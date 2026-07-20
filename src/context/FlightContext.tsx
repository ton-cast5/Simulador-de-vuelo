import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { airports, generateFlightMeta } from '../data/airports'
import {
  emptyDocuments,
  type CabinView,
  type FlightBooking,
  type FlightLogEntry,
  type FlightSession,
  type MapStyle,
  type PassengerDocs,
  type SessionMinutes,
  type Step,
} from '../types'

const LOG_KEY = 'skyvoyage-flight-log'

interface FlightContextValue {
  step: Step
  setStep: (s: Step) => void
  booking: FlightBooking
  session: FlightSession
  log: FlightLogEntry[]
  setOriginCode: (code: string) => void
  setDestinationCode: (code: string) => void
  setSessionMinutes: (m: SessionMinutes) => void
  pickRandomRoute: () => void
  setSeat: (seat: string) => void
  updateDocuments: (docs: Partial<PassengerDocs>) => void
  verifyDocuments: () => void
  tearTicket: () => void
  confirmRoute: () => void
  startFlight: () => void
  beginCruise: () => void
  togglePause: () => void
  setCabinView: (v: CabinView) => void
  togglePureMode: () => void
  toggleAmbience: () => void
  toggleMapStyle: () => void
  setAnnouncement: (text: string | null) => void
  completeLanding: () => void
  finishLanding: () => void
  reset: () => void
  softResetToRoute: () => void
}

const FlightContext = createContext<FlightContextValue | null>(null)

const initialBooking = (): FlightBooking => ({
  origin: null,
  destination: null,
  seat: null,
  documents: emptyDocuments(),
  flightNumber: '',
  gate: '',
  boardingTime: '',
  departureTime: '',
  arrivalTime: '',
  durationLabel: '',
  distanceKm: 0,
  sessionMinutes: 25,
  documentsVerified: false,
  ticketTorn: false,
})

const initialSession = (): FlightSession => ({
  startedAt: null,
  progress: 0,
  paused: false,
  pureMode: false,
  cabinView: 'globe',
  ambienceOn: true,
  mapStyle: 'day',
  announcement: null,
})

function loadLog(): FlightLogEntry[] {
  try {
    const raw = localStorage.getItem(LOG_KEY)
    if (!raw) return []
    return JSON.parse(raw) as FlightLogEntry[]
  } catch {
    return []
  }
}

function saveLog(entries: FlightLogEntry[]) {
  localStorage.setItem(LOG_KEY, JSON.stringify(entries.slice(0, 40)))
}

