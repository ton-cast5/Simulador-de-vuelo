import { SEAT_INTENTS } from '../types'
import { useFlight } from '../context/FlightContext'
import { PageMotion } from './PageMotion'

const ROWS = Array.from({ length: 10 }, (_, i) => i + 1)
const OCCUPIED = new Set(['1A', '1F', '2B', '3C', '4D', '5A', '6F', '7B', '8D', '9E', '10A'])
const EXIT_ROWS = new Set([4, 5])

export function SeatSelection() {
  const { booking, setSeat, setSeatIntent, setStep } = useFlight()

  const renderSeat = (id: string, col: string) => {
    const taken = OCCUPIED.has(id)
    const selected = booking.seat === id
    return (
      <button
        key={id}
        type="button"
        className={`seat-real ${taken ? 'taken' : ''} ${selected ? 'selected' : ''}`}
        disabled={taken}
        onClick={() => setSeat(id)}
        aria-label={`Seat ${id}`}
      >
        <span className="seat-cushion">{col}</span>
      </button>
    )
  }

  return (
    <PageMotion className="panel">
      <p className="eyebrow">02 · Seat</p>
      <h2>Choose your focus</h2>
      <p className="lede">Seat type sets your intent. Then pick where you sit.</p>

      <div className="intent-grid">
        {SEAT_INTENTS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`intent-card ${booking.seatIntent === s.id ? 'on' : ''}`}
            onClick={() => setSeatIntent(s.id)}
          >
            <div>
              <strong>{s.label}</strong>
              <span>{s.hint}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="seat-legend">
        <span>
          <i className="dot free" /> Free
        </span>
        <span>
          <i className="dot taken" /> Taken
        </span>
        <span>
          <i className="dot selected" /> Yours
        </span>
      </div>

      <div className="plane-map">
        <div className="plane-nose">COCKPIT</div>
        <div className="plane-body">
          <div className="plane-wing left" aria-hidden />
          <div className="plane-wing right" aria-hidden />
          <div className="plane-cabin">
            <div className="cabin-cols-label">
              <span />
              <span>A</span>
              <span>B</span>
              <span>C</span>
              <span />
              <span>D</span>
              <span>E</span>
              <span>F</span>
            </div>
            {ROWS.map((row) => (
              <div key={row} className="cabin-row">
                <span className="row-num">{row}</span>
                <div className="seat-bank">
                  {renderSeat(`${row}A`, 'A')}
                  {renderSeat(`${row}B`, 'B')}
                  {renderSeat(`${row}C`, 'C')}
                </div>
                <div className="cabin-aisle">
                  {EXIT_ROWS.has(row) ? <span className="exit-tag">EXIT</span> : null}
                </div>
                <div className="seat-bank">
                  {renderSeat(`${row}D`, 'D')}
                  {renderSeat(`${row}E`, 'E')}
                  {renderSeat(`${row}F`, 'F')}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="plane-tail">
          <div className="fin" />
          TAIL
        </div>
      </div>

      {booking.seat && (
        <p className="seat-picked">
          Selected: <strong>{booking.seat}</strong> · {booking.seatIntent}
        </p>
      )}

      <div className="actions">
        <button type="button" className="btn ghost" onClick={() => setStep('route')}>
          Back
        </button>
        <button
          type="button"
          className="btn primary"
          disabled={!booking.seat}
          onClick={() => setStep('ticket')}
        >
          Boarding pass
        </button>
      </div>
    </PageMotion>
  )
}
