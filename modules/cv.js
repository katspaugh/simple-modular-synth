import { range } from '../ui/range.js'

export function cv(audioContext, initialValue = 0.1) {
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
    description: 'Constant signal source',
    render: () => range(initialValue, setValue, -1, 1, 0.01),
    inputs: [() => mixer],
    output: () => mixer,
  }
}
