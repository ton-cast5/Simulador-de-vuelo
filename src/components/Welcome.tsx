import { motion } from 'framer-motion'
import { useFlight } from '../context/FlightContext'

export function Welcome() {
  const { setStep, log } = useFlight()
  const miles = log.reduce((acc, e) => acc + e.distanceKm, 0)

  return (
    <motion.section
      className="panel welcome glass"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <p className="eyebrow">SkyVoyage</p>
      <h1>Tu sesión de foco es un vuelo real</h1>
      <p className="lede">
        Reserva la ruta, pasa el control documental, elige asiento, corta tu boleto y
        cruza el planeta en un globo 3D — inspirado en Focus Flight, llevado más lejos.
      </p>

      <div className="welcome-stats">
        <div>
          <strong>{log.length}</strong>
          <span>vuelos</span>
        </div>
        <div>
          <strong>{Math.round(miles).toLocaleString('es-MX')}</strong>
          <span>km volados</span>
        </div>
      </div>

      <button type="button" className="btn primary" onClick={() => setStep('route')}>
        Reservar vuelo
      </button>
    </motion.section>
  )
}
