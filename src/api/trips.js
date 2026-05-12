import { request } from './config'

export async function getTripsByDriver(driverId, { limit = 500, offset = 0 } = {}) {
  const params = new URLSearchParams({ 
    query: `@driverId:{${driverId}}`,
    limit,
    offset
  })
  const data = await request(`/trips/search?${params.toString()}`)
  return data?.trips ?? []
}

export function getTrip(id) {
  return request(`/trips/${id}`)
}