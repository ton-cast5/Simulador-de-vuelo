import type { Airport } from '../types'

export const airports: Airport[] = [
  {
    code: 'MEX',
    name: 'Aeropuerto Internacional Benito Juárez',
    city: 'Ciudad de México',
    country: 'México',
    lat: 19.4363,
    lon: -99.0721,
    timezone: 'America/Mexico_City',
  },
  {
    code: 'CUN',
    name: 'Aeropuerto Internacional de Cancún',
    city: 'Cancún',
    country: 'México',
    lat: 21.0365,
    lon: -86.8771,
    timezone: 'America/Cancun',
  },
  {
    code: 'GDL',
    name: 'Aeropuerto Internacional Miguel Hidalgo',
    city: 'Guadalajara',
    country: 'México',
    lat: 20.5218,
    lon: -103.3112,
    timezone: 'America/Mexico_City',
  },
  {
    code: 'MTY',
    name: 'Aeropuerto Internacional Mariano Escobedo',
    city: 'Monterrey',
    country: 'México',
    lat: 25.7785,
    lon: -100.107,
    timezone: 'America/Monterrey',
  },
  {
    code: 'JFK',
    name: 'John F. Kennedy International Airport',
    city: 'Nueva York',
    country: 'Estados Unidos',
    lat: 40.6413,
    lon: -73.7781,
    timezone: 'America/New_York',
  },
  {
    code: 'LAX',
    name: 'Los Angeles International Airport',
    city: 'Los Ángeles',
    country: 'Estados Unidos',
    lat: 33.9416,
    lon: -118.4085,
    timezone: 'America/Los_Angeles',
  },
  {
    code: 'MIA',
    name: 'Miami International Airport',
    city: 'Miami',
    country: 'Estados Unidos',
    lat: 25.7959,
    lon: -80.287,
    timezone: 'America/New_York',
  },
  {
    code: 'MAD',
    name: 'Aeropuerto Adolfo Suárez Madrid-Barajas',
    city: 'Madrid',
    country: 'España',
    lat: 40.4983,
    lon: -3.5676,
    timezone: 'Europe/Madrid',
  },
  {
    code: 'BCN',
    name: 'Aeropuerto de Barcelona-El Prat',
    city: 'Barcelona',
    country: 'España',
    lat: 41.2971,
    lon: 2.0785,
    timezone: 'Europe/Madrid',
  },
  {
    code: 'CDG',
    name: 'Aéroport de Paris-Charles de Gaulle',
    city: 'París',
    country: 'Francia',
    lat: 49.0097,
    lon: 2.5479,
    timezone: 'Europe/Paris',
  },
  {
    code: 'LHR',
    name: 'London Heathrow Airport',
    city: 'Londres',
    country: 'Reino Unido',
    lat: 51.47,
    lon: -0.4543,
    timezone: 'Europe/London',
  },
  {
    code: 'FCO',
    name: 'Aeroporto Leonardo da Vinci',
    city: 'Roma',
    country: 'Italia',
    lat: 41.8003,
    lon: 12.2389,
    timezone: 'Europe/Rome',
  },
  {
    code: 'GRU',
    name: 'Aeroporto Internacional de São Paulo',
    city: 'São Paulo',
    country: 'Brasil',
    lat: -23.4356,
    lon: -46.4731,
    timezone: 'America/Sao_Paulo',
  },
  {
    code: 'EZE',
    name: 'Aeropuerto Internacional Ministro Pistarini',
    city: 'Buenos Aires',
    country: 'Argentina',
    lat: -34.8222,
    lon: -58.5358,
    timezone: 'America/Argentina/Buenos_Aires',
  },
  {
    code: 'BOG',
    name: 'Aeropuerto Internacional El Dorado',
    city: 'Bogotá',
    country: 'Colombia',
    lat: 4.7016,
    lon: -74.1469,
    timezone: 'America/Bogota',
  },
  {
    code: 'LIM',
    name: 'Aeropuerto Internacional Jorge Chávez',
    city: 'Lima',
    country: 'Perú',
    lat: -12.0219,
    lon: -77.1143,
    timezone: 'America/Lima',
  },
  {
    code: 'SCL',
    name: 'Aeropuerto Internacional Arturo Merino Benítez',
    city: 'Santiago',
    country: 'Chile',
    lat: -33.393,
    lon: -70.7858,
    timezone: 'America/Santiago',
  },
  {
    code: 'NRT',
    name: 'Narita International Airport',
    city: 'Tokio',
    country: 'Japón',
    lat: 35.772,
    lon: 140.3929,
    timezone: 'Asia/Tokyo',
  },
  {
    code: 'DXB',
    name: 'Dubai International Airport',
    city: 'Dubái',
    country: 'Emiratos Árabes',
    lat: 25.2532,
    lon: 55.3657,
    timezone: 'Asia/Dubai',
  },
  {
    code: 'SYD',
    name: 'Sydney Kingsford Smith Airport',
    city: 'Sídney',
    country: 'Australia',
    lat: -33.9399,
    lon: 151.1753,
    timezone: 'Australia/Sydney',
  },
]

export function needsVisa(origin: Airport, destination: Airport): boolean {
  return origin.country !== destination.country
}

export function estimateFlightHours(origin: Airport, destination: Airport): number {
  const R = 6371
  const dLat = ((destination.lat - origin.lat) * Math.PI) / 180
  const dLon = ((destination.lon - origin.lon) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((origin.lat * Math.PI) / 180) *
      Math.cos((destination.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  const km = 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.max(1.2, km / 820)
}

export function generateFlightMeta(origin: Airport, destination: Airport) {
  const hours = estimateFlightHours(origin, destination)
  const now = new Date()
  const depart = new Date(now.getTime() + 90 * 60 * 1000)
  const arrive = new Date(depart.getTime() + hours * 60 * 60 * 1000)
  const board = new Date(depart.getTime() - 35 * 60 * 1000)
  const fmt = (d: Date) =>
    d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })

  return {
    flightNumber: `SV${100 + Math.floor(Math.random() * 800)}`,
    gate: `${String.fromCharCode(65 + Math.floor(Math.random() * 8))}${1 + Math.floor(Math.random() * 28)}`,
    boardingTime: fmt(board),
    departureTime: fmt(depart),
    arrivalTime: fmt(arrive),
    durationLabel: `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m`,
  }
}
