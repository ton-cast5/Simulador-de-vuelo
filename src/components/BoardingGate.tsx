import { useFlight } from '../context/FlightContext'
import { unlockCabinAudio, playChime } from '../utils/cabinAudio'
import { PageMotion } from './PageMotion'

export function BoardingGate() {
  const { booking, startFlight, setStep } = useFlight()

  const board = async () => {
    await unlockCabinAudio()
    playChime()
    startFlight()
  }

  return (
    <PageMotion className="panel gate-screen">
      <p className="eyebrow">04 · Gate</p>
      <h2>Gate {booking.gate}</h2>
      <p className="lede">Final call. Cabin doors closing.</p>

      <div className="gate-board">
        <div className="row">
          <span>Flight</span>
          <span className="val">{booking.flightNumber}</span>
        </div>
        <div className="row">
          <span>Route</span>
          <span className="val">
            {booking.origin?.code} → {booking.destination?.code}
          </span>
        </div>
        <div className="row">
          <span>Seat</span>
          <span className="val">{booking.seat}</span>
        </div>
        <div className="row">
          <span>Boarding</span>
          <span className="val">{booking.boardingTime}</span>
        </div>
      </div>

      <p className="doors-msg">Cabin doors closed. Ready for takeoff.</p>

      <div className="actions">
        <button type="button" className="btn ghost" onClick={() => setStep('ticket')}>
          Back
        </button>
        <button type="button" className="btn primary" onClick={board}>
          Board aircraft
        </button>
      </div>
    </PageMotion>
  )
}
