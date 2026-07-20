import { useEffect, useRef } from 'react'

/** Soft cabin engine hum via Web Audio (no external assets). */
export function useCabinAmbience(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null)
  const nodesRef = useRef<{
    osc: OscillatorNode
    gain: GainNode
    filter: BiquadFilterNode
    lfo: OscillatorNode
    lfoGain: GainNode
  } | null>(null)

  useEffect(() => {
    if (!enabled) {
      const nodes = nodesRef.current
      if (nodes) {
        nodes.gain.gain.linearRampToValueAtTime(0, nodes.gain.context.currentTime + 0.4)
        window.setTimeout(() => {
          try {
            nodes.osc.stop()
            nodes.lfo.stop()
          } catch {
            /* already stopped */
          }
          nodesRef.current = null
        }, 450)
      }
      return
    }

    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = ctxRef.current ?? new AudioCtx()
    ctxRef.current = ctx

    const resume = () => {
      if (ctx.state === 'suspended') void ctx.resume()
    }
    resume()
    window.addEventListener('pointerdown', resume, { once: true })

    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.value = 68

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 220
    filter.Q.value = 0.7

    const gain = ctx.createGain()
    gain.gain.value = 0
    gain.gain.linearRampToValueAtTime(0.028, ctx.currentTime + 1.2)

    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.08
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 18
    lfo.connect(lfoGain)
    lfoGain.connect(filter.frequency)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    lfo.start()
    nodesRef.current = { osc, gain, filter, lfo, lfoGain }

    return () => {
      window.removeEventListener('pointerdown', resume)
      try {
        osc.stop()
        lfo.stop()
      } catch {
        /* noop */
      }
      nodesRef.current = null
    }
  }, [enabled])
}
