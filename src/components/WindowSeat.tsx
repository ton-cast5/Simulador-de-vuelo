import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { motion } from 'framer-motion'
import type { Airport } from '../types'
import { greatCircleArc, interpolateGreatCircle } from '../utils/geo'
import 'leaflet/dist/leaflet.css'

const planeIcon = L.divIcon({
  className: 'window-plane-icon',
  html: `<div class="window-plane-svg"><svg viewBox="0 0 24 24" width="28" height="28"><path fill="#fff" stroke="#0b1220" stroke-width="1.2" d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

function FlyTo({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lon], map.getZoom(), { animate: true, duration: 0.6 })
  }, [lat, lon, map])
  return null
}

export function WindowSeat({
  progress,
  origin,
  destination,
}: {
  progress: number
  origin: Airport | null | undefined
  destination: Airport | null | undefined
}) {
  const t = Math.min(Math.max(progress, 0), 0.999)

  const pos = useMemo(() => {
    if (!origin || !destination) return { lat: 20, lon: -40 }
    return interpolateGreatCircle(origin.lat, origin.lon, destination.lat, destination.lon, t)
  }, [origin, destination, t])

  const route = useMemo(() => {
    if (!origin || !destination) return [] as [number, number][]
    return greatCircleArc(origin.lat, origin.lon, destination.lat, destination.lon, 64).map(
      (p) => [p.lat, p.lon] as [number, number],
    )
  }, [origin, destination])

  if (!origin || !destination) {
    return <div className="window-seat window-empty">Selecciona una ruta</div>
  }

  return (
    <div className="window-seat">
      <div className="window-map-clip">
        <MapContainer
          center={[pos.lat, pos.lon]}
          zoom={5}
          zoomControl={false}
          attributionControl={false}
          dragging={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          className="window-map"
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
          <Polyline positions={route} pathOptions={{ color: '#f5d56a', weight: 2, opacity: 0.85 }} />
          <Marker position={[pos.lat, pos.lon]} icon={planeIcon} />
          <FlyTo lat={pos.lat} lon={pos.lon} />
        </MapContainer>
        <div className="window-vignette" />
      </div>

      <div className="window-frame-real" aria-hidden>
        <div className="window-bevel" />
        <div className="window-shade-bar" />
        <div className="window-scratch" />
      </div>

      <motion.p
        className="window-caption"
        key={`${Math.round(pos.lat)}-${Math.round(pos.lon)}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Ventanilla · {pos.lat.toFixed(1)}°, {pos.lon.toFixed(1)}° · satélite en vivo
      </motion.p>
    </div>
  )
}
