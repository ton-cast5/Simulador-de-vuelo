import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useFlight } from '../context/FlightContext'
import { playTakeoffSound, speakCabin } from '../utils/cabinAudio'

const PHASES = [
  { at: 0, label: 'Puertas cerradas', sub: 'Checklist completo' },
  { at: 20, label: 'Rodaje', sub: 'Taxi to runway' },
  { at: 45, label: 'Autorizado', sub: 'Cleared for takeoff' },
  { at: 70, label: 'V1 · Rotate', sub: 'Nose up' },
  { at: 88, label: 'Wheels up', sub: 'En el aire' },
] as const

function PlaneSvg() {
  return (
    <svg className="cinema-plane-svg" viewBox="0 0 160 70" aria-hidden>
      <ellipse cx="78" cy="42" rx="34" ry="5" fill="rgba(0,0,0,0.22)" />
      <path
        d="M18 36 C28 28, 48 24, 78 24 C108 24, 128 28, 142 34 L148 36 C138 40, 108 44, 78 44 C48 44, 28 40, 18 36 Z"
        fill="#eef3f8"
      />
      <path d="M142 34 L156 36 L146 30 Z" fill="#d5dee8" />
      <path d="M58 34 L22 14 L28 34 L22 52 Z" fill="#c5d2e0" />
      <path d="M108 34 L138 20 L134 34 L138 46 Z" fill="#b7c6d6" />
      <path d="M34 34 L18 22 L22 34 L18 44 Z" fill="#aebccc" />
      <rect x="96" y="26" width="18" height="7" rx="2.5" fill="#7dd3fc" opacity="0.9" />
      <rect x="78" y="27" width="10" height="5" rx="1.5" fill="#67e8f9" opacity="0.55" />
      <circle cx="52" cy="44" r="2.4" fill="#94a3b8" />
      <circle cx="70" cy="44" r="2.4" fill="#94a3b8" />
    </svg>
  )
}

export function TakeoffSequence() {
  const { booking, beginCruise } = useFlight()
  const [pct, setPct] = useState(0)

  useEffect(() => {
    let done = false
    playTakeoffSound()
    const speakId = window.setTimeout(() => {
      speakCabin(
        `Cabina a pasajeros. Despegamos con destino a ${booking.destination?.city ?? 'destino'}. Buen vuelo y buen foco.`,
      )
    }, 900)

    const start = performance.now()
    const dur = 4500
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
      window.clearTimeout(speakId)
    }
  }, [beginCruise, booking.destination?.city])

  const phase = [...PHASES].reverse().find((p) => pct >= p.at) ?? PHASES[0]
  const lift = Math.max(0, pct - 55) * 2.2
  const nose = Math.max(0, pct - 60) * 0.12

  return (
    <motion.div
      className="cinema takeoff-cinema"
      role="dialog"
      aria-label="Secuencia de despegue"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="cinema-sky takeoff-sky">
        <div className="cinema-clouds cloud-a" />
        <div className="cinema-clouds cloud-b" />
        <div
          className="cinema-runway"
          style={{
            transform: `translate3d(0, ${pct * 2.4}px, 0) scale(${1 + pct / 120})`,
            opacity: Math.max(0.15, 1 - pct / 130),
          }}
        >
          <span className="runway-line" />
        </div>
        <div className="cinema-horizon" />
        <div
          className="cinema-plane-wrap"
          style={{
            transform: `translate(-50%, calc(-50% - ${lift}px)) rotate(${-2 - nose}deg) scale(${0.95 + pct / 400})`,
          }}
        >
          <PlaneSvg />
        </div>
        <div className="cinema-speed-lines" style={{ opacity: pct > 40 ? (pct - 40) / 80 : 0 }} />
      </div>

      <div className="cinema-hud">
        <p className="eyebrow">Despegue</p>
        <h2>
          {booking.origin?.code ?? '---'} → {booking.destination?.code ?? '---'}
        </h2>
        <AnimatePresence mode="wait">
          <motion.div
            key={phase.label}
            className="cinema-phase"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            <strong>{phase.label}</strong>
            <span>{phase.sub}</span>
          </motion.div>
        </AnimatePresence>
        <div className="cinema-bar">
          <div style={{ width: `${pct}%` }} />
        </div>
        <p className="cinema-meta">
          {booking.flightNumber} · {booking.seat} · {booking.sessionMinutes} min
        </p>
      </div>
    </motion.div>
  )
}
