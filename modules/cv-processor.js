class CvProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [{ name: 'value', defaultValue: 100, minValue: 0, maxValue: 2000, automationRate: 'k-rate' }]
  }
  process(_inputs, outputs, parameters) {
    const output = outputs[0]
    const value = parameters.value[0]
    output.forEach((channel) => {
      for (let i = 0; i < channel.length; i++) {
        channel[i] = value
      }
    })
    return true
  }
}

registerProcessor('cv-processor', CvProcessor)
