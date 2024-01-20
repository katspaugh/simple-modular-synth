import { makeDraggable } from './draggable.js'

export function renderModule(parentEl, id, x, y, label, numInputs = 0) {
  const div = document.createElement('div')
  div.className = 'module'
  Object.assign(div.style, {
    left: `${x}px`,
    top: `${y}px`,
  })

  // Render label
  const input = document.createElement('input')
  if (label) {
    input.value = label
    input.setAttribute('readonly', 'readonly')
  }
  div.appendChild(input)

  // Render inputs
  const inputs = []
  for (let i = 0; i < numInputs; i++) {
    const button = document.createElement('button')
    Object.assign(button.style, {
      left: '0',
      top: `${i * 20 + 8}px`,
    })
    button.setAttribute('id', `${id}-input-${i}`)
    div.appendChild(button)
    inputs.push(button)
  }

  // Render output
  const button = document.createElement('button')
  Object.assign(button.style, {
    left: '100%',
    top: '50%',
    transform: 'translateY(-50%)',
  })
  button.setAttribute('id', `${id}-output`)
  div.appendChild(button)

  parentEl.appendChild(div)

  return [div, inputs, button, input]
}

export function dragModule(moduleEl, onDrag) {
  const bbox = moduleEl.getBoundingClientRect()
  let { left, top } = bbox
  makeDraggable(moduleEl, (dx, dy) => {
    left += dx
    top += dy
    Object.assign(moduleEl.style, {
      left: `${left}px`,
      top: `${top}px`,
    })
    onDrag(left, top)
  })
}

export function renderSvg(parentEl) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  const width = parentEl.offsetWidth
  const height = parentEl.offsetHeight
  svg.setAttribute('width', `${width}px`)
  svg.setAttribute('height', `${height}px`)
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
  svg.setAttribute('preserveAspectRatio', 'none')
  svg.setAttribute('pointer-events', 'none')
  parentEl.appendChild(svg)
  return svg
}

export function setPatchCablePosition(path, fromEl, toEl) {
  const fromPoint = fromEl.getBoundingClientRect()
  const toPoint = toEl.getBoundingClientRect()
  const fromX = fromPoint.left + fromPoint.width / 2
  const fromY = fromPoint.top + fromPoint.height / 2
  const toX = toPoint.left + toPoint.width / 2
  const toY = toPoint.top + toPoint.height / 2
  path.setAttribute('d', `M ${fromX} ${fromY} C ${fromX + 100} ${fromY} ${toX - 100} ${toY} ${toX} ${toY}`)
}

export function renderPatchCable(parentSvg, fromEl, toEl) {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  setPatchCablePosition(path, fromEl, toEl)
  parentSvg.appendChild(path)
  return path
}

export function renderContent(parentEl, children) {
  children = Array.isArray(children) ? children : [children]
  children.forEach((el) => parentEl.appendChild(el))
}

export function renderDatalist(options) {
  const datalist = document.createElement('datalist')
  options.forEach((option) => {
    const optionEl = document.createElement('option')
    optionEl.setAttribute('value', option)
    datalist.appendChild(optionEl)
  })
  return datalist
}
