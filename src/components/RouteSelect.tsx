import { motion } from 'framer-motion'
import { airports, estimateFlightHours, routeDistanceKm } from '../data/airports'
import { useFlight } from '../context/FlightContext'
import { SESSION_OPTIONS } from '../types'
import { formatDistance } from '../utils/geo'

export function RouteSelect() {
  const {
    booking,
    setOriginCode,
    setDestinationCode,
    setSessionMinutes,
    pickRandomRoute,
    confirmRoute,
    setStep,
  } = useFlight()

  const hours =
    booking.origin && booking.destination
      ? estimateFlightHours(booking.origin, booking.destination)
      : null
  const km =
    booking.origin && booking.destination
      ? routeDistanceKm(booking.origin, booking.destination)
      : null

  const canContinue =
    !!booking.origin &&
    !!booking.destination &&
    booking.origin.code !== booking.destination.code

  const swap = () => {
    if (!booking.origin || !booking.destination) return
    const from = booking.origin.code
    const to = booking.destination.code
    setOriginCode(to)
    setDestinationCode(from)
  }

  return (
    <motion.section
      className="panel glass"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className="eyebrow">01 · Ruta</p>
      <h2>¿A dónde volamos?</h2>
      <p className="lede">Elige aeropuertos reales. La duración define tu sesión de foco.</p>

      {canContinue && (
        <div className="route-visual">
          <div>
            <span className="code">{booking.origin!.code}</span>
            <span className="city">{booking.origin!.city}</span>
          </div>
          <div className="mid">
            <div className="route-line" />
            <span>{formatDistance(km!)}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="code">{booking.destination!.code}</span>
            <span className="city">{booking.destination!.city}</span>
          </div>
        </div>
      )}

      <div className="airport-pair">
        <label>
          Origen
          <select
            value={booking.origin?.code ?? ''}
            onChange={(e) => setOriginCode(e.target.value)}
          >
            <option value="">Aeropuerto</option>
            {airports.map((a) => (
              <option key={a.code} value={a.code}>
                {a.code} — {a.city}
              </option>
            ))}
          </select>
        </label>

        <button type="button" className="airport-swap" onClick={swap} aria-label="Intercambiar">
          ⇄
        </button>

        <label>
          Destino
          <select
            value={booking.destination?.code ?? ''}
            onChange={(e) => setDestinationCode(e.target.value)}
          >
            <option value="">Aeropuerto</option>
            {airports.map((a) => (
              <option
                key={a.code}
                value={a.code}
                disabled={a.code === booking.origin?.code}
              >
                {a.code} — {a.city}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button type="button" className="btn ghost random-btn full" onClick={pickRandomRoute}>
        Ruta sorpresa
      </button>

      <p className="field-label">Duración a bordo</p>
      <div className="session-grid">
        {SESSION_OPTIONS.map((opt) => (
          <button
            key={opt.minutes}
            type="button"
            className={`session-card ${booking.sessionMinutes === opt.minutes ? 'on' : ''}`}
            onClick={() => setSessionMinutes(opt.minutes)}
          >
            <strong>{opt.label}</strong>
            <span>{opt.hint}</span>
          </button>
        ))}
      </div>

      {canContinue && hours !== null && (
        <div className="route-summary">
          <span>
            {booking.origin!.city} → {booking.destination!.city}
          </span>
          <span>
            vuelo real ~{Math.floor(hours)}h {Math.round((hours % 1) * 60)}m
          </span>
        </div>
      )}

      <div className="actions">
        <button type="button" className="btn ghost" onClick={() => setStep('welcome')}>
          Atrás
        </button>
        <button
          type="button"
          className="btn primary"
          disabled={!canContinue}
          onClick={confirmRoute}
        >
          Continuar
        </button>
      </div>
    </motion.section>
  )
}
