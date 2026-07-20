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

  return (
    <motion.section
      className="panel route glass"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <p className="eyebrow">Paso 1 · Ruta</p>
      <h2>Elige tu vuelo</h2>
      <p className="lede">Aeropuertos reales. La duración de sesión marca tu foco a bordo.</p>

      <button type="button" className="btn ghost random-btn" onClick={pickRandomRoute}>
        Ruta sorpresa
      </button>

      <div className="field-grid">
        <label>
          Origen
          <select
            value={booking.origin?.code ?? ''}
            onChange={(e) => setOriginCode(e.target.value)}
          >
            <option value="">Selecciona aeropuerto</option>
            {airports.map((a) => (
              <option key={a.code} value={a.code}>
                {a.code} — {a.city}, {a.country}
              </option>
            ))}
          </select>
        </label>

        <label>
          Destino
          <select
            value={booking.destination?.code ?? ''}
            onChange={(e) => setDestinationCode(e.target.value)}
          >
            <option value="">Selecciona aeropuerto</option>
            {airports.map((a) => (
              <option
                key={a.code}
                value={a.code}
                disabled={a.code === booking.origin?.code}
              >
                {a.code} — {a.city}, {a.country}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="field-label">Duración de la sesión a bordo</p>
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

      {canContinue && hours !== null && km !== null && (
        <div className="route-summary">
          <span>
            {booking.origin!.city} → {booking.destination!.city}
          </span>
          <span>
            {formatDistance(km)} · vuelo real ~{Math.floor(hours)}h{' '}
            {Math.round((hours % 1) * 60)}m
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
          Continuar a documentos
        </button>
      </div>
    </motion.section>
  )
}
