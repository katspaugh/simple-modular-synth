export function range(initialValue, setValue, min, max, step) {
  const input = document.createElement('input')
  input.type = 'range'
  input.value = initialValue
  input.min = min
  input.max = max
  input.step = step
  input.placeholder = initialValue.toString()

  Object.assign(input.style, {
    width: '90%',
    margin: '0 auto',
    display: 'block',
    boxSizing: 'border-box',
  })

  input.addEventListener('input', () => {
    setValue(Number(input.value))
  })

  return input
}
