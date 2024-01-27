import { Range } from '../components/Range.js'

export function vca(audioContext, initialValue = 0) {
  const gainNode = audioContext.createGain()
  gainNode.gain.value = initialValue

  return {
    description: 'Voltage-controlled amplifier',
    inputs: [() => gainNode, () => gainNode.gain],
    output: () => gainNode,
    render: () =>
      Range().render({
        value: initialValue,
        min: 0,
        max: 1,
        step: 0.01,
        onInput: (value) => {
          gainNode.gain.value = value
        },
      }),
  }
}
