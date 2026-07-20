import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useFlight } from '../context/FlightContext'

const TEAR_THRESHOLD = 96

export function BoardingPass() {
  const { booking, tearTicket, setStep } = useFlight()
  const [dragging, setDragging] = useState(false)
  const [rip, setRip] = useState(0)
  const startX = useRef(0)
  const startY = useRef(0)
  const tornAnim = booking.ticketTorn

  const drag = useMotionValue(0)
  const smooth = useSpring(drag, { stiffness: 210, damping: 22, mass: 0.85 })
  const stubRotate = useTransform(smooth, [0, 140], [0, 14])
  const stubY = useTransform(smooth, (v) => Math.sin(v / 9) * Math.min(5, v / 28))
  const mainRotate = useTransform(smooth, [0, 140], [0, -3.2])
  const tearGap = useTransform(smooth, [0, 140], [10, 26])
  const mainShift = useTransform(smooth, (v) => -v * 0.1)

  useEffect(() => {
    if (!booking.ticketTorn) return
    const t = window.setTimeout(() => setStep('gate'), 2000)
    return () => window.clearTimeout(t)
  }, [booking.ticketTorn, setStep])

  const finishTear = useCallback(() => {
    if (booking.ticketTorn) return
    setRip(1)
    window.setTimeout(() => tearTicket(), 120)
  }, [booking.ticketTorn, tearTicket])

  const onPointerDown = (e: ReactPointerEvent) => {
    if (booking.ticketTorn) return
    e.currentTarget.setPointerCapture(e.pointerId)
    startX.current = e.clientX
    startY.current = e.clientY
    setDragging(true)
  }

  const onPointerMove = (e: ReactPointerEvent) => {
    if (!dragging || booking.ticketTorn) return
    const dx = e.clientX - startX.current
    const dy = e.clientY - startY.current
    const dist = Math.max(0, dx * 0.82 + Math.max(0, dy) * 0.48)
    // Fibres don't tear in a straight line — small irregularity feels human
    const jitter = Math.sin(dist / 6.5) * Math.min(2.8, dist / 32) + Math.cos(dist / 11) * 0.6
    drag.set(dist + jitter)
    setRip(Math.min(1, dist / TEAR_THRESHOLD))
    if (dist >= TEAR_THRESHOLD) {
      setDragging(false)
      drag.set(TEAR_THRESHOLD + 28)
      finishTear()
    }
  }

  const onPointerUp = () => {
    if (booking.ticketTorn) return
    setDragging(false)
    if (drag.get() < TEAR_THRESHOLD) {
      drag.set(0)
      setRip(0)
    }
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
      className="panel ticket glass"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <p className="eyebrow">04 · Boleto</p>
      <h2>Pase de abordar</h2>
      <p className="lede">
        {booking.ticketTorn
          ? 'Boleto cortado. Dirígete a la puerta.'
          : 'Sujeta el talón y jálalo despacio — como si lo rasgara un agente.'}
      </p>

      <div
        className={`boarding-pass ${tornAnim ? 'torn' : 'interactive'} ${dragging ? 'pulling' : ''}`}
      >
        <AnimatePresence>
          {!booking.ticketTorn ? (
            <div className="bp-full organic" key="full">
              <motion.div
                className="bp-main-wrap"
                style={{ rotate: mainRotate, x: mainShift }}
              >
                {main}
                <div className="bp-tear-edge left" style={{ opacity: rip }} />
              </motion.div>

              <motion.div className="bp-perforation" style={{ width: tearGap }} aria-hidden>
                <span className="bp-cut-hint">rasga</span>
              </motion.div>

              <motion.div
                className="bp-stub-wrap"
                style={{ x: smooth, y: stubY, rotate: stubRotate }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                role="slider"
                aria-valuemin={0}
                aria-valuemax={TEAR_THRESHOLD}
                aria-valuenow={Math.round(rip * TEAR_THRESHOLD)}
                aria-label="Arrastra para rasgar el boleto"
                tabIndex={0}
              >
                <div className="bp-tear-edge right" style={{ opacity: rip }} />
                {stub}
                <div className="bp-drag-affordance">⟶ jala</div>
              </motion.div>
            </div>
          ) : (
            <>
              <motion.div
                className="bp-piece left"
                key="left"
                initial={{ x: -6, rotate: -1.5, y: 0, opacity: 1 }}
                animate={{ x: -28, rotate: -5.5, y: 10 }}
                transition={{ type: 'spring', stiffness: 55, damping: 14, mass: 1.1 }}
              >
                {main}
                <div className="bp-tear-edge left on" />
              </motion.div>
              <motion.div
                className="bp-piece right"
                key="right"
                initial={{ x: 18, rotate: 5, y: 6, opacity: 1 }}
                animate={{ x: 58, rotate: 18, y: 42 }}
                transition={{ type: 'spring', stiffness: 48, damping: 12, mass: 1.15 }}
              >
                <div className="bp-tear-edge right on" />
                {stub}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {!booking.ticketTorn && (
        <p className="tear-hint">Mantén pulsado el talón y arrastra — no hace falta un botón</p>
      )}

      <div className="actions">
        <button type="button" className="btn ghost" onClick={() => setStep('seat')}>
          Atrás
        </button>
        {booking.ticketTorn ? (
          <button type="button" className="btn primary" onClick={() => setStep('gate')}>
            Ir a la puerta
          </button>
        ) : null}
      </div>
    </motion.section>
  )
}
