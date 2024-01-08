export async function sampleAndHold(audioContext) {
  await audioContext.audioWorklet.addModule('/modules/sample-and-hold-processor.js')
  const sampleAndHold = new AudioWorkletNode(audioContext, 'sample-and-hold-processor')

  return {
    label: 's&h',
    inputs: [() => sampleAndHold.parameters.get('source'), () => sampleAndHold.parameters.get('trigger')],
    output: () => sampleAndHold,
  }
}
