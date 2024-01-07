export function envelope(audioContext) {
  let adsrNode
  audioContext.audioWorklet.addModule('/modules/adsr-processor.js').then(() => {
    adsrNode = new AudioWorkletNode(audioContext, 'adsr-processor', {
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
  })

  return {
    inputs: [
      // Trigger
      (node) => {
        node.connect(adsrNode.parameters.get('trigger'))
      },
      (attack) => {
        adsrNode.parameters.get('attack').setValueAtTime(attack, audioContext.currentTime)
      },
      (release) => {
        adsrNode.parameters.get('release').setValueAtTime(release, audioContext.currentTime)
      },
    ],
    output: () => adsrNode,
  }
}
