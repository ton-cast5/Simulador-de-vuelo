import { AnimatePresence, motion } from 'framer-motion'
import { useFlight } from '../context/FlightContext'
import { formatDistance, formatDuration } from '../utils/geo'
import { useCabinAmbience } from '../hooks/useCabinAmbience'
import { useCabinAnnouncements } from '../hooks/useCabinAnnouncements'
import { GlobeScene } from './GlobeScene'
import { WindowSeat } from './WindowSeat'

function phaseLabel(progress: number) {
  if (progress < 0.12) return 'Despegue'
  if (progress < 0.7) return 'Crucero'
  if (progress < 0.92) return 'Descenso'
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

  useCabinAmbience(session.ambienceOn && !session.paused)
  useCabinAnnouncements(
    session.startedAt,
    session.progress,
    session.ambienceOn,
    session.paused,
    setAnnouncement,
  )

  const remainingMs =
    booking.sessionMinutes * 60 * 1000 * (1 - session.progress)
  const remainingKm = booking.distanceKm * (1 - session.progress)
  const phase = phaseLabel(session.progress)

  return (
    <motion.section
      className={`flight-immersive ${session.pureMode ? 'pure' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {session.cabinView === 'globe' ? (
        <GlobeScene
          origin={booking.origin}
          destination={booking.destination}
          mode="flight"
          progress={session.progress}
          mapStyle={session.mapStyle}
          className="globe-canvas flight-globe"
        />
      ) : (
        <WindowSeat
          progress={session.progress}
          origin={booking.origin}
          destination={booking.destination}
        />
      )}

      <div className="flight-overlay">
        {!session.pureMode && (
          <div className="flight-chrome">
            <div className="flight-route-pill">
              {booking.origin?.code}
              <em>→</em>
              {booking.destination?.code}
              <em>· {booking.flightNumber}</em>
            </div>
            <div className="flight-tools">
              <button
                type="button"
                className={`chip ${session.cabinView === 'globe' ? 'on' : ''}`}
                onClick={() => setCabinView('globe')}
              >
                Mapa
              </button>
              <button
                type="button"
                className={`chip ${session.cabinView === 'window' ? 'on' : ''}`}
                onClick={() => setCabinView('window')}
              >
                Ventana
              </button>
              <button type="button" className="chip" onClick={toggleMapStyle}>
                {session.mapStyle === 'day' ? 'Día' : 'Noche'}
              </button>
              <button type="button" className="chip" onClick={toggleAmbience}>
                {session.ambienceOn ? 'Audio' : 'Mute'}
              </button>
              <button type="button" className="chip" onClick={togglePureMode}>
                Pure
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
              <span className="cabin-announce-tag">Cabina</span>
              <p>{session.announcement}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flight-bottom">
          <div className="progress-rail">
            <div className="progress-fill" style={{ width: `${session.progress * 100}%` }} />
            <div className="phase-marks" aria-hidden>
              <i style={{ left: '12%' }} />
              <i style={{ left: '70%' }} />
              <i style={{ left: '92%' }} />
            </div>
          </div>

          <div className="flight-hud">
            <div className="hud-card">
              <span>Tiempo restante</span>
              <strong>{formatDuration(remainingMs)}</strong>
            </div>
            <div className="hud-card">
              <span>Distancia restante</span>
              <strong>{formatDistance(remainingKm)}</strong>
            </div>
            <div className="hud-card phase">
              <strong>
                {phase} · {Math.round(session.progress * 100)}% · asiento {booking.seat}
              </strong>
            </div>
          </div>

          {!session.pureMode && (
            <div className="flight-actions">
              <button type="button" className="btn ghost" onClick={togglePause}>
                {session.paused ? 'Reanudar' : 'Pausar'}
              </button>
              <button type="button" className="btn ghost" onClick={togglePureMode}>
                Modo puro
              </button>
              <button type="button" className="btn primary" onClick={completeLanding}>
                Aterrizar
              </button>
            </div>
          )}
        </div>

        {session.pureMode && (
          <button type="button" className="pure-exit" onClick={togglePureMode}>
            Salir · {formatDuration(remainingMs)}
          </button>
        )}

        {session.paused && !session.pureMode && (
          <div className="paused-badge">En espera</div>
        )}
      </div>
    </motion.section>
  )
}
