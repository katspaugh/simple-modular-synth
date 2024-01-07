import { oscillator } from './oscillator.js'

export function lfo(audioContext, freq = 10, type = 'sine', gain = 10) {
  return oscillator(audioContext, freq, type, gain)
}
