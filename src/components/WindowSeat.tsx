import { useMemo } from 'react'
import { motion } from 'framer-motion'

const SCENES = [
  { sky: '#6eb6ff', land: '#2f6b4f', accent: '#c4a574', label: 'Costas al amanecer' },
  { sky: '#87b7e8', land: '#3d5c45', accent: '#8a9e7a', label: 'Campos y ríos' },
  { sky: '#4a6d9a', land: '#1f3d4a', accent: '#d9e6f2', label: 'Cordilleras' },
  { sky: '#2a3a55', land: '#152433', accent: '#f0c75e', label: 'Ciudades nocturnas' },
  { sky: '#7ec8e3', land: '#1a6b6b', accent: '#e8d5a3', label: 'Archipiélagos' },
]

export function WindowSeat({ progress }: { progress: number }) {
  const scene = SCENES[Math.min(SCENES.length - 1, Math.floor(progress * SCENES.length))]
  const drift = useMemo(() => progress * 40, [progress])

  return (
    <div className="window-seat">
      <div
        className="window-sky"
        style={{
          background: `linear-gradient(180deg, ${scene.sky} 0%, #dfefff 45%, ${scene.land} 100%)`,
          transform: `translateX(${-drift}%)`,
        }}
      >
        <div className="window-clouds" />
        <div className="window-terrain" style={{ background: scene.land }} />
        <div className="window-glow" style={{ background: scene.accent }} />
      </div>
      <div className="window-frame">
        <div className="window-shade" />
        <motion.p
          className="window-caption"
          key={scene.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Vista de ventanilla · {scene.label}
        </motion.p>
      </div>
    </div>
  )
}
