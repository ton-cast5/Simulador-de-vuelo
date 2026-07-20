import { useFlight } from '../context/FlightContext'
import { PageMotion } from './PageMotion'

const ROWS = Array.from({ length: 12 }, (_, i) => i + 1)
const OCCUPIED = new Set([
  '1A',
  '1F',
  '2B',
  '2E',
  '3C',
  '4D',
  '5A',
  '6F',
  '7B',
  '7C',
  '8D',
  '9E',
  '10A',
  '11F',
  '12B',
])
const EXIT_ROWS = new Set([5, 6])

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
    <PageMotion className="panel seats glass">
      <p className="eyebrow">03 · Asiento</p>
      <h2>Elige tu lugar</h2>
      <p className="lede">Mapa en forma de avión · ventanilla, pasillo y emergencias.</p>

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

      <div className="plane-map">
        <div className="plane-nose" aria-hidden>
          <span>COCKPIT</span>
        </div>

        <div className="plane-body">
          <div className="plane-wing left" aria-hidden />
          <div className="plane-wing right" aria-hidden />

          <div className="plane-cabin">
            <div className="cabin-cols-label">
              <span />
              <span>A</span>
              <span>B</span>
              <span>C</span>
              <span className="aisle-label">│</span>
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
          </div>
        </div>

        <div className="plane-tail" aria-hidden>
          <div className="fin" />
          <span>TAIL</span>
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
    </PageMotion>
  )
}
