import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, useTexture } from '@react-three/drei'
import { Suspense, useEffect, useMemo, useRef } from 'react'
import type { ComponentRef } from 'react'
import * as THREE from 'three'
import type { Airport } from '../types'
import { greatCirclePoints, latLonToVector3 } from '../utils/geo'
import { Airplane } from './Airplane'

const EARTH_RADIUS = 2.2

const TEXTURE =
  'https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg'
const BUMP =
  'https://unpkg.com/three-globe@2.31.1/example/img/earth-topology.png'
const NIGHT =
  'https://unpkg.com/three-globe@2.31.1/example/img/earth-night.jpg'
const WATER =
  'https://unpkg.com/three-globe@2.31.1/example/img/earth-water.png'

function useIsMobile() {
  const { size } = useThree()
  return size.width < 768
}

function Earth({ spinning, mapStyle }: { spinning: boolean; mapStyle: 'day' | 'night' }) {
  const earthRef = useRef<THREE.Mesh>(null)
  const atmosRef = useRef<THREE.Mesh>(null)
  const mobile = useIsMobile()
  const [colorMap, bumpMap, nightMap, waterMap] = useTexture([
    TEXTURE,
    BUMP,
    NIGHT,
    WATER,
  ])
  const night = mapStyle === 'night'
  const segs = mobile ? 48 : 96

  useEffect(() => {
    colorMap.colorSpace = THREE.SRGBColorSpace
    nightMap.colorSpace = THREE.SRGBColorSpace
    colorMap.anisotropy = 8
    nightMap.anisotropy = 8
    bumpMap.anisotropy = 4
  }, [colorMap, bumpMap, nightMap])

  useFrame((_, delta) => {
    if (!spinning) return
    if (earthRef.current) earthRef.current.rotation.y += delta * 0.035
    if (atmosRef.current) atmosRef.current.rotation.y += delta * 0.02
  })

  return (
    <group>
      <mesh ref={earthRef}>
        <sphereGeometry args={[EARTH_RADIUS, segs, segs]} />
        <meshStandardMaterial
          map={night ? nightMap : colorMap}
          bumpMap={bumpMap}
          bumpScale={night ? 0.02 : 0.045}
          roughnessMap={waterMap}
          roughness={night ? 0.92 : 0.78}
          metalness={0.05}
          emissiveMap={nightMap}
          emissive={new THREE.Color(night ? '#ffb56a' : '#ffd7a0')}
          emissiveIntensity={night ? 1.35 : 0.22}
        />
      </mesh>

      {/* Soft atmosphere rim */}
      <mesh scale={1.045}>
        <sphereGeometry args={[EARTH_RADIUS, 32, 32]} />
        <meshBasicMaterial
          color={night ? '#3b6ea8' : '#7ec8ff'}
          transparent
          opacity={night ? 0.14 : 0.11}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Thin haze shell */}
      <mesh ref={atmosRef} scale={1.018}>
        <sphereGeometry args={[EARTH_RADIUS, 32, 32]} />
        <meshBasicMaterial
          color="#dcefff"
          transparent
          opacity={night ? 0.03 : 0.06}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

function AirportMarker({ airport, color }: { airport: Airport; color: string }) {
  const pos = useMemo(
    () => latLonToVector3(airport.lat, airport.lon, EARTH_RADIUS * 1.016),
    [airport],
  )
  const quat = useMemo(() => {
    const q = new THREE.Quaternion()
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize())
    return q
  }, [pos])

  return (
    <group position={pos} quaternion={quat}>
      <mesh>
        <sphereGeometry args={[0.028, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <ringGeometry args={[0.04, 0.058, 28]} />
        <meshBasicMaterial color={color} transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.004, 0.004, 0.1, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.85} />
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
  const mobile = useIsMobile()
  const points = useMemo(
    () =>
      greatCirclePoints(
        origin.lat,
        origin.lon,
        destination.lat,
        destination.lon,
        EARTH_RADIUS,
        200,
      ),
    [origin, destination],
  )

  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points])

  const tube = useMemo(() => {
    const geo = new THREE.TubeGeometry(curve, 200, mobile ? 0.012 : 0.01, 8, false)
    const mat = new THREE.MeshBasicMaterial({
      color: '#f5d56a',
      transparent: true,
      opacity: 0.92,
    })
    return new THREE.Mesh(geo, mat)
  }, [curve, mobile])

  const planeRef = useRef<THREE.Group>(null)
  const { camera } = useThree()
  const tmp = useMemo(
    () => ({
      pos: new THREE.Vector3(),
      look: new THREE.Vector3(),
      forward: new THREE.Vector3(),
      up: new THREE.Vector3(),
      right: new THREE.Vector3(),
      trueUp: new THREE.Vector3(),
      desired: new THREE.Vector3(),
      matrix: new THREE.Matrix4(),
      target: new THREE.Vector3(),
    }),
    [],
  )

  useFrame(() => {
    if (!planeRef.current) return
    const t = Math.min(Math.max(progress, 0), 0.999)
    curve.getPointAt(t, tmp.pos)
    curve.getPointAt(Math.min(t + 0.012, 1), tmp.look)

    tmp.forward.copy(tmp.look).sub(tmp.pos).normalize()
    tmp.up.copy(tmp.pos).normalize()
    tmp.right.crossVectors(tmp.forward, tmp.up).normalize()
    if (tmp.right.lengthSq() < 0.001) {
      tmp.right.set(1, 0, 0)
    }
    tmp.trueUp.crossVectors(tmp.right, tmp.forward).normalize()
    // Model faces +Z; basis = (right, up, forward)
    tmp.matrix.makeBasis(tmp.right, tmp.trueUp, tmp.forward)
    planeRef.current.position.copy(tmp.pos)
    planeRef.current.quaternion.setFromRotationMatrix(tmp.matrix)

    if (followCamera) {
      const dist = mobile ? 1.9 : 1.45
      const lift = mobile ? 0.7 : 0.5
      tmp.desired
        .copy(tmp.pos)
        .addScaledVector(tmp.up, dist * 0.55 + lift * 0.2)
        .addScaledVector(tmp.forward, -dist * 0.85)
        .addScaledVector(tmp.trueUp, lift)
      camera.position.lerp(tmp.desired, 0.06)
      tmp.target.copy(tmp.pos).addScaledVector(tmp.forward, 0.35)
      camera.lookAt(tmp.target)
    }
  })

  return (
    <group>
      <primitive object={tube} />
      <group ref={planeRef}>
        <Airplane scale={mobile ? 1.55 : 1.25} />
        <pointLight color="#fff4cc" intensity={0.65} distance={1.4} />
      </group>
    </group>
  )
}

