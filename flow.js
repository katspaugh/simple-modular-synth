import {
  renderSvg,
  renderModule,
  renderPatchCable,
  renderContent,
  dragModule,
  setPatchCablePosition,
} from './render.js'

export function renderGraph(graphContainer, onConnect) {
  const svg = renderSvg(graphContainer)
  let currentOutput
  let currentInput

  const onPointerDown = (node, e) => {
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
        input: node.inputs[inputIndex],
      }
    }

    if (id.includes('output')) {
      currentOutput = {
        element: e.target,
        output: node.output,
      }
    }

    if (currentInput && currentOutput) {
      renderPatchCable(svg, currentOutput.element, currentInput.element)
      onConnect(currentInput.element.id, currentOutput.element.id)
      currentInput = null
      currentOutput = null
    } else {
      e.target.style.fill = '#f00'
    }
  }

  const nodes = []
  const edges = []

  return {
    renderModule: ({ id, x, y, inputsCount, label, children }) => {
      const [container, inputs, output] = renderModule(graphContainer, id, x, y, label, inputsCount)

      if (children) {
        renderContent(container, children)
      }

      const node = {
        id,
        container,
        inputs,
        output,
      }

      container.addEventListener('pointerdown', (e) => onPointerDown(node, e))

      dragModule(container, () => {
        const movedEdges = edges.filter(
          (e) => inputs.includes(e.fromEl) || inputs.includes(e.toEl) || e.fromEl === output || e.toEl === output,
        )

        movedEdges.forEach((edge) => {
          setPatchCablePosition(edge.path, edge.fromEl, edge.toEl)
        })
      })

      nodes.push(node)
    },

    renderPatchCable: (fromEl, toEl) => {
      const path = renderPatchCable(svg, fromEl, toEl)
      edges.push({
        path,
        fromEl,
        toEl,
      })
    },
  }
}
