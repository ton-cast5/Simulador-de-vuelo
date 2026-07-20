import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFlight } from '../context/FlightContext'

export function BoardingPass() {
  const { booking, tearTicket, setStep } = useFlight()
  const [tearing, setTearing] = useState(false)

  useEffect(() => {
    if (!booking.ticketTorn) return
    const t = window.setTimeout(() => setStep('gate'), 1600)
    return () => window.clearTimeout(t)
  }, [booking.ticketTorn, setStep])

  const onTear = () => {
    if (booking.ticketTorn || tearing) return
    setTearing(true)
    window.setTimeout(() => {
      tearTicket()
    }, 700)
  }

  const stub = (
    <div className="bp-stub">
      <div className="bp-airline">SKYVOYAGE</div>
      <div className="bp-qr" aria-hidden />
      <div className="bp-mini">
        <span>ASIENTO</span>
        <strong>{booking.seat}</strong>
      </div>
      <div className="bp-mini">
        <span>PUERTA</span>
        <strong>{booking.gate}</strong>
      </div>
      <div className="bp-barcode" aria-hidden />
    </div>
  )

  const main = (
    <div className="bp-main">
      <div className="bp-top">
        <div>
          <div className="bp-airline">SKYVOYAGE AIRLINES</div>
          <div className="bp-boarding">BOARDING PASS</div>
        </div>
        <div className="bp-flight">
          <span>VUELO</span>
          <strong>{booking.flightNumber}</strong>
        </div>
      </div>

      <div className="bp-route">
        <div>
          <span className="code">{booking.origin?.code}</span>
          <span className="city">{booking.origin?.city}</span>
        </div>
        <div className="plane-icon" aria-hidden>
          ✈
        </div>
        <div>
          <span className="code">{booking.destination?.code}</span>
          <span className="city">{booking.destination?.city}</span>
        </div>
      </div>

      <div className="bp-grid">
        <div>
          <span>Pasajero</span>
          <strong>{booking.documents.fullName || '—'}</strong>
        </div>
        <div>
          <span>Asiento</span>
          <strong>{booking.seat}</strong>
        </div>
        <div>
          <span>Puerta</span>
          <strong>{booking.gate}</strong>
        </div>
        <div>
          <span>Embarque</span>
          <strong>{booking.boardingTime}</strong>
        </div>
        <div>
          <span>Salida</span>
          <strong>{booking.departureTime}</strong>
        </div>
        <div>
          <span>Llegada</span>
          <strong>{booking.arrivalTime}</strong>
        </div>
      </div>

      <div className="bp-footer">
        Pasaporte {booking.documents.passportNumber} · Documentos verificados ✓
      </div>
    </div>
  )

  return (
    <motion.section
      className="panel ticket"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <p className="eyebrow">Paso 4 · Boleto</p>
      <h2>Tu pase de abordar</h2>
      <p className="lede">
        {booking.ticketTorn
          ? 'Boleto sellado y cortado. Dirígete a la puerta.'
          : 'Presenta el boleto en el mostrador para que te lo corten.'}
      </p>

      <div className={`boarding-pass ${tearing || booking.ticketTorn ? 'torn' : ''}`}>
        <AnimatePresence>
          {!booking.ticketTorn ? (
            <motion.div
              className="bp-full"
              key="full"
              animate={tearing ? { x: [0, -6, 8, -4, 0], rotate: [0, -0.5, 0.8, 0] } : {}}
              transition={{ duration: 0.65 }}
            >
              {main}
              <div className="bp-perforation" aria-hidden />
              {stub}
            </motion.div>
          ) : (
            <>
              <motion.div
                className="bp-piece left"
                key="left"
                initial={{ x: 0, rotate: 0, opacity: 1 }}
                animate={{ x: -40, rotate: -8, opacity: 0.95 }}
                transition={{ type: 'spring', stiffness: 120, damping: 14 }}
              >
                {main}
              </motion.div>
              <motion.div
                className="bp-piece right"
                key="right"
                initial={{ x: 0, rotate: 0, opacity: 1 }}
                animate={{ x: 50, y: 20, rotate: 12, opacity: 0.9 }}
                transition={{ type: 'spring', stiffness: 110, damping: 12 }}
              >
                {stub}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <div className="actions">
        <button type="button" className="btn ghost" onClick={() => setStep('seat')}>
          Atrás
        </button>
        {!booking.ticketTorn ? (
          <button type="button" className="btn primary" onClick={onTear} disabled={tearing}>
            {tearing ? 'Cortando boleto…' : 'Cortar boleto en el control'}
          </button>
        ) : (
          <button type="button" className="btn primary" onClick={() => setStep('gate')}>
            Ir a la puerta
          </button>
        )}
      </div>
    </motion.section>
  )
}
