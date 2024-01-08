import { range } from '../ui/range.js'

export function oscillator(audioContext, initialFrequency = 220, type = 'triangle') {
  const oscillator = audioContext.createOscillator()
  let started = false
  oscillator.type = type
  oscillator.frequency.value = initialFrequency

  const freqGainNode = audioContext.createGain()
  freqGainNode.gain.value = 1000 // +- 1000 Hz
  freqGainNode.connect(oscillator.frequency)

  const setValue = (newValue) => {
    oscillator.detune.value = newValue
  }

  return {
    render: () => range(0, setValue, -4800, 4800, 1),
    inputs: [(node) => freqGainNode],
    output: () => {
      setTimeout(() => {
        if (!started) {
          started = true
          oscillator.start()
        }
      }, 0)
      return oscillator
    },
  }
}
