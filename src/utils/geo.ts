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

function toRad(d: number) {
  return (d * Math.PI) / 180
}

function toDeg(r: number) {
  return (r * 180) / Math.PI
}

/** Spherical interpolation between two lat/lon points (correct great-circle). */
export function interpolateGreatCircle(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  t: number,
): { lat: number; lon: number } {
  const φ1 = toRad(lat1)
  const λ1 = toRad(lon1)
  const φ2 = toRad(lat2)
  const λ2 = toRad(lon2)

  const x1 = Math.cos(φ1) * Math.cos(λ1)
  const y1 = Math.cos(φ1) * Math.sin(λ1)
  const z1 = Math.sin(φ1)

  const x2 = Math.cos(φ2) * Math.cos(λ2)
  const y2 = Math.cos(φ2) * Math.sin(λ2)
  const z2 = Math.sin(φ2)

  const dot = Math.min(1, Math.max(-1, x1 * x2 + y1 * y2 + z1 * z2))
  const ω = Math.acos(dot)

  if (ω < 1e-8) return { lat: lat1, lon: lon1 }

  const sinω = Math.sin(ω)
  const a = Math.sin((1 - t) * ω) / sinω
  const b = Math.sin(t * ω) / sinω

  const x = a * x1 + b * x2
  const y = a * y1 + b * y2
  const z = a * z1 + b * z2

  return {
    lat: toDeg(Math.atan2(z, Math.sqrt(x * x + y * y))),
    lon: toDeg(Math.atan2(y, x)),
  }
}

export function greatCircleArc(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  segments = 64,
): { lat: number; lon: number }[] {
  const pts: { lat: number; lon: number }[] = []
  for (let i = 0; i <= segments; i++) {
    pts.push(interpolateGreatCircle(lat1, lon1, lat2, lon2, i / segments))
  }
  return pts
}
