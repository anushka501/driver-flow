import { getToken, clearToken } from '../auth/tokenStore'

const BASE = 'https://api.dev.zeromoblt.com'

function stripNulls(obj) {
  if (Array.isArray(obj)) return obj.map(stripNulls)
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([, v]) => v !== null && v !== undefined && v !== '')
        .map(([k, v]) => [k, stripNulls(v)])
    )
  }
  return obj
}

export async function request(path, options = {}) {
  const token = getToken()
  const method = (options.method || 'GET').toUpperCase()

  // Normalize body for logging
  const requestBody = typeof options.body === 'string'
    ? JSON.parse(options.body)
    : options.body

  console.log('REQUEST:', path, { ...options, body: requestBody })

  const cleanBody = requestBody && method !== 'GET'
    ? stripNulls(requestBody)   // ← strip null/undefined/'' before sending
    : undefined

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    body: cleanBody ? JSON.stringify(cleanBody) : undefined,
    headers: {
      ...(method !== 'GET' ? { 'Content-Type': 'application/json' } : {}),
      accept: 'application/json',
      ...(token ? { Authorization: token } : {}),
      ...(options.headers || {}),
    },
  })

  // 401 check BEFORE ok check
  if (res.status === 401) {
    clearToken()
    window.location.reload()
    return
  }

  if (res.status === 204) return null

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}))
    console.error('API error body:', errBody)
    throw new Error(errBody.message || res.statusText)
  }

  return res.json()
}