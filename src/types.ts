export type Step =
  | 'welcome'
  | 'route'
  | 'seat'
  | 'ticket'
  | 'gate'
  | 'takeoff'
  | 'flight'
  | 'touchdown'
  | 'landed'

export type CabinView = 'window' | 'map'
export type MapStyle = '3d' | 'satellite' | 'classic'
export type SessionMinutes = 3 | 25 | 45 | 90
export type SeatIntent = 'study' | 'work' | 'create'

export interface Airport {
  code: string
  name: string
  city: string
  country: string
  lat: number
  lon: number
  timezone: string
}

export interface PassengerDocs {
  fullName: string
  passportNumber: string
  nationality: string
  visaNumber: string
  birthDate: string
}

export interface FlightBooking {
  origin: Airport | null
  destination: Airport | null
  seat: string | null
  seatIntent: SeatIntent
  documents: PassengerDocs
  flightNumber: string
  gate: string
  boardingTime: string
  departureTime: string
  arrivalTime: string
  durationLabel: string
  distanceKm: number
  sessionMinutes: SessionMinutes
  documentsVerified: boolean
  ticketTorn: boolean
}

export interface FlightSession {
  startedAt: number | null
  progress: number
  paused: boolean
  pureMode: boolean
  cabinView: CabinView
  ambienceOn: boolean
  mapStyle: MapStyle
  announcement: string | null
}

export interface FlightLogEntry {
  id: string
  flightNumber: string
  origin: string
  destination: string
  originCity: string
  destinationCity: string
  seat: string
  seatIntent: SeatIntent
  passenger: string
  distanceKm: number
  sessionMinutes: number
  completedAt: string
}

export const emptyDocuments = (): PassengerDocs => ({
  fullName: 'Passenger',
  passportNumber: 'SV' + Math.floor(10000000 + Math.random() * 89999999),
  nationality: 'MX',
  visaNumber: '',
  birthDate: '1998-01-01',
})

export const SESSION_OPTIONS: { minutes: SessionMinutes; label: string; hint: string }[] = [
  { minutes: 3, label: 'Express', hint: '3 min demo' },
  { minutes: 25, label: 'Short haul', hint: '25 min focus' },
  { minutes: 45, label: 'Regional', hint: '45 min deep' },
  { minutes: 90, label: 'Long haul', hint: '90 min block' },
]

export const SEAT_INTENTS: {
  id: SeatIntent
  label: string
  hint: string
}[] = [
  { id: 'study', label: 'Study', hint: 'Reading, exam prep' },
  { id: 'work', label: 'Work', hint: 'Tasks & deep work' },
  { id: 'create', label: 'Create', hint: 'Writing, drawing' },
]
