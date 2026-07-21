import { useEffect } from 'react'
import { playCabinHum } from '../utils/cabinAudio'

export function useCabinAmbience(active: boolean) {
  useEffect(() => {
    playCabinHum(active)
    return () => playCabinHum(false)
  }, [active])
}
