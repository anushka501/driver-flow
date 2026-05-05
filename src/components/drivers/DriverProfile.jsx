import React, { useState, useEffect } from 'react';
import Avatar from '../shared/Avatar';
import { Icons } from '../../assets/icons';
import { statusBadgeClass, statusLabel, docStatusBadgeClass , tagBool, getTag, formatUpdatedAt} from '../../utils/helpers';

const TABS = [
  { id: 'overview',   label: 'Overview'       },
  { id: 'profile',    label: 'Profile'         },
  { id: 'documents',  label: 'Document Review' },
  { id: 'vehicles',   label: 'Vehicles'        },
  { id: 'location',   label: 'Location'        },
  { id: 'routes',     label: 'Routes'          },
  { id: 'trips',      label: 'Trip History'    },
  { id: 'performance',label: 'Performance'     },
];

// All doc types matching admin portal (Image 4)
const DOC_TYPES = [
  'AADHAR', 'CONTRACT', 'DRIVERS_LICENSE', 'INSURANCE',
  'PAN', 'PASSPORT', 'POLICE_VERIFICATION', 'POLICY_DOCUMENT',
  'POLLUTION', 'REGISTRATION', 'SAFETY_STICKER', 'VEHICLE_FITNESS', 'OTHERS',
];

function normalizeDoc(doc, docType) {
  if (!doc) return null;
  if (typeof doc === 'string') {
    return {
      id: doc,
      documentId: doc,
      fileName: doc,
      status: 'PENDING_VERIFICATION',
      type: docType,
    };
  }

  return {
    ...doc,
    id: doc.id || doc.documentId,
    documentId: doc.documentId || doc.id,
    fileName: doc.fileName || doc.filename || doc.meta?.filename || doc.documentId || doc.id,
    fileUrl: doc.fileUrl || doc.url || doc.downloadUrl,
    status: doc.status || 'PENDING_VERIFICATION',
    type: doc.type || docType,
  };
}

