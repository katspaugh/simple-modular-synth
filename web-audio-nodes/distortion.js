import { Range } from '../components/Range.js'

function makeDistortionCurve(amount) {
  const k = typeof amount === 'number' ? amount : 50
  const n_samples = 44100
  const curve = new Float32Array(n_samples)
  const deg = Math.PI / 180

  for (let i = 0; i < n_samples; i++) {
    const x = (i * 2) / n_samples - 1
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x))
  }
  return curve
}

export function distortion(audioContext, initialValue = 400) {
  const distortion = audioContext.createWaveShaper()
  distortion.curve = makeDistortionCurve(initialValue)
  distortion.oversample = '4x'

  return {
    description: 'Distortion',
    inputs: [() => distortion],
    output: () => distortion,
    render: () =>
      Range().render({
        value: initialValue,
        min: 100,
        max: 1000,
        step: 10,
        onInput: (value) => {
          distortion.curve = makeDistortionCurve(value)
        },
      }),
  }
}
