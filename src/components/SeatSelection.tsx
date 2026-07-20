import { motion } from 'framer-motion'
import { useFlight } from '../context/FlightContext'

const ROWS = Array.from({ length: 14 }, (_, i) => i + 1)
const OCCUPIED = new Set([
  '1A',
  '1F',
  '2B',
  '2E',
  '4C',
  '4D',
  '5A',
  '6F',
  '7B',
  '8C',
  '8D',
  '9E',
  '11A',
  '11F',
  '12B',
  '13C',
  '14D',
])
const EXIT_ROWS = new Set([6, 7])

export function SeatSelection() {
  const { booking, setSeat, setStep } = useFlight()

  const renderSeat = (id: string, col: string, side: 'window' | 'middle' | 'aisle') => {
    const taken = OCCUPIED.has(id)
    const selected = booking.seat === id
    return (
      <button
        key={id}
        type="button"
        className={`seat-real ${side} ${taken ? 'taken' : ''} ${selected ? 'selected' : ''}`}
        disabled={taken}
        onClick={() => setSeat(id)}
        aria-label={`Asiento ${id}`}
      >
        <span className="seat-back" />
        <span className="seat-cushion">{col}</span>
      </button>
    )
  }

  return (
    <motion.section
      className="panel seats glass"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <p className="eyebrow">03 · Asiento</p>
      <h2>Elige tu lugar</h2>
      <p className="lede">Cabina Economy · ventanilla, pasillo y filas de emergencia.</p>

      <div className="seat-legend">
        <span>
          <i className="dot free" /> Libre
        </span>
        <span>
          <i className="dot taken" /> Ocupado
        </span>
        <span>
          <i className="dot selected" /> Tu asiento
        </span>
      </div>

      <div className="cabin-shell">
        <div className="cabin-nose">Cabina · frente</div>
        <div className="cabin-fuselage">
          <div className="cabin-bins" aria-hidden />
          <div className="cabin-cols-label">
            <span>A</span>
            <span>B</span>
            <span>C</span>
            <span className="aisle-label">pasillo</span>
            <span>D</span>
            <span>E</span>
            <span>F</span>
          </div>

          {ROWS.map((row) => (
            <div key={row} className={`cabin-row ${EXIT_ROWS.has(row) ? 'exit' : ''}`}>
              <span className="row-num">{row}</span>
              <div className="seat-bank left">
                {renderSeat(`${row}A`, 'A', 'window')}
                {renderSeat(`${row}B`, 'B', 'middle')}
                {renderSeat(`${row}C`, 'C', 'aisle')}
              </div>
              <div className="cabin-aisle">
                {EXIT_ROWS.has(row) ? <span className="exit-tag">EXIT</span> : null}
              </div>
              <div className="seat-bank right">
                {renderSeat(`${row}D`, 'D', 'aisle')}
                {renderSeat(`${row}E`, 'E', 'middle')}
                {renderSeat(`${row}F`, 'F', 'window')}
              </div>
            </div>
          ))}
          <div className="cabin-tail">Cola</div>
        </div>
      </div>

      {booking.seat && (
        <p className="seat-picked">
          Seleccionado: <strong>{booking.seat}</strong>
          {booking.seat.endsWith('A') || booking.seat.endsWith('F')
            ? ' · ventanilla'
            : booking.seat.endsWith('C') || booking.seat.endsWith('D')
              ? ' · pasillo'
              : ' · centro'}
        </p>
      )}

      <div className="actions">
        <button type="button" className="btn ghost" onClick={() => setStep('documents')}>
          Atrás
        </button>
        <button
          type="button"
          className="btn primary"
          disabled={!booking.seat}
          onClick={() => setStep('ticket')}
        >
          Recoger boleto {booking.seat ? `(${booking.seat})` : ''}
        </button>
      </div>
    </motion.section>
  )
}
