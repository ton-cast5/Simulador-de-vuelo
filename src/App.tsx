import { AnimatePresence } from 'framer-motion'
import { FlightProvider, useFlight } from './context/FlightContext'
import { Welcome } from './components/Welcome'
import { RouteSelect } from './components/RouteSelect'
import { DocumentsCheck } from './components/DocumentsCheck'
import { SeatSelection } from './components/SeatSelection'
import { BoardingPass } from './components/BoardingPass'
import { BoardingGate } from './components/BoardingGate'
import { TakeoffSequence } from './components/TakeoffSequence'
import { FlightView } from './components/FlightView'
import { TouchdownSequence } from './components/TouchdownSequence'
import { Landing } from './components/Landing'
import { GlobeScene } from './components/GlobeScene'
import './App.css'

const STEPS = [
  { id: 'route', label: 'Ruta', short: '1' },
  { id: 'documents', label: 'Docs', short: '2' },
  { id: 'seat', label: 'Asiento', short: '3' },
  { id: 'ticket', label: 'Boleto', short: '4' },
  { id: 'gate', label: 'Puerta', short: '5' },
  { id: 'flight', label: 'Vuelo', short: '6' },
  { id: 'landed', label: 'Llegada', short: '7' },
] as const

function Shell() {
  const { step, booking, session } = useFlight()
  const cinematic = step === 'takeoff' || step === 'touchdown'
  const immersive = step === 'flight' || cinematic
  const showBgGlobe = !immersive
  const highlightId =
    step === 'takeoff' ? 'flight' : step === 'touchdown' ? 'landed' : step
  const highlightIdx = STEPS.findIndex((x) => x.id === highlightId)

  return (
    <div
      className={`app-shell step-${step} ${immersive ? 'immersive' : ''} ${cinematic ? 'cinematic' : ''}`}
    >
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
                  className={`step-pill ${i <= highlightIdx ? 'on' : ''} ${s.id === highlightId ? 'current' : ''}`}
                >
                  <span className="step-full">{s.label}</span>
                  <span className="step-short">{s.short}</span>
                </span>
              ))}
            </nav>
          )}
        </header>
      )}

      <main className={`layout ${immersive ? 'layout-flight' : ''} step-${step}`}>
        <div className={`stage ${cinematic ? 'stage-cinema' : ''}`}>
          <AnimatePresence mode="wait">
            {step === 'welcome' && <Welcome key="welcome" />}
            {step === 'route' && <RouteSelect key="route" />}
            {step === 'documents' && <DocumentsCheck key="documents" />}
            {step === 'seat' && <SeatSelection key="seat" />}
            {step === 'ticket' && <BoardingPass key="ticket" />}
            {step === 'gate' && <BoardingGate key="gate" />}
            {step === 'takeoff' && <TakeoffSequence key="takeoff" />}
            {step === 'flight' && <FlightView key="flight" />}
            {step === 'touchdown' && <TouchdownSequence key="touchdown" />}
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
