import { request } from './config'

function withoutEmptyValues(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== '' && value !== undefined && value !== null),
  )
}

// GET /drivers/search?query=* — the working list endpoint
export function getDrivers(query = '*') {
  return request(`/drivers/search?query=${encodeURIComponent(query)}`)
}

// GET /drivers/:id
export function getDriver(id) {
  return request(`/drivers/${id}`)
}

// POST /drivers — id must be an existing user id.
export function createDriver(data) {
  const id = (data.id || '').trim()

  if (!id) {
    throw new Error('Existing User ID is required.')
  }

  if (!/^Z[A-Z]{2}[0-9]{5,10}$/.test(id)) {
    throw new Error('User ID must match the format ZDR000001.')
  }

  const body = withoutEmptyValues({
    id,
    status: 'UNVERIFIED',
    vendorId: (data.vendorId || '').trim(),
    documents: {},
    homeLocation: {},
    preferredAreas: {},
    referrer: '',
    tags: withoutEmptyValues({
      licensePlate: (data.licensePlate || '').trim(),
      driverType: data.driverType || 'ADHOC',
      phone: (data.phone || '').trim(),
      isActive: data.isActive === false ? 'false' : 'true',
      zeroCertified: 'false',
      pushNotifications: 'true',
    }),
  })

  return request('/drivers', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// PUT /drivers/:id — used for status, vendorId, and tag-based toggles
export function updateDriver(id, fields) {
  return request(`/drivers/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      vendorId:  fields.vendorId  ?? '',
      status:    fields.status    ?? 'UNVERIFIED',
      documents: fields.documents ?? {},
      tags:      fields.tags      ?? {},
    }),
  })
}