import { Range } from '../components/Range.js'

export function delay(audioContext, initialValue = 1, maxSeconds = 5) {
  const delay = audioContext.createDelay(maxSeconds)
  delay.delayTime.value = initialValue

  const onInput = (value) => {
    delay.delayTime.value = value
  }

  return {
    description: 'Delay',
    inputs: [() => delay, () => delay.delayTime],
    output: () => delay,
    render: () =>
      Range().render({
        value: initialValue,
        min: 0,
        max: maxSeconds,
        step: 0.1,
        onInput,
      }),
  }
}
