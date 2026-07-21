import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useFlight } from '../context/FlightContext'
import { playTouchdownSound } from '../utils/cabinAudio'
import { formatDistance } from '../utils/geo'

export function TouchdownSequence() {
  const { booking, finishLanding } = useFlight()
  const [pct, setPct] = useState(0)

  useEffect(() => {
    let done = false
    playTouchdownSound()
    const start = performance.now()
    const dur = 2800
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
    }
  }, [finishLanding])

  return (
    <motion.div
      className="cinema"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="stamp soft">TOUCHDOWN</div>
      <h2>{booking.destination?.city}</h2>
      <p className="cinema-phase">
        {booking.flightNumber} · {formatDistance(booking.distanceKm)} · {booking.sessionMinutes}{' '}
        min
      </p>
      <div className="cinema-bar">
        <div style={{ width: `${pct}%` }} />
      </div>
    </motion.div>
  )
}
