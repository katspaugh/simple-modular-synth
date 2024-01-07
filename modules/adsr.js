export async function envelope(audioContext) {
  await audioContext.audioWorklet.addModule('/modules/adsr-processor.js')
  const adsrNode = new AudioWorkletNode(audioContext, 'adsr-processor', {
    numberOfInputs: 0,
    numberOfOutputs: 1,
    channelCount: 1,
    parameterData: {
      attack: 0,
      decay: 0,
      sustain: 1,
      release: 0.2,
      trigger: 0,
    },
  })

  return {
    inputs: [
      () => adsrNode.parameters.get('trigger'),
      () => adsrNode.parameters.get('attack'),
      () => adsrNode.parameters.get('release'),
    ],
    output: () => adsrNode,
  }
}
