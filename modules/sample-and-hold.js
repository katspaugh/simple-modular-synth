export async function sampleAndHold(audioContext) {
  await audioContext.audioWorklet.addModule('/modules/sample-and-hold-processor.js')
  const sampleAndHold = new AudioWorkletNode(audioContext, 'sample-and-hold-processor')

  return {
    description: 'Sample and hold',
    inputs: [() => sampleAndHold.parameters.get('source'), () => sampleAndHold.parameters.get('trigger')],
    output: () => sampleAndHold,
  }
}
