import { Canvas, useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { Airport, MapStyle } from '../types'
import { interpolateGreatCircle } from '../utils/geo'

const EARTH =
  'https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg'
const EARTH_NIGHT =
  'https://unpkg.com/three-globe@2.31.1/example/img/earth-night.jpg'
const BUMP =
  'https://unpkg.com/three-globe@2.31.1/example/img/earth-topology.png'

function latLonToVec3(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}

function Earth({ mapStyle }: { mapStyle: MapStyle }) {
  const tex = useMemo(() => {
    const loader = new THREE.TextureLoader()
    const url =
      mapStyle === 'classic'
        ? EARTH_NIGHT
        : mapStyle === 'satellite'
          ? EARTH
          : EARTH
    const t = loader.load(url)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [mapStyle])

  const bump = useMemo(() => new THREE.TextureLoader().load(BUMP), [])

  return (
    <mesh>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial
        map={tex}
        bumpMap={bump}
        bumpScale={0.04}
        roughness={0.85}
        metalness={0.05}
        color={mapStyle === 'classic' ? '#c5d4e8' : '#ffffff'}
      />
    </mesh>
  )
}

function Scene({
  origin,
  destination,
  progress,
  mapStyle,
}: {
  origin: Airport
  destination: Airport
  progress: number
  mapStyle: MapStyle
}) {
  const earthRef = useRef<THREE.Group>(null)

  useFrame(({ camera }) => {
    const p = interpolateGreatCircle(
      origin.lat,
      origin.lon,
      destination.lat,
      destination.lon,
      progress,
    )
    const surface = latLonToVec3(p.lat, p.lon, 2)
    const altitude = mapStyle === 'satellite' ? 2.28 : 2.48
    const camPos = surface.clone().normalize().multiplyScalar(altitude)
    const next = interpolateGreatCircle(
      origin.lat,
      origin.lon,
      destination.lat,
      destination.lon,
      Math.min(1, progress + 0.004),
    )
    const ahead = latLonToVec3(next.lat, next.lon, 2)
    const look = camPos.clone().lerp(ahead, 0.4)

    camera.position.lerp(camPos, 0.06)
    camera.up.copy(camPos.clone().normalize())
    camera.lookAt(look)

    if (earthRef.current && mapStyle === '3d') {
      earthRef.current.rotation.y += 0.00012
    }
  })

  return (
    <>
      <color attach="background" args={['#05070c']} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 3, 2]} intensity={1.35} />
      <hemisphereLight args={['#9ecbff', '#1a1208', 0.35]} />
      <Stars radius={80} depth={40} count={2500} factor={3} saturation={0} fade speed={0.4} />
      <group ref={earthRef}>
        <Earth mapStyle={mapStyle} />
        {mapStyle === '3d' && (
          <mesh scale={2.035}>
            <sphereGeometry args={[1, 48, 48]} />
            <meshStandardMaterial
              color="#ffffff"
              transparent
              opacity={0.12}
              depthWrite={false}
            />
          </mesh>
        )}
      </group>
      {/* soft atmosphere */}
      <mesh scale={2.06}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial
          color="#6eb6ff"
          transparent
          opacity={0.07}
          side={THREE.BackSide}
        />
      </mesh>
    </>
  )
}

export function CabinWindow3D({
  origin,
  destination,
  progress,
  mapStyle,
}: {
  origin: Airport
  destination: Airport
  progress: number
  mapStyle: MapStyle
}) {
  return (
    <div className="cabin-window-3d">
      <div className="cabin-interior" aria-hidden>
        <div className="cabin-wall left" />
        <div className="cabin-wall right" />
        <div className="cabin-shade" />
        <div className="cabin-ledge" />
      </div>

      <div className="window-portal">
        <div className="window-glass">
          <Canvas
            className="window-canvas"
            camera={{ fov: 42, near: 0.1, far: 200, position: [0, 0, 4] }}
            dpr={[1, 1.75]}
            gl={{ antialias: true, alpha: false }}
          >
            <Scene
              origin={origin}
              destination={destination}
              progress={progress}
              mapStyle={mapStyle}
            />
          </Canvas>
          <div className="window-reflection" />
          <div className="window-scratch" />
        </div>
        <div className="window-bezel" />
      </div>
    </div>
  )
}
