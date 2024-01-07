export function noise(audioContext) {
  const gainNode = audioContext.createGain()
  gainNode.gain.value = 1

  const buffer = audioContext.createBuffer(1, 1, 8000)
  const bufferSource = audioContext.createBufferSource()
  buffer.getChannelData(0)[0] = 1
  bufferSource.buffer = buffer
  bufferSource.connect(gainNode)
  let started = false

  audioContext.audioWorklet.addModule('/modules/white-noise-processor.js').then(() => {
    const noise = new AudioWorkletNode(audioContext, 'white-noise-processor', {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      channelCount: 1,
    })
    noise.connect(gainNode)
  })

  return {
    inputs: [],
    output: () => {
      setTimeout(() => {
        if (!started) {
          started = true
          bufferSource.start()
        }
      }, 0)

      return gainNode
    },
  }
}
