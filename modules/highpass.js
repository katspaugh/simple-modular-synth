import { filter } from './filter.js'

export function highpass(audioContext, freq = 880) {
  return filter(audioContext, 'highpass', freq)
}
