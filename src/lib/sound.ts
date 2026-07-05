/**
 * Tiny synthesized audio cues via the Web Audio API (no asset files).
 * The AudioContext is created lazily on first use — which always happens
 * inside a user gesture (a click), satisfying browser autoplay policies.
 */

let ctx: AudioContext | null = null
let muted = false

export function setMuted(value: boolean): void {
  muted = value
}

type Ctor = typeof AudioContext
function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const W = window as Window & { webkitAudioContext?: Ctor }
    const AC: Ctor | undefined = window.AudioContext ?? W.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freq: number, start: number, duration: number, gain = 0.08, type: OscillatorType = 'sine') {
  const ac = getCtx()
  if (!ac) return
  const osc = ac.createOscillator()
  const env = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, ac.currentTime + start)
  env.gain.setValueAtTime(0.0001, ac.currentTime + start)
  env.gain.exponentialRampToValueAtTime(gain, ac.currentTime + start + 0.012)
  env.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + duration)
  osc.connect(env).connect(ac.destination)
  osc.start(ac.currentTime + start)
  osc.stop(ac.currentTime + start + duration + 0.02)
}

/** Bright rising two-note chime. */
export function playCorrect(): void {
  if (muted) return
  tone(659.25, 0, 0.13, 0.07, 'triangle') // E5
  tone(987.77, 0.09, 0.18, 0.07, 'triangle') // B5
}

/** Soft low "thud". */
export function playWrong(): void {
  if (muted) return
  tone(196, 0, 0.22, 0.06, 'sawtooth') // G3
  tone(146.83, 0.04, 0.26, 0.05, 'sine') // D3
}

/** Little tap feedback for selecting / placing a token. */
export function playTap(): void {
  if (muted) return
  tone(523.25, 0, 0.05, 0.03, 'square')
}

/** Triumphant arpeggio for finishing a session / new record. */
export function playFanfare(): void {
  if (muted) return
  ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.1, 0.22, 0.06, 'triangle'))
}
