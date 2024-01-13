import { makeDraggable } from './draggable.js'

export function renderModule(parentEl, id, x, y, label, numInputs = 0) {
  const div = document.createElement('div')
  div.className = 'module'
  Object.assign(div.style, {
    left: `${x}px`,
    top: `${y}px`,
  })

  // Render label
  if (label) {
    const span = document.createElement('span')
    span.textContent = label
    div.appendChild(span)
  }

  // Render inputs
  for (let i = 0; i < numInputs; i++) {
    const button = document.createElement('button')
    Object.assign(button.style, {
      left: '-5px',
      top: `${(i + 1) * 20}px`,
    })
    button.setAttribute('id', `module-${id}-input-${i}`)
    div.appendChild(button)
  }

  // Render output
  const button = document.createElement('button')
  Object.assign(button.style, {
    right: '-5px',
    top: '50%',
    transform: 'translateY(-50%)',
  })
  button.setAttribute('id', `module-${id}-output`)
  div.appendChild(button)

  parentEl.appendChild(div)

  return div
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
  svg.setAttribute('width', '100%')
  svg.setAttribute('height', '100%')
  const width = window.innerWidth
  const height = window.innerHeight
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
  svg.setAttribute('preserveAspectRatio', 'none')
  svg.setAttribute('pointer-events', 'none')
  parentEl.appendChild(svg)
  return svg
}

export function renderPatchCable(parentSvg, fromEl, toEl) {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  const fromPoint = fromEl.getBoundingClientRect()
  const toPoint = toEl.getBoundingClientRect()
  const fromX = fromPoint.left + fromPoint.width / 2
  const fromY = fromPoint.top + fromPoint.height / 2
  const toX = toPoint.left + toPoint.width / 2
  const toY = toPoint.top + toPoint.height / 2
  path.setAttribute('d', `M ${fromX} ${fromY} C ${fromX + 100} ${fromY} ${toX - 100} ${toY} ${toX} ${toY}`)

  parentSvg.appendChild(path)
}

export function renderContent(parentEl, children) {
  children = Array.isArray(children) ? children : [children]
  children.forEach((el) => parentEl.appendChild(el))
}