function CameraRig({ mode }: { mode: 'idle' | 'preview' | 'flight' }) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null)
  const mobile = useIsMobile()
  const { camera } = useThree()

  useEffect(() => {
    if (controls.current) {
      controls.current.enabled = mode !== 'flight'
    }
    if (mode !== 'flight') {
      const z = mobile ? (mode === 'preview' ? 7.4 : 8.2) : mode === 'preview' ? 6.4 : 6.8
      camera.position.set(0, mobile ? 0.35 : 0.55, z)
    }
  }, [mode, mobile, camera])

  return (
    <OrbitControls
      ref={controls}
      enablePan={false}
      enableZoom
      minDistance={mobile ? 5.2 : 4.2}
      maxDistance={mobile ? 12 : 11}
      minPolarAngle={0.35}
      maxPolarAngle={Math.PI - 0.35}
      autoRotate={mode === 'idle'}
      autoRotateSpeed={0.25}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={mobile ? 0.55 : 0.7}
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
      <Canvas
        camera={{ position: [0, 0.55, 6.8], fov: 42, near: 0.1, far: 200 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        style={{ touchAction: 'none' }}
      >
        <color attach="background" args={[night ? '#01040c' : '#020617']} />
        <fog attach="fog" args={[night ? '#01040c' : '#020617', 10, 28]} />

        <ambientLight intensity={night ? 0.18 : 0.42} />
        <directionalLight
          position={[5.5, 3.2, 4.5]}
          intensity={night ? 0.35 : 1.85}
          color={night ? '#9aabcc' : '#fff4e5'}
        />
        <directionalLight position={[-4, -1.5, -2]} intensity={night ? 0.35 : 0.28} color="#6eb6ff" />
        <hemisphereLight
          args={[night ? '#1a2740' : '#b8d4ff', night ? '#05080f' : '#1a2a1a', night ? 0.35 : 0.45]}
        />

        <Stars
          radius={120}
          depth={60}
          count={night ? 5000 : 3200}
          factor={night ? 3.6 : 2.8}
          saturation={0}
          fade
          speed={0.4}
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
