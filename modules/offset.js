import { range } from '../ui/range.js'

export function offset(audioContext, initialValue = 0) {
  const constantSource = audioContext.createConstantSource()
  constantSource.offset.value = initialValue
  constantSource.start()

  const mixer = audioContext.createGain()
  mixer.gain.value = 1
  constantSource.connect(mixer)

  const setValue = (newValue) => {
    constantSource.offset.value = newValue
  }

  return {
    description: 'Add or subtract a constant value',
    render: () => range(initialValue, setValue, -1, 1, 0.01),
    inputs: [() => mixer],
    output: () => mixer,
  }
}
