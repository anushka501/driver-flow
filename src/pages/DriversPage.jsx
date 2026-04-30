import React, { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import DriverStats from '../components/drivers/DriverStats';
import DriverTable from '../components/drivers/DriverTable';
import DriverProfile from '../components/drivers/DriverProfile';
import CreateDriverModal from '../components/drivers/CreateDriverModal';
import VendorModal from '../components/drivers/VendorModal';
import { Icons } from '../assets/icons';
import { useToast } from '../hooks/useToast';
import '../components/drivers/CreateDriverModal.css';

export default function DriversPage() {
  const { showToast } = useToast();

  const [drivers, setDrivers]               = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [activeTabOverride, setActiveTabOverride] = useState(null);
  const [createOpen, setCreateOpen]         = useState(false);
  const [vendorModal, setVendorModal]       = useState({ open: false, id: null });
  const [statFilter, setStatFilter]         = useState(null);

  // ── Compute all 9 stats from driver data ──
  const stats = {
    total:            drivers.length,
    verified:         drivers.filter(d => d.status === 'VERIFIED').length,
    policeVerified:   drivers.filter(d => d.policeVerified).length,
    unverified:       drivers.filter(d => d.status === 'UNVERIFIED').length,
    zeroCertified:    drivers.filter(d => d.zeroCertified).length,
    // Doc stats (counts across all drivers' documents)
    docsVerified:     drivers.reduce((n, d) => n + Object.values(d.documents || {}).filter(doc => doc?.status === 'APPROVED').length, 0),
    docsPendingReview:drivers.reduce((n, d) => n + Object.values(d.documents || {}).filter(doc => doc?.status === 'PENDING').length, 0),
    docsUnverified:   drivers.reduce((n, d) => n + Object.values(d.documents || {}).filter(doc => !doc?.status).length, 0),
    docsRejected:     drivers.reduce((n, d) => n + Object.values(d.documents || {}).filter(doc => doc?.status === 'REJECTED').length, 0),
  };

  function handleViewDriver(driver) {
    setActiveTabOverride(null);
    setSelectedDriver(driver);
  }

  function handleViewDriverDocs(driver) {
    setActiveTabOverride('documents');
    setSelectedDriver(driver);
  }

  function handleBack() {
    setSelectedDriver(null);
    setActiveTabOverride(null);
  }

  function handleCreateSave(newDriver) {
    const fullDriver = {
      ...newDriver,
      name: `${newDriver.firstName} ${newDriver.lastName}`.trim() || 'New Driver',
      status: 'UNVERIFIED',
      docCount: 0,
      documents: {},
      vehicles: [],
      routes: [],
      trips: [],
      performance: {},
    };
    setDrivers(prev => [fullDriver, ...prev]);
    showToast('Driver created', `${fullDriver.name} has been added successfully.`);
  }

  function handleDelete(driver) {
    if (window.confirm(`Delete driver ${driver.name}?`)) {
      setDrivers(prev => prev.filter(d => d.id !== driver.id));
      if (selectedDriver?.id === driver.id) setSelectedDriver(null);
      showToast('Driver deleted', `${driver.name} has been removed.`);
    }
  }

  function handleApproveDoc(driver, docType) {
    const update = d => ({
      ...d,
      documents: { ...d.documents, [docType]: { ...(d.documents?.[docType] || {}), status: 'APPROVED' } },
    });
    setDrivers(prev => prev.map(d => d.id === driver.id ? update(d) : d));
    setSelectedDriver(prev => prev?.id === driver.id ? update(prev) : prev);
    showToast('Document approved', `${docType} has been approved.`);
  }

  function handleRejectDoc(driver, docType) {
    const update = d => ({
      ...d,
      documents: { ...d.documents, [docType]: { ...(d.documents?.[docType] || {}), status: 'REJECTED' } },
    });
    setDrivers(prev => prev.map(d => d.id === driver.id ? update(d) : d));
    setSelectedDriver(prev => prev?.id === driver.id ? update(prev) : prev);
    showToast('Document rejected', `${docType} has been rejected.`);
  }

  return (
    <AppLayout activeNav="drivers">
      {/* Page header */}
      <div className="page-hdr">
        <span className="bc-link" style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => selectedDriver && handleBack()}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Entities
        </span>
        <span className="bc-sep">/</span>
        {selectedDriver ? (
          <>
            <span className="bc-link" style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={handleBack}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Drivers
            </span>
            <span className="bc-sep">/</span>
            <span className="bc-cur">{selectedDriver.name}</span>
          </>
        ) : (
          <span className="bc-cur" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Drivers
          </span>
        )}
        <div className="page-hdr-right">
          <button className="btn btn-sm" title="Table view" style={{ padding: '4px 8px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setCreateOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Create
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="content" style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {selectedDriver ? (
          <DriverProfile
            driver={selectedDriver}
            onBack={handleBack}
            onEdit={() => setCreateOpen(true)}
            onApproveDoc={handleApproveDoc}
            onRejectDoc={handleRejectDoc}
            onAssignDoc={() => showToast('Assign Document', 'Connect to API to assign documents.')}
            activeTabOverride={activeTabOverride}
          />
        ) : (
          <>
            <DriverStats
              stats={stats}
              activeFilter={statFilter}
              onFilter={setStatFilter}
            />
            {drivers.length === 0 ? (
              <EmptyState onCreateClick={() => setCreateOpen(true)} />
            ) : (
              <DriverTable
                drivers={drivers}
                statFilter={statFilter}
                onView={handleViewDriver}
                onEdit={() => setCreateOpen(true)}
                onDelete={handleDelete}
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
        onSave={handleCreateSave}
      />
      <VendorModal
        open={vendorModal.open}
        onClose={() => setVendorModal({ open: false, id: null })}
        vendorId={vendorModal.id}
      />
    </AppLayout>
  );
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
          Create your first driver profile or connect to your API to load existing data.
        </div>
        <button className="btn btn-primary" onClick={onCreateClick}>+ Create Driver</button>
      </div>
    </div>
  );
}
