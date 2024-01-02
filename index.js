function oscillator(audioContext, initialFrequency = 440, type = 'sine') {
  const oscillator = audioContext.createOscillator()
  let started = false
  oscillator.type = type
  oscillator.frequency.value = initialFrequency

  return {
    inputs: [
      (frequency) => {
        console.log('frequency', frequency)
        if (frequency.connect) {
          frequency.connect(oscillator.frequency)
        } else {
          oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
        }
      },
      (type) => {
        oscillator.type = type
      },
    ],
    output: (input) => {
      input(oscillator)
      if (!started) {
        started = true
        oscillator.start()
      }
    },
  }
}

function lfo(audioContext) {
  return oscillator(audioContext, 100, 'triangle')
}

function pulse() {
  let delay = 300

  const setTimer = (callback) => {
    callback()
    setTimeout(() => setTimer(callback), delay)
  }

  return {
    inputs: [(newDelay) => (delay = newDelay)],
    output: (destination) => {
      setTimer(destination)
    },
  }
}

function trigger() {
  const callbacks = []

  return {
    render: (svgNode) => {
      const button = document.createElement('button')
      const bbox = svgNode.getBoundingClientRect()
      button.addEventListener('click', () => {
        callbacks.forEach((callback) => callback())
      })
      Object.assign(button.style, {
        width: '60px',
        position: 'absolute',
        zIndex: 100,
        top: `${bbox.top + 15}px`,
        left: `${bbox.left + 20}px`,
      })
      button.textContent = 'Trigger'
      document.body.appendChild(button)
    },

    inputs: [],

    output: (destination) => {
      callbacks.push(destination)
    },
  }
}

function envelope(audioContext) {
  let attack = 0
  let decay = 0.3
  let sustain = 0.5
  let release = 0.2

  const gainNode = audioContext.createGain()
  gainNode.gain.value = 0

  return {
    inputs: [
      () => {
        console.log('trigger')
        const now = audioContext.currentTime
        gainNode.gain.cancelScheduledValues(now)
        gainNode.gain.setValueAtTime(0, now)
        gainNode.gain.linearRampToValueAtTime(1, now + attack)
        gainNode.gain.linearRampToValueAtTime(sustain, now + attack + decay)
        gainNode.gain.linearRampToValueAtTime(0, now + attack + decay + release)
      },
      (newAttack, newDecay, newSustain, newRelease) => {
        attack = newAttack
        decay = newDecay
        sustain = newSustain
        release = newRelease
      },
    ],
    output: (destination) => {
      destination(gainNode)
    },
  }
}

function vca(audioContext) {
  const gainNode = audioContext.createGain()
  gainNode.gain.value = 1
  let envelopeGain = gainNode
  let out

  return {
    inputs: [
      (node) => {
        node.connect(gainNode)
      },
      (envelope) => {
        gainNode.disconnect()
        envelopeGain = envelope
        gainNode.connect(envelope)
        if (out) {
          out(envelope)
        }
      },
    ],
    output: (destination) => {
      out = destination
      destination(envelopeGain)
    },
  }
}

function speakers(audioContext) {
  return {
    inputs: [
      (node) => {
        node.connect(audioContext.destination)
      },
    ],
    output: (destination) => destination(audioContext.destination),
  }
}

function random() {
  const callbacks = []

  const trigger = () => {
    const rand = Math.round(Math.random() * 1000)
    callbacks.forEach((callback) => callback(rand))
  }

  return {
    inputs: [trigger],
    output: (destination) => {
      callbacks.push(destination)
      trigger()
    },
  }
}

function cv() {
  let value = 100
  let callback

  return {
    render: (svgNode) => {
      const input = document.createElement('input')
      const bbox = svgNode.getBoundingClientRect()
      input.addEventListener('input', () => {
        value = Number(input.value)
        if (callback) {
          callback(value)
        }
      })
      Object.assign(input.style, {
        width: '60px',
        position: 'absolute',
        zIndex: 100,
        top: `${bbox.top + 15}px`,
        left: `${bbox.left + 20}px`,
      })
      input.placeholder = value.toString()
      document.body.appendChild(input)
    },
    inputs: [(newValue) => (value = newValue)],
    output: (destination) => {
      callback = destination
      destination(value)
    },
  }
}

function renderModule(parentSvg, x, y, label, numInputs = 0) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')

  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  rect.setAttribute('width', 100)
  rect.setAttribute('height', 50)
  rect.setAttribute('fill', '#fff')
  rect.setAttribute('stroke', '#000')
  rect.setAttribute('stroke-width', 1)
  rect.setAttribute('x', x)
  rect.setAttribute('y', y)
  g.appendChild(rect)

  // Render label
  if (label) {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    text.setAttribute('x', x + 50)
    text.setAttribute('y', y + 25)
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
    circle.setAttribute('cx', x)
    circle.setAttribute('cy', y + 25 + i * 10)
    circle.setAttribute('r', 5)
    circle.setAttribute('fill', '#fff')
    circle.setAttribute('stroke', '#000')
    circle.setAttribute('stroke-width', 1)
    g.appendChild(circle)
  }

  // Render output
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  circle.setAttribute('name', 'output')
  circle.setAttribute('cx', x + 100)
  circle.setAttribute('cy', y + 25)
  circle.setAttribute('r', 5)
  circle.setAttribute('fill', '#fff')
  circle.setAttribute('stroke', '#000')
  circle.setAttribute('stroke-width', 1)
  g.appendChild(circle)

  parentSvg.appendChild(g)
  return g
}

function renderPatchCable(parentSvg, fromEl, toEl) {
  const curve = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  curve.setAttribute('fill', 'none')
  curve.setAttribute('stroke', '#000')
  curve.setAttribute('stroke-width', 1)
  curve.setAttribute(
    'd',
    `M ${fromEl.getAttribute('cx')} ${fromEl.getAttribute('cy')} C ${fromEl.getAttribute('cx')} ${toEl.getAttribute(
      'cy',
    )} ${toEl.getAttribute('cx')} ${fromEl.getAttribute('cy')} ${toEl.getAttribute('cx')} ${toEl.getAttribute('cy')}`,
  )
  parentSvg.appendChild(curve)
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
    { x: 250, y: 1, type: pulse },
    { x: 400, y: 1, type: pulse },
    { x: 550, y: 1, type: trigger },
    { x: 250, y: 100, type: envelope },
    { x: 400, y: 100, type: envelope },
    { x: 250, y: 200, type: vca },
    { x: 400, y: 200, type: vca },
    { x: 450, y: 300, type: speakers },
    { x: 100, y: 400, type: cv },
    { x: 250, y: 400, type: cv },
    { x: 400, y: 400, type: random },
  ]

  modules.forEach((module) => {
    const io = module.type(audioContext)

    const svgNode = renderModule(svg, module.x, module.y, module.type.name, io.inputs.length)

    if (io.render) {
      io.render(svgNode)
    }

    svgNode.addEventListener('mousedown', (e) => {
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
        currentOutput.output(currentInput.input)
        currentInput = null
        currentOutput = null
      }
    })
  })
}

renderApp()
