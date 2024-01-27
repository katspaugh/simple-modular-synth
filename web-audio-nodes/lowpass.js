import { filter } from './filter.js'

export function lowpass(audioContext, freq = 440) {
  return {
    ...filter(audioContext, 'lowpass', freq),
    description: 'Low-pass filter',
  }
}
