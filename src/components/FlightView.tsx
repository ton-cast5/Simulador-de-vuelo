import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useFlight } from '../context/FlightContext'
import { formatDistance, formatDuration } from '../utils/geo'
import { useCabinAmbience } from '../hooks/useCabinAmbience'
import { useCabinAnnouncements } from '../hooks/useCabinAnnouncements'
import { setCabinVolume } from '../utils/cabinAudio'
import { CabinWindow3D } from './CabinWindow3D'
import { GlobeScene } from './GlobeScene'

function phaseLabel(progress: number) {
  if (progress < 0.12) return 'Climb'
  if (progress < 0.7) return 'Cruise'
  if (progress < 0.92) return 'Descent'
  return 'Final'
}

export function FlightView() {
  const {
    booking,
    session,
    togglePause,
    setCabinView,
    togglePureMode,
    toggleAmbience,
    toggleMapStyle,
    setAnnouncement,
    completeLanding,
  } = useFlight()
  const [volume, setVolume] = useState(0.38)

  useCabinAmbience(session.ambienceOn && !session.paused)
  useCabinAnnouncements(
    session.startedAt,
    session.progress,
    session.ambienceOn,
    session.paused,
    setAnnouncement,
  )

  useEffect(() => {
    setCabinVolume(volume)
  }, [volume])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') togglePureMode()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [togglePureMode])

  const remainingMs = booking.sessionMinutes * 60 * 1000 * (1 - session.progress)
  const remainingKm = booking.distanceKm * (1 - session.progress)
  const phase = phaseLabel(session.progress)
  const origin = booking.origin!
  const destination = booking.destination!

  const mapLabel =
    session.mapStyle === '3d' ? '3D' : session.mapStyle === 'satellite' ? 'Sat' : 'Map'

  return (
    <motion.section
      className={`flight-immersive ${session.pureMode ? 'pure' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onDoubleClick={togglePureMode}
    >
      {session.cabinView === 'window' ? (
        <CabinWindow3D
          origin={origin}
          destination={destination}
          progress={session.progress}
          mapStyle={session.mapStyle}
        />
      ) : (
        <div className="flight-map-fallback">
          <GlobeScene
            origin={origin}
            destination={destination}
            mode="flight"
            progress={session.progress}
            mapStyle={session.mapStyle === 'classic' ? 'night' : 'day'}
            className="globe-canvas flight-globe"
          />
        </div>
      )}

      <div className="flight-overlay">
        {!session.pureMode && (
          <div className="flight-chrome">
            <div className="flight-route-pill">
              {origin.code}
              <em>→</em>
              {destination.code}
              <em>· {booking.flightNumber}</em>
            </div>
            <div className="flight-tools">
              <button
                type="button"
                className={`chip ${session.cabinView === 'window' ? 'on' : ''}`}
                onClick={() => setCabinView('window')}
              >
                Window
              </button>
              <button
                type="button"
                className={`chip ${session.cabinView === 'map' ? 'on' : ''}`}
                onClick={() => setCabinView('map')}
              >
                Route
              </button>
              <button type="button" className="chip" onClick={toggleMapStyle}>
                {mapLabel}
              </button>
              <button type="button" className="chip" onClick={toggleAmbience}>
                {session.ambienceOn ? 'Sound' : 'Mute'}
              </button>
            </div>
          </div>
        )}

        <AnimatePresence>
          {session.announcement && !session.pureMode && (
            <motion.div
              className="cabin-announce"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              key={session.announcement}
            >
              <span className="cabin-announce-tag">Cabin</span>
              <p>{session.announcement}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flight-bottom">
          <div className="progress-rail">
            <div className="progress-fill" style={{ width: `${session.progress * 100}%` }} />
          </div>

          <div className="flight-hud">
            <div className="hud-card">
              <span>Time remaining</span>
              <strong>{formatDuration(remainingMs)}</strong>
            </div>
            <div className="hud-card">
              <span>Distance left</span>
              <strong>{formatDistance(remainingKm)}</strong>
            </div>
            {!session.pureMode && (
              <div className="hud-card phase">
                <strong>
                  {phase} · {Math.round(session.progress * 100)}% · {booking.seat} ·{' '}
                  {booking.seatIntent}
                </strong>
                {session.ambienceOn && (
                  <label className="vol-row">
                    <span>Cabin volume</span>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      onClick={(e) => e.stopPropagation()}
                      onDoubleClick={(e) => e.stopPropagation()}
                    />
                  </label>
                )}
              </div>
            )}
          </div>

          {!session.pureMode && (
            <div className="flight-actions">
              <button type="button" className="btn ghost" onClick={togglePause}>
                {session.paused ? 'Resume' : 'Pause'}
              </button>
              <button type="button" className="btn ghost" onClick={togglePureMode}>
                Pure
              </button>
              <button type="button" className="btn primary" onClick={completeLanding}>
                Land
              </button>
            </div>
          )}
        </div>

        {session.pureMode && (
          <button type="button" className="pure-exit" onClick={togglePureMode}>
            Exit · {formatDuration(remainingMs)}
          </button>
        )}

        {session.paused && !session.pureMode && <div className="paused-badge">Paused</div>}
      </div>
    </motion.section>
  )
}
