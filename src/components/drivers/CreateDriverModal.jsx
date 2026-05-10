import React, { useEffect, useState } from 'react'
import Modal from '../shared/Modal'
import { createUser } from '../../api/users'
import { createDriver } from '../../api/drivers'
import { searchVendors } from '../../api/vendors'
import { getTag } from '../../utils/helpers'

function normalizeVendors(data) {
  let rows
  if (Array.isArray(data)) {
    rows = data
  } else if (data && typeof data === 'object') {
    const listKey = ['vendors', 'vendorList', 'items', 'Items', 'results', 'data', 'content']
      .find(k => Array.isArray(data[k]))
    if (listKey) {
      rows = data[listKey]
    } else {
      rows = Object.entries(data).map(([key, val]) => {
        if (val && typeof val === 'object') return { id: key, ...val }
        if (typeof val === 'string')        return { id: key, name: val }
        return { id: key }
      })
    }
  } else {
    rows = []
  }

  const normalized = rows
    .map(vendor => {
      if (typeof vendor === 'string') return { id: vendor, label: vendor }
      const id = vendor?.id || vendor?.vendorId || vendor?.vendor_id || ''
      const name = vendor?.name || vendor?.vendorName || vendor?.displayName || ''
      if (!id) return null
      return { id, label: name || id }
    })
    .filter(Boolean)

  return [...new Map(normalized.map(v => [v.id, v])).values()]
}

