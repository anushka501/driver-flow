import React, { useState, useEffect } from 'react';
import Modal from '../shared/Modal';
import { request } from '../../api/config';

export default function VendorModal({ open, onClose, vendorId, vendorName }) {
  const [expandDocs, setExpandDocs] = useState(false);
  const [vendor, setVendor]         = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  // Reset + fetch whenever the modal opens with a vendorId
  useEffect(() => {
    if (!open || !vendorId) {
      setVendor(null);
      setError('');
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    setVendor(null);

    request(`/vendors/${vendorId}`)
      .then(data => { if (!cancelled) setVendor(data); })
      .catch(err  => { if (!cancelled) setError(err.message || 'Failed to load vendor'); })
      .finally(()  => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [open, vendorId]);

  if (!open) return null;

  // Resolve display values — fall back to props if API hasn't returned yet
  const displayId     = vendorId   || '—';
  const displayName   = vendor?.name   || vendor?.vendorName   || vendorName || vendorId || '—';
  const displayGstin  = vendor?.gstin  || vendor?.gstIn        || vendor?.gst || '—';
  const displayStatus = vendor?.status || 'VERIFIED';
  function formatTimestamp(val) {
  if (!val) return '—';
  if (typeof val === 'string') return val;
  // Firestore/protobuf timestamp object: { epochSeconds, nanosecondsOfSecond }
  if (val?.epochSeconds) return new Date(val.epochSeconds * 1000).toLocaleString();
  if (val?.seconds)      return new Date(val.seconds * 1000).toLocaleString();
  return '—';
}

const displayUpdAt = formatTimestamp(vendor?.updatedAt || vendor?.lastUpdatedAt || vendor?.updated_at)
  const officials     = vendor?.officials || [];

  const statusIsVerified = displayStatus === 'VERIFIED';

  return (
    <Modal open={open} onClose={onClose} title="Vendor Details" width={560}>
      {/* Sub-breadcrumb */}
      <div style={{ padding: '8px 20px', borderBottom: '1px solid var(--g100)', background: 'var(--g50)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--g400)" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span style={{ fontSize: 11, color: 'var(--g400)', cursor: 'pointer' }}>Entities</span>
        <span style={{ fontSize: 11, color: 'var(--g300)' }}>/</span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--g400)" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
        <span style={{ fontSize: 11, color: 'var(--g400)', cursor: 'pointer' }}>Vendors</span>
      </div>

      <div style={{ padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--g900)', marginBottom: 20 }}>Vendor Details</div>

        {/* Loading state */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '24px 0', fontSize: 12, color: 'var(--g400)' }}>
            Loading vendor data...
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div style={{ marginBottom: 16, padding: '8px 12px', background: 'var(--rl)', border: '1px solid var(--rb)', borderRadius: 'var(--r)', fontSize: 12, color: 'var(--red)' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Basic Information */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--g700)', marginBottom: 14 }}>Basic Information</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <InfoField label="Vendor ID">
                <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--g700)' }}>{displayId}</span>
              </InfoField>
              <InfoField label="Name">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--g400)" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                  <span style={{ fontSize: 12, color: 'var(--g700)' }}>{displayName}</span>
                </div>
              </InfoField>
              <InfoField label="GSTIN">
                <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: displayGstin !== '—' ? 'var(--blue)' : 'var(--g400)' }}>
                  {displayGstin}
                </span>
              </InfoField>
              <InfoField label="Status">
                <span className={`badge ${statusIsVerified ? 'badge-green' : 'badge-gray'}`}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusIsVerified ? 'var(--green)' : 'var(--g400)', display: 'inline-block', marginRight: 3 }} />
                  {displayStatus}
                </span>
              </InfoField>
            </div>
          </div>

          {/* Officials Information */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--g700)', marginBottom: 14 }}>Officials Information</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--g500)" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--g600)' }}>Officials ({officials.length})</span>
            </div>

            {officials.length === 0 ? (
              <div style={{ background: 'var(--g50)', border: '1px solid var(--g200)', borderRadius: 'var(--r)', padding: '10px 12px', fontSize: 11, color: 'var(--g400)', textAlign: 'center' }}>
                {loading ? 'Loading...' : 'No officials data'}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {officials.map((off, i) => (
                  <div key={i} style={{ background: 'var(--g50)', border: '1px solid var(--g200)', borderRadius: 'var(--r)', padding: '8px 12px', fontSize: 11, color: 'var(--g700)' }}>
                    <div style={{ fontWeight: 500 }}>{off.name || off.displayName || `Official ${i + 1}`}</div>
                    {off.role  && <div style={{ color: 'var(--g400)', marginTop: 2 }}>{off.role}</div>}
                    {off.email && <div style={{ color: 'var(--g400)', marginTop: 2 }}>{off.email}</div>}
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: 12 }}>
              <InfoField label="Last Updated At">
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: displayUpdAt !== '—' ? 'var(--green)' : 'var(--g300)', display: 'inline-block' }} />
                  <span style={{ fontSize: 11, color: 'var(--g500)' }}>{displayUpdAt}</span>
                </div>
              </InfoField>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--g700)', marginBottom: 12 }}>Additional Information</div>
          <div style={{ border: '1px solid var(--g200)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
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
              <div style={{ padding: '12px 14px', borderTop: '1px solid var(--g100)' }}>
                {vendor?.documents && Object.keys(vendor.documents).length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {Object.entries(vendor.documents).map(([key, val]) => (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                        <span style={{ color: 'var(--g500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{key}</span>
                        <span style={{ color: 'var(--g700)', fontFamily: 'var(--mono)' }}>{typeof val === 'string' ? val : val?.id || '—'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--g400)' }}>No documents or tags</div>
                )}
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
