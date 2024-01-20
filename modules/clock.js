import { square } from './square.js'

export function clock(audioContext, freq = 2) {
  return {
    ...square(audioContext, freq),
    description: 'Pulse generator',
  }
}
