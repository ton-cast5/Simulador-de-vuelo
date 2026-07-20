import { useEffect, useRef } from 'react'

/** Layered cabin ambience: engine + air hiss (Web Audio only). */
export function useCabinAmbience(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null)
  const nodesRef = useRef<{
    stop: () => void
  } | null>(null)

  useEffect(() => {
    if (!enabled) {
      nodesRef.current?.stop()
      nodesRef.current = null
      return
    }

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = ctxRef.current ?? new AudioCtx()
    ctxRef.current = ctx

    const resume = () => {
      if (ctx.state === 'suspended') void ctx.resume()
    }
    resume()
    window.addEventListener('pointerdown', resume, { once: true })

    const master = ctx.createGain()
    master.gain.value = 0
    master.gain.linearRampToValueAtTime(0.034, ctx.currentTime + 1.4)
    master.connect(ctx.destination)

    // Engine rumble
    const eng = ctx.createOscillator()
    eng.type = 'sawtooth'
    eng.frequency.value = 62
    const engFilter = ctx.createBiquadFilter()
    engFilter.type = 'lowpass'
    engFilter.frequency.value = 200
    const engGain = ctx.createGain()
    engGain.gain.value = 0.55
    eng.connect(engFilter)
    engFilter.connect(engGain)
    engGain.connect(master)

    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.07
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 14
    lfo.connect(lfoGain)
    lfoGain.connect(engFilter.frequency)

    // Air hiss (filtered noise)
    const noiseLen = ctx.sampleRate * 2
    const noiseBuf = ctx.createBuffer(1, noiseLen, ctx.sampleRate)
    const data = noiseBuf.getChannelData(0)
    for (let i = 0; i < noiseLen; i++) data[i] = Math.random() * 2 - 1
    const noise = ctx.createBufferSource()
    noise.buffer = noiseBuf
    noise.loop = true
    const noiseFilter = ctx.createBiquadFilter()
    noiseFilter.type = 'bandpass'
    noiseFilter.frequency.value = 900
    noiseFilter.Q.value = 0.5
    const noiseGain = ctx.createGain()
    noiseGain.gain.value = 0.22
    noise.connect(noiseFilter)
    noiseFilter.connect(noiseGain)
    noiseGain.connect(master)

    eng.start()
    lfo.start()
    noise.start()

    nodesRef.current = {
      stop: () => {
        master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.45)
        window.setTimeout(() => {
          try {
            eng.stop()
            lfo.stop()
            noise.stop()
          } catch {
            /* noop */
          }
        }, 500)
      },
    }

    return () => {
      window.removeEventListener('pointerdown', resume)
      nodesRef.current?.stop()
      nodesRef.current = null
    }
  }, [enabled])
}
