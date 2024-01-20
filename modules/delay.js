import { range } from '../ui/range.js'

export function delay(audioContext, initialValue = 1, maxSeconds = 5) {
  const delay = audioContext.createDelay(maxSeconds)
  delay.delayTime.value = initialValue

  const setValue = (value) => {
    delay.delayTime.value = value
  }

  return {
    description: 'Delay',
    render: () => range(initialValue, setValue, 0, maxSeconds, 0.1),
    inputs: [() => delay, () => delay.delayTime],
    output: () => delay,
  }
}
