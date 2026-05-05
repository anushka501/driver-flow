import { request } from './config'

/**
 * Search vendors via GET /vendors/search
 * @param {string} query - search term (default '*' = all)
 * @param {string|number} offset - pagination offset
 * @param {string|number} limit - max results to return
 * @returns {Promise<{ total: number, vendors: Array }>}
 */
export async function searchVendors({ query = '*', offset = '', limit = '' } = {}) {
  const params = new URLSearchParams({ query, offset, limit })
  return request(`/vendors/search?${params.toString()}`)
}

// Keep getVendors as an alias that uses the search endpoint
export async function getVendors() {
  return searchVendors({ query: '*' })
}