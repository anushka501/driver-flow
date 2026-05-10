// src/api/vehicles.js
import { request } from './config'

export async function getVehicle(id) {
  try {
    const res = await request(`/vehicles/${id}`)
    if (res && (res.id || res.licencePlate)) return res
  } catch (_) {}

  const params = new URLSearchParams({ query: id })
  const res = await request(`/vehicles/search?${params.toString()}`)
  const list = Array.isArray(res) ? res : (res?.vehicles ?? [])
  const match = list.find(v => v.id === id) || list[0]
  if (!match) throw new Error(`Vehicle ${id} not found`)
  return match
}

export function searchVehicles({ query = '*', limit = '', offset = '' } = {}) {
  const params = new URLSearchParams({ query, limit, offset })
  return request(`/vehicles/search?${params.toString()}`)
}

// Fetch ALL vehicles and return a map of { [driverId]: vehicle }
export async function fetchVehiclesByDriverMap() {
  try {
    const res = await request(`/vehicles/search?query=*&limit=500`)
    const list = Array.isArray(res) ? res : (res?.vehicles ?? [])
    const map = {}
    list.forEach(v => {
      // ownedBy should be a real driver ID like "ZDR008851"
      if (v.ownedBy && v.ownedBy !== 'Driver') {
        map[v.ownedBy] = v
      }
    })
    return map
  } catch (_) {
    return {}
  }
}