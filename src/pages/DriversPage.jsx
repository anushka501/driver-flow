import React, { useState, useEffect, useCallback } from 'react'
import AppLayout from '../components/layout/AppLayout'
import DriverStats from '../components/drivers/DriverStats'
import DriverTable from '../components/drivers/DriverTable'
import DriverProfile from '../components/drivers/DriverProfile'
import CreateDriverModal from '../components/drivers/CreateDriverModal'
import AssignDocumentModal from '../components/drivers/AssignDocumentModal'
import VendorModal from '../components/drivers/VendorModal'
import { Icons } from '../assets/icons'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../auth/AuthContext'
import { getDriver, getDrivers, updateDriver } from '../api/drivers'
import { createAndUploadDocument, reviewDocument } from '../api/documents'
import { tagBool } from '../utils/helpers'
import '../components/drivers/CreateDriverModal.css'

export default function DriversPage() {
  const { showToast } = useToast()
  const { logout } = useAuth()

  const [drivers, setDrivers]                     = useState([])
  const [loading, setLoading]                     = useState(true)
  const [error, setError]                         = useState(null)
  const [selectedDriver, setSelectedDriver]       = useState(null)
  const [activeTabOverride, setActiveTabOverride] = useState(null)
  const [createOpen, setCreateOpen]               = useState(false)
  const [assignDocDriver, setAssignDocDriver]     = useState(null)
  const [vendorModal, setVendorModal] = useState({ open: false, id: null })
  const [statusFilter, setStatusFilter]  = useState(null)
  // ── Fetch drivers using search endpoint ─────────────────
  const fetchDrivers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getDrivers('*')
      // API returns { drivers: [...] }
      const list = Array.isArray(data) ? data : (data?.drivers ?? [])
      setDrivers(list)
    } catch (err) {
      setError(err.message)
      showToast('Failed to load', err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDrivers() }, [fetchDrivers])

  // ── Stats — computed from real data ─────────────────────
  const stats = {
    total:             drivers.length,
    verified:          drivers.filter(d => d.status === 'VERIFIED').length,
    policeVerified:    drivers.filter(d => d.status === 'POLICE_VERIFIED').length,
    unverified:        drivers.filter(d => d.status === 'UNVERIFIED').length,
    zeroCertified:     drivers.filter(d => tagBool(d, 'zeroCertified')).length,
    docsVerified:      drivers.reduce((n, d) => n + Object.values(d.documents || {}).filter(doc => doc?.status === 'APPROVED').length, 0),
    docsPendingReview: drivers.reduce((n, d) => n + Object.values(d.documents || {}).filter(doc => {
      const status = typeof doc === 'string' ? 'PENDING_VERIFICATION' : doc?.status
      return status === 'PENDING' || status === 'PENDING_VERIFICATION'
    }).length, 0),
    docsUnverified:    drivers.reduce((n, d) => n + Object.values(d.documents || {}).filter(doc => !doc?.status).length, 0),
    docsRejected:      drivers.reduce((n, d) => n + Object.values(d.documents || {}).filter(doc => doc?.status === 'REJECTED').length, 0),
  }

  // ── Navigation ───────────────────────────────────────────
  function handleViewDriver(driver) {
    setActiveTabOverride(null)
    setSelectedDriver(driver)
  }

  function handleViewDriverDocs(driver) {
    setActiveTabOverride('documents')
    setSelectedDriver(driver)
  }

  function handleBack() {
    setSelectedDriver(null)
    setActiveTabOverride(null)
  }

  // ── Called after successful POST ─────────────────────────
  function handleDriverCreated(newDriver) {
    setDrivers(prev => [newDriver, ...prev])
    showToast('Driver created', `${newDriver.id} added successfully.`)
  }

  // ── Update driver (toggles, status) ─────────────────────
  async function handleUpdateDriver(driverId, fields) {
    // Find current driver to merge tags
    const current = drivers.find(d => d.id === driverId)
    if (!current) return

    const updatedTags = { ...(current.tags || {}), ...(fields.tags || {}) }
    const payload = {
      vendorId:  fields.vendorId  ?? current.vendorId  ?? '',
      status:    fields.status    ?? current.status    ?? 'UNVERIFIED',
      documents: fields.documents ?? current.documents ?? {},
      tags:      updatedTags,
    }

    try {
      const result = await updateDriver(driverId, payload)
      const updated = result ?? { ...current, ...payload }
      patchDriver(driverId, updated)
      showToast('Updated', 'Driver updated successfully.')
    } catch (err) {
      showToast('Update failed', err.message)
    }
  }

  // ── Doc review ───────────────────────────────────────────
  async function handleApproveDoc(driver, docType) {
    const doc = driver.documents?.[docType]
    const docId = typeof doc === 'string' ? doc : (doc?.documentId || doc?.id)
    if (!docId) {
      showToast('Cannot review', 'Document has no ID yet.')
      return
    }
    try {
      await reviewDocument(docId, 'APPROVED')
      patchDoc(driver.id, docType, 'APPROVED')
      showToast('Approved', `${docType} approved.`)
    } catch (err) {
      showToast('Failed', err.message)
    }
  }

  async function handleRejectDoc(driver, docType) {
    const doc = driver.documents?.[docType]
    const docId = typeof doc === 'string' ? doc : (doc?.documentId || doc?.id)
    if (!docId) {
      showToast('Cannot review', 'Document has no ID yet.')
      return
    }
    try {
      await reviewDocument(docId, 'REJECTED')
      patchDoc(driver.id, docType, 'REJECTED')
      showToast('Rejected', `${docType} rejected.`)
    } catch (err) {
      showToast('Failed', err.message)
    }
  }

  async function refreshDriver(driverId) {
    const fresh = await getDriver(driverId)
    patchDriver(driverId, fresh)
    return fresh
  }

  async function handleAssignDocument({ driver, type, file }) {
    try {
      const result = await createAndUploadDocument({
        entityId: driver.id,
        type,
        file,
      })

      patchDoc(driver.id, type, 'PENDING_VERIFICATION', {
        id: result.documentId,
        documentId: result.documentId,
        fileName: file.name,
        fileUrl: result.preSignedUrl?.split('?')[0],
        type,
      })

      await refreshDriver(driver.id).catch(() => null)
      showToast('Document assigned', `${type} uploaded successfully.`)
    } catch (err) {
      showToast('Upload failed', err.message)
      throw err
    }
  }

  // ── Local state patchers ─────────────────────────────────
  function patchDriver(driverId, updated) {
    setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, ...updated } : d))
    setSelectedDriver(prev => prev?.id === driverId ? { ...prev, ...updated } : prev)
  }

  function patchDoc(driverId, docType, newStatus, extra = {}) {
    const apply = d => ({
      ...d,
      documents: {
        ...d.documents,
        [docType]: {
          ...(typeof d.documents?.[docType] === 'string'
            ? { id: d.documents?.[docType], documentId: d.documents?.[docType] }
            : (d.documents?.[docType] || {})),
          ...extra,
          status: newStatus,
        },
      },
    })
    setDrivers(prev => prev.map(d => d.id === driverId ? apply(d) : d))
    setSelectedDriver(prev => prev?.id === driverId ? apply(prev) : prev)
  }

  return (
    <AppLayout activeNav="drivers">
      <div className="page-hdr">
        <span className="bc-link" onClick={() => selectedDriver && handleBack()}>Entities</span>
        <span className="bc-sep">/</span>
        {selectedDriver ? (
          <>
            <span className="bc-link" onClick={handleBack}>Drivers</span>
            <span className="bc-sep">/</span>
            <span className="bc-cur">{selectedDriver.name || selectedDriver.id}</span>
          </>
        ) : (
          <span className="bc-cur">Drivers</span>
        )}
        <div className="page-hdr-right">
          {!selectedDriver && (
            <button className="btn btn-sm" onClick={fetchDrivers} disabled={loading}>
              {loading ? '↻' : '↻ Refresh'}
            </button>
          )}
          <button className="btn btn-sm"><Icons.Download /> Export</button>
          <button className="btn btn-primary btn-sm" onClick={() => setCreateOpen(true)}>
            + Create Driver
          </button>
          <button
            className="btn btn-sm"
            onClick={logout}
            style={{ color: 'var(--red)', borderColor: 'var(--rb)' }}
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="content" style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {selectedDriver ? (
          <DriverProfile
            driver={selectedDriver}
            onBack={handleBack}
            onEdit={() => setCreateOpen(true)}
            onApproveDoc={handleApproveDoc}
            onRejectDoc={handleRejectDoc}
            onUpdate={handleUpdateDriver}
            onAssignDoc={driver => setAssignDocDriver(driver)}
            activeTabOverride={activeTabOverride}
          />
        ) : (
          <>
            <DriverStats stats={stats} activeFilter={statusFilter} onFilter={setStatusFilter} />

            {loading && (
              <div className="card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--g400)', fontSize: 13 }}>
                Loading drivers...
              </div>
            )}

            {!loading && error && (
              <div className="card" style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>{error}</div>
                <button className="btn btn-primary btn-sm" onClick={fetchDrivers}>Retry</button>
              </div>
            )}

            {!loading && !error && drivers.length === 0 && (
              <EmptyState onCreateClick={() => setCreateOpen(true)} />
            )}

            {!loading && !error && drivers.length > 0 && (
              <DriverTable
                drivers={(() => {
                  if (!statusFilter) return drivers

                  if (statusFilter === 'ZERO_CERTIFIED')
                    return drivers.filter(d => tagBool(d, 'zeroCertified'))

                  if (statusFilter === 'DOCS_VERIFIED')
                    return drivers.filter(d =>
                      Object.values(d.documents || {}).every(doc => doc?.status === 'APPROVED')
                    )

                  if (statusFilter === 'DOCS_PENDING')
                    return drivers.filter(d =>
                      Object.values(d.documents || {}).some(doc =>
                        doc?.status === 'PENDING' || doc?.status === 'PENDING_VERIFICATION'
                      )
                    )

                  if (statusFilter === 'DOCS_UNVERIFIED')
                    return drivers.filter(d =>
                      Object.values(d.documents || {}).length === 0
                    )

                  if (statusFilter === 'DOCS_REJECTED')
                    return drivers.filter(d =>
                      Object.values(d.documents || {}).some(doc => doc?.status === 'REJECTED')
                    )

                  if (statusFilter === 'POLICE_VERIFIED')
                    return drivers.filter(d => tagBool(d, 'policeVerified'))

                  // fallback → normal status
                  return drivers.filter(d => d.status === statusFilter)
                })()}
                onView={handleViewDriver}
                onEdit={() => setCreateOpen(true)}
                onDelete={() => showToast('Delete', 'Wire up delete API when ready.')}
                onViewDocs={handleViewDriverDocs}
                onViewVendor={id => setVendorModal({ open: true, id })}
              />
            )}
          </>
        )}
      </div>

      <CreateDriverModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onDriverCreated={handleDriverCreated}
        existingDrivers={drivers}
      />
      <AssignDocumentModal
        open={!!assignDocDriver}
        driver={assignDocDriver}
        onClose={() => setAssignDocDriver(null)}
        onAssign={handleAssignDocument}
      />
      <VendorModal
        open={vendorModal.open}
        onClose={() => setVendorModal({ open: false, id: null })}
        vendorId={vendorModal.id}
      />
    </AppLayout>
  )
}

function EmptyState({ onCreateClick }) {
  return (
    <div className="card">
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--bl)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--blue)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--g800)', marginBottom: 6 }}>No drivers yet</div>
        <div style={{ fontSize: 12, color: 'var(--g400)', marginBottom: 20 }}>
          API returned no drivers, or create your first one.
        </div>
        <button className="btn btn-primary" onClick={onCreateClick}>+ Create Driver</button>
      </div>
    </div>
  )
}
