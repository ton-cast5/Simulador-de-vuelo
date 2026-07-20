import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars, useTexture } from '@react-three/drei'
import { Suspense, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { Airport } from '../types'
import { greatCirclePoints, latLonToVector3 } from '../utils/geo'

const EARTH_RADIUS = 2.2
const TEXTURE =
  'https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg'
const BUMP =
  'https://unpkg.com/three-globe@2.31.1/example/img/earth-topology.png'
const SPECULAR =
  'https://unpkg.com/three-globe@2.31.1/example/img/earth-water.png'

function Earth({ spinning }: { spinning: boolean }) {
  const earthRef = useRef<THREE.Mesh>(null)
  const cloudRef = useRef<THREE.Mesh>(null)
  const [colorMap, bumpMap, specularMap] = useTexture([TEXTURE, BUMP, SPECULAR])

  useFrame((_, delta) => {
    if (!spinning) return
    if (earthRef.current) earthRef.current.rotation.y += delta * 0.05
    if (cloudRef.current) cloudRef.current.rotation.y += delta * 0.065
  })

  return (
    <group>
      <mesh ref={earthRef}>
        <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
        <meshPhongMaterial
          map={colorMap}
          bumpMap={bumpMap}
          bumpScale={0.05}
          specularMap={specularMap}
          specular={new THREE.Color('#334455')}
          shininess={12}
        />
      </mesh>
      <mesh ref={cloudRef} scale={1.015}>
        <sphereGeometry args={[EARTH_RADIUS, 48, 48]} />
        <meshPhongMaterial
          map={specularMap}
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </mesh>
      <mesh scale={1.03}>
        <sphereGeometry args={[EARTH_RADIUS, 32, 32]} />
        <meshBasicMaterial
          color="#4ea8ff"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  )
}

function AirportMarker({ airport, color }: { airport: Airport; color: string }) {
  const pos = useMemo(
    () => latLonToVector3(airport.lat, airport.lon, EARTH_RADIUS * 1.02),
    [airport],
  )
  return (
    <mesh position={pos}>
      <sphereGeometry args={[0.035, 16, 16]} />
      <meshBasicMaterial color={color} />
    </mesh>
  )
}

function FlightPath({
  origin,
  destination,
  animated,
}: {
  origin: Airport
  destination: Airport
  animated: boolean
}) {
  const points = useMemo(
    () =>
      greatCirclePoints(
        origin.lat,
        origin.lon,
        destination.lat,
        destination.lon,
        EARTH_RADIUS,
        160,
      ),
    [origin, destination],
  )

  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points])
  const lineObj = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(160))
    const mat = new THREE.LineBasicMaterial({
      color: '#f0c75e',
      transparent: true,
      opacity: 0.85,
    })
    return new THREE.Line(geo, mat)
  }, [curve])

  const planeRef = useRef<THREE.Group>(null)
  const progress = useRef(animated ? 0 : 0)

  useFrame((_, delta) => {
    if (!planeRef.current) return
    if (animated) {
      progress.current = Math.min(1, progress.current + delta * 0.035)
    }
    const t = animated ? progress.current : 0
    const pos = curve.getPointAt(t)
    const look = curve.getPointAt(Math.min(t + 0.012, 1))
    planeRef.current.position.copy(pos)
    planeRef.current.lookAt(look)
  })

  return (
    <group>
      <primitive object={lineObj} />
      <group ref={planeRef}>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <coneGeometry args={[0.04, 0.14, 8]} />
          <meshStandardMaterial color="#e8eef5" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.18, 0.01, 0.04]} />
          <meshStandardMaterial color="#c9d4e0" />
        </mesh>
      </group>
    </group>
  )
}

interface GlobeSceneProps {
  origin?: Airport | null
  destination?: Airport | null
  mode: 'idle' | 'preview' | 'flight'
  className?: string
}

export function GlobeScene({
  origin,
  destination,
  mode,
  className,
}: GlobeSceneProps) {
  return (
    <div className={className ?? 'globe-canvas'}>
      <Canvas camera={{ position: [0, 0.6, 6.2], fov: 42 }} dpr={[1, 1.75]}>
        <color attach="background" args={['#020617']} />
        <ambientLight intensity={0.45} />
        <directionalLight position={[5, 3, 5]} intensity={1.35} />
        <pointLight position={[-4, -2, -3]} intensity={0.35} color="#7dd3fc" />
        <Stars
          radius={80}
          depth={40}
          count={3500}
          factor={3}
          saturation={0}
          fade
          speed={0.6}
        />
        <Suspense fallback={null}>
          <Earth spinning={mode === 'idle'} />
          {origin && <AirportMarker airport={origin} color="#22d3ee" />}
          {destination && <AirportMarker airport={destination} color="#f472b6" />}
          {origin && destination && (mode === 'preview' || mode === 'flight') && (
            <FlightPath
              origin={origin}
              destination={destination}
              animated={mode === 'flight'}
            />
          )}
        </Suspense>
        <OrbitControls
          enablePan={false}
          minDistance={4.2}
          maxDistance={10}
          autoRotate={mode === 'idle'}
          autoRotateSpeed={0.35}
        />
      </Canvas>
    </div>
  )
}
