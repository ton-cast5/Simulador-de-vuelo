import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useFlight } from '../context/FlightContext'
import { playTouchdownSound, speakCabin } from '../utils/cabinAudio'
import { formatDistance } from '../utils/geo'

function PlaneSvg() {
  return (
    <svg className="cinema-plane-svg" viewBox="0 0 160 70" aria-hidden>
      <ellipse cx="78" cy="48" rx="36" ry="5" fill="rgba(0,0,0,0.28)" />
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
    </svg>
  )
}

export function TouchdownSequence() {
  const { booking, finishLanding } = useFlight()
  const [pct, setPct] = useState(0)

  useEffect(() => {
    let done = false
    playTouchdownSound()
    const speakId = window.setTimeout(() => {
      speakCabin(
        `Hemos aterrizado en ${booking.destination?.city ?? 'destino'}. Gracias por volar con SkyVoyage. Bienvenido.`,
      )
    }, 500)

    const start = performance.now()
    const dur = 3600
    let raf = 0

    const tick = (now: number) => {
      const p = Math.min(100, ((now - start) / dur) * 100)
      setPct(p)
      if (p >= 100) {
        if (!done) {
          done = true
          finishLanding()
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
  }, [finishLanding, booking.destination?.city])

  const descent = Math.max(0, 100 - pct) * 1.1
  const flare = Math.max(0, pct - 50) * 0.08

  return (
    <motion.div
      className="cinema touchdown-cinema"
      role="dialog"
      aria-label="Secuencia de aterrizaje"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="cinema-sky touchdown-sky">
        <div className="cinema-city-glow" />
        <div
          className="cinema-ground"
          style={{ transform: `translate3d(0, ${30 - pct * 0.25}px, 0)` }}
        >
          <span className="runway-line light" />
        </div>
        <div
          className="cinema-plane-wrap landing"
          style={{
            transform: `translate(-50%, calc(-50% + ${20 - descent}px)) rotate(${-10 + flare}deg) scale(${1.08 - pct / 500})`,
          }}
        >
          <PlaneSvg />
        </div>
        <div
          className="touchdown-flash"
          style={{ opacity: pct > 58 && pct < 72 ? 0.45 : 0 }}
        />
        <div className="cinema-dust" style={{ opacity: pct > 60 ? (pct - 60) / 80 : 0 }} />
      </div>

      <div className="cinema-hud">
        <div className="stamp soft">TOUCHDOWN</div>
        <p className="eyebrow">Aterrizaje</p>
        <h2>{booking.destination?.city ?? 'Destino'}</h2>
        <motion.p className="cinema-meta" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {booking.flightNumber} · {formatDistance(booking.distanceKm)} ·{' '}
          {booking.sessionMinutes} min de foco
        </motion.p>
        <div className="cinema-bar">
          <div style={{ width: `${pct}%` }} />
        </div>
      </div>
    </motion.div>
  )
}
