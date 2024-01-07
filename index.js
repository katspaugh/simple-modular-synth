import { oscillator } from './modules/oscillator.js'
import { lfo } from './modules/lfo.js'
import { clock } from './modules/clock.js'
import { envelope } from './modules/adsr.js'
import { vca } from './modules/vca.js'
import { speakers } from './modules/speakers.js'
import { cv } from './modules/cv.js'
import { noise } from './modules/white-noise.js'
import { lowpass } from './modules/lowpass.js'
import { highpass } from './modules/highpass.js'

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
    text.setAttribute('y', 25)
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

      const svgNode = renderModule(svg, module.id, module.x, module.y, module.type.name, mod.inputs.length)

      if (mod.render) {
        mod.render(svgNode)
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
    { id: '0', x: 100, y: 50, type: oscillator },
    { id: '1', x: 100, y: 150, type: lfo },
    { id: '2', x: 250, y: 1, type: clock },
    { id: '3', x: 400, y: 1, type: clock },
    { id: '4', x: 250, y: 100, type: envelope },
    { id: '5', x: 400, y: 100, type: envelope },
    { id: '6', x: 250, y: 200, type: vca },
    { id: '7', x: 400, y: 200, type: vca },
    { id: '8', x: 300, y: 300, type: lowpass },
    { id: '9', x: 450, y: 300, type: speakers },
    { id: '10', x: 100, y: 400, type: cv },
    { id: '11', x: 250, y: 400, type: cv },
    { id: '12', x: 400, y: 400, type: noise },
    { id: '13', x: 150, y: 300, type: highpass },
  ],
  [
    { from: '0-output', to: '8-input-0' },
    { from: '8-output', to: '7-input-0' },
    { from: '5-output', to: '7-input-1' },
    { from: '7-output', to: '9-input-0' },
    { from: '2-output', to: '5-input-0' },
  ],
)
