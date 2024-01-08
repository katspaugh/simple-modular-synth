class SampleAndHoldProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this.value = 0
    this.trig = false
  }
  static get parameterDescriptors() {
    return [
      { name: 'source', defaultValue: 0, minValue: 0, maxValue: 1, automationRate: 'a-rate' },
      { name: 'trigger', defaultValue: 0, minValue: 0, maxValue: 1, automationRate: 'a-rate' },
    ]
  }
  process(_inputs, outputs, parameters) {
    const trig = parameters.trigger[0] > 0.5
    if (!this.trig && trig) {
      this.value = parameters.source[0]
    }
    this.trig = trig

    const output = outputs[0]
    for (let i = 0; i < output[0].length; ++i) {
      output[0][i] = this.value
    }

    return true
  }
}

registerProcessor('sample-and-hold-processor', SampleAndHoldProcessor)
