export async function shiftRegister(audioContext) {
  await audioContext.audioWorklet.addModule('/modules/shift-register-processor.js')
  const shiftReg = new AudioWorkletNode(audioContext, 'shift-register-processor', {
    numberOfInputs: 0,
    numberOfOutputs: 8,
    channelCount: 1,
  })

  return {
    description: 'Shift register',
    inputs: [() => shiftReg.parameters.get('data'), () => shiftReg.parameters.get('clock')],
    output: () => shiftReg,
  }
}
