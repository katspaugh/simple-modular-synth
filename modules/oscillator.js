export function oscillator(audioContext, initialFrequency = 220, type = 'triangle') {
  const oscillator = audioContext.createOscillator()
  let started = false
  oscillator.type = type
  oscillator.frequency.value = initialFrequency

  const freqGainNode = audioContext.createGain()
  freqGainNode.gain.value = 1000
  freqGainNode.connect(oscillator.frequency)

  return {
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
