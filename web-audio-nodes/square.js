import { oscillator } from './oscillator.js'

export function square(audioContext, freq = 220) {
  return {
    ...oscillator(audioContext, freq, 'square'),
    description: 'Square wave oscillator',
  }
}
