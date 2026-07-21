import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useFlight } from '../context/FlightContext'
import { playTakeoffSound } from '../utils/cabinAudio'

const PHASES = [
  { at: 0, label: 'Doors closed' },
  { at: 25, label: 'Taxi' },
  { at: 55, label: 'Cleared for takeoff' },
  { at: 78, label: 'Rotate' },
  { at: 92, label: 'Wheels up' },
] as const

export function TakeoffSequence() {
  const { booking, beginCruise } = useFlight()
  const [pct, setPct] = useState(0)

  useEffect(() => {
    let done = false
    playTakeoffSound()
    const start = performance.now()
    const dur = 3200
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min(100, ((now - start) / dur) * 100)
      setPct(p)
      if (p >= 100) {
        if (!done) {
          done = true
          beginCruise()
        }
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      done = true
      cancelAnimationFrame(raf)
    }
  }, [beginCruise])

  const phase = [...PHASES].reverse().find((p) => pct >= p.at) ?? PHASES[0]

  return (
    <motion.div
      className="cinema"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <p className="eyebrow" style={{ color: 'rgba(255,255,255,0.45)' }}>
        Takeoff
      </p>
      <h2>
        {booking.origin?.code} → {booking.destination?.code}
      </h2>
      <AnimatePresence mode="wait">
        <motion.p
          key={phase.label}
          className="cinema-phase"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          {phase.label}
        </motion.p>
      </AnimatePresence>
      <div className="cinema-bar">
        <div style={{ width: `${pct}%` }} />
      </div>
    </motion.div>
  )
}
