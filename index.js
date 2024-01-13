import { renderSvg, renderModule, renderPatchCable, renderContent, dragModule } from './render.js'
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
  const svg = renderSvg(document.body)
  let currentOutput
  let currentInput

  const onPointerDown = (module, e) => {
    const id = e.target.getAttribute('id')
    if (!id) return

    if (currentOutput) {
      currentOutput.element.style.fill = ''
    }

    if (currentInput) {
      currentInput.element.style.fill = ''
    }

    if (id.includes('input')) {
      const inputIndex = id.split('-input-')[1]
      currentInput = {
        element: e.target,
        input: module.inputs[inputIndex],
      }
    }

    if (id.includes('output')) {
      currentOutput = {
        element: e.target,
        output: module.output,
      }
    }

    if (currentInput && currentOutput) {
      renderPatchCable(svg, currentOutput.element, currentInput.element)
      currentOutput.output().connect(currentInput.input())
      currentInput = null
      currentOutput = null
    } else {
      e.target.style.fill = '#f00'
    }
  }

  const modules = await Promise.all(
    initialModules.map(async (module) => {
      const mod = await module.type(audioContext)

      const container = renderModule(
        document.body,
        module.id,
        module.x,
        module.y,
        mod.label || module.type.name,
        mod.inputs.length,
      )

      if (mod.render) {
        renderContent(container, mod.render())
      }

      container.addEventListener('pointerdown', (e) => onPointerDown(mod, e))

      return {
        ...mod,
        id: module.id,
        container,
      }
    }),
  )

  initialPatchCables.forEach((cable) => {
    const fromEl = document.querySelector(`#module-${cable.from}`)
    const toEl = document.querySelector(`#module-${cable.to}`)
    renderPatchCable(svg, fromEl, toEl)
    const outputModuleId = cable.from.split('-output')[0]
    const [inputModuleId, inputIndex] = cable.to.split('-input-')
    const inputModule = modules.find((m) => m.id === inputModuleId)
    const outputModule = modules.find((m) => m.id === outputModuleId)
    outputModule.output().connect(inputModule.inputs[inputIndex]())
  })

  document.addEventListener('click', (e) => {
    if (audioContext.state === 'suspended') {
      audioContext.resume()
    }
  })
}

renderApp(
  [
    { id: 'osc-0', x: 100, y: 50, type: oscillator },
    { id: 'lfo-0', x: 100, y: 125, type: lfo },
    { id: 'clock-0', x: 250, y: 1, type: clock },
    { id: 'clock-1', x: 400, y: 1, type: clock },
    { id: 'adsr-0', x: 250, y: 100, type: adsr },
    { id: 'adsr-1', x: 400, y: 100, type: adsr },
    { id: 'vca-0', x: 250, y: 200, type: vca },
    { id: 'vca-1', x: 400, y: 200, type: vca },
    { id: 'lowpass-0', x: 300, y: 300, type: lowpass },
    { id: 'speakers-0', x: 450, y: 300, type: speakers },
    { id: 'cv-0', x: 100, y: 400, type: cv },
    { id: 'cv-1', x: 250, y: 400, type: cv },
    { id: 'noise-0', x: 400, y: 400, type: noise },
    { id: 'highpass-0', x: 150, y: 300, type: highpass },
    { id: 'sampleAndHold-0', x: 100, y: 200, type: sampleAndHold },
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
