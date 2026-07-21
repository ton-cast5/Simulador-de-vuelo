import { AnimatePresence } from 'framer-motion'
import { FlightProvider, useFlight } from './context/FlightContext'
import { Welcome } from './components/Welcome'
import { RouteSelect } from './components/RouteSelect'
import { SeatSelection } from './components/SeatSelection'
import { BoardingPass } from './components/BoardingPass'
import { BoardingGate } from './components/BoardingGate'
import { TakeoffSequence } from './components/TakeoffSequence'
import { FlightView } from './components/FlightView'
import { TouchdownSequence } from './components/TouchdownSequence'
import { Landing } from './components/Landing'
import './App.css'

const DOTS = ['welcome', 'route', 'seat', 'ticket', 'gate', 'flight', 'landed'] as const

function Shell() {
  const { step } = useFlight()
  const cinematic = step === 'takeoff' || step === 'touchdown'
  const immersive = step === 'flight' || cinematic
  const highlight =
    step === 'takeoff' || step === 'flight'
      ? 'flight'
      : step === 'touchdown'
        ? 'landed'
        : step
  const idx = DOTS.indexOf(highlight as (typeof DOTS)[number])

  return (
    <div
      className={`app-shell step-${step} ${immersive ? 'immersive' : ''} ${cinematic ? 'cinematic' : ''}`}
    >
      <div className="phone-frame">
        {!immersive && (
          <header className="topbar">
            <div className="brand">
              <span className="brand-mark" aria-hidden />
              <span>SkyVoyage</span>
            </div>
            {step !== 'welcome' && (
              <div className="step-dots" aria-hidden>
                {DOTS.slice(1).map((_, i) => (
                  <i key={DOTS[i + 1]} className={i < idx ? 'on' : ''} />
                ))}
              </div>
            )}
          </header>
        )}

        <AnimatePresence mode="wait">
          {step === 'takeoff' && <TakeoffSequence key="takeoff" />}
          {step === 'touchdown' && <TouchdownSequence key="touchdown" />}
        </AnimatePresence>

        <main className={`layout ${immersive ? 'layout-flight' : ''}`}>
          <div className="stage">
            <AnimatePresence mode="wait">
              {step === 'welcome' && <Welcome key="welcome" />}
              {step === 'route' && <RouteSelect key="route" />}
              {step === 'seat' && <SeatSelection key="seat" />}
              {step === 'ticket' && <BoardingPass key="ticket" />}
              {step === 'gate' && <BoardingGate key="gate" />}
              {step === 'flight' && <FlightView key="flight" />}
              {step === 'landed' && <Landing key="landed" />}
            </AnimatePresence>
          </div>
        </main>
      </div>
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
