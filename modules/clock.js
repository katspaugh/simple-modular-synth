import { lfo } from './lfo.js'

export async function clock(audioContext, freq = 2) {
  return lfo(audioContext, freq, 'square')
}
