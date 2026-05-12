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
import { searchVendors } from '../api/vendors'
import { createAndUploadDocument, reviewDocument } from '../api/documents'
import { fetchVehiclesByDriverMap } from '../api/vehicles'
import { tagBool } from '../utils/helpers'
import '../components/drivers/CreateDriverModal.css'

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

export default function DriversPage() {
  const { showToast } = useToast()
  const { logout } = useAuth()

  const [allDrivers, setAllDrivers]               = useState([])
  const [loading, setLoading]                     = useState(true)
  const [error, setError]                         = useState(null)
  const [currentPage, setCurrentPage]             = useState(1)
  const [pageSize, setPageSize]                   = useState(10)
  const [vendorMap, setVendorMap]                 = useState({})
  const [vehicleMap, setVehicleMap]               = useState({})   // ← NEW
  const [selectedDriver, setSelectedDriver]       = useState(null)
  const [activeTabOverride, setActiveTabOverride] = useState(null)
  const [createOpen, setCreateOpen]               = useState(false)
  const [assignDocDriver, setAssignDocDriver]     = useState(null)
  const [vendorModal, setVendorModal]             = useState({ open: false, id: null, name: null })
  const [statusFilter, setStatusFilter]           = useState(null)

  // ── Fetch ALL drivers + vehicles once ────────────────────
  const fetchDrivers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [driverData, vendorData] = await Promise.all([
        getDrivers('*', 1000, 0),
        searchVendors({ query: '*' }).catch(() => ({ vendors: [] })),
      ])

      const vendorList = Array.isArray(vendorData) ? vendorData : (vendorData?.vendors ?? [])
      const map = {}
      vendorList.forEach(v => { if (v?.id) map[v.id] = v.name || v.id })
      setVendorMap(map)

      const list = driverData?.drivers ?? []
      const enriched = list.map(d => ({
        ...d,
        vendor:     map[d.vendorId] || d.vendorName || d.vendor || d.vendorId || '',
        vendorName: map[d.vendorId] || d.vendorName || '',
      }))

      setAllDrivers(enriched)
      setCurrentPage(1)
    } catch (err) {
      setError(err.message)
      showToast('Failed to load', err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Fetch vehicle map separately (non-blocking) ──────────
  useEffect(() => {
    fetchVehiclesByDriverMap()
      .then(setVehicleMap)
      .catch(() => {}) // silently fail — vehicle col just shows "—"
  }, [])

  useEffect(() => { fetchDrivers() }, [fetchDrivers])

  // ── Handle vehicle click ─────────────────────────────────
  function handleViewVehicle(vehicle) {
    // Opens the driver's profile on the Vehicles tab
    const driver = allDrivers.find(d => d.id === vehicle.ownedBy)
    if (driver) {
      setActiveTabOverride('vehicles')
      setSelectedDriver(driver)
    }
  }

  // ── Filtered + paginated drivers ─────────────────────────
  function getFilteredDrivers() {
    let filtered = allDrivers
    if (statusFilter === 'ZERO_CERTIFIED')
      filtered = allDrivers.filter(d => tagBool(d, 'zeroCertified'))
    else if (statusFilter === 'POLICE_VERIFIED')
      filtered = allDrivers.filter(d => d.status === 'POLICE_VERIFIED' || tagBool(d, 'policeVerified'))
    else if (statusFilter === 'DOCS_VERIFIED')
      filtered = allDrivers.filter(d => {
        const docs = Object.values(d.documents || {})
        return docs.length > 0 && docs.every(doc => typeof doc === 'object' && doc?.status === 'APPROVED')
      })
    else if (statusFilter === 'DOCS_PENDING')
      filtered = allDrivers.filter(d =>
        Object.values(d.documents || {}).some(doc => {
          if (typeof doc === 'string') return true
          return doc?.status === 'PENDING' || doc?.status === 'PENDING_VERIFICATION'
        })
      )
    else if (statusFilter === 'DOCS_UNVERIFIED')
      filtered = allDrivers.filter(d =>
        Object.keys(d.documents || {}).length === 0 && (d.docCount ?? 0) === 0
      )
    else if (statusFilter === 'DOCS_REJECTED')
      filtered = allDrivers.filter(d =>
        Object.values(d.documents || {}).some(doc =>
          typeof doc === 'object' && doc?.status === 'REJECTED'
        )
      )
    else if (statusFilter)
      filtered = allDrivers.filter(d => d.status === statusFilter)

    const total = filtered.length
    const pages = Math.ceil(total / pageSize)
    const safePage = Math.min(currentPage, pages || 1)
    const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)
    return { paged, total, pages }
  }

  // ── Stats (always from full list) ────────────────────────
  const stats = {
    total:          allDrivers.length,
    verified:       allDrivers.filter(d => d.status === 'VERIFIED').length,
    policeVerified: allDrivers.filter(d => d.status === 'POLICE_VERIFIED' || tagBool(d, 'policeVerified')).length,
    unverified:     allDrivers.filter(d => d.status === 'UNVERIFIED').length,
    zeroCertified:  allDrivers.filter(d => tagBool(d, 'zeroCertified')).length,

    docsVerified: allDrivers.filter(d => {
      const docs = Object.values(d.documents || {})
      return docs.length > 0 && docs.every(doc => typeof doc === 'object' && doc?.status === 'APPROVED')
    }).length,

    docsPendingReview: allDrivers.filter(d =>
      Object.values(d.documents || {}).some(doc => {
        if (typeof doc === 'string') return true
        return doc?.status === 'PENDING' || doc?.status === 'PENDING_VERIFICATION'
      })
    ).length,

    docsUnverified: allDrivers.filter(d =>
      Object.keys(d.documents || {}).length === 0 && (d.docCount ?? 0) === 0
    ).length,

    docsRejected: allDrivers.filter(d =>
      Object.values(d.documents || {}).some(doc =>
        typeof doc === 'object' && doc?.status === 'REJECTED'
      )
    ).length,
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

  async function handleDriverCreated(result) {
    const id = result?.id || result?.userId || result?.driverId || ''
    showToast('Driver created', `${id ? id + ' added' : 'Driver added'} successfully.`)
    await fetchDrivers()
  }

  // ── Update driver ────────────────────────────────────────
  async function handleUpdateDriver(driverId, fields) {
    const current = allDrivers.find(d => d.id === driverId)
    if (!current) return

    const updatedTags = { ...(current.tags || {}), ...(fields.tags || {}) }
    const payload = {
      vendorId:  fields.vendorId  ?? current.vendorId  ?? null,
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
    if (!docId) { showToast('Cannot review', 'Document has no ID yet.'); return }
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
    if (!docId) { showToast('Cannot review', 'Document has no ID yet.'); return }
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
      const result = await createAndUploadDocument({ entityId: driver.id, type, file })
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
    setAllDrivers(prev => prev.map(d => d.id === driverId ? { ...d, ...updated } : d))
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
    setAllDrivers(prev => prev.map(d => d.id === driverId ? apply(d) : d))
    setSelectedDriver(prev => prev?.id === driverId ? apply(prev) : prev)
  }

  // ── Pagination renderer ──────────────────────────────────
  function renderPagination(total, pages) {
    if (pages <= 1) return null
    const delta = 2
    const pageNums = []

    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || (i >= currentPage - delta && i <= currentPage + delta)) {
        pageNums.push(i)
      } else if (pageNums[pageNums.length - 1] !== '...') {
        pageNums.push('...')
      }
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 4px', marginTop: 8 }}>
        <div style={{ fontSize: 12, color: 'var(--g400)' }}>
          {((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, total)} of {total} drivers
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            className="btn btn-sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{ padding: '0 8px', minWidth: 28 }}
          >‹</button>

          {pageNums.map((p, i) =>
            p === '...'
              ? <span key={`e${i}`} style={{ padding: '0 6px', fontSize: 12, color: 'var(--g400)' }}>…</span>
              : <button
                  key={p}
                  className={`btn btn-sm${p === currentPage ? ' btn-primary' : ''}`}
                  onClick={() => setCurrentPage(p)}
                  style={{ padding: '0 8px', minWidth: 28 }}
                >{p}</button>
          )}

          <button
            className="btn btn-sm"
            onClick={() => setCurrentPage(p => Math.min(pages, p + 1))}
            disabled={currentPage === pages}
            style={{ padding: '0 8px', minWidth: 28 }}
          >›</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--g400)' }}>
          <span>Show</span>
          <select
            className="inp"
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1) }}
            style={{ width: 64, height: 28, fontSize: 12, padding: '0 4px' }}
          >
            {PAGE_SIZE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <span>per page</span>
        </div>
      </div>
    )
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

            {!loading && !error && allDrivers.length === 0 && (
              <EmptyState onCreateClick={() => setCreateOpen(true)} />
            )}

            {!loading && !error && allDrivers.length > 0 && (() => {
              const { paged, total, pages } = getFilteredDrivers()
              return (
                <>
                  <DriverTable
                    drivers={paged}
                    vehicleMap={vehicleMap}
                    onView={handleViewDriver}
                    onEdit={() => setCreateOpen(true)}
                    onDelete={() => showToast('Delete', 'Wire up delete API when ready.')}
                    onViewDocs={handleViewDriverDocs}
                    onViewVendor={({ id, name }) => setVendorModal({ open: true, id, name })}
                    onViewVehicle={handleViewVehicle}
                  />
                  {renderPagination(total, pages)}
                </>
              )
            })()}
          </>
        )}
      </div>

      <CreateDriverModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onDriverCreated={handleDriverCreated}
        existingDrivers={allDrivers}
      />
      <AssignDocumentModal
        open={!!assignDocDriver}
        driver={assignDocDriver}
        onClose={() => setAssignDocDriver(null)}
        onAssign={handleAssignDocument}
      />
      <VendorModal
        open={vendorModal.open}
        onClose={() => setVendorModal({ open: false, id: null, name: null })}
        vendorId={vendorModal.id}
        vendorName={vendorModal.name}
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