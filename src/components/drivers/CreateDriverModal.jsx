import React, { useEffect, useState } from 'react'
import Modal from '../shared/Modal'
import { createDriver } from '../../api/drivers'
import { searchVendors } from '../../api/vendors'
import { getTag } from '../../utils/helpers'

function normalizeVendors(data) {
  // /vendors/search returns { total: N, vendors: [...] }
  // Each vendor has at minimum: id, name
  let rows

  if (Array.isArray(data)) {
    rows = data
  } else if (data && typeof data === 'object') {
    const listKey = ['vendors', 'vendorList', 'items', 'Items', 'results', 'data', 'content']
      .find(k => Array.isArray(data[k]))

    if (listKey) {
      rows = data[listKey]
    } else {
      // Plain object map: { "V001": { name: "Acme" }, ... }
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

      const id =
        vendor?.id         ||
        vendor?.vendorId   ||
        vendor?.vendor_id  ||
        vendor?.pk         ||
        vendor?.PK         ||
        ''

      const name =
        vendor?.name        ||
        vendor?.vendorName  ||
        vendor?.displayName ||
        vendor?.companyName ||
        vendor?.legalName   ||
        ''

      if (!id) return null

      // Show name only — fall back to id if name is missing
      return { id, label: name || id }
    })
    .filter(Boolean)

  return [...new Map(normalized.map(v => [v.id, v])).values()]
}

export default function CreateDriverModal({ open, onClose, onDriverCreated, existingDrivers = [] }) {
  const [submitting, setSubmitting] = useState(false)
  const [showUserSearch, setShowUserSearch] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [vendors, setVendors] = useState([])
  const [vendorsLoading, setVendorsLoading] = useState(false)
  const [vendorsError, setVendorsError] = useState('')

  const [form, setForm] = useState({
    userId: '', phone: '', email: '',
    licenseNo: '', vendor: '', isActive: true,
    firstName: '', lastName: '',
  })

  const vendorOptions = vendors

  useEffect(() => {
    if (!open) return

    let cancelled = false
    setVendorsLoading(true)
    setVendorsError('')

    searchVendors({ query: '*' })
      .then(data => {
        if (cancelled) return
        const normalized = normalizeVendors(data)
        console.log('VENDORS RESPONSE:', data, normalized)
        setVendors(normalized)
      })
      .catch(err => {
        if (cancelled) return
        setVendors([])
        setVendorsError(err.message || 'Failed to load vendors')
      })
      .finally(() => {
        if (!cancelled) setVendorsLoading(false)
      })

    return () => { cancelled = true }
  }, [open])

  function currentUserId() {
    return (selectedUser?.id || form.userId).trim()
  }

  function handleClose() {
    setSubmitting(false)
    setShowUserSearch(false)
    setSelectedUser(null)
    setForm({
      userId: '', firstName: '', lastName: '', phone: '', email: '',
      licenseNo: '', vendor: '', isActive: true,
    })
    onClose()
  }

  function validateForm() {
    if (!currentUserId())        { alert('Existing User ID is required.'); return false }
    if (!form.phone.trim())      { alert('Phone is required.');            return false }
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
      const result = await createDriver({
        id:           currentUserId(),
        phone:        form.phone,
        vendorId:     form.vendor       || '',
        licensePlate: form.licenseNo    || '',
        driverType:   'ADHOC',
        isActive:     form.isActive,
      })
      handleClose()
      onDriverCreated && onDriverCreated(result)
    } catch (err) {
      alert('Failed to create driver: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Create Driver">
      <div style={{ padding: 20 }}>

        {/* User ID */}
        <div style={{ marginBottom: 16 }}>
          <label className="lbl">Existing User ID <span className="lbl-req">*</span></label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
            <input
              className="inp"
              placeholder="ZDR000001"
              value={selectedUser?.id || form.userId}
              onChange={e => {
                setSelectedUser(null)
                setForm({ ...form, userId: e.target.value })
              }}
              style={{ flex: 1, fontFamily: 'var(--mono)' }}
            />
            <button className="btn btn-sm" onClick={() => setShowUserSearch(!showUserSearch)}>
              {showUserSearch ? 'Cancel' : 'Use ID'}
            </button>
          </div>

          {showUserSearch && (
            <UserSearchPanel
              onSelect={user => {
                setSelectedUser(user)
                setForm({ ...form, userId: user.id })
                setShowUserSearch(false)
              }}
            />
          )}

          {selectedUser && (
            <div style={{ marginTop: 8, padding: '6px 10px', background: 'var(--gl)', border: '1px solid var(--gb)', borderRadius: 'var(--r)', fontSize: 11, color: 'var(--green)' }}>
              ✓ Linked: {selectedUser.name} · {selectedUser.id}
            </div>
          )}
        </div>

        {/* Form fields */}
        <div className="fg fg-2">
          <div className="field">
            <label className="lbl">Phone <span className="lbl-req">*</span></label>
            <input className="inp" placeholder="+91 99999 99999" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="field">
            <label className="lbl">Email</label>
            <input className="inp" type="email" placeholder="driver@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="field">
            <label className="lbl">License Number</label>
            <input className="inp" placeholder="DL-XXXXXXXXXXXX" value={form.licenseNo} onChange={e => setForm({ ...form, licenseNo: e.target.value })} />
          </div>
          <div className="field">
            <label className="lbl">Vendor</label>
            <select
              className="inp"
              value={form.vendor}
              onChange={e => setForm({ ...form, vendor: e.target.value })}
              disabled={vendorsLoading}
            >
              <option value="">
                {vendorsLoading ? 'Loading vendors...' : vendorOptions.length ? 'No vendor' : 'No vendors found'}
              </option>
              {vendorOptions.map(vendor => (
                <option key={vendor.id} value={vendor.id}>{vendor.label}</option>
              ))}
            </select>
            {vendorsError && (
              <div style={{ marginTop: 5, fontSize: 11, color: 'var(--orange)' }}>
                {vendorsError}
              </div>
            )}
          </div>
        </div>

        {/* Active toggle */}
        <div style={{ marginBottom: 16 }}>
          <label className="lbl" style={{ display: 'block', marginBottom: 8 }}>Driver Active</label>
          <div className="toggle-wrap">
            <button className={`toggle${form.isActive ? '' : ' off'}`} onClick={() => setForm({ ...form, isActive: !form.isActive })}>
              <div className="toggle-knob" />
            </button>
            <span style={{ fontSize: 12, fontWeight: 500, color: form.isActive ? 'var(--blue)' : 'var(--g400)' }}>
              {form.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 12, borderTop: '1px solid var(--g100)' }}>
          <button className="btn" onClick={handleClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Driver'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

function UserSearchPanel({ onSelect }) {
  const [query, setQuery] = useState('')

  return (
    <div style={{ marginTop: 8, background: 'var(--g50)', border: '1px solid var(--g200)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
      <div style={{ padding: 12 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            className="inp"
            placeholder="Paste existing user ID e.g. ZDR000001"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ flex: 1, fontFamily: 'var(--mono)' }}
          />
          <button
            className="btn btn-sm"
            onClick={() => query.trim() && onSelect({ id: query.trim(), name: query.trim() })}
          >
            Link
          </button>
        </div>
      </div>
    </div>
  )
}
