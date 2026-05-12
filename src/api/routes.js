import { request } from './config';

export async function getRoutes({ query = '', offset = '', limit = '' } = {}) {
  const params = new URLSearchParams();
  if (query)  params.set('query',  query);
  if (offset) params.set('offset', String(offset));
  if (limit)  params.set('limit',  String(limit));

  const qs   = params.toString();
  const data = await request(`/routes/search${qs ? `?${qs}` : ''}`);
  return data?.routes || [];
}

export async function getRouteById(routeId) {
  return request(`/routes/${routeId}`);
}

export async function getRoutesByDriver(driverId) {
  // Step 1: get all trips for this driver
  const params = new URLSearchParams({
    query: `@driverId:{${driverId}}`,
    limit: 500,
  })
  const tripData = await request(`/trips/search?${params.toString()}`)
  const trips = tripData?.trips ?? []

  // Step 2: extract unique route IDs
  const routeIds = [...new Set(trips.map(t => t.routeId).filter(Boolean))]

  if (routeIds.length === 0) return []

  // Step 3: fetch each route in parallel
  const results = await Promise.allSettled(routeIds.map(id => getRouteById(id)))

  return results
    .filter(r => r.status === 'fulfilled' && r.value)
    .map(r => r.value)
}