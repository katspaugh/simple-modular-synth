import { filter } from './filter.js'

export function lowpass(audioContext, freq = 300) {
  return filter(audioContext, 'lowpass', freq)
}
