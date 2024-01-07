export function oscillator(audioContext, initialFrequency = 440, type = 'triangle', gain = 1) {
  const oscillator = audioContext.createOscillator()
  let started = false
  oscillator.type = type
  oscillator.frequency.value = initialFrequency

  const gainNode = audioContext.createGain()
  gainNode.gain.value = gain
  oscillator.connect(gainNode)

  return {
    inputs: [
      (node) => {
        console.log(node)
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
      return gainNode
    },
  }
}
