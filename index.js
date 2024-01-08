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

function renderModule(parentSvg, id, x, y, label, numInputs = 0) {
  const { width, height } = parentSvg.getBoundingClientRect()
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  g.setAttribute('transform', `translate(${x}, ${y})`)
  g.setAttribute('id', `module-${id}`)

  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  rect.setAttribute('width', 100)
  rect.setAttribute('height', 50)
  rect.setAttribute('fill', '#fff')
  rect.setAttribute('stroke', '#000')
  rect.setAttribute('stroke-width', 1)
  g.appendChild(rect)

  // Render label
  if (label) {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    text.setAttribute('x', 50)
    text.setAttribute('y', 10)
    text.setAttribute('font-size', 12)
    text.setAttribute('text-anchor', 'middle')
    text.setAttribute('alignment-baseline', 'middle')
    text.setAttribute('fill', '#000')
    text.textContent = label
    g.appendChild(text)
  }

  // Render inputs
  for (let i = 0; i < numInputs; i++) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    circle.setAttribute('cx', 0)
    circle.setAttribute('cy', 25 + i * 10)
    circle.setAttribute('r', 5)
    circle.setAttribute('fill', '#fff')
    circle.setAttribute('stroke', '#000')
    circle.setAttribute('stroke-width', 1)
    circle.setAttribute('id', `module-${id}-input-${i}`)
    g.appendChild(circle)
  }

  // Render output
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  circle.setAttribute('cx', 100)
  circle.setAttribute('cy', 25)
  circle.setAttribute('r', 5)
  circle.setAttribute('fill', '#fff')
  circle.setAttribute('stroke', '#000')
  circle.setAttribute('stroke-width', 1)
  circle.setAttribute('id', `module-${id}-output`)
  g.appendChild(circle)

  parentSvg.appendChild(g)
  return g
}

function renderPatchCable(parentSvg, fromEl, toEl) {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('fill', 'none')
  path.setAttribute('stroke', '#000')
  path.setAttribute('stroke-width', 1)
  path.setAttribute('transform', 'translate(-7, -7)')

  const fromPoint = fromEl.getBoundingClientRect()
  const toPoint = toEl.getBoundingClientRect()
  const fromX = fromPoint.left + fromPoint.width / 2
  const fromY = fromPoint.top + fromPoint.height / 2
  const toX = toPoint.left + toPoint.width / 2
  const toY = toPoint.top + toPoint.height / 2
  path.setAttribute('d', `M ${fromX} ${fromY} C ${fromX + 100} ${fromY} ${toX - 100} ${toY} ${toX} ${toY}`)

  parentSvg.appendChild(path)
}

function renderSvg() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('width', 800)
  svg.setAttribute('height', 600)
  svg.style.userSelect = 'none'
  document.body.appendChild(svg)
  return svg
}

function renderForeignObject(svgNode, children) {
  const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject')
  foreignObject.setAttribute('width', 80)
  foreignObject.setAttribute('height', 35)
  foreignObject.setAttribute('x', 10)
  foreignObject.setAttribute('y', 15)
  const div = document.createElement('div')
  Object.assign(div.style, {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  })
  children = Array.isArray(children) ? children : [children]
  children.forEach((el) => div.appendChild(el))
  foreignObject.appendChild(div)
  svgNode.appendChild(foreignObject)
}

async function renderApp(initialModules, initialPatchCables) {
  const audioContext = new AudioContext()
  const svg = renderSvg()
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

      const svgNode = renderModule(svg, module.id, module.x, module.y, mod.label || module.type.name, mod.inputs.length)

      if (mod.render) {
        renderForeignObject(svgNode, mod.render())
      }

      svgNode.addEventListener('pointerdown', (e) => onPointerDown(mod, e))

      return {
        id: module.id,
        ...mod,
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
