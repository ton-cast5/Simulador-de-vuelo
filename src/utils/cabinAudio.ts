/** Cross-device cabin PA: chime (Web Audio) + speech when available. */

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
) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 1800
  osc.type = 'sine'
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.04)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur)
  osc.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  osc.start(start)
  osc.stop(start + dur + 0.05)
}

/** Classic double-ding cabin chime — works on all browsers after unlock. */
export function playCabinChime() {
  const ctx = getCtx()
  if (!ctx) return
  void ctx.resume()
  const t = ctx.currentTime
  playTone(ctx, 880, t, 0.22, 0.09)
  playTone(ctx, 660, t + 0.28, 0.28, 0.08)
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

    // iOS sometimes needs a tiny delay after cancel
    window.setTimeout(() => {
      try {
        window.speechSynthesis.speak(utter)
      } catch {
        /* chime still played */
      }
    }, 80)
  }

  if (!voicesReady) {
    const onVoices = () => {
      voicesReady = true
      window.speechSynthesis.onvoiceschanged = null
      run()
    }
    window.speechSynthesis.onvoiceschanged = onVoices
    // Fallback if event never fires
    window.setTimeout(run, 250)
  } else {
    run()
  }

  if (!unlocked) void unlockCabinAudio()
}

export function stopCabinSpeech() {
  window.speechSynthesis?.cancel()
}
