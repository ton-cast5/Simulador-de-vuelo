import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useFlight } from '../context/FlightContext'
import { PageMotion } from './PageMotion'

const TEAR_THRESHOLD = 90

export function BoardingPass() {
  const { booking, tearTicket, setStep } = useFlight()
  const [expanded, setExpanded] = useState(false)
  const [dragging, setDragging] = useState(false)
  const startX = useRef(0)
  const startY = useRef(0)

  const drag = useMotionValue(0)
  const smooth = useSpring(drag, { stiffness: 210, damping: 22, mass: 0.85 })
  const stubRotate = useTransform(smooth, [0, 140], [0, 14])
  const stubY = useTransform(smooth, (v) => Math.sin(v / 9) * Math.min(5, v / 28))

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
    if (booking.ticketTorn || !expanded) return
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
    const jitter = Math.sin(dist / 6.5) * Math.min(2.8, dist / 32)
    drag.set(dist + jitter)
    if (dist >= TEAR_THRESHOLD) {
      setDragging(false)
      drag.set(TEAR_THRESHOLD + 24)
      finishTear()
    }
  }

  const onPointerUp = () => {
    if (booking.ticketTorn) return
    setDragging(false)
    if (drag.get() < TEAR_THRESHOLD) {
      drag.set(0)
    }
  }

  return (
    <PageMotion className="ticket-screen">
      <p className="eyebrow">03 · Boarding</p>
      <h2>Your boarding pass</h2>
      <p className="lede">Pull up the pass, then tear the stub to board.</p>

      <div className="ticket-map-stub">
        <div className="route-arc">
          {booking.origin?.code}
          <span>→</span>
          {booking.destination?.code}
        </div>
      </div>

      <motion.div
        className="boarding-sheet"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.18}
        onDragEnd={(_, info) => {
          if (info.offset.y < -48 || info.velocity.y < -400) setExpanded(true)
          if (info.offset.y > 48 && !booking.ticketTorn) setExpanded(false)
        }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      >
        <div
          className="sheet-handle"
          onClick={() => setExpanded((v) => !v)}
          role="button"
          tabIndex={0}
          aria-label="Expand boarding pass"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setExpanded((v) => !v)
          }}
        />

        {!booking.ticketTorn ? (
          <>
            <button
              type="button"
              className="bp-compact"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
            >
              <div className="codes">
                {booking.origin?.code}
                <em>→</em>
                {booking.destination?.code}
              </div>
              <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
                {expanded ? 'Collapse' : 'Expand'}
              </span>
            </button>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  className="bp-full-inner"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                >
                  <div className="bp-paper">
                    <div className="bp-main">
                      <div className="bp-airline">SKYVOYAGE AIRLINES</div>
                      <div className="bp-boarding">BOARDING PASS</div>
                      <div className="bp-route-row">
                        <div>
                          <div className="code">{booking.origin?.code}</div>
                          <div className="city">{booking.origin?.city}</div>
                        </div>
                        <div aria-hidden>✈</div>
                        <div>
                          <div className="code">{booking.destination?.code}</div>
                          <div className="city">{booking.destination?.city}</div>
                        </div>
                      </div>
                      <div className="bp-grid">
                        <div>
                          <span>Flight</span>
                          <strong>{booking.flightNumber}</strong>
                        </div>
                        <div>
                          <span>Seat</span>
                          <strong>{booking.seat}</strong>
                        </div>
                        <div>
                          <span>Gate</span>
                          <strong>{booking.gate}</strong>
                        </div>
                        <div>
                          <span>Boarding</span>
                          <strong>{booking.boardingTime}</strong>
                        </div>
                      </div>
                    </div>
                    <div className="bp-perf" aria-hidden />
                    <motion.div
                      className="bp-stub"
                      style={{ x: smooth, y: stubY, rotate: stubRotate }}
                      onPointerDown={onPointerDown}
                      onPointerMove={onPointerMove}
                      onPointerUp={onPointerUp}
                      onPointerCancel={onPointerUp}
                    >
                      <div className="bp-airline">SV</div>
                      <div className="bp-qr" aria-hidden />
                      <div className="bp-mini">
                        <span>SEAT</span>
                        <strong>{booking.seat}</strong>
                      </div>
                      <div className="bp-barcode" aria-hidden />
                    </motion.div>
                  </div>
                  <p className="tear-hint">Hold the stub and drag to tear</p>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <div className="boarding-pass torn">
            <motion.div
              className="bp-piece left"
              initial={{ x: 0, rotate: 0 }}
              animate={{ x: -20, rotate: -6 }}
              transition={{ type: 'spring', stiffness: 55, damping: 14 }}
            >
              <div className="bp-airline">SKYVOYAGE</div>
              <div className="code" style={{ fontSize: '1.4rem', fontWeight: 700 }}>
                {booking.origin?.code} → {booking.destination?.code}
              </div>
            </motion.div>
            <motion.div
              className="bp-piece right"
              initial={{ x: 0, rotate: 0 }}
              animate={{ x: 28, rotate: 16, y: 24 }}
              transition={{ type: 'spring', stiffness: 48, damping: 12 }}
            >
              <div className="bp-mini">
                <span>SEAT</span>
                <strong>{booking.seat}</strong>
              </div>
              <div className="bp-qr" aria-hidden />
            </motion.div>
          </div>
        )}
      </motion.div>

      <div className="actions">
        <button type="button" className="btn ghost" onClick={() => setStep('seat')}>
          Back
        </button>
        {booking.ticketTorn ? (
          <button type="button" className="btn primary" onClick={() => setStep('gate')}>
            Go to gate
          </button>
        ) : (
          <button type="button" className="btn blue" onClick={() => setExpanded(true)}>
            Check in
          </button>
        )}
      </div>
    </PageMotion>
  )
}
