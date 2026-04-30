import React from 'react';

export default function StatCard({ label, value, sub, valueColor, active, onClick }) {
  return (
    <div
      className={`stat-card${active ? ' active' : ''}`}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <div className="stat-lbl">{label}</div>
      <div className="stat-val" style={valueColor ? { color: valueColor } : {}}>
        {value ?? '—'}
      </div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}
