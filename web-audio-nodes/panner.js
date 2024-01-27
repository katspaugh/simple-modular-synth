import { Range } from '../components/Range.js'

export function panner(audioContext) {
  const panner = audioContext.createStereoPanner()
  const initialValue = panner.pan.value

  return {
    description: 'Panner',
    inputs: [() => panner, () => panner.pan],
    output: () => panner,
    render: () =>
      Range().render({
        value: initialValue,
        min: -1,
        max: 1,
        step: 0.01,
        onInput: (value) => {
          panner.pan.value = value
        },
      }),
  }
}
