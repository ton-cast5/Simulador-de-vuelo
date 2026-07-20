export type Step =
  | 'welcome'
  | 'route'
  | 'documents'
  | 'seat'
  | 'ticket'
  | 'gate'
  | 'flight'

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
  documentsVerified: boolean
  ticketTorn: boolean
}

export const emptyDocuments = (): PassengerDocs => ({
  fullName: '',
  passportNumber: '',
  nationality: '',
  visaNumber: '',
  birthDate: '',
})
