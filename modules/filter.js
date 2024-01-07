export function filter(audioContext, type = 'lowpass', freq = 300) {
  const filterNode = audioContext.createBiquadFilter()
  filterNode.type = type
  filterNode.frequency.value = freq
  filterNode.Q.value = 0

  // Frequency range amplifier
  const freqGainNode = audioContext.createGain()
  freqGainNode.gain.value = 1000
  freqGainNode.connect(filterNode.frequency)

  // Resonance range amplifier
  const qGainNode = audioContext.createGain()
  qGainNode.gain.value = 10
  qGainNode.connect(filterNode.Q)

  return {
    inputs: [() => filterNode, () => freqGainNode, () => qGainNode],
    output: () => filterNode,
  }
}
