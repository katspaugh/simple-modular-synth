import { range } from '../ui/range.js'

export function vca(audioContext, initialValue = 0) {
  const gainNode = audioContext.createGain()
  gainNode.gain.value = initialValue

  const setValue = (newValue) => {
    gainNode.gain.value = newValue
  }

  return {
    description: 'Voltage-controlled amplifier',
    inputs: [() => gainNode, () => gainNode.gain],
    output: () => gainNode,
    render: () => range(initialValue, setValue, -1, 1, 0.1),
  }
}
