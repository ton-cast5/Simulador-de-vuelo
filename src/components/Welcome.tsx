import { motion } from 'framer-motion'
import { useFlight } from '../context/FlightContext'
import { unlockCabinAudio } from '../utils/cabinAudio'

export function Welcome() {
  const { setStep, log } = useFlight()
  const miles = log.reduce((acc, e) => acc + e.distanceKm, 0)

  const start = async () => {
    await unlockCabinAudio()
    setStep('route')
  }

  return (
    <motion.section
      className="panel glass welcome-hero"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className="eyebrow">SkyVoyage</p>
      <h1>Despega. Enfócate. Aterriza.</h1>
      <p className="lede">
        Cada sesión es un vuelo real: ruta, documentos, asiento, boleto y el planeta
        girando bajo tus alas.
      </p>

      <div className="welcome-stats">
        <div>
          <strong>{log.length}</strong>
          <span>vuelos</span>
        </div>
        <div>
          <strong>{Math.round(miles).toLocaleString('es-MX')}</strong>
          <span>km</span>
        </div>
      </div>

      <div className="welcome-cta">
        <button type="button" className="btn primary" onClick={start}>
          Empezar viaje
        </button>
        <p className="welcome-note">Tu mundo está detrás · gira el globo</p>
      </div>
    </motion.section>
  )
}
