import { useEffect, useRef } from 'react'
import { speakCabin, stopCabinSpeech } from '../utils/cabinAudio'

export interface AnnouncementBeat {
  at: number
  text: string
}

export const DEFAULT_BEATS: AnnouncementBeat[] = [
  {
    at: 0.02,
    text: 'Cabina a pasajeros: hemos despegado. Tren de aterrizaje retraído. Buen vuelo y buen foco.',
  },
  {
    at: 0.28,
    text: 'Ahora en crucero. Luces atenuadas. Mantengan cinturones abrochados mientras trabajamos.',
  },
  {
    at: 0.72,
    text: 'Iniciamos descenso. Preparen la llegada: faltan pocos minutos de sesión.',
  },
  {
    at: 0.92,
    text: 'Aproximación final. Gracias por volar con SkyVoyage. Preparando aterrizaje.',
  },
]

/** Milestone cabin announcements (chime + speech on all devices after unlock). */
export function useCabinAnnouncements(
  flightKey: number | null,
  progress: number,
  enabled: boolean,
  paused: boolean,
  onAnnounce: (text: string | null) => void,
) {
  const fired = useRef<Set<number>>(new Set())
  const onAnnounceRef = useRef(onAnnounce)
  onAnnounceRef.current = onAnnounce

  useEffect(() => {
    fired.current = new Set()
    onAnnounceRef.current(null)
    return () => {
      stopCabinSpeech()
      onAnnounceRef.current(null)
    }
  }, [flightKey])

  useEffect(() => {
    if (!enabled || paused || flightKey == null) return

    for (const beat of DEFAULT_BEATS) {
      if (progress >= beat.at && !fired.current.has(beat.at)) {
        fired.current.add(beat.at)
        onAnnounceRef.current(beat.text)
        speakCabin(beat.text)
        const clearId = window.setTimeout(() => onAnnounceRef.current(null), 8000)
        return () => window.clearTimeout(clearId)
      }
    }
  }, [progress, enabled, paused, flightKey])
}
