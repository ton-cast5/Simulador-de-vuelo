import * as THREE from 'three'
import type { Airport } from '../types'

const EARTH_KM = 6371

export function distanceKm(a: Airport, b: Airport): number {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLon = ((b.lon - a.lon) * Math.PI) / 180
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return 2 * EARTH_KM * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

export function formatDistance(km: number): string {
  if (km < 1000) return `${Math.round(km)} km`
  return `${(km / 1000).toFixed(1)} mil km`
}

export function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000))
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}

/** Great-circle arc points between two airports on a sphere */
export function greatCirclePoints(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  radius: number,
  segments = 128,
): THREE.Vector3[] {
  const start = latLonToVector3(lat1, lon1, 1).normalize()
  const end = latLonToVector3(lat2, lon2, 1).normalize()
  const points: THREE.Vector3[] = []

  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const point = new THREE.Vector3().copy(start).lerp(end, t).normalize()
    const lift = 1 + 0.045 * Math.sin(Math.PI * t)
    points.push(point.multiplyScalar(radius * lift))
  }

  return points
}
