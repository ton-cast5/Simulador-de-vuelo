import { motion } from 'framer-motion'
import { useFlight } from '../context/FlightContext'

export function BoardingGate() {
  const { booking, setStep } = useFlight()

  return (
    <motion.section
      className="panel gate"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <p className="eyebrow">Paso 5 · Embarque</p>
      <h2>Puerta {booking.gate}</h2>
      <p className="lede">
        Documentos y boleto verificados. Puedes ingresar al avión rumbo a{' '}
        {booking.destination?.city}.
      </p>

      <div className="gate-board">
        <div className="gate-row">
          <span>Vuelo</span>
          <strong>{booking.flightNumber}</strong>
        </div>
        <div className="gate-row">
          <span>Destino</span>
          <strong>
            {booking.destination?.code} · {booking.destination?.city}
          </strong>
        </div>
        <div className="gate-row">
          <span>Asiento</span>
          <strong>{booking.seat}</strong>
        </div>
        <div className="gate-row">
          <span>Estado</span>
          <strong className="status-ok">ABORDANDO</strong>
        </div>
      </div>

      <div className="jetway">
        <div className="jetway-tunnel" />
        <div className="jetway-door">INGRESO AL AVIÓN</div>
      </div>

      <div className="actions">
        <button type="button" className="btn ghost" onClick={() => setStep('ticket')}>
          Atrás
        </button>
        <button type="button" className="btn primary" onClick={() => setStep('flight')}>
          Subir al avión y despegar
        </button>
      </div>
    </motion.section>
  )
}
