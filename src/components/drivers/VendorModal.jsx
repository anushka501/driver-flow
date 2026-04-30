import React, { useState } from 'react';
import Modal from '../shared/Modal';

export default function VendorModal({ open, onClose, vendorId }) {
  const [expandDocs, setExpandDocs] = useState(false);

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title="Vendor Details" width={560}>
      {/* Sub-breadcrumb matching Image 3 */}
      <div style={{ padding: '8px 20px', borderBottom: '1px solid var(--g100)', background: 'var(--g50)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--g400)" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span style={{ fontSize: 11, color: 'var(--g400)', cursor: 'pointer' }}>Entities</span>
        <span style={{ fontSize: 11, color: 'var(--g300)' }}>/</span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--g400)" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
        <span style={{ fontSize: 11, color: 'var(--g400)', cursor: 'pointer' }}>Vendors</span>
      </div>

      <div style={{ padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--g900)', marginBottom: 20 }}>Vendor Details</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Basic Information */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--g700)', marginBottom: 14 }}>Basic Information</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <InfoField label="Vendor ID">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--g700)' }}>{vendorId || '—'}</span>
                </div>
              </InfoField>
              <InfoField label="Name">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--g400)" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                  <span style={{ fontSize: 12, color: 'var(--g700)' }}>{vendorId || '—'}</span>
                </div>
              </InfoField>
              <InfoField label="GSTIN">
                <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--blue)' }}>—</span>
              </InfoField>
              <InfoField label="Status">
                <span className="badge badge-green">
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', marginRight: 3 }} />
                  VERIFIED
                </span>
              </InfoField>
            </div>
          </div>

          {/* Officials Information */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--g700)', marginBottom: 14 }}>Officials Information</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--g500)" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--g600)' }}>Officials (0)</span>
            </div>
            <div style={{ background: 'var(--g50)', border: '1px solid var(--g200)', borderRadius: 'var(--r)', padding: '10px 12px', fontSize: 11, color: 'var(--g400)', textAlign: 'center' }}>
              No officials data — connect to API
            </div>
            <div style={{ marginTop: 12 }}>
              <InfoField label="Last Updated At">
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--g300)', display: 'inline-block' }} />
                  <span style={{ fontSize: 11, color: 'var(--g500)' }}>—</span>
                </div>
              </InfoField>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--g700)', marginBottom: 12 }}>Additional Information</div>
          <div
            style={{ border: '1px solid var(--g200)', borderRadius: 'var(--r)', overflow: 'hidden' }}
          >
            <div
              style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', background: expandDocs ? 'var(--g50)' : 'var(--w)' }}
              onClick={() => setExpandDocs(!expandDocs)}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--g500)" strokeWidth="2.5">
                {expandDocs
                  ? <polyline points="18 15 12 9 6 15"/>
                  : <polyline points="6 9 12 15 18 9"/>
                }
              </svg>
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--g600)' }}>Documents & Tags</span>
            </div>
            {expandDocs && (
              <div style={{ padding: '12px 14px', borderTop: '1px solid var(--g100)', fontSize: 12, color: 'var(--g400)' }}>
                No documents or tags — connect to API
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function InfoField({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  );
}
