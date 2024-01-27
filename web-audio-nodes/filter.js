import { Range } from '../components/Range.js'

export function filter(audioContext, type = 'lowpass', initialFrequency = 440) {
  const filterNode = audioContext.createBiquadFilter()
  filterNode.type = type
  filterNode.frequency.value = initialFrequency
  filterNode.Q.value = 0

  // Frequency range amplifier
  const freqGainNode = audioContext.createGain()
  freqGainNode.gain.value = 1000 // +- 1000 Hz
  freqGainNode.connect(filterNode.frequency)

  // Resonance range amplifier
  const qGainNode = audioContext.createGain()
  qGainNode.gain.value = 10
  qGainNode.connect(filterNode.Q)

  return {
    description: 'Filter',
    inputs: [() => filterNode, () => freqGainNode, () => qGainNode],
    output: () => filterNode,
    render: () =>
      Range().render({
        value: initialFrequency,
        min: 20,
        max: 2000,
        step: 1,
        onInput: (value) => {
          filterNode.frequency.value = value
        },
      }),
  }
}
