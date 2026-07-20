import { motion } from 'framer-motion'
import { useFlight } from '../context/FlightContext'

export function Welcome() {
  const { setStep } = useFlight()

  return (
    <motion.section
      className="panel welcome"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <p className="eyebrow">Simulador de Vuelo</p>
      <h1>Tu viaje empieza en la puerta de embarque</h1>
      <p className="lede">
        Elige aeropuertos reales, entrega tus documentos, recoge tu boleto,
        pasa el control y observa tu avión cruzar el mundo.
      </p>
      <button type="button" className="btn primary" onClick={() => setStep('route')}>
        Iniciar viaje
      </button>
    </motion.section>
  )
}
