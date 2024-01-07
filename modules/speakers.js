export async function speakers(audioContext) {
  return {
    inputs: [
      (node) => {
        node.connect(audioContext.destination)
      },
    ],
    output: () => audioContext.destination,
  }
}