export function FlightProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<Step>('welcome')
  const [booking, setBooking] = useState<FlightBooking>(initialBooking)
  const [session, setSession] = useState<FlightSession>(initialSession)
  const [log, setLog] = useState<FlightLogEntry[]>(() => loadLog())
  const pausedAccum = useRef(0)
  const pauseStarted = useRef<number | null>(null)

  const setOriginCode = useCallback((code: string) => {
    const origin = airports.find((a) => a.code === code) ?? null
    setBooking((b) => ({ ...b, origin }))
  }, [])

  const setDestinationCode = useCallback((code: string) => {
    const destination = airports.find((a) => a.code === code) ?? null
    setBooking((b) => ({ ...b, destination }))
  }, [])

  const setSessionMinutes = useCallback((m: SessionMinutes) => {
    setBooking((b) => ({ ...b, sessionMinutes: m }))
  }, [])

  const pickRandomRoute = useCallback(() => {
    const a = airports[Math.floor(Math.random() * airports.length)]
    let b = airports[Math.floor(Math.random() * airports.length)]
    while (b.code === a.code) {
      b = airports[Math.floor(Math.random() * airports.length)]
    }
    setBooking((prev) => ({ ...prev, origin: a, destination: b }))
  }, [])

  const confirmRoute = useCallback(() => {
    setBooking((b) => {
      if (!b.origin || !b.destination) return b
      const meta = generateFlightMeta(b.origin, b.destination)
      return { ...b, ...meta }
    })
    setStep('documents')
  }, [])

  const setSeat = useCallback((seat: string) => {
    setBooking((b) => ({ ...b, seat }))
  }, [])

  const updateDocuments = useCallback((docs: Partial<PassengerDocs>) => {
    setBooking((b) => ({
      ...b,
      documents: { ...b.documents, ...docs },
    }))
  }, [])

  const verifyDocuments = useCallback(() => {
    setBooking((b) => ({ ...b, documentsVerified: true }))
    setStep('seat')
  }, [])

  const tearTicket = useCallback(() => {
    setBooking((b) => ({ ...b, ticketTorn: true }))
  }, [])

  const startFlight = useCallback(() => {
    pausedAccum.current = 0
    pauseStarted.current = null
    landedLock.current = false
    setSession((s) => ({
      ...s,
      startedAt: null,
      progress: 0,
      paused: false,
      cabinView: 'globe',
      announcement: null,
    }))
    setStep('takeoff')
  }, [])

  const beginCruise = useCallback(() => {
    pausedAccum.current = 0
    pauseStarted.current = null
    setSession((s) => ({
      ...s,
      startedAt: Date.now(),
      progress: 0,
      paused: false,
    }))
    setStep('flight')
  }, [])

  const togglePause = useCallback(() => {
    setSession((s) => {
      if (!s.startedAt) return s
      if (!s.paused) {
        pauseStarted.current = Date.now()
        return { ...s, paused: true }
      }
      if (pauseStarted.current) {
        pausedAccum.current += Date.now() - pauseStarted.current
        pauseStarted.current = null
      }
      return { ...s, paused: false }
    })
  }, [])

  const setCabinView = useCallback((v: CabinView) => {
    setSession((s) => ({ ...s, cabinView: v }))
  }, [])

  const togglePureMode = useCallback(() => {
    setSession((s) => ({ ...s, pureMode: !s.pureMode }))
  }, [])

  const toggleAmbience = useCallback(() => {
    setSession((s) => ({ ...s, ambienceOn: !s.ambienceOn }))
  }, [])

  const toggleMapStyle = useCallback(() => {
    setSession((s) => ({
      ...s,
      mapStyle: (s.mapStyle === 'day' ? 'night' : 'day') as MapStyle,
    }))
  }, [])

  const setAnnouncement = useCallback((text: string | null) => {
    setSession((s) => ({ ...s, announcement: text }))
  }, [])

  const landedLock = useRef(false)

  const completeLanding = useCallback(() => {
    if (landedLock.current) return
    landedLock.current = true
    setBooking((b) => {
      if (!b.origin || !b.destination) return b
      const entry: FlightLogEntry = {
        id: `${Date.now()}`,
        flightNumber: b.flightNumber,
        origin: b.origin.code,
        destination: b.destination.code,
        originCity: b.origin.city,
        destinationCity: b.destination.city,
        seat: b.seat ?? '—',
        passenger: b.documents.fullName,
        distanceKm: b.distanceKm,
        sessionMinutes: b.sessionMinutes,
        completedAt: new Date().toISOString(),
      }
      setLog((prev) => {
        const next = [entry, ...prev]
        saveLog(next)
        return next
      })
      return b
    })
    setSession((s) => ({ ...s, progress: 1, paused: true }))
    setStep('touchdown')
  }, [])

  const finishLanding = useCallback(() => {
    setStep('landed')
  }, [])

  const reset = useCallback(() => {
    pausedAccum.current = 0
    pauseStarted.current = null
    landedLock.current = false
    window.speechSynthesis?.cancel()
    setBooking(initialBooking())
    setSession(initialSession())
    setStep('welcome')
  }, [])

  const softResetToRoute = useCallback(() => {
    pausedAccum.current = 0
    pauseStarted.current = null
    landedLock.current = false
    window.speechSynthesis?.cancel()
    setBooking((b) => ({
      ...initialBooking(),
      documents: b.documents,
      sessionMinutes: b.sessionMinutes,
    }))
    setSession(initialSession())
    setStep('route')
  }, [])

  useEffect(() => {
    if (step !== 'flight' || !session.startedAt) return

    const tick = () => {
      if (session.paused) return
      const total = booking.sessionMinutes * 60 * 1000
      const elapsed = Date.now() - session.startedAt! - pausedAccum.current
      const progress = Math.min(1, elapsed / total)
      setSession((s) => (s.progress === progress ? s : { ...s, progress }))
      if (progress >= 1) completeLanding()
    }

    tick()
    const id = window.setInterval(tick, 200)
    return () => window.clearInterval(id)
  }, [
    step,
    session.startedAt,
    session.paused,
    booking.sessionMinutes,
    completeLanding,
  ])

  const value = useMemo(
    () => ({
      step,
      setStep,
      booking,
      session,
      log,
      setOriginCode,
      setDestinationCode,
      setSessionMinutes,
      pickRandomRoute,
      setSeat,
      updateDocuments,
      verifyDocuments,
      tearTicket,
      confirmRoute,
      startFlight,
      beginCruise,
      togglePause,
      setCabinView,
      togglePureMode,
      toggleAmbience,
      toggleMapStyle,
      setAnnouncement,
      completeLanding,
      finishLanding,
      reset,
      softResetToRoute,
    }),
    [
      step,
      booking,
      session,
      log,
      setOriginCode,
      setDestinationCode,
      setSessionMinutes,
      pickRandomRoute,
      setSeat,
      updateDocuments,
      verifyDocuments,
      tearTicket,
      confirmRoute,
      startFlight,
      beginCruise,
      togglePause,
      setCabinView,
      togglePureMode,
      toggleAmbience,
      toggleMapStyle,
      setAnnouncement,
      completeLanding,
      finishLanding,
      reset,
      softResetToRoute,
    ],
  )

  return <FlightContext.Provider value={value}>{children}</FlightContext.Provider>
}

export function useFlight() {
  const ctx = useContext(FlightContext)
  if (!ctx) throw new Error('useFlight must be used within FlightProvider')
  return ctx
}
