import { motion } from 'framer-motion'
import { useFlight } from '../context/FlightContext'
import { formatDistance } from '../utils/geo'

export function Landing() {
  const { booking, reset, softResetToRoute, log } = useFlight()
  const recent = log[0]

  return (
    <motion.section
      className="panel landing glass"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <p className="eyebrow">Aterrizaje seguro</p>
      <h2>Bienvenido a {booking.destination?.city}</h2>
      <p className="lede">
        Vuelo {booking.flightNumber} completado · {formatDistance(booking.distanceKm)} ·{' '}
        {booking.sessionMinutes} min de sesión.
      </p>

      <div className="landing-card">
        <div>
          <span>Ruta</span>
          <strong>
            {booking.origin?.code} → {booking.destination?.code}
          </strong>
        </div>
        <div>
          <span>Pasajero</span>
          <strong>{booking.documents.fullName}</strong>
        </div>
        <div>
          <span>Asiento</span>
          <strong>{booking.seat}</strong>
        </div>
        <div>
          <span>Estado</span>
          <strong className="status-ok">ON TIME</strong>
        </div>
      </div>

      {log.length > 0 && (
        <div className="flight-log">
          <h3>Flight Log</h3>
          <ul>
            {log.slice(0, 5).map((e) => (
              <li key={e.id}>
                <span>
                  {e.origin}→{e.destination}
                </span>
                <span>{e.sessionMinutes}m</span>
                <span>{new Date(e.completedAt).toLocaleDateString('es-MX')}</span>
              </li>
            ))}
          </ul>
          {recent && (
            <p className="log-note">Último vuelo guardado en tu bitácora local.</p>
          )}
        </div>
      )}

      <div className="actions">
        <button type="button" className="btn ghost" onClick={softResetToRoute}>
          Nueva ruta
        </button>
        <button type="button" className="btn primary" onClick={reset}>
          Volver al inicio
        </button>
      </div>
    </motion.section>
  )
}
