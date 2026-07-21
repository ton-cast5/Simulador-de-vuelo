import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Globe, { type GlobeMethods } from 'react-globe.gl'
import type { Airport } from '../types'
import { greatCircleArc, interpolateGreatCircle } from '../utils/geo'

const DAY_TEX = '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg'
const NIGHT_TEX = '//unpkg.com/three-globe/example/img/earth-night.jpg'
const BUMP_TEX = '//unpkg.com/three-globe/example/img/earth-topology.png'
const SKY_TEX = '//unpkg.com/three-globe/example/img/night-sky.png'

function PlaneMarker() {
  return (
    <div className="globe-plane-marker" title="Avión">
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
        <path
          fill="currentColor"
          d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
        />
      </svg>
    </div>
  )
}

interface GlobeSceneProps {
  origin?: Airport | null
  destination?: Airport | null
  mode: 'idle' | 'preview' | 'flight'
  progress?: number
  mapStyle?: 'day' | 'night'
  className?: string
}

export function GlobeScene({
  origin,
  destination,
  mode,
  progress = 0,
  mapStyle = 'day',
  className,
}: GlobeSceneProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 800, h: 600 })

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0) setSize({ w: width, h: height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const points = useMemo(() => {
    const list: { lat: number; lng: number; color: string; label: string; size: number }[] = []
    if (origin) {
      list.push({
        lat: origin.lat,
        lng: origin.lon,
        color: '#5b8fff',
        label: `${origin.code} · ${origin.city}`,
        size: 0.7,
      })
    }
    if (destination) {
      list.push({
        lat: destination.lat,
        lng: destination.lon,
        color: '#2f6fed',
        label: `${destination.code} · ${destination.city}`,
        size: 0.7,
      })
    }
    return list
  }, [origin, destination])

  const arcs = useMemo(() => {
    if (!origin || !destination) return []
    return [
      {
        startLat: origin.lat,
        startLng: origin.lon,
        endLat: destination.lat,
        endLng: destination.lon,
        color: ['#2f6fed', '#8eb6ff'],
      },
    ]
  }, [origin, destination])

  const rings = useMemo(() => {
    if (!origin || !destination) return []
    return [
      { lat: origin.lat, lng: origin.lon, color: '#5b8fff', maxR: 3.2, prop: 0 },
      { lat: destination.lat, lng: destination.lon, color: '#2f6fed', maxR: 3.2, prop: 0 },
    ]
  }, [origin, destination])

  const planeEls = useMemo(() => {
    if (!origin || !destination || mode === 'idle') return []
    const t = mode === 'flight' ? Math.min(Math.max(progress, 0), 0.999) : 0
    const pos = interpolateGreatCircle(
      origin.lat,
      origin.lon,
      destination.lat,
      destination.lon,
      t,
    )
    const ahead = interpolateGreatCircle(
      origin.lat,
      origin.lon,
      destination.lat,
      destination.lon,
      Math.min(t + 0.01, 1),
    )
    const bearing =
      (Math.atan2(
        Math.sin(((ahead.lon - pos.lon) * Math.PI) / 180) * Math.cos((ahead.lat * Math.PI) / 180),
        Math.cos((pos.lat * Math.PI) / 180) * Math.sin((ahead.lat * Math.PI) / 180) -
          Math.sin((pos.lat * Math.PI) / 180) *
            Math.cos((ahead.lat * Math.PI) / 180) *
            Math.cos(((ahead.lon - pos.lon) * Math.PI) / 180),
      ) *
        180) /
      Math.PI
    return [{ lat: pos.lat, lng: pos.lon, bearing }]
  }, [origin, destination, mode, progress])

  const labels = useMemo(() => {
    if (!origin || !destination) return []
    return [
      { lat: origin.lat, lng: origin.lon, text: origin.code, color: '#5b8fff' },
      { lat: destination.lat, lng: destination.lon, text: destination.code, color: '#2f6fed' },
    ]
  }, [origin, destination])

  const pathDots = useMemo(() => {
    if (!origin || !destination || mode === 'idle') return []
    return greatCircleArc(origin.lat, origin.lon, destination.lat, destination.lon, 64).map(
      (p) => ({ lat: p.lat, lng: p.lon }),
    )
  }, [origin, destination, mode])

  useEffect(() => {
    const g = globeRef.current
    if (!g) return
    g.controls().autoRotate = mode === 'idle'
    g.controls().autoRotateSpeed = 0.35
    g.controls().enableZoom = true
    g.controls().minDistance = 150
    g.controls().maxDistance = 480
    g.controls().enableDamping = true
    g.controls().dampingFactor = 0.08
  }, [mode, size.w])

  useEffect(() => {
    const g = globeRef.current
    if (!g) return
    if (mode === 'preview' && origin && destination) {
      const mid = interpolateGreatCircle(
        origin.lat,
        origin.lon,
        destination.lat,
        destination.lon,
        0.5,
      )
      g.pointOfView({ lat: mid.lat, lng: mid.lon, altitude: size.w < 768 ? 2.35 : 1.85 }, 1400)
    } else if (mode === 'idle') {
      g.pointOfView({ lat: 16, lng: -30, altitude: size.w < 768 ? 2.55 : 2.05 }, 1200)
    }
  }, [mode, origin, destination, size.w])

  useEffect(() => {
    const g = globeRef.current
    if (!g || mode !== 'flight' || !planeEls[0]) return
    const p = planeEls[0]
    g.pointOfView(
      {
        lat: p.lat,
        lng: p.lng,
        altitude: size.w < 768 ? 1.65 : 1.28,
      },
      400,
    )
  }, [mode, planeEls, size.w])

  const htmlElement = useCallback((d: object) => {
    const el = document.createElement('div')
    const data = d as { bearing: number }
    el.innerHTML = `<div class="globe-plane-marker" style="transform:rotate(${data.bearing}deg)"><svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg></div>`
    return el
  }, [])

  return (
    <div className={className ?? 'globe-canvas'} ref={wrapRef}>
      <Globe
        ref={globeRef}
        width={size.w}
        height={size.h}
        backgroundImageUrl={SKY_TEX}
        globeImageUrl={mapStyle === 'night' ? NIGHT_TEX : DAY_TEX}
        bumpImageUrl={BUMP_TEX}
        showAtmosphere
        atmosphereColor={mapStyle === 'night' ? '#5b7fd4' : '#8ec5ff'}
        atmosphereAltitude={0.22}
        pointsData={points}
        pointLat="lat"
        pointLng="lng"
        pointColor="color"
        pointAltitude={0.014}
        pointRadius="size"
        pointLabel="label"
        labelsData={labels}
        labelLat="lat"
        labelLng="lng"
        labelText="text"
        labelColor="color"
        labelSize={1.55}
        labelDotRadius={0.4}
        labelAltitude={0.022}
        labelResolution={2}
        ringsData={mode === 'idle' ? [] : rings}
        ringLat="lat"
        ringLng="lng"
        ringColor={(d: object) => (d as { color: string }).color}
        ringMaxRadius="maxR"
        ringPropagationSpeed={2.2}
        ringRepeatPeriod={1400}
        arcsData={mode === 'idle' ? [] : arcs}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor="color"
        arcAltitude={0.28}
        arcStroke={1.35}
        arcDashLength={0.4}
        arcDashGap={0.15}
        arcDashAnimateTime={mode === 'flight' ? 0 : 2200}
        pathsData={mode === 'idle' ? [] : [pathDots]}
        pathPointLat="lat"
        pathPointLng="lng"
        pathColor={() => 'rgba(230,195,106,0.5)'}
        pathStroke={0.65}
        htmlElementsData={planeEls}
        htmlLat="lat"
        htmlLng="lng"
        htmlAltitude={0.05}
        htmlElement={htmlElement}
        waitForGlobeReady
        animateIn={false}
      />
      <span className="sr-only">
        <PlaneMarker />
      </span>
    </div>
  )
}
