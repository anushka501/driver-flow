const AVATAR_COLORS = [
  '#6366f1', '#d97706', '#0891b2', '#7c3aed',
  '#db2777', '#059669', '#dc2626', '#2563eb',
];

export function getAvatarColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}

export function statusBadgeClass(status = '') {
  switch (status.toUpperCase()) {
    case 'VERIFIED':           return 'badge-green';
    case 'PENDING_VERIFICATION':
    case 'PENDING':            return 'badge-orange';
    case 'UNVERIFIED':         return 'badge-red';
    case 'ZERO_CERTIFIED':     return 'badge-blue';
    default:                   return 'badge-gray';
  }
}

export function statusDotClass(status = '') {
  switch (status.toUpperCase()) {
    case 'VERIFIED':           return 'dot-green';
    case 'PENDING_VERIFICATION':
    case 'PENDING':            return 'dot-orange';
    case 'UNVERIFIED':         return 'dot-red';
    default:                   return '';
  }
}

export function statusLabel(status = '') {
  switch (status.toUpperCase()) {
    case 'PENDING_VERIFICATION': return 'PENDING';
    default: return status.toUpperCase();
  }
}

export function docStatusBadgeClass(status = '') {
  switch ((status || '').toUpperCase()) {
    case 'APPROVED':  return 'badge-green';
    case 'REJECTED':  return 'badge-red';
    case 'PENDING':   return 'badge-orange';
    default:          return 'badge-gray';
  }
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return dateStr;
}
