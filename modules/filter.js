import { range } from '../ui/range.js'

export function filter(audioContext, type = 'lowpass', freq = 440) {
  const filterNode = audioContext.createBiquadFilter()
  filterNode.type = type
  filterNode.frequency.value = freq
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
    render: () => range(freq, (newValue) => (filterNode.frequency.value = newValue), 20, 2000, 10),
    inputs: [() => filterNode, () => freqGainNode, () => qGainNode],
    output: () => filterNode,
  }
}
