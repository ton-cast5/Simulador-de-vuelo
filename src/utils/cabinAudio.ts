/** Cross-device cabin audio: chimes, takeoff/landing FX, speech. */

let audioCtx: AudioContext | null = null
let unlocked = false
let voicesReady = false

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  if (!audioCtx) audioCtx = new AC()
  return audioCtx
}

export async function unlockCabinAudio(): Promise<void> {
  const ctx = getCtx()
  if (ctx && ctx.state === 'suspended') {
    try {
      await ctx.resume()
    } catch {
      /* ignore */
    }
  }
  unlocked = true

  if (typeof window !== 'undefined' && window.speechSynthesis) {
    const warm = new SpeechSynthesisUtterance(' ')
    warm.volume = 0
    window.speechSynthesis.speak(warm)
    window.speechSynthesis.cancel()

    const loadVoices = () => {
      voicesReady = window.speechSynthesis.getVoices().length > 0
    }
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
  }
}

function playTone(
  ctx: AudioContext,
  freq: number,
  start: number,
  dur: number,
  gainValue: number,
  type: OscillatorType = 'sine',
) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 2200
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.03)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur)
  osc.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  osc.start(start)
  osc.stop(start + dur + 0.05)
}

function playNoiseBurst(ctx: AudioContext, start: number, dur: number, gainValue: number) {
  const len = Math.floor(ctx.sampleRate * dur)
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  const src = ctx.createBufferSource()
  src.buffer = buffer
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 420
  filter.Q.value = 0.6
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.08)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur)
  src.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  src.start(start)
  src.stop(start + dur + 0.02)
}

export function playCabinChime() {
  const ctx = getCtx()
  if (!ctx) return
  void ctx.resume()
  const t = ctx.currentTime
  playTone(ctx, 880, t, 0.22, 0.09)
  playTone(ctx, 660, t + 0.28, 0.28, 0.08)
}

/** Rising engine + whoosh for takeoff cinematic. */
export function playTakeoffSound() {
  const ctx = getCtx()
  if (!ctx) return
  void ctx.resume()
  const t = ctx.currentTime

  playCabinChime()
  playNoiseBurst(ctx, t + 0.5, 2.8, 0.045)

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(180, t + 0.4)
  filter.frequency.exponentialRampToValueAtTime(900, t + 3.2)
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(55, t + 0.4)
  osc.frequency.exponentialRampToValueAtTime(110, t + 3.2)
  gain.gain.setValueAtTime(0.0001, t + 0.4)
  gain.gain.exponentialRampToValueAtTime(0.04, t + 1.2)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 3.6)
  osc.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  osc.start(t + 0.4)
  osc.stop(t + 3.7)
}

/** Soft touchdown thump + chime. */
export function playTouchdownSound() {
  const ctx = getCtx()
  if (!ctx) return
  void ctx.resume()
  const t = ctx.currentTime
  playNoiseBurst(ctx, t, 0.55, 0.06)
  playTone(ctx, 140, t, 0.35, 0.05, 'triangle')
  playTone(ctx, 880, t + 0.45, 0.2, 0.07)
  playTone(ctx, 660, t + 0.7, 0.28, 0.06)
}

function pickVoice(): SpeechSynthesisVoice | null {
  if (!window.speechSynthesis) return null
  const voices = window.speechSynthesis.getVoices()
  return (
    voices.find((v) => v.lang === 'es-MX') ||
    voices.find((v) => v.lang === 'es-ES') ||
    voices.find((v) => v.lang.startsWith('es')) ||
    voices.find((v) => v.default) ||
    voices[0] ||
    null
  )
}

export function speakCabin(text: string) {
  playCabinChime()
  if (!window.speechSynthesis) return

  const run = () => {
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    const voice = pickVoice()
    if (voice) {
      utter.voice = voice
      utter.lang = voice.lang
    } else {
      utter.lang = 'es-MX'
    }
    utter.rate = 0.9
    utter.pitch = 1
    utter.volume = 1
    window.setTimeout(() => {
      try {
        window.speechSynthesis.speak(utter)
      } catch {
        /* chime still played */
      }
    }, 80)
  }

  if (!voicesReady) {
    window.speechSynthesis.onvoiceschanged = () => {
      voicesReady = true
      window.speechSynthesis.onvoiceschanged = null
      run()
    }
    window.setTimeout(run, 250)
  } else {
    run()
  }

  if (!unlocked) void unlockCabinAudio()
}

export function stopCabinSpeech() {
  window.speechSynthesis?.cancel()
}
