import React, { useState } from 'react'
import Modal from '../shared/Modal'

const DOC_TYPES = [
  'AADHAR',
  'CONTRACT',
  'DRIVERS_LICENSE',
  'INSURANCE',
  'PAN',
  'PASSPORT',
  'POLICE_VERIFICATION',
  'POLICY_DOCUMENT',
  'POLLUTION',
  'REGISTRATION',
  'SAFETY_STICKER',
  'VEHICLE_FITNESS',
  'OTHERS',
]

export default function AssignDocumentModal({ open, driver, onClose, onAssign }) {
  const [type, setType] = useState('AADHAR')
  const [file, setFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    if (!driver?.id) { alert('Driver ID is missing.'); return }
    if (!type) { alert('Document type is required.'); return }
    if (!file) { alert('Choose a file first.'); return }
    if (!file.name.includes('.')) { alert('File must have an extension.'); return }

    setSubmitting(true)
    try {
      await onAssign({ driver, type, file })
      setFile(null)
      setType('AADHAR')
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Assign Document" width={520}>
      <div style={{ padding: 20 }}>
        <div style={{ marginBottom: 14, fontSize: 12, color: 'var(--g600)' }}>
          Driver ID: <span style={{ fontFamily: 'var(--mono)' }}>{driver?.id || '-'}</span>
        </div>

        <div className="fg">
          <div className="field">
            <label className="lbl">Document Type <span className="lbl-req">*</span></label>
            <select className="inp" value={type} onChange={e => setType(e.target.value)}>
              {DOC_TYPES.map(docType => <option key={docType} value={docType}>{docType}</option>)}
            </select>
          </div>

          <div className="field">
            <label className="lbl">File <span className="lbl-req">*</span></label>
            <input className="inp" type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 12, borderTop: '1px solid var(--g100)' }}>
          <button className="btn" onClick={onClose} disabled={submitting}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Uploading...' : 'Assign Document'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
