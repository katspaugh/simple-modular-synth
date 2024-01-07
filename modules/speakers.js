export function speakers(audioContext) {
  return {
    inputs: [() => audioContext.destination],
    output: () => audioContext.destination,
  }
}
