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
      setError('Completa todos los campos del pasaporte.')
      return
    }
    if (visaRequired && !d.visaNumber.trim()) {
      setError(`Visa requerida: ${booking.origin!.country} → ${booking.destination!.country}.`)
      return
    }
    setError('')
    verifyDocuments()
  }

  return (
    <motion.section
      className="panel glass"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className="eyebrow">02 · Documentos</p>
      <h2>Control de pasajeros</h2>
      <p className="lede">
        Vuelo <strong>{booking.flightNumber}</strong>
        {visaRequired ? ' · se solicita visa' : ' · solo pasaporte'}.
      </p>

      <div className="passport">
        <div className="passport-head">
          <div>
            <div className="passport-title">Pasaporte</div>
            <div style={{ color: 'rgba(230,195,106,0.65)', fontSize: '0.75rem', marginTop: 4 }}>
              SkyVoyage Immigration
            </div>
          </div>
          <div className="passport-crest">SV</div>
        </div>

        <form className="docs-form" onSubmit={onSubmit}>
          <label>
            Nombre completo
            <input
              value={booking.documents.fullName}
              onChange={(e) => updateDocuments({ fullName: e.target.value })}
              placeholder="Como en el pasaporte"
              autoComplete="name"
            />
          </label>

          <div className="field-grid">
            <label>
              Nº pasaporte
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
              Nacimiento
              <input
                type="date"
                value={booking.documents.birthDate}
                onChange={(e) => updateDocuments({ birthDate: e.target.value })}
              />
            </label>
            {visaRequired && (
              <label>
                Nº visa
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

          {error && <p className="form-error">{error}</p>}

          <div className="actions">
            <button type="button" className="btn ghost" onClick={() => setStep('route')}>
              Atrás
            </button>
            <button type="submit" className="btn primary">
              Verificar
            </button>
          </div>
        </form>
      </div>
    </motion.section>
  )
}
