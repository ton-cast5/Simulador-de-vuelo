import { AnimatePresence } from 'framer-motion'
import { FlightProvider, useFlight } from './context/FlightContext'
import { Welcome } from './components/Welcome'
import { RouteSelect } from './components/RouteSelect'
import { DocumentsCheck } from './components/DocumentsCheck'
import { SeatSelection } from './components/SeatSelection'
import { BoardingPass } from './components/BoardingPass'
import { BoardingGate } from './components/BoardingGate'
import { FlightView } from './components/FlightView'
import { Landing } from './components/Landing'
import { GlobeScene } from './components/GlobeScene'
import './App.css'

const STEPS = [
  { id: 'route', label: 'Ruta' },
  { id: 'documents', label: 'Docs' },
  { id: 'seat', label: 'Asiento' },
  { id: 'ticket', label: 'Boleto' },
  { id: 'gate', label: 'Puerta' },
  { id: 'flight', label: 'Vuelo' },
  { id: 'landed', label: 'Llegada' },
] as const

function Shell() {
  const { step, booking, session } = useFlight()
  const immersive = step === 'flight'
  const activeIdx = STEPS.findIndex((s) => s.id === step)
  const showBgGlobe = !immersive

  return (
    <div className={`app-shell step-${step} ${immersive ? 'immersive' : ''}`}>
      {showBgGlobe && (
        <div className="world-bg" aria-hidden>
          <GlobeScene
            origin={booking.origin}
            destination={booking.destination}
            mode={booking.origin && booking.destination ? 'preview' : 'idle'}
            mapStyle={session.mapStyle}
            className="globe-canvas world-globe"
          />
          <div className="world-veil" />
        </div>
      )}

      {!immersive && (
        <header className="topbar">
          <div className="brand">
            <span className="brand-mark" aria-hidden />
            <span>SkyVoyage</span>
          </div>
          {step !== 'welcome' && (
            <nav className="stepper" aria-label="Progreso del viaje">
              {STEPS.map((s, i) => (
                <span
                  key={s.id}
                  className={`step-pill ${i <= activeIdx ? 'on' : ''} ${s.id === step ? 'current' : ''}`}
                >
                  {s.label}
                </span>
              ))}
            </nav>
          )}
        </header>
      )}

      <main className={`layout ${immersive ? 'layout-flight' : ''}`}>
        <div className="stage">
          <AnimatePresence mode="wait">
            {step === 'welcome' && <Welcome key="welcome" />}
            {step === 'route' && <RouteSelect key="route" />}
            {step === 'documents' && <DocumentsCheck key="documents" />}
            {step === 'seat' && <SeatSelection key="seat" />}
            {step === 'ticket' && <BoardingPass key="ticket" />}
            {step === 'gate' && <BoardingGate key="gate" />}
            {step === 'flight' && <FlightView key="flight" />}
            {step === 'landed' && <Landing key="landed" />}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <FlightProvider>
      <Shell />
    </FlightProvider>
  )
}
