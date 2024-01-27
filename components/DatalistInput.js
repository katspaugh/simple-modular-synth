export function DatalistInput() {
  const container = document.createElement('div')
  const id = Math.random().toString(36).slice(2)
  const datalist = document.createElement('datalist')
  const input = document.createElement('input')
  datalist.setAttribute('id', id)
  input.setAttribute('list', id)
  container.appendChild(datalist)
  container.appendChild(input)

  return {
    container,

    render: ({ options, onChange, onBlur }) => {
      datalist.innerHTML = ''
      options.forEach((option) => {
        const optionEl = document.createElement('option')
        optionEl.setAttribute('value', option)
        datalist.appendChild(optionEl)
      })

      input.onchange = onChange
      input.onblur = onBlur

      setTimeout(() => {
        input.focus()
      }, 100)

      return container
    },
  }
}
