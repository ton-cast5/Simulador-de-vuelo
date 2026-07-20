import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { airports, generateFlightMeta } from '../data/airports'
import {
  emptyDocuments,
  type FlightBooking,
  type PassengerDocs,
  type Step,
} from '../types'

interface FlightContextValue {
  step: Step
  setStep: (s: Step) => void
  booking: FlightBooking
  setOriginCode: (code: string) => void
  setDestinationCode: (code: string) => void
  setSeat: (seat: string) => void
  updateDocuments: (docs: Partial<PassengerDocs>) => void
  verifyDocuments: () => void
  tearTicket: () => void
  reset: () => void
  confirmRoute: () => void
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
  documentsVerified: false,
  ticketTorn: false,
})

export function FlightProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<Step>('welcome')
  const [booking, setBooking] = useState<FlightBooking>(initialBooking)

  const setOriginCode = useCallback((code: string) => {
    const origin = airports.find((a) => a.code === code) ?? null
    setBooking((b) => ({ ...b, origin }))
  }, [])

  const setDestinationCode = useCallback((code: string) => {
    const destination = airports.find((a) => a.code === code) ?? null
    setBooking((b) => ({ ...b, destination }))
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

  const reset = useCallback(() => {
    setBooking(initialBooking())
    setStep('welcome')
  }, [])

  const value = useMemo(
    () => ({
      step,
      setStep,
      booking,
      setOriginCode,
      setDestinationCode,
      setSeat,
      updateDocuments,
      verifyDocuments,
      tearTicket,
      reset,
      confirmRoute,
    }),
    [
      step,
      booking,
      setOriginCode,
      setDestinationCode,
      setSeat,
      updateDocuments,
      verifyDocuments,
      tearTicket,
      reset,
      confirmRoute,
    ],
  )

  return <FlightContext.Provider value={value}>{children}</FlightContext.Provider>
}

export function useFlight() {
  const ctx = useContext(FlightContext)
  if (!ctx) throw new Error('useFlight must be used within FlightProvider')
  return ctx
}
