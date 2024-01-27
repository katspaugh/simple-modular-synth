import { Range } from '../components/Range.js'

export function speakers(audioContext, volume = 1) {
  const gainNode = audioContext.createGain()
  gainNode.gain.value = volume
  gainNode.connect(audioContext.destination)

  return {
    description: 'Final audio output',
    inputs: [() => gainNode],
    output: () => gainNode,
    render: () =>
      Range().render({
        value: volume,
        min: 0,
        max: 2,
        step: 0.01,
        onInput: (value) => {
          gainNode.gain.value = value
        },
      }),
  }
}
