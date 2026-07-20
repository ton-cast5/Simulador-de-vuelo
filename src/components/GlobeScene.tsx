import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, useTexture } from '@react-three/drei'
import { Suspense, useEffect, useMemo, useRef } from 'react'
import type { ComponentRef } from 'react'
import * as THREE from 'three'
import type { Airport } from '../types'
import { greatCirclePoints, latLonToVector3 } from '../utils/geo'

const EARTH_RADIUS = 2.35
const TEXTURE =
  'https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg'
const BUMP =
  'https://unpkg.com/three-globe@2.31.1/example/img/earth-topology.png'
const NIGHT =
  'https://unpkg.com/three-globe@2.31.1/example/img/earth-night.jpg'
const WATER =
  'https://unpkg.com/three-globe@2.31.1/example/img/earth-water.png'

function Earth({ spinning, mapStyle }: { spinning: boolean; mapStyle: 'day' | 'night' }) {
  const earthRef = useRef<THREE.Mesh>(null)
  const cloudRef = useRef<THREE.Mesh>(null)
  const [colorMap, bumpMap, nightMap, waterMap] = useTexture([
    TEXTURE,
    BUMP,
    NIGHT,
    WATER,
  ])
  const night = mapStyle === 'night'

  useFrame((_, delta) => {
    if (!spinning) return
    if (earthRef.current) earthRef.current.rotation.y += delta * 0.04
    if (cloudRef.current) cloudRef.current.rotation.y += delta * 0.055
  })

  return (
    <group>
      <mesh ref={earthRef}>
        <sphereGeometry args={[EARTH_RADIUS, 72, 72]} />
        <meshPhongMaterial
          map={night ? nightMap : colorMap}
          bumpMap={bumpMap}
          bumpScale={night ? 0.03 : 0.055}
          specularMap={waterMap}
          specular={new THREE.Color(night ? '#111822' : '#223344')}
          shininess={night ? 6 : 14}
          emissiveMap={nightMap}
          emissive={new THREE.Color(night ? '#ffb56a' : '#ffc98a')}
          emissiveIntensity={night ? 1.15 : 0.28}
        />
      </mesh>
      <mesh ref={cloudRef} scale={1.012}>
        <sphereGeometry args={[EARTH_RADIUS, 56, 56]} />
        <meshPhongMaterial
          map={waterMap}
          transparent
          opacity={night ? 0.08 : 0.18}
          depthWrite={false}
        />
      </mesh>
      <mesh scale={1.035}>
        <sphereGeometry args={[EARTH_RADIUS, 32, 32]} />
        <meshBasicMaterial
          color={night ? '#1a3a6a' : '#5eb8ff'}
          transparent
          opacity={night ? 0.1 : 0.07}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  )
}

function AirportMarker({
  airport,
  color,
}: {
  airport: Airport
  color: string
}) {
  const pos = useMemo(
    () => latLonToVector3(airport.lat, airport.lon, EARTH_RADIUS * 1.018),
    [airport],
  )
  return (
    <group position={pos}>
      <mesh>
        <sphereGeometry args={[0.032, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh>
        <ringGeometry args={[0.045, 0.065, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.55} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function FlightPath({
  origin,
  destination,
  progress,
  followCamera,
}: {
  origin: Airport
  destination: Airport
  progress: number
  followCamera: boolean
}) {
  const points = useMemo(
    () =>
      greatCirclePoints(
        origin.lat,
        origin.lon,
        destination.lat,
        destination.lon,
        EARTH_RADIUS,
        180,
      ),
    [origin, destination],
  )

  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points])

  const trail = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(180))
    const mat = new THREE.LineBasicMaterial({
      color: '#f5d56a',
      transparent: true,
      opacity: 0.9,
    })
    return new THREE.Line(geo, mat)
  }, [curve])

  const planeRef = useRef<THREE.Group>(null)
  const { camera } = useThree()
  const controlsTarget = useRef(new THREE.Vector3())

  useFrame(() => {
    if (!planeRef.current) return
    const t = Math.min(Math.max(progress, 0), 0.999)
    const pos = curve.getPointAt(t)
    const look = curve.getPointAt(Math.min(t + 0.014, 1))
    planeRef.current.position.copy(pos)
    planeRef.current.lookAt(look)

    if (followCamera) {
      const outward = pos.clone().normalize()
      const desired = pos
        .clone()
        .add(outward.multiplyScalar(1.55))
        .add(new THREE.Vector3(0, 0.55, 0))
      camera.position.lerp(desired, 0.045)
      controlsTarget.current.lerp(pos, 0.08)
      camera.lookAt(controlsTarget.current)
    }
  })

  return (
    <group>
      <primitive object={trail} />
      <group ref={planeRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.028, 0.11, 10]} />
          <meshStandardMaterial color="#f4f7fb" metalness={0.7} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.16, 0.008, 0.035]} />
          <meshStandardMaterial color="#c5d0dc" metalness={0.5} roughness={0.35} />
        </mesh>
        <mesh position={[0, -0.02, -0.02]}>
          <boxGeometry args={[0.05, 0.006, 0.04]} />
          <meshStandardMaterial color="#9aabbc" />
        </mesh>
        <pointLight color="#fff4cc" intensity={0.55} distance={1.2} />
      </group>
    </group>
  )
}

function CameraRig({ mode }: { mode: 'idle' | 'preview' | 'flight' }) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null)
  useEffect(() => {
    if (controls.current) {
      controls.current.enabled = mode !== 'flight'
    }
  }, [mode])
  return (
    <OrbitControls
      ref={controls}
      enablePan={false}
      minDistance={4.4}
      maxDistance={11}
      autoRotate={mode === 'idle'}
      autoRotateSpeed={0.28}
      enableDamping
      dampingFactor={0.06}
    />
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
  const night = mapStyle === 'night'
  return (
    <div className={className ?? 'globe-canvas'}>
      <Canvas camera={{ position: [0, 0.8, 6.8], fov: 40 }} dpr={[1, 1.8]}>
        <color attach="background" args={[night ? '#01040c' : '#020617']} />
        <fog attach="fog" args={[night ? '#01040c' : '#020617', 8, 22]} />
        <ambientLight intensity={night ? 0.12 : 0.32} />
        <directionalLight
          position={[6, 3.5, 4]}
          intensity={night ? 0.25 : 1.55}
          color={night ? '#8899bb' : '#fff6e8'}
        />
        <directionalLight
          position={[-5, -1, -3]}
          intensity={night ? 0.45 : 0.25}
          color="#6eb6ff"
        />
        <Stars
          radius={100}
          depth={50}
          count={night ? 5600 : 4200}
          factor={night ? 3.8 : 3.2}
          saturation={0}
          fade
          speed={0.45}
        />
        <Suspense fallback={null}>
          <Earth spinning={mode === 'idle'} mapStyle={mapStyle} />
          {origin && <AirportMarker airport={origin} color="#5eead4" />}
          {destination && <AirportMarker airport={destination} color="#fb7185" />}
          {origin && destination && mode !== 'idle' && (
            <FlightPath
              origin={origin}
              destination={destination}
              progress={mode === 'flight' ? progress : 0}
              followCamera={mode === 'flight'}
            />
          )}
        </Suspense>
        <CameraRig mode={mode} />
      </Canvas>
    </div>
  )
}
