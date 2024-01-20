import { range } from '../ui/range.js'

export function speakers(audioContext, volume = 1) {
  const gainNode = audioContext.createGain()
  gainNode.gain.value = volume
  gainNode.connect(audioContext.destination)

  const setValue = (newValue) => {
    gainNode.gain.value = newValue
  }

  return {
    description: 'Speakers',
    inputs: [() => gainNode],
    output: () => gainNode,
    render: () => range(volume, setValue, 0, 2, 0.1),
  }
}
