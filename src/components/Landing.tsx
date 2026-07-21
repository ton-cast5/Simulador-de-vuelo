import { useFlight } from '../context/FlightContext'
import { formatDistance } from '../utils/geo'
import { PageMotion } from './PageMotion'

export function Landing() {
  const { booking, log, softResetToRoute, reset } = useFlight()

  return (
    <PageMotion className="panel">
      <div className="stamp soft" style={{ transform: 'rotate(-6deg)', marginBottom: '0.75rem' }}>
        LANDED
      </div>
      <p className="eyebrow">Arrived</p>
      <h2>{booking.destination?.city}</h2>
      <p className="lede">Safe landing. Your focus session is complete.</p>

      <div className="landing-card">
        <div className="landing-row">
          <span>Flight</span>
          <strong>{booking.flightNumber}</strong>
        </div>
        <div className="landing-row">
          <span>Route</span>
          <strong>
            {booking.origin?.code} → {booking.destination?.code}
          </strong>
        </div>
        <div className="landing-row">
          <span>Seat</span>
          <strong>
            {booking.seat} · {booking.seatIntent}
          </strong>
        </div>
        <div className="landing-row">
          <span>Distance</span>
          <strong>{formatDistance(booking.distanceKm)}</strong>
        </div>
        <div className="landing-row">
          <span>Focus time</span>
          <strong>{booking.sessionMinutes} min</strong>
        </div>
      </div>

      {log.length > 0 && (
        <div className="flight-log">
          <h3>FlightLog</h3>
          {log.slice(0, 5).map((e) => (
            <div key={e.id} className="log-item">
              <strong>
                {e.origin} → {e.destination}
              </strong>
              <span>
                {e.sessionMinutes}m · {e.seatIntent ?? 'work'}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="actions">
        <button type="button" className="btn ghost" onClick={reset}>
          Home
        </button>
        <button type="button" className="btn primary" onClick={softResetToRoute}>
          Fly again
        </button>
      </div>
    </PageMotion>
  )
}
