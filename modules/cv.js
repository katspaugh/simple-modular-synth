function renderInput(svgNode, initialValue, setValue) {
  const input = document.createElement('input')
  input.type = 'number'
  input.addEventListener('input', () => {
    setValue(Number(input.value))
  })
  input.placeholder = initialValue.toString()
  input.style.width = '100%'
  input.style.height = '100%'
  input.style.boxSizing = 'border-box'
  const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject')
  foreignObject.setAttribute('width', 60)
  foreignObject.setAttribute('height', 20)
  foreignObject.setAttribute('x', 20)
  foreignObject.setAttribute('y', 15)
  foreignObject.appendChild(input)
  svgNode.appendChild(foreignObject)
}

export function cv(audioContext, initialValue = 100) {
  const constantSource = audioContext.createConstantSource()
  constantSource.offset.value = initialValue
  constantSource.start()

  const setValue = (newValue) => {
    constantSource.offset.value = newValue
  }

  return {
    render: (svgNode) => {
      renderInput(svgNode, initialValue, setValue)
    },
    inputs: [],
    output: () => constantSource,
  }
}
