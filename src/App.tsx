import { AnimatePresence } from 'framer-motion'
import { FlightProvider, useFlight } from './context/FlightContext'
import { Welcome } from './components/Welcome'
import { RouteSelect } from './components/RouteSelect'
import { DocumentsCheck } from './components/DocumentsCheck'
import { SeatSelection } from './components/SeatSelection'
import { BoardingPass } from './components/BoardingPass'
import { BoardingGate } from './components/BoardingGate'
import { FlightView } from './components/FlightView'
import { GlobeScene } from './components/GlobeScene'
import './App.css'

const STEPS = [
  { id: 'route', label: 'Ruta' },
  { id: 'documents', label: 'Docs' },
  { id: 'seat', label: 'Asiento' },
  { id: 'ticket', label: 'Boleto' },
  { id: 'gate', label: 'Puerta' },
  { id: 'flight', label: 'Vuelo' },
] as const

function Shell() {
  const { step, booking } = useFlight()
  const showSideGlobe = step !== 'flight' && step !== 'welcome'
  const activeIdx = STEPS.findIndex((s) => s.id === step)

  return (
    <div className={`app-shell step-${step}`}>
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden />
          <span>Simulador de Vuelo</span>
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

      <main className="layout">
        <div className="stage">
          <AnimatePresence mode="wait">
            {step === 'welcome' && <Welcome key="welcome" />}
            {step === 'route' && <RouteSelect key="route" />}
            {step === 'documents' && <DocumentsCheck key="documents" />}
            {step === 'seat' && <SeatSelection key="seat" />}
            {step === 'ticket' && <BoardingPass key="ticket" />}
            {step === 'gate' && <BoardingGate key="gate" />}
            {step === 'flight' && <FlightView key="flight" />}
          </AnimatePresence>
        </div>

        {showSideGlobe && (
          <aside className="globe-aside">
            <GlobeScene
              origin={booking.origin}
              destination={booking.destination}
              mode={booking.origin && booking.destination ? 'preview' : 'idle'}
            />
            <p className="globe-hint">
              {booking.origin && booking.destination
                ? `${booking.origin.city} → ${booking.destination.city}`
                : 'El mundo en tiempo real · gira para explorar'}
            </p>
          </aside>
        )}

        {step === 'welcome' && (
          <aside className="globe-aside welcome-globe">
            <GlobeScene mode="idle" />
          </aside>
        )}
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
