export type Step =
  | 'welcome'
  | 'route'
  | 'documents'
  | 'seat'
  | 'ticket'
  | 'gate'
  | 'takeoff'
  | 'flight'
  | 'touchdown'
  | 'landed'

export type CabinView = 'globe' | 'window'
export type MapStyle = 'day' | 'night'
export type SessionMinutes = 3 | 25 | 45 | 90

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
  passenger: string
  distanceKm: number
  sessionMinutes: number
  completedAt: string
}

export const emptyDocuments = (): PassengerDocs => ({
  fullName: '',
  passportNumber: '',
  nationality: '',
  visaNumber: '',
  birthDate: '',
})

export const SESSION_OPTIONS: { minutes: SessionMinutes; label: string; hint: string }[] = [
  { minutes: 3, label: 'Express', hint: '3 min · demo rápida' },
  { minutes: 25, label: 'Focus', hint: '25 min · pomodoro' },
  { minutes: 45, label: 'Deep', hint: '45 min · deep work' },
  { minutes: 90, label: 'Long haul', hint: '90 min · sesión larga' },
]
