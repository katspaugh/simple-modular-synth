import {
  renderSvg,
  renderModule,
  renderPatchCable,
  renderContent,
  dragModule,
  setPatchCablePosition,
  renderDatalist,
} from './render.js'

export function renderGraph(graphContainer, allModuleNames, onConnect, onAddModule) {
  const svg = renderSvg(graphContainer)
  const _nodes = []
  const _edges = []
  let currentOutput
  let currentInput

  const onPointerDown = (node, e) => {
    const id = e.target.getAttribute('id')
    if (!id) return

    if (currentOutput) {
      currentOutput.element.classList.remove('active')
    }

    if (currentInput) {
      currentInput.element.classList.remove('active')
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
      api.renderPatchCable(currentOutput.element, currentInput.element)
      onConnect(currentInput.element.id, currentOutput.element.id)
      currentInput = null
      currentOutput = null
    } else {
      e.target.classList.add('active')
    }
  }

  const api = {
    renderModule: ({ id, x, y, inputsCount, label, children }) => {
      const [container, inputs, output, labelEl] = renderModule(graphContainer, id, x, y, label, inputsCount)

      if (children) {
        renderContent(container, children)
      }

      const node = {
        id,
        container,
        inputs,
        output,
        label: labelEl,
      }

      container.addEventListener('pointerdown', (e) => onPointerDown(node, e))

      dragModule(container, () => {
        const movedEdges = _edges.filter(
          (e) => inputs.includes(e.fromEl) || inputs.includes(e.toEl) || e.fromEl === output || e.toEl === output,
        )

        movedEdges.forEach((edge) => {
          setPatchCablePosition(edge.path, edge.fromEl, edge.toEl)
        })
      })

      _nodes.push(node)

      return node
    },

    renderPatchCable: (fromEl, toEl) => {
      const path = renderPatchCable(svg, fromEl, toEl)
      _edges.push({
        path,
        fromEl,
        toEl,
      })
    },

    removeModule(id) {
      const node = _nodes.find((n) => n.id === id)
      if (!node) return

      node.container.remove()
      _nodes.splice(_nodes.indexOf(node), 1)

      const { inputs, output } = node
      const nodeEdges = _edges.filter(
        (e) => inputs.includes(e.fromEl) || inputs.includes(e.toEl) || e.fromEl === output || e.toEl === output,
      )

      nodeEdges.forEach((edge) => {
        edge.path.remove()
        _edges.splice(_edges.indexOf(edge), 1)
      })
    },
  }

  let isAdding
  graphContainer.addEventListener(
    'click',
    (e) => {
      if (e.target !== graphContainer) return
      if (isAdding) return
      isAdding = true

      const id = `module-${Math.random().toString(36).slice(2)}`
      const x = e.clientX - graphContainer.offsetLeft
      const y = e.clientY - graphContainer.offsetTop
      const datalist = renderDatalist(allModuleNames)
      datalist.id = 'modules'
      const node = api.renderModule({ id, x, y, inputsCount: 0, label: '', children: datalist })

      node.label.setAttribute('list', datalist.id)
      node.label.focus()

      node.label.addEventListener('input', () => {
        if (allModuleNames.includes(node.label.value.trim())) {
          onAddModule({ type: node.label.value, x, y })
          api.removeModule(id)
          isAdding = false
        }
      })

      node.label.addEventListener('blur', () => {
        setTimeout(() => {
          if (isAdding) {
            api.removeModule(id)
            isAdding = false
          }
        }, 100)
      })
    },
    { capture: true },
  )

  return api
}
