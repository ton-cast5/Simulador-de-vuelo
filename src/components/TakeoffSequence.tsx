import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useFlight } from '../context/FlightContext'
import { playTakeoffSound, speakCabin } from '../utils/cabinAudio'

const PHASES = [
  { at: 0, label: 'Puertas cerradas', sub: 'Checklist completo' },
  { at: 18, label: 'Rodaje', sub: 'Taxi to runway' },
  { at: 42, label: 'Autorizado', sub: 'Cleared for takeoff' },
  { at: 68, label: 'V1 · Rotate', sub: 'Nose up' },
  { at: 88, label: 'Wheels up', sub: 'En el aire' },
] as const

export function TakeoffSequence() {
  const { booking, beginCruise } = useFlight()
  const [pct, setPct] = useState(0)

  useEffect(() => {
    playTakeoffSound()
    window.setTimeout(() => {
      speakCabin(
        `Cabina a pasajeros. Despegamos con destino a ${booking.destination?.city}. Buen vuelo y buen foco.`,
      )
    }, 900)

    const start = Date.now()
    const dur = 4200
    const id = window.setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / dur) * 100)
      setPct(p)
      if (p >= 100) {
        window.clearInterval(id)
        beginCruise()
      }
    }, 40)
    return () => window.clearInterval(id)
  }, [beginCruise, booking.destination?.city])

  const phase = [...PHASES].reverse().find((p) => pct >= p.at) ?? PHASES[0]

  return (
    <motion.div
      className="cinema takeoff-cinema"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="cinema-sky">
        <div className="cinema-runway" style={{ transform: `translateY(${pct * 1.2}px) scale(${1 + pct / 180})` }} />
        <div className="cinema-horizon" style={{ opacity: 0.35 + pct / 200 }} />
        <motion.div
          className="cinema-plane"
          animate={{
            y: [40, 10, -pct * 0.55],
            rotate: [-2, -1, -4 - pct * 0.04],
            scale: [0.92, 1, 1.05],
          }}
          transition={{ duration: 4.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <svg viewBox="0 0 24 24" width="72" height="72" aria-hidden>
            <path
              fill="currentColor"
              d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
            />
          </svg>
        </motion.div>
      </div>

      <div className="cinema-hud">
        <p className="eyebrow">Despegue</p>
        <h2>
          {booking.origin?.code} → {booking.destination?.code}
        </h2>
        <AnimatePresence mode="wait">
          <motion.div
            key={phase.label}
            className="cinema-phase"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            <strong>{phase.label}</strong>
            <span>{phase.sub}</span>
          </motion.div>
        </AnimatePresence>
        <div className="cinema-bar">
          <div style={{ width: `${pct}%` }} />
        </div>
        <p className="cinema-meta">
          {booking.flightNumber} · asiento {booking.seat} · {booking.sessionMinutes} min
        </p>
      </div>
    </motion.div>
  )
}
