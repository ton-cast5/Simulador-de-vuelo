import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { needsVisa } from '../data/airports'
import { useFlight } from '../context/FlightContext'

export function DocumentsCheck() {
  const { booking, updateDocuments, verifyDocuments, setStep } = useFlight()
  const [error, setError] = useState('')

  const visaRequired =
    booking.origin && booking.destination
      ? needsVisa(booking.origin, booking.destination)
      : false

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const d = booking.documents
    if (!d.fullName.trim() || !d.passportNumber.trim() || !d.nationality.trim() || !d.birthDate) {
      setError('Completa todos los campos obligatorios del pasaporte.')
      return
    }
    if (visaRequired && !d.visaNumber.trim()) {
      setError(`Se requiere visa para viajar de ${booking.origin!.country} a ${booking.destination!.country}.`)
      return
    }
    setError('')
    verifyDocuments()
  }

  return (
    <motion.section
      className="panel docs glass"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <p className="eyebrow">Paso 2 · Control documental</p>
      <h2>Entrega tus papeles</h2>
      <p className="lede">
        Presenta pasaporte
        {visaRequired ? ' y visa' : ''} para el vuelo{' '}
        <strong>{booking.flightNumber}</strong>.
      </p>

      <form className="docs-form" onSubmit={onSubmit}>
        <label>
          Nombre completo
          <input
            value={booking.documents.fullName}
            onChange={(e) => updateDocuments({ fullName: e.target.value })}
            placeholder="Como aparece en el pasaporte"
            autoComplete="name"
          />
        </label>

        <div className="field-grid">
          <label>
            Nº de pasaporte
            <input
              value={booking.documents.passportNumber}
              onChange={(e) =>
                updateDocuments({ passportNumber: e.target.value.toUpperCase() })
              }
              placeholder="G12345678"
            />
          </label>
          <label>
            Nacionalidad
            <input
              value={booking.documents.nationality}
              onChange={(e) => updateDocuments({ nationality: e.target.value })}
              placeholder="México"
            />
          </label>
        </div>

        <div className="field-grid">
          <label>
            Fecha de nacimiento
            <input
              type="date"
              value={booking.documents.birthDate}
              onChange={(e) => updateDocuments({ birthDate: e.target.value })}
            />
          </label>
          {visaRequired && (
            <label>
              Nº de visa
              <input
                value={booking.documents.visaNumber}
                onChange={(e) =>
                  updateDocuments({ visaNumber: e.target.value.toUpperCase() })
                }
                placeholder="VISA-000000"
              />
            </label>
          )}
        </div>

        {visaRequired && (
          <div className="notice">
            Viaje internacional detectado: se solicita visa además del pasaporte.
          </div>
        )}

        {error && <p className="form-error">{error}</p>}

        <div className="actions">
          <button type="button" className="btn ghost" onClick={() => setStep('route')}>
            Atrás
          </button>
          <button type="submit" className="btn primary">
            Verificar documentos
          </button>
        </div>
      </form>
    </motion.section>
  )
}