export default function DriverProfile({ driver, onBack, onEdit, onApproveDoc, onRejectDoc, onAssignDoc,onUpdate, activeTabOverride }) {
  const [activeTab, setActiveTab] = useState(activeTabOverride || 'overview');

  if (!driver) return null;

  const badgeClass = statusBadgeClass(driver.status);
  const label = statusLabel(driver.status);

  return (
    <div className="fade-in">
      {/* Profile Banner */}
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

      {/* Tabs */}
      <div className="tabs-bar">
        {TABS.map(tab => (
          <div key={tab.id} className={`tab-item${activeTab === tab.id ? ' active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </div>
        ))}
      </div>

      {activeTab === 'overview'    && <OverviewTab    driver={driver} onTabSwitch={setActiveTab} />}
      {activeTab === 'profile'     && <ProfileTab     driver={driver} onUpdate={onUpdate} />}
      {activeTab === 'documents'   && <DocumentsTab   driver={driver} onApprove={onApproveDoc} onReject={onRejectDoc} onAssign={onAssignDoc} />}
      {activeTab === 'vehicles'    && <VehiclesTab    driver={driver} />}
      {activeTab === 'location'    && <LocationTab    driver={driver} />}
      {activeTab === 'routes'      && <RoutesTab      driver={driver} />}
      {activeTab === 'trips'       && <TripsTab       driver={driver} />}
      {activeTab === 'performance' && <PerformanceTab driver={driver} />}
    </div>
  );
}

/* ── OVERVIEW TAB ── */
function OverviewTab({ driver, onTabSwitch }) {
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
            <div className="ib-row"><span className="ib-key">Last Updated</span><span className="ib-val">{driver.lastUpdated || '—'}</span></div>
            <div className="ib-row"><span className="ib-key">Doc Count</span><span className="ib-val ib-val-mono">{driver.docCount ?? 0}</span></div>
          </div>
        </div>
        <div className="ib">
          <div className="ib-hdr">Quick Actions</div>
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="btn btn-sm" onClick={() => onTabSwitch('documents')} style={{ justifyContent: 'flex-start' }}>
              <Icons.FileText /> Review Documents ({driver.docCount ?? 0})
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

      {/* Mini map preview */}
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

/* ── PROFILE TAB ── */
function ProfileTab({ driver, onUpdate }) {
  const [saving, setSaving] = useState(null)

  // Tags store the boolean values as strings "true"/"false"
  const isActive        = tagBool(driver, 'isActive')
  const zeroCertified   = tagBool(driver, 'zeroCertified')
  const pushNotifs      = tagBool(driver, 'pushNotifications')
  const phone           = getTag(driver, 'phone') || driver.phone || ''

  async function handleToggle(tagKey, currentVal) {
    setSaving(tagKey)
    try {
      await onUpdate(driver.id, {
        tags: {
          ...(driver.tags || {}),
          [tagKey]: String(!currentVal),
        },
      })
    } finally {
      setSaving(null)
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
          <ToggleRow
            label="Active"
            sublabel="Driver is available for assignments"
            value={isActive}
            saving={saving === 'isActive'}
            onChange={() => handleToggle('isActive', isActive)}
          />
          <ToggleRow
            label="Zero Certified"
            sublabel="Driver has completed Zero certification"
            value={zeroCertified}
            saving={saving === 'zeroCertified'}
            onChange={() => handleToggle('zeroCertified', zeroCertified)}
          />
          <ToggleRow
            label="Push Notifications"
            sublabel="Receive ride and alert notifications"
            value={pushNotifs}
            saving={saving === 'pushNotifications'}
            onChange={() => handleToggle('pushNotifications', pushNotifs)}
          />
        </div>
      </div>
    </div>
  )
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
        <button
          className={`toggle${value ? '' : ' off'}`}
          onClick={onChange}
          disabled={saving}
          style={{ opacity: saving ? 0.6 : 1 }}
        >
          <div className="toggle-knob" />
        </button>
      </div>
    </div>
  )
}

/* ── DOCUMENTS TAB ── matching Image 4 exactly ── */
function DocumentsTab({ driver, onApprove, onReject, onAssign }) {
  const [apiDocMap, setApiDocMap]     = useState(null)   // null = not yet loaded
  const [docsLoading, setDocsLoading] = useState(true)
  const [docsError, setDocsError]     = useState('')

  useEffect(() => {
    let cancelled = false
    setDocsLoading(true)
    setDocsError('')

    import('../../api/documents').then(({ getDocuments, normalizeDocuments }) =>
      getDocuments(driver.id)
    ).then(raw => {
      if (cancelled) return
      // normalizeDocuments converts array or wrapped response → { TYPE: docObj }
      import('../../api/documents').then(({ normalizeDocuments }) => {
        const map = normalizeDocuments(raw)
        setApiDocMap(map)
        setDocsLoading(false)
      })
    }).catch(err => {
      if (cancelled) return
      console.warn('getDocuments failed, using embedded data:', err.message)
      setDocsError('Could not fetch live document details.')
      setApiDocMap(null)
      setDocsLoading(false)
    })

    return () => { cancelled = true }
  }, [driver.id])

  // Merge: API data wins; fall back to embedded driver.documents
  const embeddedDocs = driver.documents || {}

  function resolveDoc(docType) {
    // Use api map if loaded, otherwise embedded
    const source = apiDocMap ?? embeddedDocs
    const raw = source[docType]

    if (!raw) return null
    if (typeof raw === 'string') {
      return {
        documentId: raw,
        id: raw,
        status: null,
        fileName: null,
        fileUrl: null,
        uploadedAt: null,
        reviewedBy: null,
      }
    }
    return {
      documentId: raw.documentId || raw.id || null,
      id:         raw.documentId || raw.id || null,
      status:     raw.status     || null,
      fileName:   raw.meta?.filename || raw.fileName || raw.filename || null,
      fileUrl:    raw.fileUrl    || raw.downloadUrl  || raw.url || null,
      uploadedAt: raw.meta?.date || raw.createdAt    || raw.uploadedAt || null,
      reviewedBy: raw.reviewMeta?.reviewedBy         || raw.reviewedBy || null,
    }
  }

  return (
    <div className="fade-in">
      {/* Driver Information header */}
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
            {docsLoading && (
              <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--g400)', fontWeight: 400 }}>Loading…</span>
            )}
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
                const doc = resolveDoc(docType)
                const hasDoc = !!doc
                const statusVal = doc?.status
                return (
                  <tr key={docType}>
                    {/* Document Type */}
                    <td className="dt">{docType}</td>

                    {/* Document ID */}
                    <td>
                      {doc?.documentId
                        ? <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--g400)' }} title={doc.documentId}>{doc.documentId.slice(0, 14)}…</span>
                        : <span className="nd">—</span>
                      }
                    </td>

                    {/* File Name */}
                    <td>
                      {doc?.fileName
                        ? <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--g600)' }}>{doc.fileName}</span>
                        : hasDoc
                          ? <span style={{ fontSize: 11, color: 'var(--g400)' }}>—</span>
                          : <span className="nd">—</span>
                      }
                    </td>

                    {/* Status */}
                    <td>
                      {hasDoc && statusVal
                        ? <span className={`badge ${docStatusBadgeClass(statusVal)}`}>{statusVal}</span>
                        : hasDoc
                          ? <span className="badge badge-gray">UPLOADED</span>
                          : <span className="nd">—</span>
                      }
                    </td>

                    {/* Uploaded At */}
                    <td style={{ fontSize: 11, color: 'var(--g400)', whiteSpace: 'nowrap' }}>
                      {doc?.uploadedAt
                        ? new Date(doc.uploadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                        : <span className="nd">—</span>
                      }
                    </td>

                    {/* Reviewed By */}
                    <td style={{ fontSize: 11, color: 'var(--g500)' }}>
                      {doc?.reviewedBy || <span className="nd">—</span>}
                    </td>

                    {/* Document link */}
                    <td>
                      {doc?.fileUrl
                        ? (
                          <button className="btn btn-sm" onClick={() => window.open(doc.fileUrl, '_blank')}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                            View
                          </button>
                        )
                        : hasDoc
                          ? <span className="nd" style={{ fontSize: 10 }}>No URL</span>
                          : <span className="nd">No Document</span>
                      }
                    </td>

                    {/* Review Actions */}
                    <td>
                      {hasDoc ? (
                        <div style={{ display: 'flex', gap: 5 }}>
                          <button
                            className="btn btn-sm"
                            style={{ background: 'var(--gl)', color: 'var(--green)', border: '1px solid var(--gb)' }}
                            onClick={() => onApprove && onApprove(driver, docType)}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-sm"
                            style={{ background: 'var(--rl)', color: 'var(--red)', border: '1px solid var(--rb)' }}
                            onClick={() => onReject && onReject(driver, docType)}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="nd">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ── VEHICLES TAB ── */
function VehiclesTab({ driver }) {
  const vehicles = driver.vehicles || [];
  return (
    <div className="fade-in">
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-hdr">
          <span className="card-title">Vehicles associated with this driver</span>
          <span style={{ fontSize: 11, color: 'var(--g400)' }}>Vehicles page is the source of truth — this is a linked view</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Licence Plate</th><th>Vehicle ID</th><th>Status</th>
                <th>Fitness</th><th>Seating Capacity</th><th>Make</th>
                <th>Year</th><th>Last Serviced</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 24, color: 'var(--g400)', fontSize: 12 }}>
                  No vehicles associated with this driver
                </td></tr>
              ) : vehicles.map(v => (
                <tr key={v.plate} className="clickable">
                  <td><span style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{v.plate}</span></td>
                  <td><span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--g500)' }}>{v.id || v.plate}</span></td>
                  <td><span className={`badge ${v.status === 'AVAILABLE' ? 'badge-green' : v.status === 'IN_USE' ? 'badge-blue' : 'badge-orange'}`}>{v.status}</span></td>
                  <td><span className={`badge ${v.fitness === 'VERIFIED' ? 'badge-green' : 'badge-red'}`}>{v.fitness}</span></td>
                  <td><span style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{v.seats}</span></td>
                  <td><span style={{ fontSize: 11, color: 'var(--g400)' }}>{v.make || 'N/A'}</span></td>
                  <td><span style={{ fontSize: 11, color: 'var(--g400)' }}>{v.year || 'N/A'}</span></td>
                  <td><span style={{ fontSize: 11, color: 'var(--g400)' }}>{v.lastServiced || 'Never serviced'}</span></td>
                  <td><button className="btn btn-sm">View details</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ background: 'var(--gl)', border: '1px solid var(--gb)', borderRadius: 'var(--r)', padding: '10px 14px', fontSize: 12, color: 'var(--green)' }}>
        To add or remove vehicle associations, go to the Vehicles page and update the OwnedBy field to this driver's ID.
      </div>
    </div>
  );
}

/* ── LOCATION TAB — Google Maps of Hyderabad, fully scrollable ── */
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

        {/* Full Google Maps embed — Hyderabad, India, scrollable */}
        <div style={{ height: 480, position: 'relative' }}>
          <iframe
            title="driver-location-map"
            src="https://maps.google.com/maps?q=Hyderabad,Telangana,India&z=13&output=embed&ll=17.3850,78.4867"
            style={{ width: '100%', height: '100%', border: 'none' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          {isOnline && (
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 18, height: 18,
              background: 'var(--blue)', borderRadius: '50%',
              border: '3px solid #fff',
              boxShadow: '0 0 0 6px rgba(37,99,235,0.25)',
              pointerEvents: 'none',
            }} />
          )}
        </div>

        <div className="map-foot">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--g400)" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span style={{ fontSize: 11, color: 'var(--g400)' }}>
              {isOnline ? 'Hyderabad, Telangana — live' : `Last seen: ${driver.lastSeen || '—'}`}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--g400)' }}>0 connected vehicles</span>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--bl)', border: '1px solid var(--bb)', borderRadius: 'var(--r)', padding: '10px 14px', fontSize: 12, color: 'var(--blue)' }}>
        Live location tracking will be available when the driver is online and the mobile app is connected. The map shows Hyderabad by default — scroll or zoom to explore.
      </div>
    </div>
  );
}

/* ── ROUTES TAB ── */
function RoutesTab({ driver }) {
  const routes = driver.routes || [];
  return (
    <div className="fade-in">
      <div className="card">
        <div className="card-hdr">
          <span className="card-title">Assigned Routes</span>
          <span style={{ fontSize: 11, color: 'var(--g400)' }}>Routes this driver is currently assigned to</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Route ID</th><th>Route Name</th><th>Campus</th>
                <th>Shift</th><th>Stops</th><th>Students</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {routes.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24, color: 'var(--g400)', fontSize: 12 }}>
                  No routes assigned to this driver
                </td></tr>
              ) : routes.map(r => (
                <tr key={r.id} className="clickable">
                  <td><span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--g500)' }}>{r.id}</span></td>
                  <td style={{ fontWeight: 500 }}>{r.name}</td>
                  <td style={{ fontSize: 11, color: 'var(--g600)' }}>{r.campus}</td>
                  <td style={{ fontSize: 11, color: 'var(--g600)' }}>{r.shift}</td>
                  <td><span style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{r.stops}</span></td>
                  <td><span style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{r.students}</span></td>
                  <td><span className={`badge ${r.status === 'Active' ? 'badge-green' : 'badge-gray'}`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── TRIP HISTORY TAB ── matching Image 6 layout ── */
function TripsTab({ driver }) {
  const trips = driver.trips || [];
  return (
    <div className="fade-in">
      <div className="card">
        <div className="card-hdr">
          <span className="card-title">Trip History</span>
          <span style={{ fontSize: 11, color: 'var(--g400)' }}>All trips for this driver</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Trip ID</th><th>Status</th><th>Date</th>
                <th>Vehicle</th><th>Stops</th><th>Last Updated</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trips.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24, color: 'var(--g400)', fontSize: 12 }}>
                  No trip history available
                </td></tr>
              ) : trips.map(t => (
                <tr key={t.id} className="clickable">
                  <td><span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--g500)' }}>{t.id}</span></td>
                  <td><span className={`badge ${t.status === 'COMPLETED' ? 'badge-green' : t.status === 'STARTED' ? 'badge-blue' : t.status === 'REJECTED' ? 'badge-red' : 'badge-gray'}`}>{t.status}</span></td>
                  <td style={{ fontSize: 11 }}>{t.date}</td>
                  <td style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--g600)' }}>{t.vehicle || '—'}</td>
                  <td><span style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{t.stops ? `${t.stops} Stops` : '—'}</span></td>
                  <td style={{ fontSize: 11, color: 'var(--g400)' }}>{t.lastUpdated || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-sm btn-primary" style={{ fontSize: 10, padding: '3px 8px' }}>Timeline</button>
                      <button className="ibtn"><Icons.Eye /></button>
                    </div>
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

/* ── PERFORMANCE TAB ── */
function PerformanceTab({ driver }) {
  const perf = driver.performance || {};
  return (
    <div className="fade-in">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Total Trips',  value: perf.totalTrips ?? '—',  color: 'var(--g900)' },
          { label: 'Avg Rating',   value: perf.avgRating  ?? '—',  color: 'var(--green)' },
          { label: 'On-Time %',    value: perf.onTimePercent ? `${perf.onTimePercent}%` : '—', color: 'var(--blue)' },
          { label: 'Incidents',    value: perf.incidents  ?? '—',  color: 'var(--red)' },
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
