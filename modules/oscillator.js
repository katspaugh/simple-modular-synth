export function oscillator(audioContext, initialFrequency = 220, type = 'triangle') {
  const oscillator = audioContext.createOscillator()
  let started = false
  oscillator.type = type
  oscillator.frequency.value = initialFrequency

  // Detune range amplifier
  const gainNode = audioContext.createGain()
  gainNode.gain.value = 1000
  gainNode.connect(oscillator.detune)

  return {
    inputs: [
      (node) => {
        node.connect(gainNode)
      },
      (node) => {
        node.connect(oscillator.frequency)
      },
    ],
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
