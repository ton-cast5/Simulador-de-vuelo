import { motion } from 'framer-motion'
import { useFlight } from '../context/FlightContext'
import { GlobeScene } from './GlobeScene'

export function FlightView() {
  const { booking, reset } = useFlight()

  return (
    <motion.section
      className="flight-view"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flight-hud">
        <div>
          <p className="eyebrow">En vuelo</p>
          <h2>
            {booking.origin?.code} → {booking.destination?.code}
          </h2>
          <p className="lede">
            {booking.flightNumber} · Asiento {booking.seat} ·{' '}
            {booking.documents.fullName}
          </p>
        </div>
        <button type="button" className="btn ghost" onClick={reset}>
          Nuevo viaje
        </button>
      </div>

      <GlobeScene
        origin={booking.origin}
        destination={booking.destination}
        mode="flight"
        className="globe-canvas flight-globe"
      />

      <div className="flight-caption">
        Observa la trayectoria sobre el globo terrestre. Arrastra para rotar la vista.
      </div>
    </motion.section>
  )
}
