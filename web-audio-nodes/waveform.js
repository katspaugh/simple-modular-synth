export function waveform(audioContext) {
  const analyser = audioContext.createAnalyser()
  const bufferLength = analyser.frequencyBinCount
  const timeDomainData = new Float32Array(bufferLength)

  return {
    description: 'Waveform visualizer',
    inputs: [() => analyser],
    output: () => analyser,
    render: () => {
      const canvas = document.createElement('canvas')
      canvas.width = 244
      canvas.height = 80
      Object.assign(canvas.style, {
        position: 'absolute',
        left: '0',
        bottom: '0',
        width: '100%',
        height: '40px',
        zIndex: 1,
        pointerEvents: 'none',
      })
      const context = canvas.getContext('2d')
      const { width, height } = canvas
      context.strokeStyle = '#000'

      const onFrame = () => {
        analyser.getFloatTimeDomainData(timeDomainData)

        context.clearRect(0, 0, width, height)
        context.beginPath()
        context.moveTo(0, height / 2)
        for (let i = 0; i < bufferLength; i++) {
          const x = (i / bufferLength) * width
          const y = ((timeDomainData[i] + 1) / 2) * height
          context.lineTo(x, y)
        }
        context.stroke()
        requestAnimationFrame(onFrame)
      }

      onFrame()

      return canvas
    },
  }
}
