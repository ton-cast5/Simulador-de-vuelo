import { airports, routeDistanceKm } from '../data/airports'
import { SESSION_OPTIONS } from '../types'
import { formatDistance } from '../utils/geo'
import { useFlight } from '../context/FlightContext'
import { PageMotion } from './PageMotion'

export function RouteSelect() {
  const {
    booking,
    setOriginCode,
    setDestinationCode,
    setSessionMinutes,
    pickRandomRoute,
    confirmRoute,
    setStep,
  } = useFlight()

  const ready = Boolean(booking.origin && booking.destination)
  const previewKm =
    booking.origin && booking.destination
      ? routeDistanceKm(booking.origin, booking.destination)
      : 0

  return (
    <PageMotion className="panel">
      <p className="eyebrow">01 · Route</p>
      <h2>Pick a destination</h2>
      <p className="lede">Session length is your flight time. Destination makes it real.</p>

      <div className="route-pair">
        <div className="field">
          <label htmlFor="origin">From</label>
          <select
            id="origin"
            value={booking.origin?.code ?? ''}
            onChange={(e) => setOriginCode(e.target.value)}
          >
            <option value="" disabled>
              Origin
            </option>
            {airports.map((a) => (
              <option key={a.code} value={a.code}>
                {a.code} — {a.city}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="dest">To</label>
          <select
            id="dest"
            value={booking.destination?.code ?? ''}
            onChange={(e) => setDestinationCode(e.target.value)}
          >
            <option value="" disabled>
              Destination
            </option>
            {airports
              .filter((a) => a.code !== booking.origin?.code)
              .map((a) => (
                <option key={a.code} value={a.code}>
                  {a.code} — {a.city}
                </option>
              ))}
          </select>
        </div>
      </div>

      {ready && (
        <div className="route-preview">
          <span>
            {booking.origin?.code} → {booking.destination?.code}
          </span>
          <em>{formatDistance(previewKm)}</em>
        </div>
      )}

      <p className="eyebrow" style={{ marginTop: '1.1rem' }}>
        Focus duration
      </p>
      <div className="session-grid">
        {SESSION_OPTIONS.map((o) => (
          <button
            key={o.minutes}
            type="button"
            className={`session-pill ${booking.sessionMinutes === o.minutes ? 'on' : ''}`}
            onClick={() => setSessionMinutes(o.minutes)}
          >
            <strong>{o.label}</strong>
            <span>{o.hint}</span>
          </button>
        ))}
      </div>

      <div className="actions">
        <button type="button" className="btn ghost" onClick={() => setStep('welcome')}>
          Back
        </button>
        <button type="button" className="btn ghost" onClick={pickRandomRoute}>
          Surprise
        </button>
        <button type="button" className="btn primary" disabled={!ready} onClick={confirmRoute}>
          Continue
        </button>
      </div>
    </PageMotion>
  )
}
