import { oscillator } from './oscillator.js'

export function lfo(audioContext, freq = 1, type = 'sine') {
  return {
    ...oscillator(audioContext, freq, type),
    description: 'Low frequency oscillator',
  }
}
