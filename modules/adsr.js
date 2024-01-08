import { range } from '../ui/range.js'

export async function adsr(audioContext) {
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

  const triggerParam = adsrNode.parameters.get('trigger')
  const attackParam = adsrNode.parameters.get('attack')
  const releaseParam = adsrNode.parameters.get('release')

  return {
    label: 'envelope',
    inputs: [() => triggerParam, () => attackParam, () => releaseParam],
    output: () => adsrNode,
    render: () => {
      const S = 100
      const attack = range(attackParam.value * S, (newValue) => (attackParam.value = newValue / S), 0, S, 1)
      const release = range(releaseParam.value * S, (newValue) => (releaseParam.value = newValue / S), 0, S, 1)
      return [attack, release]
    },
  }
}