export default function CreateDriverModal({ open, onClose, onDriverCreated, existingDrivers = [] }) {
  const [submitting, setSubmitting]         = useState(false)
  const [submitStep, setSubmitStep]         = useState('')
  const [vendors, setVendors]               = useState([])
  const [vendorsLoading, setVendorsLoading] = useState(false)
  const [vendorsError, setVendorsError]     = useState('')

  const [form, setForm] = useState({
    phone:      '',
    firstName:  '',
    lastName:   '',
    gender:     '',
    vendor:     '',
    autoVerify: true,
  })

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setVendorsLoading(true)
    setVendorsError('')
    searchVendors({ query: '*' })
      .then(data => {
        if (!cancelled) {
          const list = normalizeVendors(data)
          setVendors(list)
          const defaultVendor = list.find(v =>
            v.label?.toUpperCase() === 'SAMPLE1234'
          ) || list[0]
          if (defaultVendor) {
            setForm(prev => ({ ...prev, vendor: defaultVendor.id }))
          }
        }
      })
      .catch(err => { if (!cancelled) { setVendors([]); setVendorsError(err.message) } })
      .finally(() => { if (!cancelled) setVendorsLoading(false) })
    return () => { cancelled = true }
  }, [open])

  function handleClose() {
    setSubmitting(false)
    setSubmitStep('')
    setForm({ phone: '', firstName: '', lastName: '', gender: '', vendor: '', autoVerify: true })
    onClose()
  }

  function validateForm() {
    if (!form.phone.trim())     { alert('Phone is required.');       return false }
    if (!form.firstName.trim()) { alert('Given name is required.');  return false }
    if (!form.lastName.trim())  { alert('Family name is required.'); return false }
    if (!form.gender)           { alert('Gender is required.');      return false }
    if (!form.vendor)           { alert('Please select a vendor.');  return false }
    return true
  }

  function duplicatePhoneExists() {
    const normalise = p => p.replace(/\s+/g, '').replace('+', '')
    const phone = normalise(form.phone)
    return existingDrivers.find(driver => {
      const existing = getTag(driver, 'phone') || driver.phone || ''
      return existing && normalise(existing) === phone
    })
  }

  async function handleSubmit() {
    if (!validateForm()) return
    const duplicate = duplicatePhoneExists()
    if (duplicate) {
      alert(`Phone ${form.phone} is already registered to ${duplicate.name || duplicate.id}`)
      return
    }

    setSubmitting(true)
    try {
      setSubmitStep('Creating user account...')
      let userResult
      try {
        userResult = await createUser({
          phone:      form.phone,
          firstName:  form.firstName,
          lastName:   form.lastName,
          gender:     form.gender,
          autoVerify: form.autoVerify,
        })
      } catch (err) {
        if (err.message?.toLowerCase().includes('already exists')) {
          throw new Error(`A user with phone +91${form.phone.replace(/\D/g, '')} already exists in the system.`)
        }
        throw err
      }

      const driverId = userResult?.username || userResult?.id || userResult?.userId
      if (!driverId) {
        throw new Error(`User was created but no username was returned. Raw response: ${JSON.stringify(userResult)}`)
      }

      setSubmitStep('Registering as driver...')
      const driverResult = await createDriver({
        id:       driverId,
        vendorId: form.vendor,
        phone:    form.phone,
      })

      handleClose()
      onDriverCreated && onDriverCreated(driverResult ?? { id: driverId })

    } catch (err) {
      alert('Failed: ' + err.message)
    } finally {
      setSubmitting(false)
      setSubmitStep('')
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Create Driver">
      <div style={{ padding: 20 }}>

        {/* Phone */}
        <div style={{ marginBottom: 16 }}>
          <label className="lbl">Phone <span className="lbl-req">*</span></label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
            <span style={{ padding: '0 10px', height: 32, display: 'flex', alignItems: 'center', background: 'var(--g100)', border: '1px solid var(--g200)', borderRadius: 'var(--r)', fontSize: 12, color: 'var(--g600)', fontFamily: 'var(--mono)' }}>
              +91
            </span>
            <input
              className="inp"
              placeholder="98765 43210"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              style={{ flex: 1, fontFamily: 'var(--mono)' }}
            />
          </div>
        </div>

        {/* Given Name + Family Name */}
        <div className="fg fg-2" style={{ marginBottom: 16 }}>
          <div className="field">
            <label className="lbl">Given Name <span className="lbl-req">*</span></label>
            <input
              className="inp"
              placeholder="Enter given name"
              value={form.firstName}
              onChange={e => setForm({ ...form, firstName: e.target.value })}
            />
          </div>
          <div className="field">
            <label className="lbl">Family Name <span className="lbl-req">*</span></label>
            <input
              className="inp"
              placeholder="Enter family name"
              value={form.lastName}
              onChange={e => setForm({ ...form, lastName: e.target.value })}
            />
          </div>
        </div>

        {/* Gender + Vendor */}
        <div className="fg fg-2" style={{ marginBottom: 16 }}>
          <div className="field">
            <label className="lbl">Gender <span className="lbl-req">*</span></label>
            <select
              className="inp"
              value={form.gender}
              onChange={e => setForm({ ...form, gender: e.target.value })}
            >
              <option value="">Select gender</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="NA">Other / Prefer not to say</option>
            </select>
          </div>
          <div className="field">
            <label className="lbl">Vendor <span className="lbl-req">*</span></label>
            <select
              className="inp"
              value={form.vendor}
              onChange={e => setForm({ ...form, vendor: e.target.value })}
              disabled={vendorsLoading}
            >
              {vendorsLoading
                ? <option value="">Loading vendors...</option>
                : vendors.map(v => <option key={v.id} value={v.id}>{v.label}</option>)
              }
            </select>
            {vendorsError && (
              <div style={{ marginTop: 5, fontSize: 11, color: 'var(--orange)' }}>{vendorsError}</div>
            )}
          </div>
        </div>

        {/* Auto Verify */}
        <div style={{ marginBottom: 16 }}>
          <label className="lbl" style={{ display: 'block', marginBottom: 8 }}>Auto Verify</label>
          <div className="toggle-wrap">
            <button
              className={`toggle${form.autoVerify ? '' : ' off'}`}
              onClick={() => setForm({ ...form, autoVerify: !form.autoVerify })}
            >
              <div className="toggle-knob" />
            </button>
            <span style={{ fontSize: 12, fontWeight: 500, color: form.autoVerify ? 'var(--blue)' : 'var(--g400)' }}>
              {form.autoVerify ? 'Yes' : 'No'}
            </span>
          </div>
        </div>

        {/* Progress indicator */}
        {submitting && submitStep && (
          <div style={{ marginBottom: 12, padding: '8px 12px', background: 'var(--bl)', border: '1px solid var(--bb)', borderRadius: 'var(--r)', fontSize: 12, color: 'var(--blue)' }}>
            ⏳ {submitStep}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 12, borderTop: '1px solid var(--g100)' }}>
          <button className="btn" onClick={handleClose} disabled={submitting}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Driver'}
          </button>
        </div>
      </div>
    </Modal>
  )
}