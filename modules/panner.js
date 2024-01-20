import { range } from '../ui/range.js'

export function panner(audioContext) {
  const panner = audioContext.createStereoPanner()
  const initialValue = panner.pan.value

  const setValue = (value) => {
    panner.pan.value = value
  }

  return {
    description: 'Panner',
    render: () => range(initialValue, setValue, -1, 1, 0.1),
    inputs: [() => panner, () => panner.pan],
    output: () => panner,
  }
}
