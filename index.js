import { renderGraph } from './flow.js'

// Web Audio modules
import { oscillator } from './modules/oscillator.js'
import { lfo } from './modules/lfo.js'
import { clock } from './modules/clock.js'
import { adsr } from './modules/adsr.js'
import { vca } from './modules/vca.js'
import { speakers } from './modules/speakers.js'
import { cv } from './modules/cv.js'
import { noise } from './modules/white-noise.js'
import { lowpass } from './modules/lowpass.js'
import { highpass } from './modules/highpass.js'
import { sampleAndHold } from './modules/sample-and-hold.js'

async function renderApp(initialModules, initialPatchCables) {
  const audioContext = new AudioContext()

  const onConnect = (inputId, outputId) => {
    const [inputModuleId, inputIndex] = inputId.split('-input-')
    const outputModuleId = outputId.split('-output')[0]
    const inputModule = modules.find((m) => m.id === inputModuleId)
    const outputModule = modules.find((m) => m.id === outputModuleId)
    if (!inputModule || !outputModule) {
      throw new Error(`Module not found: ${inputModuleId} or ${outputModuleId}`)
    }
    outputModule.output().connect(inputModule.inputs[inputIndex]())
  }

  const graph = renderGraph(document.body, onConnect)

  const modules = await Promise.all(
    initialModules.map(async (module) => {
      const mod = await module.type(audioContext)

      graph.renderModule({
        id: module.id,
        x: module.x,
        y: module.y,
        label: mod.label || module.type.name,
        inputsCount: mod.inputs.length,
        children: mod.render ? mod.render() : undefined,
      })

      return {
        ...mod,
        id: module.id,
      }
    }),
  )

  initialPatchCables.forEach((cable) => {
    const fromEl = document.querySelector(`#${cable.from}`)
    const toEl = document.querySelector(`#${cable.to}`)
    graph.renderPatchCable(fromEl, toEl)

    onConnect(cable.to, cable.from)
  })

  document.addEventListener('click', (e) => {
    if (audioContext.state === 'suspended') {
      audioContext.resume()
    }
  })
}

renderApp(
  [
    { id: 'osc-0', x: 50, y: 50, type: oscillator },
    { id: 'lfo-0', x: 50, y: 125, type: lfo },
    { id: 'clock-0', x: 300, y: 10, type: clock },
    { id: 'clock-1', x: 600, y: 10, type: clock },
    { id: 'adsr-0', x: 300, y: 100, type: adsr },
    { id: 'adsr-1', x: 600, y: 100, type: adsr },
    { id: 'vca-0', x: 300, y: 200, type: vca },
    { id: 'vca-1', x: 600, y: 200, type: vca },
    { id: 'lowpass-0', x: 400, y: 300, type: lowpass },
    { id: 'speakers-0', x: 700, y: 300, type: speakers },
    { id: 'cv-0', x: 50, y: 400, type: cv },
    { id: 'cv-1', x: 300, y: 400, type: cv },
    { id: 'noise-0', x: 600, y: 400, type: noise },
    { id: 'highpass-0', x: 100, y: 300, type: highpass },
    { id: 'sampleAndHold-0', x: 50, y: 200, type: sampleAndHold },
  ],
  [
    { from: 'osc-0-output', to: 'lowpass-0-input-0' },
    { from: 'adsr-0-output', to: 'vca-0-input-1' },
    { from: 'clock-0-output', to: 'adsr-0-input-0' },
    { from: 'lowpass-0-output', to: 'vca-0-input-0' },
    { from: 'vca-0-output', to: 'speakers-0-input-0' },
    { from: 'lfo-0-output', to: 'cv-0-input-0' },
    { from: 'cv-0-output', to: 'lowpass-0-input-1' },
    { from: 'noise-0-output', to: 'sampleAndHold-0-input-0' },
    { from: 'sampleAndHold-0-output', to: 'osc-0-input-0' },
    { from: 'clock-0-output', to: 'sampleAndHold-0-input-1' },
    { from: 'clock-1-output', to: 'lfo-0-input-0' },
  ],
)
