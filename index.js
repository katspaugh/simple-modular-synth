import { oscillator } from './modules/oscillator.js'
import { lfo } from './modules/lfo.js'
import { clock } from './modules/clock.js'
import { envelope } from './modules/adsr.js'
import { vca } from './modules/vca.js'
import { speakers } from './modules/speakers.js'
import { cv } from './modules/cv.js'
import { noise } from './modules/white-noise.js'

function renderModule(parentSvg, x, y, label, numInputs = 0) {
  const { width, height } = parentSvg.getBoundingClientRect()
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  g.setAttribute('transform', `translate(${x}, ${y})`)

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
    circle.setAttribute('name', `input-${i}`)
    circle.setAttribute('cx', 0)
    circle.setAttribute('cy', 25 + i * 10)
    circle.setAttribute('r', 5)
    circle.setAttribute('fill', '#fff')
    circle.setAttribute('stroke', '#000')
    circle.setAttribute('stroke-width', 1)
    g.appendChild(circle)
  }

  // Render output
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  circle.setAttribute('name', 'output')
  circle.setAttribute('cx', 100)
  circle.setAttribute('cy', 25)
  circle.setAttribute('r', 5)
  circle.setAttribute('fill', '#fff')
  circle.setAttribute('stroke', '#000')
  circle.setAttribute('stroke-width', 1)
  g.appendChild(circle)

  parentSvg.appendChild(g)
  return g
}

function renderPatchCable(parentSvg, fromEl, toEl) {
  const fromPoint = fromEl.getBoundingClientRect()
  const toPoint = toEl.getBoundingClientRect()
  const fromX = fromPoint.left + fromPoint.width / 2
  const fromY = fromPoint.top + fromPoint.height / 2
  const toX = toPoint.left + toPoint.width / 2
  const toY = toPoint.top + toPoint.height / 2
  // Create a bezier curve from the center of the from circle to the center of the to circle
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('d', `M ${fromX} ${fromY} C ${fromX + 100} ${fromY} ${toX - 100} ${toY} ${toX} ${toY}`)
  path.setAttribute('fill', 'none')
  path.setAttribute('stroke', '#000')
  path.setAttribute('stroke-width', 1)
  path.setAttribute('transform', 'translate(-7, -7)')
  parentSvg.appendChild(path)
}

function renderSvg() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('width', 800)
  svg.setAttribute('height', 600)
  document.body.appendChild(svg)
  return svg
}

function renderApp() {
  const audioContext = new AudioContext()
  const svg = renderSvg()
  let currentOutput
  let currentInput

  const modules = [
    { x: 100, y: 50, type: oscillator },
    { x: 100, y: 150, type: lfo },
    { x: 250, y: 1, type: clock },
    { x: 400, y: 1, type: clock },
    { x: 250, y: 100, type: envelope },
    { x: 400, y: 100, type: envelope },
    { x: 250, y: 200, type: vca },
    { x: 400, y: 200, type: vca },
    { x: 450, y: 300, type: speakers },
    { x: 100, y: 400, type: cv },
    { x: 250, y: 400, type: cv },
    { x: 400, y: 400, type: noise },
  ]

  modules.forEach((module) => {
    const io = module.type(audioContext)

    const svgNode = renderModule(svg, module.x, module.y, module.type.name, io.inputs.length)

    if (io.render) {
      io.render(svgNode)
    }

    svgNode.addEventListener('pointerdown', (e) => {
      const name = e.target.getAttribute('name')
      if (!name) return

      if (name.startsWith('input')) {
        const inputIndex = name.split('-')[1]
        currentInput = {
          element: e.target,
          input: io.inputs[inputIndex],
        }
      }

      if (name === 'output') {
        currentOutput = {
          element: e.target,
          output: io.output,
        }
      }

      if (currentInput && currentOutput) {
        renderPatchCable(svg, currentOutput.element, currentInput.element)
        currentInput.input(currentOutput.output())
        currentInput = null
        currentOutput = null
      }
    })
  })
}

renderApp()
