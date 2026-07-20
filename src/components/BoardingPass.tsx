import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFlight } from '../context/FlightContext'

const TEAR_THRESHOLD = 72

export function BoardingPass() {
  const { booking, tearTicket, setStep } = useFlight()
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startX = useRef(0)
  const startY = useRef(0)
  const tornAnim = booking.ticketTorn

  useEffect(() => {
    if (!booking.ticketTorn) return
    const t = window.setTimeout(() => setStep('gate'), 1800)
    return () => window.clearTimeout(t)
  }, [booking.ticketTorn, setStep])

  const finishTear = useCallback(() => {
    if (booking.ticketTorn) return
    tearTicket()
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
    // Desktop: drag right. Mobile (stub below): drag down also counts.
    const dist = Math.max(0, dx, dy * 0.85)
    setDragX(dist)
    if (dist >= TEAR_THRESHOLD) {
      setDragging(false)
      setDragX(TEAR_THRESHOLD + 40)
      finishTear()
    }
  }

  const onPointerUp = () => {
    if (booking.ticketTorn) return
    setDragging(false)
    if (dragX < TEAR_THRESHOLD) {
      setDragX(0)
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
      <p className="eyebrow">Paso 4 · Boleto</p>
      <h2>Tu pase de abordar</h2>
      <p className="lede">
        {booking.ticketTorn
          ? 'Boleto cortado. Dirígete a la puerta.'
          : 'Arrastra el talón hacia la derecha para cortar tu boleto.'}
      </p>

      <div className={`boarding-pass ${tornAnim ? 'torn' : 'interactive'}`}>
        <AnimatePresence>
          {!booking.ticketTorn ? (
            <div className="bp-full" key="full">
              <div className="bp-main-wrap">{main}</div>
              <div className="bp-perforation" aria-hidden>
                <span className="bp-cut-hint">✂ corta</span>
              </div>
              <div
                className="bp-stub-wrap"
                style={{
                  transform: `translateX(${dragX}px) rotate(${dragX * 0.08}deg)`,
                }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                role="slider"
                aria-valuemin={0}
                aria-valuemax={TEAR_THRESHOLD}
                aria-valuenow={Math.round(dragX)}
                aria-label="Arrastra para cortar el boleto"
                tabIndex={0}
              >
                {stub}
                <div className="bp-drag-affordance">⟶</div>
              </div>
            </div>
          ) : (
            <>
              <motion.div
                className="bp-piece left"
                key="left"
                initial={{ x: 0, rotate: 0 }}
                animate={{ x: -28, rotate: -6, y: 4 }}
                transition={{ type: 'spring', stiffness: 90, damping: 14 }}
              >
                {main}
              </motion.div>
              <motion.div
                className="bp-piece right"
                key="right"
                initial={{ x: dragX, rotate: dragX * 0.08 }}
                animate={{ x: 56, y: 28, rotate: 14 }}
                transition={{ type: 'spring', stiffness: 80, damping: 12 }}
              >
                {stub}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {!booking.ticketTorn && (
        <p className="tear-hint">Mantén y desliza el talón por la línea de puntos</p>
      )}

      <div className="actions">
        <button type="button" className="btn ghost" onClick={() => setStep('seat')}>
          Atrás
        </button>
        {booking.ticketTorn ? (
          <button type="button" className="btn primary" onClick={() => setStep('gate')}>
            Ir a la puerta
          </button>
        ) : (
          <button
            type="button"
            className="btn ghost"
            onClick={() => {
              setDragX(TEAR_THRESHOLD + 20)
              finishTear()
            }}
          >
            Cortar con un toque
          </button>
        )}
      </div>
    </motion.section>
  )
}
