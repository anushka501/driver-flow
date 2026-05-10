import React, { useState, useMemo } from 'react';
import Avatar from '../shared/Avatar';
import { Icons } from '../../assets/icons';
import { statusBadgeClass, statusDotClass, statusLabel, docStatusBadgeClass } from '../../utils/helpers'

function SortIcon({ col, sortCol, sortDir }) {
  const active = sortCol === col;
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 1, marginLeft: 4, verticalAlign: 'middle', opacity: active ? 1 : 0.3 }}>
      <svg width="7" height="5" viewBox="0 0 7 5" fill={active && sortDir === 'asc'  ? 'var(--blue)' : 'var(--g400)'}><path d="M3.5 0 7 5H0z"/></svg>
      <svg width="7" height="5" viewBox="0 0 7 5" fill={active && sortDir === 'desc' ? 'var(--blue)' : 'var(--g400)'}><path d="M3.5 5 0 0h7z"/></svg>
    </span>
  );
}

function docVerifLabel(driver) {
  const docs = Object.values(driver.documents || {});
  if (!docs.length) return 'UNVERIFIED';
  if (docs.every(d => typeof d === 'object' && d?.status === 'APPROVED')) return 'VERIFIED';
  if (docs.some(d => typeof d === 'object' && d?.status === 'REJECTED')) return 'REJECTED';
  if (docs.some(d => typeof d === 'string' || d?.status === 'PENDING' || d?.status === 'PENDING_VERIFICATION')) return 'PENDING';
  return 'UNVERIFIED';
}

const DOC_STATUS_ORDER = { VERIFIED: 0, PENDING: 1, UNVERIFIED: 2, REJECTED: 3 };
const STATUS_ORDER      = { VERIFIED: 0, PENDING_VERIFICATION: 1, UNVERIFIED: 2 };

