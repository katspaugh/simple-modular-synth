import { Range } from '../components/Range.js'

export async function envelope(audioContext) {
  await audioContext.audioWorklet.addModule('/web-audio-nodes/envelope-processor.js')
  const envNode = new AudioWorkletNode(audioContext, 'envelope-processor', {
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

  const triggerParam = envNode.parameters.get('trigger')
  const attackParam = envNode.parameters.get('attack')
  const releaseParam = envNode.parameters.get('release')

  return {
    description: 'Envelope generator',
    inputs: [() => triggerParam, () => attackParam, () => releaseParam],
    output: () => envNode,

    render: () => {
      const S = 100 // scale

      return [
        Range().render({
          min: 0,
          max: S,
          step: 1,
          value: attackParam.value * S,
          onInput: (newValue) => (attackParam.value = newValue / S),
        }),
        Range().render({
          min: 0,
          max: S,
          step: 1,
          value: releaseParam.value * S,
          onInput: (newValue) => (releaseParam.value = newValue / S),
        }),
      ]
    },
  }
}
