/**
 * Low-poly airliner, local axes:
 *  +Z forward (nose), +Y up, ±X wings (symmetric).
 */
export function Airplane({ scale = 1 }: { scale?: number }) {
  const body = '#eef3f8'
  const wing = '#c9d5e3'
  const accent = '#2f6fed'
  const dark = '#1e293b'
  const engine = '#94a3b8'

  return (
    <group scale={scale}>
      {/* Fuselage */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <capsuleGeometry args={[0.016, 0.095, 6, 14]} />
        <meshStandardMaterial color={body} metalness={0.55} roughness={0.28} />
      </mesh>

      {/* Nose cone */}
      <mesh position={[0, 0, 0.072]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.016, 0.038, 14]} />
        <meshStandardMaterial color={body} metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Cockpit glass */}
      <mesh position={[0, 0.008, 0.052]} rotation={[0.35, 0, 0]}>
        <boxGeometry args={[0.018, 0.01, 0.022]} />
        <meshStandardMaterial
          color="#7dd3fc"
          metalness={0.2}
          roughness={0.15}
          transparent
          opacity={0.75}
        />
      </mesh>

      {/* Main wings — mirrored */}
      <mesh position={[0, -0.002, 0.005]}>
        <boxGeometry args={[0.22, 0.005, 0.042]} />
        <meshStandardMaterial color={wing} metalness={0.45} roughness={0.35} />
      </mesh>
      {/* Wing tips accent */}
      <mesh position={[0.105, -0.001, 0.005]}>
        <boxGeometry args={[0.018, 0.006, 0.03]} />
        <meshStandardMaterial color={accent} metalness={0.4} roughness={0.35} />
      </mesh>
      <mesh position={[-0.105, -0.001, 0.005]}>
        <boxGeometry args={[0.018, 0.006, 0.03]} />
        <meshStandardMaterial color={accent} metalness={0.4} roughness={0.35} />
      </mesh>

      {/* Engines under wings — mirrored */}
      <mesh position={[0.055, -0.014, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.009, 0.01, 0.032, 10]} />
        <meshStandardMaterial color={engine} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[-0.055, -0.014, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.009, 0.01, 0.032, 10]} />
        <meshStandardMaterial color={engine} metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Vertical stabilizer */}
      <mesh position={[0, 0.028, -0.055]}>
        <boxGeometry args={[0.005, 0.042, 0.032]} />
        <meshStandardMaterial color={wing} metalness={0.4} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.042, -0.05]}>
        <boxGeometry args={[0.005, 0.012, 0.02]} />
        <meshStandardMaterial color={accent} metalness={0.4} roughness={0.35} />
      </mesh>

      {/* Horizontal stabilizers — mirrored */}
      <mesh position={[0, 0.01, -0.06]}>
        <boxGeometry args={[0.085, 0.004, 0.024]} />
        <meshStandardMaterial color={wing} metalness={0.4} roughness={0.35} />
      </mesh>

      {/* Belly stripe */}
      <mesh position={[0, -0.012, 0.005]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.017, 0.017, 0.08, 12, 1, true]} />
        <meshStandardMaterial color={dark} metalness={0.3} roughness={0.5} transparent opacity={0.35} />
      </mesh>
    </group>
  )
}
