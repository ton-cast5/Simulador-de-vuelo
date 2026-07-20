import { motion } from 'framer-motion'
import { useFlight } from '../context/FlightContext'

const ROWS = Array.from({ length: 12 }, (_, i) => i + 1)
const LEFT = ['A', 'B', 'C']
const RIGHT = ['D', 'E', 'F']
const OCCUPIED = new Set(['2A', '2F', '5C', '5D', '7B', '8E', '10A', '11F', '3C', '6D'])

export function SeatSelection() {
  const { booking, setSeat, setStep } = useFlight()

  const renderSeat = (id: string, col: string) => {
    const taken = OCCUPIED.has(id)
    const selected = booking.seat === id
    return (
      <button
        key={id}
        type="button"
        className={`seat ${taken ? 'taken' : ''} ${selected ? 'selected' : ''}`}
        disabled={taken}
        onClick={() => setSeat(id)}
        aria-label={`Asiento ${id}`}
      >
        {col}
      </button>
    )
  }

  return (
    <motion.section
      className="panel seats glass"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <p className="eyebrow">Paso 3 · Asiento</p>
      <h2>Elige tu asiento</h2>
      <p className="lede">Mapa de cabina · pasillo central entre C y D.</p>

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

      <div className="cabin">
        <div className="cabin-label">Frente · cabina</div>
        {ROWS.map((row) => (
          <div key={row} className="seat-row">
            <span className="row-num">{row}</span>
            {LEFT.map((col) => renderSeat(`${row}${col}`, col))}
            <span className="aisle" aria-hidden />
            {RIGHT.map((col) => renderSeat(`${row}${col}`, col))}
          </div>
        ))}
      </div>

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
