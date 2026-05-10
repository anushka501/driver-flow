import { request } from './config'

function withoutEmptyValues(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== '' && value !== undefined && value !== null),
  )
}

// GET /drivers/search?query=* — supports pagination via nextToken
export function getDrivers(query = '*', limit = 1000, offset = 0) {
  const params = new URLSearchParams({ query, limit, offset })
  return request(`/drivers/search?${params.toString()}`)
}

// GET /drivers/:id
export function getDriver(id) {
  return request(`/drivers/${id}`)
}

// POST /drivers — id must be an existing user id.
export function createDriver(data) {
  const id = (data.id || '').trim()

  if (!id) throw new Error('Existing User ID is required.')
  if (!/^Z[A-Z]{2}[0-9]{5,10}$/.test(id)) {
    throw new Error('User ID must match the format ZDR000001.')
  }

  const body = {
    id,
    status:   'UNVERIFIED',
    vendorId: (data.vendorId && data.vendorId.trim()) ? data.vendorId.trim() : null,
    documents: {},
    homeLocation: {
      lat: 0,
      lng: 0,
    },
    preferredAreas: {},
    referrer: '',
    tags: withoutEmptyValues({
      phone:             (data.phone || '').trim() || undefined,
      driverType:        data.driverType || 'ADHOC',
      isActive:          'true',
      zeroCertified:     'false',
      pushNotifications: 'true',
    }),
  }

  console.log('createDriver body:', JSON.stringify(body, null, 2))

  return request('/drivers', {
    method: 'POST',
    body,
  })
}

// PUT /drivers/:id — used for status, vendorId, and tag-based toggles
export function updateDriver(id, fields) {
  return request(`/drivers/${id}`, {
    method: 'PUT',
    body: {
      vendorId:  fields.vendorId  ?? null,
      status:    fields.status    ?? 'UNVERIFIED',
      documents: fields.documents ?? {},
      tags:      fields.tags      ?? {},
    },
  })
}