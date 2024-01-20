import { oscillator } from './oscillator.js'

export function sine(audioContext, freq = 220) {
  return {
    ...oscillator(audioContext, freq, 'sine'),
    description: 'Sine wave oscillator',
  }
}
