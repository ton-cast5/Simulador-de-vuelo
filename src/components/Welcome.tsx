import { useMemo, useState } from 'react'
import { useFlight } from '../context/FlightContext'
import { unlockCabinAudio } from '../utils/cabinAudio'
import { PageMotion } from './PageMotion'
import { airports } from '../data/airports'
import { distanceKm } from '../utils/geo'
import type { Airport } from '../types'

function nearestAirport(lat: number, lon: number): Airport {
  const point: Airport = {
    code: 'X',
    name: '',
    city: '',
    country: '',
    lat,
    lon,
    timezone: '',
  }
  let winner = airports[0]
  let min = Infinity
  for (const a of airports) {
    const d = distanceKm(point, a)
    if (d < min) {
      min = d
      winner = a
    }
  }
  return winner
}

export function Welcome() {
  const { setStep, log, homeAirportCode, setHomeAirport, setOriginCode } = useFlight()
  const miles = log.reduce((acc, e) => acc + e.distanceKm, 0)
  const home = airports.find((a) => a.code === homeAirportCode)
  const [locating, setLocating] = useState(false)
  const [suggested, setSuggested] = useState<Airport | null>(null)
  const [manual, setManual] = useState(false)

  const start = async () => {
    await unlockCabinAudio()
    if (homeAirportCode) {
      setOriginCode(homeAirportCode)
      setStep('route')
    }
  }

  const pickHome = (code: string) => {
    setHomeAirport(code)
    setOriginCode(code)
  }

  const detectNearest = () => {
    if (!navigator.geolocation) {
      setManual(true)
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const near = nearestAirport(pos.coords.latitude, pos.coords.longitude)
        setSuggested(near)
        setLocating(false)
      },
      () => {
        setLocating(false)
        setManual(true)
      },
      { timeout: 8000 },
    )
  }

  const nearbyList = useMemo(() => {
    if (!suggested) return airports.slice(0, 6)
    return [...airports]
      .map((a) => ({
        a,
        d: distanceKm(
          {
            code: 'X',
            name: '',
            city: '',
            country: '',
            lat: suggested.lat,
            lon: suggested.lon,
            timezone: '',
          },
          a,
        ),
      }))
      .sort((x, y) => x.d - y.d)
      .slice(0, 6)
      .map((x) => x.a)
  }, [suggested])

  return (
    <PageMotion className="panel welcome-hero">
      <p className="eyebrow">SkyVoyage</p>
      <h1>Take off into deep focus</h1>
      <p className="lede">
        Pick a real route, tear your boarding pass, and stay in your seat until you land.
      </p>

      {!home ? (
        <>
          <p className="eyebrow">Set your home airport</p>
          {!manual && !suggested && (
            <div className="actions" style={{ marginTop: 0 }}>
              <button
                type="button"
                className="btn blue"
                onClick={detectNearest}
                disabled={locating}
              >
                {locating ? 'Detecting…' : 'Detect nearest'}
              </button>
              <button type="button" className="btn ghost" onClick={() => setManual(true)}>
                Pick manually
              </button>
            </div>
          )}

          {(suggested || manual) && (
            <div className="field" style={{ marginTop: '0.85rem' }}>
              <label htmlFor="home">
                {suggested ? 'Recommended near you' : 'Home airport'}
              </label>
              <select
                id="home"
                defaultValue={suggested?.code ?? ''}
                onChange={(e) => e.target.value && pickHome(e.target.value)}
              >
                <option value="" disabled>
                  Choose…
                </option>
                {(suggested ? nearbyList : airports).map((a) => (
                  <option key={a.code} value={a.code}>
                    {a.code} — {a.city}
                  </option>
                ))}
              </select>
              {suggested && (
                <button
                  type="button"
                  className="btn primary"
                  style={{ marginTop: '0.75rem', width: '100%' }}
                  onClick={() => pickHome(suggested.code)}
                >
                  Confirm {suggested.code}
                </button>
              )}
              {suggested && (
                <button
                  type="button"
                  className="btn ghost"
                  style={{ marginTop: '0.5rem', width: '100%' }}
                  onClick={() => setManual(true)}
                >
                  View all airports
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="home-airport-chip">
          Home · {home.code} · {home.city}
        </div>
      )}

      <div className="welcome-stats">
        <div>
          <strong>{log.length}</strong>
          <span>flights</span>
        </div>
        <div>
          <strong>{Math.round(miles).toLocaleString('en-US')}</strong>
          <span>km flown</span>
        </div>
      </div>

      <div className="actions">
        <button type="button" className="btn primary" disabled={!home} onClick={start}>
          Start journey
        </button>
      </div>
    </PageMotion>
  )
}
