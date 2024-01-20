import { renderGraph } from './flow.js'
import { initSidebar } from './sidebar.js'
import * as allModules from './modules.js'

async function renderApp(initialModules, initialPatchCables) {
  const audioContext = new AudioContext()
  const sidebar = initSidebar(document.querySelector('#sidebar'))
  let modules = []
  let connections = []

  const createModule = async ({ type, x, y, id = `${type}-${Date.now()}` }) => {
    if (!allModules[type]) {
      throw new Error(`Module not found: ${type}`)
    }

    const mod = await allModules[type](audioContext)

    graph.renderModule({
      id,
      x,
      y,
      label: mod.label || allModules[type].name,
      inputsCount: mod.inputs.length,
      children: mod.render ? mod.render() : undefined,
    })

    return {
      ...mod,
      type,
      id,
      x,
      y,
    }
  }

  const updateUrl = () => {
    const data = {
      modules: modules.map(({ id, type, x, y }) => ({ id, type, x, y })),
      connections,
    }
    window.location.hash = btoa(JSON.stringify(data))
  }

  const onConnect = (inputId, outputId) => {
    const [inputModuleId, inputIndex] = inputId.split('-input-')
    const outputModuleId = outputId.split('-output')[0]
    const inputModule = modules.find((m) => m.id === inputModuleId)
    const outputModule = modules.find((m) => m.id === outputModuleId)
    if (!inputModule || !outputModule) {
      throw new Error(`Module not found: ${inputModuleId} or ${outputModuleId}`)
    }
    outputModule.output().connect(inputModule.inputs[inputIndex]())

    connections.push({ from: outputId, to: inputId })

    updateUrl()
  }

  const onDisconnect = (inputId, outputId) => {
    const [inputModuleId, inputIndex] = inputId.split('-input-')
    const outputModuleId = outputId.split('-output')[0]
    const inputModule = modules.find((m) => m.id === inputModuleId)
    const outputModule = modules.find((m) => m.id === outputModuleId)
    if (!inputModule || !outputModule) {
      throw new Error(`Module not found: ${inputModuleId} or ${outputModuleId}`)
    }
    outputModule.output().disconnect(inputModule.inputs[inputIndex]())

    connections = connections.filter((c) => c.from !== outputId || c.to !== inputId)

    updateUrl()
  }

  const onAddModule = async (module) => {
    const mod = await createModule(module)
    modules.push(mod)
    updateUrl()
    return mod
  }

  const onMove = (id, x, y) => {
    const module = modules.find((m) => m.id === id)
    if (!module) {
      throw new Error(`Module not found: ${id}`)
    }
    module.x = x
    module.y = y
    updateUrl()
  }

  const onModuleSelect = (id) => {
    const module = modules.find((m) => m.id === id)
    sidebar.render(module)
  }

  const graph = renderGraph({
    graphContainer: document.querySelector('#graph'),
    allModuleNames: Object.keys(allModules),
    onConnect,
    onDisconnect,
    onAddModule,
    onMove,
    onModuleSelect,
  })

  modules = await Promise.all(initialModules.map(onAddModule))

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

// Initialize app
const hash = window.location.hash.slice(1)
if (hash) {
  const data = JSON.parse(atob(hash))
  renderApp(data.modules, data.connections)
} else {
  renderApp([{ id: 'speakers-0', x: 700, y: 50, type: 'speakers' }], [])
}
