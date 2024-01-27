import { oscillator } from './oscillator.js'

export function triangle(audioContext) {
  return {
    ...oscillator(audioContext),
    description: 'Triangle wave oscillator',
  }
}
