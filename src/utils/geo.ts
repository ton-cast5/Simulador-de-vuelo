import * as THREE from 'three'

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
    // Lift arc slightly above surface for visibility
    const lift = 1 + 0.04 * Math.sin(Math.PI * t)
    points.push(point.multiplyScalar(radius * lift))
  }

  return points
}
