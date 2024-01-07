import { oscillator } from './oscillator.js'

export function lfo(audioContext, freq = 10, type = 'sine') {
  return oscillator(audioContext, freq, type)
}
