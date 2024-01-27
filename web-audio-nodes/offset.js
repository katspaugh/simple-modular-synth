import { Range } from '../components/Range.js'

export function offset(audioContext, initialValue = 0) {
  const constantSource = audioContext.createConstantSource()
  constantSource.offset.value = initialValue
  constantSource.start()

  const mixer = audioContext.createGain()
  mixer.gain.value = 1
  constantSource.connect(mixer)

  return {
    description: 'Add or subtract a constant value',
    inputs: [() => mixer],
    output: () => mixer,
    render: () =>
      Range().render({
        value: initialValue,
        min: -1,
        max: 1,
        step: 0.01,
        onInput: (value) => {
          constantSource.offset.value = value
        },
      }),
  }
}
