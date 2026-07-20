import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useFlight } from '../context/FlightContext'
import { playTouchdownSound, speakCabin } from '../utils/cabinAudio'
import { formatDistance } from '../utils/geo'

export function TouchdownSequence() {
  const { booking, finishLanding } = useFlight()
  const [pct, setPct] = useState(0)

  useEffect(() => {
    playTouchdownSound()
    window.setTimeout(() => {
      speakCabin(
        `Hemos aterrizado en ${booking.destination?.city}. Gracias por volar con SkyVoyage. Bienvenido.`,
      )
    }, 500)

    const start = Date.now()
    const dur = 3200
    const id = window.setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / dur) * 100)
      setPct(p)
      if (p >= 100) {
        window.clearInterval(id)
        finishLanding()
      }
    }, 40)
    return () => window.clearInterval(id)
  }, [finishLanding, booking.destination?.city])

  return (
    <motion.div
      className="cinema touchdown-cinema"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="cinema-sky night">
        <div className="cinema-ground" style={{ transform: `translateY(${40 - pct * 0.35}px)` }} />
        <motion.div
          className="cinema-plane landing"
          animate={{
            y: [-80, -20, 8],
            rotate: [-8, -3, 0],
            scale: [1.1, 1.02, 0.95],
          }}
          transition={{ duration: 3.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <svg viewBox="0 0 24 24" width="72" height="72" aria-hidden>
            <path
              fill="currentColor"
              d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
            />
          </svg>
        </motion.div>
        <div className="touchdown-flash" style={{ opacity: pct > 55 && pct < 70 ? 0.35 : 0 }} />
      </div>

      <div className="cinema-hud">
        <div className="stamp soft">TOUCHDOWN</div>
        <p className="eyebrow">Aterrizaje</p>
        <h2>{booking.destination?.city}</h2>
        <p className="cinema-meta">
          {booking.flightNumber} · {formatDistance(booking.distanceKm)} ·{' '}
          {booking.sessionMinutes} min de foco
        </p>
        <div className="cinema-bar">
          <div style={{ width: `${pct}%` }} />
        </div>
      </div>
    </motion.div>
  )
}
