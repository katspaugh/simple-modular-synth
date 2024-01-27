import { renderGraph } from './flow.js'
import { Sidebar } from './components/Sidebar.js'
import { Range } from './components/Range.js'
import { getHashData, setHashData } from './hash.js'
import * as allModules from './modules.js'

function initWebAudio() {
  const audioContext = new AudioContext()

  document.addEventListener('click', (e) => {
    if (audioContext.state === 'suspended') {
      audioContext.resume()
    }
  })

  return audioContext
}

async function renderApp(initialData) {
  const audioContext = initWebAudio()
  const appContainer = document.querySelector('#app')
  const sidebar = Sidebar()
  appContainer.appendChild(sidebar.container)

  let _modules = []
  let _connections = []

  const findModule = (id) => _modules.find((m) => m.id === id)

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
      children: mod.render ? mod.render() : null,
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
      modules: _modules.map(({ id, type, x, y }) => ({ id, type, x, y })),
      connections: _connections,
    }
    setHashData(data)
  }

  const updateConnection = (inputId, outputId, disconnect = false) => {
    const [inputModuleId, inputIndex] = inputId.split('-input-')
    const outputModuleId = outputId.split('-output')[0]
    const inputModule = findModule(inputModuleId)
    const outputModule = findModule(outputModuleId)
    if (!inputModule || !outputModule) {
      throw new Error(`Module not found: ${inputModuleId} or ${outputModuleId}`)
    }
    const output = outputModule.output()
    const input = inputModule.inputs[inputIndex]()
    if (disconnect) {
      output.disconnect(input)
      _connections = _connections.filter((c) => c.from !== outputId || c.to !== inputId)
    } else {
      output.connect(input)
      _connections.push({ from: outputId, to: inputId })
    }
    updateUrl()
  }

  const onConnect = (inputId, outputId) => {
    updateConnection(inputId, outputId)
  }

  const onDisconnect = (inputId, outputId) => {
    updateConnection(inputId, outputId, true)
  }

  const onAddModule = async (module) => {
    const mod = await createModule(module)
    _modules.push(mod)
    updateUrl()
    return mod
  }

  const onRemoveModule = (id) => {
    const module = findModule(id)
    if (!module) return
    module.output().disconnect()
    module.inputs.forEach((input) => {
      const inputNode = input()
      inputNode.disconnect && inputNode.disconnect()
    })
    _modules = _modules.filter((m) => m.id !== id)
    _connections = _connections.filter((c) => c.from.split('-output')[0] !== id && c.to.split('-input')[0] !== id)
    updateUrl()
  }

  const onMove = (id, x, y) => {
    const module = findModule(id)
    if (!module) return
    module.x = x
    module.y = y
    updateUrl()
  }

  const onModuleSelect = (id) => {
    const module = findModule(id)
    sidebar.render(module)
  }

  const graph = renderGraph({
    appContainer,
    allModuleNames: Object.keys(allModules),
    onConnect,
    onDisconnect,
    onAddModule,
    onRemoveModule,
    onMove,
    onModuleSelect,
  })

  _modules = await Promise.all(initialData.modules.map(onAddModule))

  initialData.connections.forEach((cable) => {
    const fromEl = document.querySelector(`#${cable.from}`)
    const toEl = document.querySelector(`#${cable.to}`)
    graph.renderPatchCable(fromEl, toEl)
    onConnect(cable.to, cable.from)
  })
}

// Initialize app
renderApp(getHashData() || { modules: [{ id: 'speakers-0', x: 700, y: 50, type: 'speakers' }], connections: [] })
