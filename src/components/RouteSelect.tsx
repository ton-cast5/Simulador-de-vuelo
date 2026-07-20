import { motion } from 'framer-motion'
import { airports, estimateFlightHours } from '../data/airports'
import { useFlight } from '../context/FlightContext'

export function RouteSelect() {
  const { booking, setOriginCode, setDestinationCode, confirmRoute, setStep } =
    useFlight()

  const hours =
    booking.origin && booking.destination
      ? estimateFlightHours(booking.origin, booking.destination)
      : null

  const canContinue =
    !!booking.origin &&
    !!booking.destination &&
    booking.origin.code !== booking.destination.code

  return (
    <motion.section
      className="panel route"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <p className="eyebrow">Paso 1 · Ruta</p>
      <h2>Elige origen y destino</h2>
      <p className="lede">Aeropuertos reales alrededor del mundo.</p>

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

      {canContinue && hours !== null && (
        <div className="route-summary">
          <span>
            {booking.origin!.city} → {booking.destination!.city}
          </span>
          <span>
            ~{Math.floor(hours)}h {Math.round((hours % 1) * 60)}m de vuelo
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
