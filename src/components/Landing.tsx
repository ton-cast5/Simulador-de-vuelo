import { motion } from 'framer-motion'
import { useFlight } from '../context/FlightContext'
import { formatDistance } from '../utils/geo'

export function Landing() {
  const { booking, reset, softResetToRoute, log } = useFlight()

  return (
    <motion.section
      className="panel glass"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="landing-burst">
        <div className="stamp">LANDED</div>
        <p className="eyebrow">Aterrizaje seguro</p>
        <h2>Bienvenido a {booking.destination?.city}</h2>
        <p className="lede" style={{ marginInline: 'auto' }}>
          {booking.flightNumber} · {formatDistance(booking.distanceKm)} ·{' '}
          {booking.sessionMinutes} min de foco.
        </p>
      </div>

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
        </div>
      )}

      <div className="actions">
        <button type="button" className="btn ghost" onClick={softResetToRoute}>
          Nueva ruta
        </button>
        <button type="button" className="btn primary" onClick={reset}>
          Inicio
        </button>
      </div>
    </motion.section>
  )
}
