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
  return 'Aproximación final'
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
  const flownKm = booking.distanceKm * session.progress
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
        <WindowSeat progress={session.progress} />
      )}

      <div className="flight-overlay">
        {!session.pureMode && (
          <header className="flight-top">
            <div>
              <p className="eyebrow">
                {phase} · {booking.flightNumber}
              </p>
              <h2>
                {booking.origin?.code} → {booking.destination?.code}
              </h2>
              <p className="lede tight">
                {booking.origin?.city} · Asiento {booking.seat} ·{' '}
                {booking.documents.fullName}
              </p>
            </div>
            <div className="flight-tools">
              <button
                type="button"
                className={`chip ${session.cabinView === 'globe' ? 'on' : ''}`}
                onClick={() => setCabinView('globe')}
              >
                Globo 3D
              </button>
              <button
                type="button"
                className={`chip ${session.cabinView === 'window' ? 'on' : ''}`}
                onClick={() => setCabinView('window')}
              >
                Ventanilla
              </button>
              <button type="button" className="chip" onClick={toggleMapStyle}>
                {session.mapStyle === 'day' ? 'Día' : 'Noche'}
              </button>
              <button type="button" className="chip" onClick={toggleAmbience}>
                {session.ambienceOn ? 'Cabina ON' : 'Cabina OFF'}
              </button>
              <button type="button" className="chip" onClick={togglePureMode}>
                Pure
              </button>
            </div>
          </header>
        )}

        <AnimatePresence>
          {session.announcement && !session.pureMode && (
            <motion.div
              className="cabin-announce"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              key={session.announcement}
            >
              <span className="cabin-announce-tag">Anuncio de cabina</span>
              <p>{session.announcement}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="progress-rail">
          <div className="progress-fill" style={{ width: `${session.progress * 100}%` }} />
          <div className="phase-marks" aria-hidden>
            <i style={{ left: '12%' }} />
            <i style={{ left: '70%' }} />
            <i style={{ left: '92%' }} />
          </div>
        </div>

        <footer className="flight-hud">
          <div className="hud-card">
            <span>Tiempo restante</span>
            <strong>{formatDuration(remainingMs)}</strong>
          </div>
          <div className="hud-card center">
            <span>
              {booking.origin?.code} · {phase} · {Math.round(session.progress * 100)}% ·{' '}
              {booking.destination?.code}
            </span>
            <strong>
              {formatDistance(flownKm)} · queda {formatDistance(remainingKm)}
            </strong>
          </div>
          <div className="hud-card">
            <span>Distancia total</span>
            <strong>{formatDistance(booking.distanceKm)}</strong>
          </div>
        </footer>

        {!session.pureMode && (
          <div className="flight-actions">
            <button type="button" className="btn ghost" onClick={togglePause}>
              {session.paused ? 'Reanudar' : 'Pausar'}
            </button>
            <button type="button" className="btn ghost" onClick={togglePureMode}>
              Modo puro
            </button>
            <button type="button" className="btn primary" onClick={completeLanding}>
              Aterrizar ahora
            </button>
          </div>
        )}

        {session.pureMode && (
          <button type="button" className="pure-exit" onClick={togglePureMode}>
            Salir de Pure · {formatDuration(remainingMs)}
          </button>
        )}

        {session.paused && !session.pureMode && (
          <div className="paused-badge">En espera · turbulencia de foco</div>
        )}
      </div>
    </motion.section>
  )
}
