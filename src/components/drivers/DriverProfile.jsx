import React, { useState, useEffect } from 'react';
import Avatar from '../shared/Avatar';
import { Icons } from '../../assets/icons';
import { statusBadgeClass, statusLabel, docStatusBadgeClass, tagBool, getTag } from '../../utils/helpers';

const TABS = [
  { id: 'overview',    label: 'Overview'       },
  { id: 'profile',     label: 'Profile'        },
  { id: 'documents',   label: 'Document Review'},
  { id: 'vehicles',    label: 'Vehicles'       },
  { id: 'location',    label: 'Location'       },
  { id: 'routes',      label: 'Routes'         },
  { id: 'trips',       label: 'Trip History'   },
  { id: 'performance', label: 'Performance'    },
];

const DOC_TYPES = [
  'AADHAR', 'CONTRACT', 'DRIVERS_LICENSE', 'INSURANCE',
  'PAN', 'PASSPORT', 'POLICE_VERIFICATION', 'POLICY_DOCUMENT',
  'POLLUTION', 'REGISTRATION', 'SAFETY_STICKER', 'VEHICLE_FITNESS', 'OTHERS',
];

function formatUpdatedAt(updatedAt) {
  const epoch = updatedAt?.epochSeconds;
  if (!epoch) return '—';
  const date = new Date(epoch * 1000);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' ' + date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function DriverProfile({ driver, onBack, onEdit, onApproveDoc, onRejectDoc, onAssignDoc, onUpdate, activeTabOverride }) {
  const [activeTab, setActiveTab] = useState(activeTabOverride || 'overview');

  if (!driver) return null;

  const badgeClass = statusBadgeClass(driver.status);
  const label = statusLabel(driver.status);

  return (
    <div className="fade-in">
      <div className="prof-banner">
        <Avatar name={driver.name} size="lg" />
        <div style={{ flex: 1 }}>
          <div className="prof-name">{driver.name}</div>
          <div className="prof-meta">{driver.id} · {driver.phone || 'No phone'}</div>
          <div className="prof-tags">
            <span className={`badge ${badgeClass}`}>{label}</span>
            {driver.vendor && <span className="badge badge-gray">{driver.vendor}</span>}
            {driver.zeroCertified && <span className="badge badge-blue">Zero Certified</span>}
          </div>
        </div>
        <div className="prof-acts">
          <button className="btn btn-sm" onClick={onBack}>← Back</button>
          <button className="btn btn-sm" onClick={() => onEdit && onEdit(driver)}><Icons.Edit /> Edit</button>
          <button className="btn btn-primary btn-sm">Approve Driver</button>
        </div>
      </div>

      <div className="tabs-bar">
        {TABS.map(tab => (
          <div key={tab.id} className={`tab-item${activeTab === tab.id ? ' active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </div>
        ))}
      </div>

      {activeTab === 'overview'    && <OverviewTab    driver={driver} onTabSwitch={setActiveTab} formatUpdatedAt={formatUpdatedAt} />}
      {activeTab === 'profile'     && <ProfileTab     driver={driver} onUpdate={onUpdate} formatUpdatedAt={formatUpdatedAt} />}
      {activeTab === 'documents'   && <DocumentsTab   driver={driver} onApprove={onApproveDoc} onReject={onRejectDoc} onAssign={onAssignDoc} />}
      {activeTab === 'vehicles'    && <VehiclesTab    driver={driver} />}
      {activeTab === 'location'    && <LocationTab    driver={driver} />}
      {activeTab === 'routes'      && <RoutesTab      driver={driver} />}
      {activeTab === 'trips'       && <TripsTab       driver={driver} />}
      {activeTab === 'performance' && <PerformanceTab driver={driver} />}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   OVERVIEW TAB
───────────────────────────────────────────────────────── */
function OverviewTab({ driver, onTabSwitch, formatUpdatedAt }) {
  return (
    <div className="fade-in">
      <div className="two-col">
        <div className="ib">
          <div className="ib-hdr">Driver Info</div>
          <div className="ib-grid">
            <div className="ib-row"><span className="ib-key">Driver ID</span><span className="ib-val ib-val-mono">{driver.id}</span></div>
            <div className="ib-row"><span className="ib-key">Status</span><span className={`badge ${statusBadgeClass(driver.status)}`}>{statusLabel(driver.status)}</span></div>
            <div className="ib-row"><span className="ib-key">Phone</span><span className="ib-val ib-val-mono">{driver.phone || <span className="ib-val-empty">—</span>}</span></div>
            <div className="ib-row"><span className="ib-key">Vendor</span><span className="ib-val">{driver.vendor || <span className="ib-val-empty">—</span>}</span></div>
            <div className="ib-row"><span className="ib-key">Last Updated</span><span className="ib-val">{formatUpdatedAt(driver.updatedAt)}</span></div>
            <div className="ib-row"><span className="ib-key">Doc Count</span><span className="ib-val ib-val-mono">{driver.docCount ?? Object.keys(driver.documents || {}).length}</span></div>
          </div>
        </div>
        <div className="ib">
          <div className="ib-hdr">Quick Actions</div>
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="btn btn-sm" onClick={() => onTabSwitch('documents')} style={{ justifyContent: 'flex-start' }}>
              <Icons.FileText /> Review Documents ({driver.docCount ?? Object.keys(driver.documents || {}).length})
            </button>
            <button className="btn btn-sm" onClick={() => onTabSwitch('vehicles')} style={{ justifyContent: 'flex-start' }}>
              <Icons.Car /> View Vehicles
            </button>
            <button className="btn btn-sm" onClick={() => onTabSwitch('routes')} style={{ justifyContent: 'flex-start' }}>
              <Icons.Route /> View Routes
            </button>
            <button className="btn btn-sm btn-primary" onClick={() => onTabSwitch('location')} style={{ justifyContent: 'flex-start' }}>
              <Icons.MapPin /> Track Live Location
            </button>
          </div>
        </div>
      </div>

      <div className="map-wrap">
        <div className="card-hdr">
          <span className="card-title">Live Location</span>
          <span className="badge badge-gray">Offline</span>
        </div>
        <div style={{ height: 220, position: 'relative', overflow: 'hidden', borderRadius: '0 0 var(--r2) var(--r2)' }}>
          <iframe
            title="hyderabad-preview"
            src="https://maps.google.com/maps?q=Hyderabad,India&z=12&output=embed"
            style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none', filter: 'grayscale(0.3)' }}
          />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.35)' }}>
            <div style={{ background: 'rgba(255,255,255,.92)', padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 500, color: 'var(--g700)' }}>
              Driver is offline · Click Location tab to expand
            </div>
          </div>
        </div>
        <div className="map-foot">
          <span style={{ fontSize: 11, color: 'var(--g400)' }}>Last seen: {driver.lastSeen || '—'}</span>
          <button className="btn btn-sm" onClick={() => onTabSwitch('location')}>View full map</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   PROFILE TAB
───────────────────────────────────────────────────────── */
function ProfileTab({ driver, onUpdate, formatUpdatedAt }) {
  const [saving, setSaving] = useState(null);

  const isActive      = tagBool(driver, 'isActive');
  const zeroCertified = tagBool(driver, 'zeroCertified');
  const pushNotifs    = tagBool(driver, 'pushNotifications');
  const phone         = getTag(driver, 'phone') || driver.phone || '';

  async function handleToggle(tagKey, currentVal) {
    setSaving(tagKey);
    try {
      await onUpdate(driver.id, {
        tags: { ...(driver.tags || {}), [tagKey]: String(!currentVal) },
      });
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="fade-in">
      <div className="two-col">
        <div className="ib">
          <div className="ib-hdr">Personal Information</div>
          <div className="ib-grid">
            <div className="ib-row"><span className="ib-key">Full Name</span><span className="ib-val">{driver.name || <span className="ib-val-empty">—</span>}</span></div>
            <div className="ib-row"><span className="ib-key">Phone</span><span className="ib-val ib-val-mono">{phone || <span className="ib-val-empty">—</span>}</span></div>
            <div className="ib-row"><span className="ib-key">Driver Type</span><span className="ib-val">{getTag(driver, 'driverType') || <span className="ib-val-empty">—</span>}</span></div>
            <div className="ib-row"><span className="ib-key">License Plate</span><span className="ib-val ib-val-mono">{getTag(driver, 'licensePlate') || <span className="ib-val-empty">—</span>}</span></div>
          </div>
        </div>
        <div className="ib">
          <div className="ib-hdr">Driver Details</div>
          <div className="ib-grid">
            <div className="ib-row"><span className="ib-key">Driver ID</span><span className="ib-val ib-val-mono">{driver.id}</span></div>
            <div className="ib-row"><span className="ib-key">Status</span><span className={`badge ${statusBadgeClass(driver.status)}`}>{statusLabel(driver.status)}</span></div>
            <div className="ib-row"><span className="ib-key">Vendor ID</span><span className="ib-val ib-val-mono">{driver.vendorId || <span className="ib-val-empty">—</span>}</span></div>
            <div className="ib-row"><span className="ib-key">Last Updated</span><span className="ib-val">{formatUpdatedAt(driver.updatedAt)}</span></div>
          </div>
        </div>
      </div>

      <div className="ib">
        <div className="ib-hdr">Account Settings</div>
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ToggleRow label="Active" sublabel="Driver is available for assignments" value={isActive} saving={saving === 'isActive'} onChange={() => handleToggle('isActive', isActive)} />
          <ToggleRow label="Zero Certified" sublabel="Driver has completed Zero certification" value={zeroCertified} saving={saving === 'zeroCertified'} onChange={() => handleToggle('zeroCertified', zeroCertified)} />
          <ToggleRow label="Push Notifications" sublabel="Receive ride and alert notifications" value={pushNotifs} saving={saving === 'pushNotifications'} onChange={() => handleToggle('pushNotifications', pushNotifs)} />
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, sublabel, value, onChange, saving }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--g800)' }}>{label}</div>
        <div style={{ fontSize: 11, color: 'var(--g400)', marginTop: 2 }}>{sublabel}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {saving && <span style={{ fontSize: 10, color: 'var(--g400)', fontFamily: 'var(--mono)' }}>Saving...</span>}
        <button className={`toggle${value ? '' : ' off'}`} onClick={onChange} disabled={saving} style={{ opacity: saving ? 0.6 : 1 }}>
          <div className="toggle-knob" />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   DOCUMENTS TAB
───────────────────────────────────────────────────────── */
function DocumentsTab({ driver, onApprove, onReject, onAssign }) {
  const [apiDocMap, setApiDocMap]     = useState(null);
  const [docsLoading, setDocsLoading] = useState(true);
  const [docsError, setDocsError]     = useState('');

  useEffect(() => {
    let cancelled = false;
    setDocsLoading(true);
    setDocsError('');

    import('../../api/documents')
      .then(({ getDocuments, normalizeDocuments }) =>
        getDocuments(driver.id).then(raw => {
          if (cancelled) return;
          setApiDocMap(normalizeDocuments(raw));
          setDocsLoading(false);
        })
      )
      .catch(err => {
        if (cancelled) return;
        console.warn('getDocuments failed, using embedded data:', err.message);
        setDocsError('Could not fetch live document details.');
        setApiDocMap(null);
        setDocsLoading(false);
      });

    return () => { cancelled = true; };
  }, [driver.id]);

  const embeddedDocs = driver.documents || {};

  function resolveDoc(docType) {
    const source = apiDocMap ?? embeddedDocs;
    const raw = source[docType];
    if (!raw) return null;
    if (typeof raw === 'string') {
      return { documentId: raw, id: raw, status: null, fileName: null, fileUrl: null, uploadedAt: null, reviewedBy: null };
    }
    return {
      documentId: raw.documentId || raw.id || null,
      id:         raw.documentId || raw.id || null,
      status:     raw.status     || null,
      fileName:   raw.meta?.filename || raw.fileName || raw.filename || null,
      fileUrl:    raw.fileUrl    || raw.downloadUrl  || raw.url || null,
      uploadedAt: raw.meta?.date || raw.createdAt    || raw.uploadedAt || null,
      reviewedBy: raw.reviewMeta?.reviewedBy         || raw.reviewedBy || null,
    };
  }

  return (
    <div className="fade-in">
      <div style={{ background: 'var(--w)', border: '1px solid var(--g200)', borderRadius: 'var(--r2)', padding: '16px 20px', marginBottom: 16, boxShadow: 'var(--sh)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--g500)" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--g800)' }}>Driver Information</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--g600)' }}>Driver ID: <span style={{ fontFamily: 'var(--mono)' }}>{driver.id}</span></div>
        <div style={{ fontSize: 12, color: 'var(--g600)' }}>Name: {driver.name}</div>
      </div>

      {docsError && (
        <div style={{ marginBottom: 12, padding: '8px 12px', background: 'var(--ol)', border: '1px solid var(--ob)', borderRadius: 'var(--r)', fontSize: 11, color: 'var(--orange)' }}>
          ⚠ {docsError} Showing cached data.
        </div>
      )}

      <div style={{ background: 'var(--w)', border: '1px solid var(--g200)', borderRadius: 'var(--r2)', boxShadow: 'var(--sh)', overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--g100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--g800)' }}>
            Documents
            {docsLoading && <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--g400)', fontWeight: 400 }}>Loading…</span>}
          </span>
          <button className="btn btn-primary btn-sm" onClick={() => onAssign && onAssign(driver)}>+ Assign Document</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="dtbl" style={{ minWidth: 820 }}>
            <thead>
              <tr>
                <th>Document Type</th>
                <th>Document ID</th>
                <th>File Name</th>
                <th>Status</th>
                <th>Uploaded At</th>
                <th>Reviewed By</th>
                <th>Document</th>
                <th>Review Actions</th>
              </tr>
            </thead>
            <tbody>
              {DOC_TYPES.map(docType => {
                const doc = resolveDoc(docType);
                const hasDoc = !!doc;
                const statusVal = doc?.status;
                return (
                  <tr key={docType}>
                    <td className="dt">{docType}</td>
                    <td>
                      {doc?.documentId
                        ? <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--g400)' }} title={doc.documentId}>{doc.documentId.slice(0, 14)}…</span>
                        : <span className="nd">—</span>}
                    </td>
                    <td>
                      {doc?.fileName
                        ? <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--g600)' }}>{doc.fileName}</span>
                        : hasDoc ? <span style={{ fontSize: 11, color: 'var(--g400)' }}>—</span>
                        : <span className="nd">—</span>}
                    </td>
                    <td>
                      {hasDoc && statusVal
                        ? <span className={`badge ${docStatusBadgeClass(statusVal)}`}>{statusVal}</span>
                        : hasDoc ? <span className="badge badge-gray">UPLOADED</span>
                        : <span className="nd">—</span>}
                    </td>
                    <td style={{ fontSize: 11, color: 'var(--g400)', whiteSpace: 'nowrap' }}>
                      {doc?.uploadedAt
                        ? new Date(doc.uploadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                        : <span className="nd">—</span>}
                    </td>
                    <td style={{ fontSize: 11, color: 'var(--g500)' }}>
                      {doc?.reviewedBy || <span className="nd">—</span>}
                    </td>
                    <td>
                      {doc?.fileUrl
                        ? <button className="btn btn-sm" onClick={() => window.open(doc.fileUrl, '_blank')}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                            View
                          </button>
                        : hasDoc ? <span className="nd" style={{ fontSize: 10 }}>No URL</span>
                        : <span className="nd">No Document</span>}
                    </td>
                    <td>
                      {hasDoc ? (
                        <div style={{ display: 'flex', gap: 5 }}>
                          <button className="btn btn-sm" style={{ background: 'var(--gl)', color: 'var(--green)', border: '1px solid var(--gb)' }} onClick={() => onApprove && onApprove(driver, docType)}>Approve</button>
                          <button className="btn btn-sm" style={{ background: 'var(--rl)', color: 'var(--red)', border: '1px solid var(--rb)' }} onClick={() => onReject && onReject(driver, docType)}>Reject</button>
                        </div>
                      ) : <span className="nd">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   VEHICLES TAB
───────────────────────────────────────────────────────── */
function VehiclesTab({ driver }) {
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    import('../../api/vehicles')
      .then(({ fetchVehiclesByDriverMap }) => fetchVehiclesByDriverMap())
      .then(map => {
        if (cancelled) return;
        setVehicle(map[driver.id] || null);
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        setError('Could not load vehicle data.');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [driver.id]);

  const v = vehicle;

  return (
    <div className="fade-in">
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-hdr">
          <span className="card-title">Vehicle assigned to this driver</span>
          {loading && <span style={{ fontSize: 11, color: 'var(--g400)' }}>Loading…</span>}
        </div>
        {error && (
          <div style={{ margin: '8px 16px', padding: '8px 12px', background: 'var(--ol)', border: '1px solid var(--ob)', borderRadius: 'var(--r)', fontSize: 11, color: 'var(--orange)' }}>
            ⚠ {error}
          </div>
        )}
        <div style={{ overflowX: 'auto' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Licence Plate</th><th>Vehicle ID</th><th>Status</th>
                <th>Make / Model</th><th>Year</th><th>Seating</th>
                <th>Fitness</th><th>Owned By</th>
              </tr>
            </thead>
            <tbody>
              {!loading && !v ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 24, color: 'var(--g400)', fontSize: 12 }}>No vehicle associated with this driver</td></tr>
              ) : v ? (
                <tr className="clickable">
                  <td><span style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{v.licencePlate || '—'}</span></td>
                  <td><span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--g500)' }}>{v.id || '—'}</span></td>
                  <td><span className={`badge ${v.status === 'AVAILABLE' ? 'badge-green' : v.status === 'IN_USE' ? 'badge-blue' : 'badge-orange'}`}>{v.status || '—'}</span></td>
                  <td><span style={{ fontSize: 11 }}>{[v.make, v.model].filter(Boolean).join(' ') || '—'}</span></td>
                  <td><span style={{ fontSize: 11, color: 'var(--g400)' }}>{v.year || '—'}</span></td>
                  <td><span style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{v.seatingCapacity || v.seats || '—'}</span></td>
                  <td><span className={`badge ${v.fitness === 'VERIFIED' ? 'badge-green' : 'badge-red'}`}>{v.fitness || '—'}</span></td>
                  <td><span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--g500)' }}>{v.ownedBy || '—'}</span></td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {v && (
        <div className="two-col">
          <div className="ib">
            <div className="ib-hdr">Vehicle Details</div>
            <div className="ib-grid">
              {[
                ['Licence Plate', v.licencePlate],
                ['Vehicle ID',    v.id],
                ['Make',          v.make],
                ['Model',         v.model],
                ['Year',          v.year],
                ['Color',         v.color],
                ['Fuel Type',     v.fuelType],
                ['Seating',       v.seatingCapacity || v.seats],
              ].map(([k, val]) => (
                <div className="ib-row" key={k}>
                  <span className="ib-key">{k}</span>
                  <span className={`ib-val${['Vehicle ID','Licence Plate'].includes(k) ? ' ib-val-mono' : ''}`}>
                    {val || <span className="ib-val-empty">—</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="ib">
            <div className="ib-hdr">Registration & Compliance</div>
            <div className="ib-grid">
              {[
                ['Status',       v.status],
                ['Fitness',      v.fitness],
                ['Insurance',    typeof v.insurance === 'object' ? (v.insurance?.insuranceStatus || v.insurance?.policyNumber || 'See details') : v.insurance],
                ['Insured By',   typeof v.insurance === 'object' ? v.insurance?.insuredBy : null],
                ['Policy No.',   typeof v.insurance === 'object' ? v.insurance?.policyNumber : null],
                ['Expiry',       typeof v.insurance === 'object' ? v.insurance?.expirationDate : null],
                ['Pollution',    typeof v.pollution === 'object' ? (v.pollution?.status || v.pollution?.pollutionStatus || 'See details') : v.pollution],
                ['Registration', v.registrationNumber || v.registration],
                ['Owned By',     v.ownedBy],
              ].filter(([, val]) => val !== null && val !== undefined)
               .map(([k, val]) => (
                <div className="ib-row" key={k}>
                  <span className="ib-key">{k}</span>
                  <span className="ib-val ib-val-mono">
                    {typeof val === 'object' ? JSON.stringify(val) : (val || <span className="ib-val-empty">—</span>)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ background: 'var(--gl)', border: '1px solid var(--gb)', borderRadius: 'var(--r)', padding: '10px 14px', fontSize: 12, color: 'var(--green)' }}>
        To change vehicle assignment, go to the Vehicles page and update the <strong>OwnedBy</strong> field to this driver's ID: <span style={{ fontFamily: 'var(--mono)' }}>{driver.id}</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   LOCATION TAB
───────────────────────────────────────────────────────── */
function LocationTab({ driver }) {
  const [isOnline, setIsOnline] = useState(false);
  return (
    <div className="fade-in">
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-hdr">
          <span className="card-title">Live Location</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className={`badge ${isOnline ? 'badge-green' : 'badge-gray'}`}>
              <span className={`dot ${isOnline ? 'dot-green' : ''}`} style={{ background: isOnline ? 'var(--green)' : 'var(--g400)' }} />
              {isOnline ? 'Online' : 'Offline'}
            </span>
            <button className="btn btn-sm" onClick={() => setIsOnline(!isOnline)}>
              {isOnline ? 'Simulate offline' : 'Simulate online'}
            </button>
          </div>
        </div>
        {!isOnline && (
          <div style={{ background: 'var(--ol)', borderBottom: '1px solid var(--ob)', padding: '8px 16px', fontSize: 11, color: 'var(--orange)' }}>
            Driver is offline · Last seen: {driver.lastSeen || '—'} · Showing last known location area
          </div>
        )}
        <div style={{ height: 480, position: 'relative' }}>
          <iframe
            title="driver-location-map"
            src="https://maps.google.com/maps?q=Hyderabad,Telangana,India&z=13&output=embed&ll=17.3850,78.4867"
            style={{ width: '100%', height: '100%', border: 'none' }}
            allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
          />
          {isOnline && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 18, height: 18, background: 'var(--blue)', borderRadius: '50%', border: '3px solid #fff', boxShadow: '0 0 0 6px rgba(37,99,235,0.25)', pointerEvents: 'none' }} />
          )}
        </div>
        <div className="map-foot">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--g400)" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span style={{ fontSize: 11, color: 'var(--g400)' }}>{isOnline ? 'Hyderabad, Telangana — live' : `Last seen: ${driver.lastSeen || '—'}`}</span>
          </div>
          <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--g400)' }}>0 connected vehicles</span>
        </div>
      </div>
      <div style={{ background: 'var(--bl)', border: '1px solid var(--bb)', borderRadius: 'var(--r)', padding: '10px 14px', fontSize: 12, color: 'var(--blue)' }}>
        Live location tracking will be available when the driver is online and the mobile app is connected.
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   ROUTES TAB
───────────────────────────────────────────────────────── */
function RoutesTab({ driver }) {
  const [routes,  setRoutes]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    import('../../api/routes')
      .then(({ getRoutesByDriver }) => getRoutesByDriver(driver.id))
      .then(data => {
        if (cancelled) return;
        setRoutes(data);
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        setError('Could not load routes. ' + (err.message || ''));
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [driver.id]);

  // Flatten each route into one row per shift
  function getShiftRows(route) {
    const routeMap = route.routeMap || {};
    const rows = [];

    Object.entries(routeMap).forEach(([shiftId, entry]) => {
      const stops    = entry.value || [];
      const campus   = stops.find(s => s.type === 'CAMPUS')?.value || '—';
      const students = stops.filter(s => s.type === 'STUDENT').length;
      const stopCount = stops.filter(s => s.type !== 'CAMPUS').length;

      // Try to get shift time from shiftId or entry tags
      const shiftTime = entry.time || entry.shiftTime || shiftId;

      // Direction label
      const direction = entry.type === 'ONWARD' ? 'Morning' : entry.type === 'RETURN' ? 'Afternoon' : entry.type || '';

      rows.push({
        shiftId,
        campus,
        shiftLabel: direction && shiftTime ? `${direction} · ${shiftTime}` : shiftTime,
        stopCount,
        students,
      });
    });

    return rows;
  }

  function routeStatusBadge(status) {
    return {
      ACTIVE:            'badge-green',
      INACTIVE:          'badge-gray',
      PENDING_APPROVAL:  'badge-orange',
      PLANNING:          'badge-blue',
    }[status] || 'badge-gray';
  }

  function routeStatusLabel(status) {
    return {
      ACTIVE:           'Active',
      INACTIVE:         'Inactive',
      PENDING_APPROVAL: 'Pending',
      PLANNING:         'Planning',
    }[status] || status;
  }

  // Flatten all routes → one row per shift for the table
  const rows = routes.flatMap(route =>
    getShiftRows(route).map(shift => ({ route, shift }))
  );

  return (
    <div className="fade-in">
      {selected && (
        <RouteDetailModal route={selected} onClose={() => setSelected(null)} />
      )}

      <div className="card">
        <div className="card-hdr">
          <span className="card-title">Assigned Routes</span>
          <span style={{ fontSize: 11, color: 'var(--g400)' }}>
            {loading
              ? 'Loading…'
              : `Routes this driver is currently assigned to`}
          </span>
        </div>

        {error && (
          <div style={{ margin: '8px 16px', padding: '8px 12px', background: 'var(--ol)', border: '1px solid var(--ob)', borderRadius: 'var(--r)', fontSize: 11, color: 'var(--orange)' }}>
            ⚠ {error}
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Route ID</th>
                <th>Route Name</th>
                <th>Campus</th>
                <th>Shift</th>
                <th>Stops</th>
                <th>Students</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--g400)', fontSize: 12 }}>
                    Loading routes…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--g400)', fontSize: 12 }}>
                    No routes assigned to this driver
                  </td>
                </tr>
              ) : rows.map(({ route, shift }, i) => (
                <tr
                  key={`${route.id}-${shift.shiftId}-${i}`}
                  className="clickable"
                  onClick={() => setSelected(route)}
                >
                  <td>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--g500)' }}>
                      {route.id}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{route.name || '—'}</td>
                  <td style={{ fontSize: 12, color: 'var(--g600)' }}>{shift.campus}</td>
                  <td style={{ fontSize: 12, color: 'var(--g600)' }}>{shift.shiftLabel}</td>
                  <td>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{shift.stopCount}</span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{shift.students}</span>
                  </td>
                  <td>
                    <span className={`badge ${routeStatusBadge(route.status)}`}>
                      {routeStatusLabel(route.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: 10, background: 'var(--bl)', border: '1px solid var(--bb)', borderRadius: 'var(--r)', padding: '10px 14px', fontSize: 12, color: 'var(--blue)' }}>
        Route assignment is managed via the Route Debugger. Changes there reflect automatically once saved there.
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   ROUTE DETAIL MODAL  (right-side drawer)
───────────────────────────────────────────────────────── */
function RouteDetailModal({ route: listRoute, onClose }) {
  const [fullRoute, setFullRoute]   = useState(null);
  const [fetchError, setFetchError] = useState('');

  // Fetch full route detail via GET /routes/{id} on mount
  useEffect(() => {
    let cancelled = false;
    import('../../api/routes')
      .then(({ getRouteById }) => getRouteById(listRoute.id))
      .then(data => { if (!cancelled) setFullRoute(data); })
      .catch(err => { if (!cancelled) setFetchError(err.message || 'Failed to load route detail.'); });
    return () => { cancelled = true; };
  }, [listRoute.id]);

  // Use full fetched data if available, fall back to list data while loading
  const route = fullRoute || listRoute;

  const routeMap = route.routeMap || {};
  const shifts   = Object.entries(routeMap); // [[shiftId, entry], ...]

  const [activeShift, setActiveShift] = useState(null);

  // Set default active shift once data arrives
  useEffect(() => {
    if (shifts.length > 0 && !activeShift) {
      setActiveShift(shifts[0][0]);
    }
  }, [route.id, shifts.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentEntry = activeShift ? routeMap[activeShift] : null;
  const stops        = currentEntry?.value    || [];
  const flags        = currentEntry?.flagInfo || [];
  const lastTrip     = currentEntry?.lastTripGenerationLog || null;

  const meta    = route.meta    || {};
  const notes   = meta.notes   || {};
  const contact = meta.contact || {};

  /* ── helpers ── */
  function flagStyle(flag) {
    return {
      BEAUTIFUL_ROUTE: { bg: 'var(--gl)', color: 'var(--green)',  label: '★ Beautiful' },
      ISSUE_ROUTE:     { bg: 'var(--ol)', color: 'var(--orange)', label: '⚠ Issue'     },
      CRITICAL_ROUTE:  { bg: 'var(--rl)', color: 'var(--red)',    label: '✕ Critical'  },
    }[flag] || { bg: 'var(--g100)', color: 'var(--g500)', label: flag };
  }

  function stopDotColor(type) {
    return type === 'CAMPUS' ? 'var(--blue)' : type === 'WAYPOINT' ? 'var(--orange)' : 'var(--green)';
  }

  function stopBadgeClass(type) {
    return type === 'CAMPUS' ? 'badge-blue' : type === 'WAYPOINT' ? 'badge-orange' : 'badge-green';
  }

  function routeStatusBadge(status) {
    return { ACTIVE: 'badge-green', INACTIVE: 'badge-gray', PENDING_APPROVAL: 'badge-orange', PLANNING: 'badge-blue' }[status] || 'badge-gray';
  }

  return (
    /* ── Backdrop ── */
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }}
      onClick={onClose}
    >
      {/* ── Drawer panel ── */}
      <div
        style={{ width: 520, maxWidth: '95vw', height: '100vh', overflowY: 'auto', background: 'var(--w)', boxShadow: '-4px 0 28px rgba(0,0,0,0.16)', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}
      >

        {/* Loading / error banner */}
        {!fullRoute && !fetchError && (
          <div style={{ padding: '8px 24px', background: 'var(--bl)', borderBottom: '1px solid var(--bb)', fontSize: 11, color: 'var(--blue)', flexShrink: 0 }}>
            Loading full route details…
          </div>
        )}
        {fetchError && (
          <div style={{ padding: '8px 24px', background: 'var(--ol)', borderBottom: '1px solid var(--ob)', fontSize: 11, color: 'var(--orange)', flexShrink: 0 }}>
            ⚠ {fetchError} — showing cached data.
          </div>
        )}

        {/* Header */}
        <div style={{ padding: '20px 24px 14px', borderBottom: '1px solid var(--g100)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--g900)', marginBottom: 3, wordBreak: 'break-word' }}>{route.name}</div>
              <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--g400)' }}>{route.id}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <span className={`badge ${routeStatusBadge(route.status)}`}>{route.status}</span>
              <button className="btn btn-sm" onClick={onClose} style={{ padding: '3px 9px', lineHeight: 1.4 }}>✕</button>
            </div>
          </div>
          {/* Meta row */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {meta.area && <span style={{ fontSize: 11, color: 'var(--g500)' }}>📍 {meta.area}</span>}
            <span style={{ fontSize: 11, color: 'var(--g500)' }}>
              <span style={{ color: 'var(--g400)' }}>Shifts: </span>
              <span style={{ fontFamily: 'var(--mono)' }}>{shifts.length}</span>
            </span>
            {route.updatedAt && (
              <span style={{ fontSize: 11, color: 'var(--g500)' }}>
                <span style={{ color: 'var(--g400)' }}>Updated: </span>
                {new Date(route.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>

        {/* Shift selector */}
        {shifts.length > 0 && (
          <div style={{ padding: '12px 24px 0', borderBottom: '1px solid var(--g100)', flexShrink: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Shifts</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', paddingBottom: 12 }}>
              {shifts.map(([shiftId, entry]) => {
                const isActive  = activeShift === shiftId;
                const dirSymbol = entry.type === 'ONWARD' ? '→' : entry.type === 'RETURN' ? '←' : '';
                const stopCount = (entry.value || []).length;
                return (
                  <button
                    key={shiftId}
                    onClick={() => setActiveShift(shiftId)}
                    style={{
                      padding: '5px 11px', borderRadius: 6, cursor: 'pointer', fontSize: 11,
                      fontFamily: 'var(--mono)', transition: 'all 0.12s',
                      border:      isActive ? '1.5px solid var(--blue)' : '1px solid var(--g200)',
                      background:  isActive ? 'var(--bl)' : 'var(--g50)',
                      color:       isActive ? 'var(--blue)' : 'var(--g600)',
                      fontWeight:  isActive ? 600 : 400,
                    }}
                  >
                    {dirSymbol} {shiftId}
                    <span style={{ fontSize: 10, opacity: 0.65, marginLeft: 4 }}>({stopCount})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Shift body */}
        {currentEntry ? (
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>

            {/* Direction + flags row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 11, padding: '3px 10px', borderRadius: 4, fontWeight: 600,
                background: currentEntry.type === 'ONWARD' ? 'var(--bl)' : 'var(--ol)',
                color:      currentEntry.type === 'ONWARD' ? 'var(--blue)' : 'var(--orange)',
              }}>
                {currentEntry.type === 'ONWARD' ? '→ Onward' : currentEntry.type === 'RETURN' ? '← Return' : currentEntry.type || '—'}
              </span>
              {flags.map((f, i) => {
                const { bg, color, label } = flagStyle(f.flag);
                return (
                  <span
                    key={i}
                    title={f.reason || ''}
                    style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: bg, color, fontWeight: 600, cursor: f.reason ? 'help' : 'default' }}
                  >
                    {label}
                  </span>
                );
              })}
            </div>

            {/* Stops timeline */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--g600)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                Stops · {stops.length}
              </div>
              <div style={{ background: 'var(--g50)', borderRadius: 'var(--r2)', border: '1px solid var(--g100)', padding: '6px 0' }}>
                {stops.length === 0 ? (
                  <div style={{ padding: '14px 16px', fontSize: 12, color: 'var(--g400)', textAlign: 'center' }}>No stops defined for this shift</div>
                ) : stops.map((stop, i) => {
                  const isFirst = i === 0;
                  const isLast  = i === stops.length - 1;
                  const dotColor = stopDotColor(stop.type);
                  return (
                    <div key={i} style={{ display: 'flex', gap: 12, padding: '5px 16px', alignItems: 'flex-start' }}>
                      {/* Timeline connector */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 18, flexShrink: 0, paddingTop: 3 }}>
                        {!isFirst && <div style={{ width: 2, height: 8, background: 'var(--g200)', marginBottom: 2 }} />}
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: dotColor, border: '2px solid var(--w)', boxShadow: `0 0 0 2px ${dotColor}`, flexShrink: 0 }} />
                        {!isLast && <div style={{ width: 2, flex: 1, minHeight: 8, background: 'var(--g200)', marginTop: 2 }} />}
                      </div>
                      {/* Stop content */}
                      <div style={{ flex: 1, paddingBottom: 5 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <span style={{ fontSize: 12, fontWeight: stop.type === 'CAMPUS' ? 700 : 500, color: 'var(--g800)', fontFamily: 'var(--mono)' }}>
                            {stop.value || '—'}
                          </span>
                          <span className={`badge ${stopBadgeClass(stop.type)}`} style={{ fontSize: 9 }}>{stop.type}</span>
                        </div>
                        <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--g400)' }}>
                          shift: {stop.shiftId}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Last trip generation log */}
            {lastTrip && (
              <div style={{
                marginBottom: 18,
                background: lastTrip.successful ? 'var(--gl)' : 'var(--rl)',
                border: `1px solid ${lastTrip.successful ? 'var(--gb)' : 'var(--rb)'}`,
                borderRadius: 'var(--r)', padding: '10px 14px',
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: lastTrip.successful ? 'var(--green)' : 'var(--red)', marginBottom: 6 }}>
                  Last Trip Generation &nbsp;·&nbsp; {lastTrip.successful ? '✓ Successful' : '✕ Failed'}
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 11, color: lastTrip.successful ? 'var(--green)' : 'var(--red)' }}>
                  <span><span style={{ opacity: 0.7 }}>Date: </span>{lastTrip.date || '—'}</span>
                  {lastTrip.tripId && (
                    <span><span style={{ opacity: 0.7 }}>Trip: </span><span style={{ fontFamily: 'var(--mono)' }}>{lastTrip.tripId}</span></span>
                  )}
                  {lastTrip.timestamp && (
                    <span><span style={{ opacity: 0.7 }}>At: </span>{new Date(lastTrip.timestamp * 1000).toLocaleString('en-IN')}</span>
                  )}
                </div>
                {lastTrip.errorMessage && (
                  <div style={{ marginTop: 6, fontSize: 11, fontFamily: 'var(--mono)', opacity: 0.85 }}>
                    Error: {lastTrip.errorMessage}
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            {(notes.serviceOperatorNote || notes.customerCareNote) && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--g600)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Notes</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {notes.serviceOperatorNote && (
                    <div style={{ background: 'var(--g50)', border: '1px solid var(--g100)', borderRadius: 'var(--r)', padding: '8px 12px' }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--g400)', marginBottom: 3 }}>OPERATOR NOTE</div>
                      <div style={{ fontSize: 12, color: 'var(--g700)' }}>{notes.serviceOperatorNote}</div>
                      {notes.serviceOperatorDisclaimer && (
                        <div style={{ fontSize: 10, color: 'var(--g400)', marginTop: 4, fontStyle: 'italic' }}>{notes.serviceOperatorDisclaimer}</div>
                      )}
                    </div>
                  )}
                  {notes.customerCareNote && (
                    <div style={{ background: 'var(--g50)', border: '1px solid var(--g100)', borderRadius: 'var(--r)', padding: '8px 12px' }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--g400)', marginBottom: 3 }}>CUSTOMER CARE NOTE</div>
                      <div style={{ fontSize: 12, color: 'var(--g700)' }}>{notes.customerCareNote}</div>
                      {notes.customerCareDisclaimer && (
                        <div style={{ fontSize: 10, color: 'var(--g400)', marginTop: 4, fontStyle: 'italic' }}>{notes.customerCareDisclaimer}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contacts */}
            {(contact.customerCareContact || contact.supervisorContact) && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--g600)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Contacts</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    ['Customer Care', contact.customerCareContact],
                    ['Supervisor',    contact.supervisorContact],
                  ].filter(([, c]) => !!c).map(([role, c]) => (
                    <div key={role} style={{ background: 'var(--g50)', border: '1px solid var(--g100)', borderRadius: 'var(--r)', padding: '8px 12px' }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--g400)', marginBottom: 5 }}>{role.toUpperCase()}</div>
                      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12 }}>
                        {c.name  && <span style={{ color: 'var(--g800)', fontWeight: 500 }}>{c.name}</span>}
                        {c.phone && <span style={{ fontFamily: 'var(--mono)', color: 'var(--g600)' }}>{c.phone}</span>}
                        {c.email && <span style={{ color: 'var(--g500)' }}>{c.email}</span>}
                      </div>
                      {c.address?.primaryAddressLine && (
                        <div style={{ fontSize: 11, color: 'var(--g400)', marginTop: 4 }}>
                          {[c.address.primaryAddressLine, c.address.city, c.address.state, c.address.postalCode].filter(Boolean).join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {route.tags && Object.keys(route.tags).length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--g600)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Tags</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {Object.entries(route.tags).map(([k, v]) => (
                    <span key={k} style={{ fontSize: 11, padding: '2px 8px', background: 'var(--g100)', color: 'var(--g600)', borderRadius: 4, fontFamily: 'var(--mono)' }}>
                      {k}: {v}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--g400)', fontSize: 12 }}>
            No shift data available for this route
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   TRIP HISTORY TAB
───────────────────────────────────────────────────────── */
function TripsTab({ driver }) {
  const [trips, setTrips]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    import('../../api/trips')
      .then(({ getTripsByDriver }) => getTripsByDriver(driver.id))
      .then(data => {
        if (cancelled) return;
        setTrips(data);
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        setError('Could not load trip history.');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [driver.id]);

  function tripStatusBadge(status) {
    const map = {
      COMPLETED:                  'badge-green',
      ACCEPTED:                   'badge-green',
      ACCEPTED_SYSTEM_COMPLETED:  'badge-green',
      STARTED:                    'badge-blue',
      STARTED_SYSTEM_COMPLETED:   'badge-blue',
      SCHEDULED:                  'badge-blue',
      SCHEDULED_UNASSIGNED:       'badge-orange',
      SCHEDULED_SYSTEM_COMPLETED: 'badge-orange',
      DRAFT:                      'badge-gray',
      NOT_SCHEDULED:              'badge-gray',
      SUPERSEDED:                 'badge-gray',
      ABANDONED:                  'badge-red',
      REJECTED:                   'badge-red',
      EMERGENCY_TRIGGERED:        'badge-red',
    };
    return map[status] || 'badge-gray';
  }

  function formatDuration(seconds) {
    if (!seconds) return '—';
    const m = Math.floor(seconds / 60);
    const h = Math.floor(m / 60);
    return h > 0 ? `${h}h ${m % 60}m` : `${m}m`;
  }

  function formatDistance(meters) {
    if (!meters) return '—';
    return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${meters} m`;
  }

  // ── Detail view ──────────────────────────────────────────
  if (selected) {
    const t = selected;
    const updatedAt = t.updatedAt ? new Date(t.updatedAt).toLocaleString('en-IN') : '—';
    return (
      <div className="fade-in">
        <div style={{ marginBottom: 12 }}>
          <button className="btn btn-sm" onClick={() => setSelected(null)}>← Back to trips</button>
        </div>

        <div style={{ background: 'var(--w)', border: '1px solid var(--g200)', borderRadius: 'var(--r2)', padding: '16px 20px', marginBottom: 16, boxShadow: 'var(--sh)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--g900)' }}>{t.name || t.id}</div>
              <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--g400)', marginTop: 2 }}>{t.id}</div>
            </div>
            <span className={`badge ${tripStatusBadge(t.status)}`}>{t.status}</span>
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {[
              ['Date',     t.date],
              ['Route',    t.routeId],
              ['Plan',     t.routePlan],
              ['Vehicle',  t.vehicleId],
              ['Duration', formatDuration(t.commuteTime)],
              ['Distance', formatDistance(t.distance)],
              ['Updated',  updatedAt],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 10, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k}</div>
                <div style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--g700)', marginTop: 2 }}>{v || '—'}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--w)', border: '1px solid var(--g200)', borderRadius: 'var(--r2)', boxShadow: 'var(--sh)', overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--g100)' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--g800)' }}>Stops · {t.stops?.length ?? 0}</span>
          </div>
          <div style={{ padding: '8px 0' }}>
            {(t.stops ?? []).map((stop, i) => {
              const isFirst  = i === 0;
              const isLast   = i === t.stops.length - 1;
              const dotColor = stop.type === 'CAMPUS' ? 'var(--blue)' : stop.type === 'WAYPOINT' ? 'var(--orange)' : 'var(--green)';
              return (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 20px', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flexShrink: 0 }}>
                    {!isFirst && <div style={{ width: 2, height: 12, background: 'var(--g200)', marginBottom: 2 }} />}
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: dotColor, border: '2px solid var(--w)', boxShadow: `0 0 0 2px ${dotColor}`, flexShrink: 0 }} />
                    {!isLast && <div style={{ width: 2, flex: 1, minHeight: 12, background: 'var(--g200)', marginTop: 2 }} />}
                  </div>
                  <div style={{ flex: 1, paddingBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--g800)', fontFamily: 'var(--mono)' }}>{stop.value || '—'}</span>
                      <span className={`badge ${stop.type === 'CAMPUS' ? 'badge-blue' : stop.type === 'WAYPOINT' ? 'badge-orange' : 'badge-green'}`} style={{ fontSize: 9 }}>{stop.type}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--g400)' }}>
                      {stop.arrival   && <span>Arr: {stop.arrival}</span>}
                      {stop.departure && <span>Dep: {stop.departure}</span>}
                    </div>
                    {stop.actions?.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                        {stop.actions.map((a, j) => (
                          <span key={j} style={{ fontSize: 10, padding: '1px 6px', background: 'var(--bl)', color: 'var(--blue)', borderRadius: 3, fontFamily: 'var(--mono)' }}>
                            {a.type} {a.target}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {t.emergencyContact?.phone && (
          <div style={{ marginTop: 12, background: 'var(--w)', border: '1px solid var(--g200)', borderRadius: 'var(--r2)', padding: '12px 20px', boxShadow: 'var(--sh)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--g700)', marginBottom: 8 }}>Emergency Contact</div>
            <div style={{ display: 'flex', gap: 20, fontSize: 12, color: 'var(--g600)' }}>
              {t.emergencyContact.name  && <span>{t.emergencyContact.name}</span>}
              {t.emergencyContact.phone && <span style={{ fontFamily: 'var(--mono)' }}>{t.emergencyContact.phone}</span>}
              {t.emergencyContact.email && <span>{t.emergencyContact.email}</span>}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── List view ────────────────────────────────────────────
  return (
    <div className="fade-in">
      <div className="card">
        <div className="card-hdr">
          <span className="card-title">Trip History</span>
          <span style={{ fontSize: 11, color: 'var(--g400)' }}>
            {loading ? 'Loading…' : `${trips.length} trips`}
          </span>
        </div>

        {error && (
          <div style={{ margin: '8px 16px', padding: '8px 12px', background: 'var(--ol)', border: '1px solid var(--ob)', borderRadius: 'var(--r)', fontSize: 11, color: 'var(--orange)' }}>
            ⚠ {error}
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Trip ID</th>
                <th>Name</th>
                <th>Status</th>
                <th>Date</th>
                <th>Route</th>
                <th>Plan</th>
                <th>Stops</th>
                <th>Duration</th>
                <th>Distance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: 32, color: 'var(--g400)', fontSize: 12 }}>Loading trips…</td></tr>
              ) : trips.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: 32, color: 'var(--g400)', fontSize: 12 }}>No trip history available</td></tr>
              ) : trips.map(t => (
                <tr key={t.id} className="clickable" onClick={() => setSelected(t)}>
                  <td><span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--g500)' }}>{t.id}</span></td>
                  <td style={{ fontSize: 12, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name || '—'}</td>
                  <td><span className={`badge ${tripStatusBadge(t.status)}`}>{t.status}</span></td>
                  <td style={{ fontSize: 11, color: 'var(--g600)', whiteSpace: 'nowrap' }}>{t.date || '—'}</td>
                  <td><span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--g500)' }}>{t.routeId || '—'}</span></td>
                  <td><span style={{ fontSize: 11 }}>{t.routePlan || '—'}</span></td>
                  <td><span style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{t.stops?.length ?? 0}</span></td>
                  <td style={{ fontSize: 11, color: 'var(--g600)' }}>{formatDuration(t.commuteTime)}</td>
                  <td style={{ fontSize: 11, color: 'var(--g600)' }}>{formatDistance(t.distance)}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <button className="btn btn-sm" onClick={() => setSelected(t)}>
                      <Icons.Eye /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   PERFORMANCE TAB
───────────────────────────────────────────────────────── */
function PerformanceTab({ driver }) {
  const perf = driver.performance || {};
  return (
    <div className="fade-in">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Total Trips', value: perf.totalTrips ?? '—', color: 'var(--g900)' },
          { label: 'Avg Rating',  value: perf.avgRating  ?? '—', color: 'var(--green)' },
          { label: 'On-Time %',   value: perf.onTimePercent ? `${perf.onTimePercent}%` : '—', color: 'var(--blue)' },
          { label: 'Incidents',   value: perf.incidents  ?? '—', color: 'var(--red)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-lbl">{s.label}</div>
            <div className="stat-val" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div className="ib">
        <div className="ib-hdr">Performance Details</div>
        <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--g400)', fontSize: 12 }}>
          Detailed performance charts will be populated from API data
        </div>
      </div>
    </div>
  );
}