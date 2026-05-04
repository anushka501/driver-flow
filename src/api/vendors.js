import { request } from './config'

export async function getVendors(filter = '*') {
  const paths = [
    `/vendors?filter=${encodeURIComponent(filter)}`,
    '/vendors?filter=',
    '/vendors',
  ]

  let lastError
  for (const path of paths) {
    try {
      return await request(path)
    } catch (err) {
      lastError = err
      console.warn('Vendors request failed:', path, err.message)
    }
  }

  throw lastError
}
