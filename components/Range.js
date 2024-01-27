export function Range() {
  const input = document.createElement('input')
  input.setAttribute('type', 'range')

  Object.assign(input.style, {
    width: '90%',
    margin: '0 auto',
    display: 'block',
    boxSizing: 'border-box',
  })

  return {
    container: input,

    render: ({ min, max, step, value = 0, onInput }) => {
      Object.assign(input, {
        value: value,
        min: min,
        max: max,
        step: step,
        oninput: () => onInput(Number(input.value)),
      })
      return input
    },
  }
}
