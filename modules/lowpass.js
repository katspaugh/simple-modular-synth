export async function lowpass(audioContext, freq = 300) {
  const filter = audioContext.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = freq
  filter.Q.value = 0

  // Frequency range amplifier
  const gainNode = audioContext.createGain()
  gainNode.gain.value = 1000
  gainNode.connect(filter.frequency)

  // Resonance range amplifier
  const qGainNode = audioContext.createGain()
  qGainNode.gain.value = 1000
  qGainNode.connect(filter.frequency)

  return {
    inputs: [
      (node) => {
        node.connect(filter)
      },
      (node) => {
        node.connect(gainNode)
      },
      (node) => {
        node.connect(qGainNode)
      },
    ],
    output: () => filter,
  }
}
