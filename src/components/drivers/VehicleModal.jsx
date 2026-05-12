import React, { useState, useEffect } from 'react';
import Modal from '../shared/Modal';
import { getVehicle } from '../../api/vehicles';

function formatTimestamp(val) {
  if (!val) return '—';
  if (typeof val === 'string') return val;
  if (val?.epochSeconds) return new Date(val.epochSeconds * 1000).toLocaleString();
  if (val?.seconds)      return new Date(val.seconds * 1000).toLocaleString();
  return '—';
}

export default function VehicleModal({ open, onClose, vehicleId }) {
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!open || !vehicleId) {
      setVehicle(null);
      setError('');
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    setVehicle(null);

    getVehicle(vehicleId)
      .then(data => { if (!cancelled) setVehicle(data); })
      .catch(err  => { if (!cancelled) setError(err.message || 'Failed to load vehicle'); })
      .finally(()  => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [open, vehicleId]);

  if (!open) return null;

  const plate      = vehicle?.licensePlate || vehicle?.plateNumber || vehicle?.plate || '—';
  const type       = vehicle?.type         || vehicle?.vehicleType  || '—';
  const make       = vehicle?.make         || vehicle?.brand        || '—';
  const model      = vehicle?.model        || '—';
  const color      = vehicle?.color        || vehicle?.colour       || '—';
  const status     = vehicle?.status       || '—';
  const ownerId    = vehicle?.ownedBy      || vehicle?.driverId     || vehicle?.ownerDriverId || '—';
  const regNo      = vehicle?.registrationNumber || vehicle?.regNumber || vehicle?.registration || '—';
  const updatedAt  = formatTimestamp(vehicle?.updatedAt || vehicle?.lastUpdatedAt || vehicle?.updated_at);

  const statusIsActive = status === 'ACTIVE' || status === 'VERIFIED';

  return (
    <Modal open={open} onClose={onClose} title="Vehicle Details" width={560}>
      {/* Sub-breadcrumb */}
      <div style={{ padding: '8px 20px', borderBottom: '1px solid var(--g100)', background: 'var(--g50)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--g400)" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span style={{ fontSize: 11, color: 'var(--g400)', cursor: 'pointer' }}>Entities</span>
        <span style={{ fontSize: 11, color: 'var(--g300)' }}>/</span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--g400)" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
        <span style={{ fontSize: 11, color: 'var(--g400)', cursor: 'pointer' }}>Vehicles</span>
      </div>

      <div style={{ padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--g900)', marginBottom: 20 }}>Vehicle Details</div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '24px 0', fontSize: 12, color: 'var(--g400)' }}>
            Loading vehicle data...
          </div>
        )}

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
              <InfoField label="Vehicle ID">
                <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--g700)' }}>{vehicleId || '—'}</span>
              </InfoField>
              <InfoField label="License Plate">
                <span style={{ fontSize: 12, fontFamily: 'var(--mono)', fontWeight: 600, color: plate !== '—' ? 'var(--blue)' : 'var(--g400)' }}>
                  {plate}
                </span>
              </InfoField>
              <InfoField label="Type">
                <span style={{ fontSize: 12, color: 'var(--g700)' }}>{type}</span>
              </InfoField>
              <InfoField label="Status">
                <span className={`badge ${statusIsActive ? 'badge-green' : 'badge-gray'}`}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusIsActive ? 'var(--green)' : 'var(--g400)', display: 'inline-block', marginRight: 3 }} />
                  {status}
                </span>
              </InfoField>
            </div>
          </div>

          {/* Vehicle Details */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--g700)', marginBottom: 14 }}>Vehicle Details</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <InfoField label="Make">
                <span style={{ fontSize: 12, color: 'var(--g700)' }}>{make}</span>
              </InfoField>
              <InfoField label="Model">
                <span style={{ fontSize: 12, color: 'var(--g700)' }}>{model}</span>
              </InfoField>
              <InfoField label="Color">
                <span style={{ fontSize: 12, color: 'var(--g700)' }}>{color}</span>
              </InfoField>
              <InfoField label="Registration No.">
                <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: regNo !== '—' ? 'var(--g700)' : 'var(--g400)' }}>{regNo}</span>
              </InfoField>
            </div>
          </div>
        </div>

        {/* Owner + timestamps */}
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--g100)', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <InfoField label="Owned By (Driver ID)">
            <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: ownerId !== '—' ? 'var(--blue)' : 'var(--g400)' }}>{ownerId}</span>
          </InfoField>
          <InfoField label="Last Updated At">
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: updatedAt !== '—' ? 'var(--green)' : 'var(--g300)', display: 'inline-block' }} />
              <span style={{ fontSize: 11, color: 'var(--g500)' }}>{updatedAt}</span>
            </div>
          </InfoField>
        </div>

        {/* Tags if present */}
        {vehicle?.tags && Object.keys(vehicle.tags).length > 0 && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--g100)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--g700)', marginBottom: 10 }}>Tags</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {Object.entries(vehicle.tags).map(([key, val]) => {
                if (val === null || val === undefined) return null
                // If val is an object, render its sub-fields as separate tags
                if (typeof val === 'object') {
                    return Object.entries(val).map(([subKey, subVal]) => (
                    <span key={`${key}-${subKey}`} style={{ fontSize: 11, padding: '2px 8px', background: 'var(--g100)', borderRadius: 4, color: 'var(--g600)', fontFamily: 'var(--mono)' }}>
                        {key}.{subKey}: {String(subVal ?? '—')}
                    </span>
                    ))
                }
                return (
                    <span key={key} style={{ fontSize: 11, padding: '2px 8px', background: 'var(--g100)', borderRadius: 4, color: 'var(--g600)', fontFamily: 'var(--mono)' }}>
                    {key}: {String(val)}
                    </span>
                )
                })}
            </div>
          </div>
        )}
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
