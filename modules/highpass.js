import { filter } from './filter.js'

export function highpass(audioContext, freq = 1000) {
  return filter(audioContext, 'highpass', freq)
}
