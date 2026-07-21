/**
 * Cabin ambience using real WAV loops (Focus Flight-style continuous hum).
 */

let unlocked = false
let cabinEl: HTMLAudioElement | null = null
let chimeEl: HTMLAudioElement | null = null

function ensureEls() {
  if (!cabinEl) {
    cabinEl = new Audio('/audio/cabin-hum.wav')
    cabinEl.loop = true
    cabinEl.volume = 0.38
    cabinEl.preload = 'auto'
  }
  if (!chimeEl) {
    chimeEl = new Audio('/audio/chime.wav')
    chimeEl.volume = 0.45
    chimeEl.preload = 'auto'
  }
}

export async function unlockCabinAudio() {
  ensureEls()
  try {
    cabinEl!.muted = true
    await cabinEl!.play()
    cabinEl!.pause()
    cabinEl!.currentTime = 0
    cabinEl!.muted = false
    unlocked = true
  } catch {
    unlocked = true
  }
}

export function playCabinHum(on = true) {
  ensureEls()
  if (!on) {
    cabinEl!.pause()
    return
  }
  void cabinEl!.play().catch(() => {})
}

export function setCabinVolume(v: number) {
  ensureEls()
  cabinEl!.volume = Math.max(0, Math.min(1, v))
}

export function playChime() {
  ensureEls()
  chimeEl!.currentTime = 0
  void chimeEl!.play().catch(() => {})
}

export function playTakeoffSound() {
  playChime()
  playCabinHum(true)
}

export function playTouchdownSound() {
  playChime()
}

export function speakCabin(text: string) {
  // Prefer UI announcements; keep TTS soft as optional layer
  if (!unlocked || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'es-MX'
  u.rate = 0.92
  u.volume = 0.55
  window.speechSynthesis.speak(u)
}

export function stopCabinSpeech() {
  window.speechSynthesis?.cancel()
}

// Back-compat aliases
export const startCabinAmbience = () => playCabinHum(true)
export const stopCabinAmbience = () => playCabinHum(false)
