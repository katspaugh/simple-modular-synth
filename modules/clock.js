import { lfo } from './lfo.js'

export function clock(audioContext, freq = 2) {
  return lfo(audioContext, freq, 'square', 100)
}
