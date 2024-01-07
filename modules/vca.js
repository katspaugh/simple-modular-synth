export function vca(audioContext) {
  const gainNode = audioContext.createGain()
  gainNode.gain.value = 0

  return {
    inputs: [() => gainNode, () => gainNode.gain],
    output: () => gainNode,
  }
}
