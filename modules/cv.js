export function cv(audioContext, value = 100) {
  let cvNode
  audioContext.audioWorklet.addModule('/modules/cv-processor.js').then(() => {
    cvNode = new AudioWorkletNode(audioContext, 'cv-processor', {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      channelCount: 1,
      parameterData: {
        value,
      },
    })
  })

  return {
    render: (svgNode) => {
      const input = document.createElement('input')
      input.addEventListener('input', () => {
        const newValue = Number(input.value)
        cvNode.parameters.get('value').setValueAtTime(newValue, audioContext.currentTime)
      })
      input.placeholder = value.toString()
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
    },
    inputs: [],
    output: () => cvNode,
  }
}
