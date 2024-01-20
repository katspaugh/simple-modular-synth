import { sine } from './sine.js'

export function lfo(audioContext, freq = 1) {
  return {
    ...sine(audioContext, freq),
    description: 'Low frequency oscillator',
  }
}
