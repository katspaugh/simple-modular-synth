export async function noise(audioContext) {
  const gainNode = audioContext.createGain()
  gainNode.gain.value = 1

  const constantSource = audioContext.createConstantSource()
  constantSource.offset.value = 0
  constantSource.connect(gainNode.gain)
  let started = false

  await audioContext.audioWorklet.addModule('/modules/white-noise-processor.js')
  const noise = new AudioWorkletNode(audioContext, 'white-noise-processor', {
    numberOfInputs: 0,
    numberOfOutputs: 1,
    channelCount: 1,
  })
  noise.connect(gainNode)

  return {
    description: 'White noise generator',
    inputs: [],
    output: () => {
      setTimeout(() => {
        if (!started) {
          started = true
          constantSource.start()
        }
      }, 0)

      return gainNode
    },
  }
}