export default function DriverTable({
  drivers = [], onView, onEdit, onDelete, onViewDocs, onViewVendor,
  statFilter,
}) {
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [sortCol,      setSortCol]      = useState('');
  const [sortDir,      setSortDir]      = useState('asc');

  const vendors = [...new Set(drivers.map(d => d.vendor).filter(Boolean))];

  function handleSort(col) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  }

  const filtered = useMemo(() => {
    let rows = drivers.filter(d => {
      const q = search.toLowerCase();
      const matchSearch = !search ||
        d.name?.toLowerCase().includes(q) ||
        d.id?.toLowerCase().includes(q);
      const matchStatus = !statusFilter || statusFilter === 'all' || d.status === statusFilter;
      const matchVendor = !vendorFilter || vendorFilter === 'all' || d.vendor === vendorFilter;

      let matchStat = true;
      if (statFilter === 'VERIFIED')             matchStat = d.status === 'VERIFIED';
      else if (statFilter === 'POLICE_VERIFIED')  matchStat = !!d.policeVerified;
      else if (statFilter === 'UNVERIFIED')       matchStat = d.status === 'UNVERIFIED';
      else if (statFilter === 'ZERO_CERTIFIED')   matchStat = !!d.zeroCertified;
      else if (statFilter === 'DOCS_VERIFIED') {
        const docs = Object.values(d.documents || {});
        matchStat = docs.length > 0 && docs.every(doc => doc?.status === 'APPROVED');
      } else if (statFilter === 'DOCS_PENDING') {
        matchStat = Object.values(d.documents || {}).some(doc => doc?.status === 'PENDING' || doc?.status === 'PENDING_VERIFICATION' || typeof doc === 'string');
      } else if (statFilter === 'DOCS_UNVERIFIED') {
        matchStat = Object.values(d.documents || {}).some(doc => !doc?.status);
      } else if (statFilter === 'DOCS_REJECTED') {
        matchStat = Object.values(d.documents || {}).some(doc => doc?.status === 'REJECTED');
      }

      return matchSearch && matchStatus && matchVendor && matchStat;
    });

    if (sortCol) {
      rows = [...rows].sort((a, b) => {
        let va, vb;
        if (sortCol === 'id')       { va = a.id || '';    vb = b.id || ''; }
        if (sortCol === 'name')     { va = a.name || '';  vb = b.name || ''; }
        if (sortCol === 'status')   { va = STATUS_ORDER[a.status] ?? 99;             vb = STATUS_ORDER[b.status] ?? 99;             return sortDir === 'asc' ? va - vb : vb - va; }
        if (sortCol === 'docVerif') { va = DOC_STATUS_ORDER[docVerifLabel(a)] ?? 99; vb = DOC_STATUS_ORDER[docVerifLabel(b)] ?? 99; return sortDir === 'asc' ? va - vb : vb - va; }
        if (sortCol === 'lastUpd') {
          va = a.updatedAt?.epochSeconds || 0
          vb = b.updatedAt?.epochSeconds || 0
          return sortDir === 'asc' ? va - vb : vb - va  // ← early return, no fall-through
        }
        if (typeof va === 'string') {
          return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
        }
        return 0;
      });
    }

    return rows;
  }, [drivers, search, statusFilter, vendorFilter, sortCol, sortDir, statFilter]);

  function thProps(col) {
    return {
      style: { cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' },
      onClick: () => handleSort(col),
    };
  }

  return (
    <div className="card">
      <div className="card-hdr">
        <div>
          <span className="card-title">All Drivers</span>
          <span className="count-pill">{filtered.length}</span>
        </div>
      </div>

      <div className="toolbar">
        <div className="tb-search" style={{ maxWidth: 240, background: 'var(--g50)', border: '1px solid var(--g200)', borderRadius: 'var(--r)', display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px', height: 32 }}>
          <Icons.Search />
          <input
            className="ti"
            style={{ border: 'none', background: 'none', outline: 'none', flex: 1, padding: 0 }}
            placeholder="Search drivers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="ti" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="VERIFIED">Verified</option>
          <option value="PENDING_VERIFICATION">Pending</option>
          <option value="UNVERIFIED">Unverified</option>
        </select>
        <select className="ti" value={vendorFilter} onChange={e => setVendorFilter(e.target.value)}>
          <option value="">All vendors</option>
          {vendors.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th {...thProps('id')}>
                Driver ID <SortIcon col="id" sortCol={sortCol} sortDir={sortDir} />
              </th>
              <th {...thProps('name')}>
                Driver Name <SortIcon col="name" sortCol={sortCol} sortDir={sortDir} />
              </th>
              <th {...thProps('status')}>
                Status <SortIcon col="status" sortCol={sortCol} sortDir={sortDir} />
              </th>
              <th {...thProps('docVerif')}>
                Doc Verification <SortIcon col="docVerif" sortCol={sortCol} sortDir={sortDir} />
              </th>
              <th {...thProps('lastUpd')}>
                Last Updated <SortIcon col="lastUpd" sortCol={sortCol} sortDir={sortDir} />
              </th>
              <th>Doc Count</th>
              <th>Vendor</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--g400)', fontSize: 12 }}>
                  No drivers found
                </td>
              </tr>
            ) : (
              filtered.map(driver => (
                <DriverRow
                  key={driver.id}
                  driver={driver}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onViewDocs={onViewDocs}
                  onViewVendor={onViewVendor}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DriverRow({ driver, onView, onEdit, onDelete, onViewDocs, onViewVendor }) {
  const badgeClass = statusBadgeClass(driver.status);
  const dotClass   = statusDotClass(driver.status);
  const label      = statusLabel(driver.status);

  const dvLabel = docVerifLabel(driver);
  const dvClass = docStatusBadgeClass(dvLabel);

  return (
    <tr className="clickable" onClick={() => onView && onView(driver)}>
      {/* Driver ID */}
      <td>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--g500)' }}>
          {driver.id}
        </span>
      </td>

      {/* Driver Name */}
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Avatar name={driver.name} />
          <span style={{ fontWeight: 500 }}>{driver.name}</span>
        </div>
      </td>

      {/* Status */}
      <td>
        <span className={`badge ${badgeClass}`}>
          {dotClass && <span className={`dot ${dotClass}`} />}
          {label}
        </span>
      </td>

      {/* Doc Verification Status */}
      <td
        style={{ cursor: 'pointer' }}
        onClick={e => { e.stopPropagation(); onViewDocs && onViewDocs(driver); }}
        title="Click to review documents"
      >
        <span className={`badge ${dvClass}`}>{dvLabel}</span>
      </td>

      {/* Last Updated */}
      <td style={{ fontSize: 11, color: 'var(--g400)' }}>
        {(() => {
          const epoch = driver.updatedAt?.epochSeconds || driver.lastUpdated
          if (!epoch) return '—'
          const date = new Date(epoch * 1000)
          return (
            <div>
              <div style={{ color: 'var(--g700)', fontWeight: 500 }}>
                {date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
              <div style={{ color: 'var(--g400)', fontSize: 10, marginTop: 1 }}>
                {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </div>
            </div>
          )
        })()}
      </td>

      {/* Doc Count */}
      <td
        style={{ cursor: 'pointer' }}
        onClick={e => { e.stopPropagation(); onViewDocs && onViewDocs(driver); }}
      >
        {(() => {
          const count = driver.docCount > 0
            ? driver.docCount
            : Object.keys(driver.documents || {}).length
          return (
            <span style={{
              fontSize: 11, fontFamily: 'var(--mono)',
              color: count > 0 ? 'var(--blue)' : 'var(--g400)',
              fontWeight: count > 0 ? 500 : 400,
            }}>
              {count}
            </span>
          )
        })()}
      </td>

      {/* Vendor */}
      <td onClick={e => { e.stopPropagation(); onViewVendor && onViewVendor({ id: driver.vendorId, name: driver.vendor }); }}>
        <span className="badge badge-gray" style={{ cursor: 'pointer' }}>{driver.vendor || '—'}</span>
      </td>

      {/* Actions */}
      <td onClick={e => e.stopPropagation()}>
        <div className="acts" style={{ display: 'flex', gap: 4 }}>
          <button className="ibtn" title="Edit"   onClick={() => onEdit && onEdit(driver)}><Icons.Edit /></button>
          <button className="ibtn" title="View"   onClick={() => onView && onView(driver)}><Icons.Eye /></button>
          <button className="ibtn ibtn-del" title="Delete" onClick={() => onDelete && onDelete(driver)}><Icons.Trash /></button>
        </div>
      </td>
    </tr>
  );
}
