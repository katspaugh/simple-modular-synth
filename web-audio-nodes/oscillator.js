import { Range } from '../components/Range.js'

export function oscillator(audioContext, initialFrequency = 220, type = 'triangle') {
  const oscillator = audioContext.createOscillator()
  let started = false
  oscillator.type = type
  oscillator.frequency.value = initialFrequency

  const freqGainNode = audioContext.createGain()
  freqGainNode.gain.value = 1000 // +- 1000 Hz
  freqGainNode.connect(oscillator.frequency)

  return {
    description: 'Oscillator',
    inputs: [() => freqGainNode],
    output: () => {
      setTimeout(() => {
        if (!started) {
          started = true
          oscillator.start()
        }
      }, 0)
      return oscillator
    },
    render: () =>
      Range().render({
        value: 0,
        min: -4800,
        max: 4800,
        step: 1,
        onInput: (value) => {
          oscillator.detune.value = value
        },
      }),
  }
}
