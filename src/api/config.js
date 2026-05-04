import { getToken, clearToken } from '../auth/tokenStore'

const BASE = 'https://api.dev.zeromoblt.com'

export async function request(path, options = {}) {
  const token = getToken()
  const method = (options.method || 'GET').toUpperCase()
  const requestBody = typeof options.body === 'string'
    ? JSON.parse(options.body)
    : options.body

  console.log('REQUEST:', path, { ...options, body: requestBody })

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      ...(method !== 'GET' ? { 'Content-Type': 'application/json' } : {}),
      accept: 'application/json',
      ...(token ? { Authorization: token } : {}),
      ...(options.headers || {}),
    },
  })

  if (res.status === 401) {
    clearToken()
    window.location.reload()
    return
  }

  if (res.status === 204) return null

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Error ${res.status}`)
  }

  return res.json()
}
