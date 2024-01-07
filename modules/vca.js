export function vca(audioContext) {
  const gainNode = audioContext.createGain()
  gainNode.gain.value = 0

  return {
    inputs: [
      (node) => {
        node.connect(gainNode)
      },
      (envelope) => {
        envelope.connect(gainNode.gain)
      },
    ],
    output: () => gainNode,
  }
}
