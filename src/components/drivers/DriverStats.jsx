import React from 'react';
import StatCard from '../shared/StatCard';

export default function DriverStats({ stats, activeFilter, onFilter }) {
  const {
    total = 0,
    verified = 0,
    policeVerified = 0,
    unverified = 0,
    zeroCertified = 0,
    docsVerified = 0,
    docsPendingReview = 0,
    docsUnverified = 0,
    docsRejected = 0,
  } = stats || {};

  return (
    <>
      {/* Row 1: Driver status — 5 cards */}
      <div className="stats-grid-1">
        <StatCard label="Total Drivers"   value={total}           sub="All registered"    active={!activeFilter}                   onClick={() => onFilter && onFilter(null)} />
        <StatCard label="Verified"        value={verified}        sub="Fully approved"    valueColor="var(--green)"  active={activeFilter === 'VERIFIED'}         onClick={() => onFilter && onFilter('VERIFIED')} />
        <StatCard label="Police Verified" value={policeVerified}  sub="Police check done" valueColor="var(--green)"  active={activeFilter === 'POLICE_VERIFIED'}   onClick={() => onFilter && onFilter('POLICE_VERIFIED')} />
        <StatCard label="Unverified"      value={unverified}      sub="No docs uploaded"  valueColor="var(--red)"    active={activeFilter === 'UNVERIFIED'}        onClick={() => onFilter && onFilter('UNVERIFIED')} />
        <StatCard label="Zero Certified"  value={zeroCertified}   sub="Certified drivers" valueColor="var(--blue)"   active={activeFilter === 'ZERO_CERTIFIED'}    onClick={() => onFilter && onFilter('ZERO_CERTIFIED')} />
      </div>

      {/* Row 2: Doc review status — 4 cards */}
      <div className="stats-grid-2">
        <StatCard label="Docs Pending Review" value={docsPendingReview} sub="Has pending docs" valueColor="var(--green)"  active={activeFilter === 'DOCS_VERIFIED'}   onClick={() => onFilter && onFilter('DOCS_VERIFIED')} />
        <StatCard label="Docs Unverified"     value={docsUnverified}   sub="No docs uploaded"    valueColor="var(--orange)" active={activeFilter === 'DOCS_PENDING'}    onClick={() => onFilter && onFilter('DOCS_PENDING')} />
        <StatCard label="Docs Verified"       value={docsVerified}     sub="All docs approved"     sub="Not uploaded"       valueColor="var(--g400)"   active={activeFilter === 'DOCS_UNVERIFIED'} onClick={() => onFilter && onFilter('DOCS_UNVERIFIED')} />
        <StatCard label="Docs Rejected"       value={docsRejected}     sub="Has rejected docs"     valueColor="var(--red)"    active={activeFilter === 'DOCS_REJECTED'}   onClick={() => onFilter && onFilter('DOCS_REJECTED')} />
      </div>
    </>
  );
}
