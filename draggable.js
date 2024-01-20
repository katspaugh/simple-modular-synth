export function makeDraggable(element, onDrag, onStart, onEnd, threshold = 3) {
  if (!element) return () => void 0

  let unsubscribeDocument = () => void 0

  const onPointerDown = (event) => {
    if (event.currentTarget !== event.target) return

    event.preventDefault()
    event.stopPropagation()

    let startX = event.clientX
    let startY = event.clientY
    let isDragging = false

    const onPointerMove = (event) => {
      event.preventDefault()
      event.stopPropagation()

      const x = event.clientX
      const y = event.clientY
      const dx = x - startX
      const dy = y - startY

      if (isDragging || Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
        const rect = element.getBoundingClientRect()
        const { left, top } = rect

        if (!isDragging) {
          onStart?.(startX - left, startY - top)
          isDragging = true
        }

        onDrag(dx, dy, x - left, y - top)

        startX = x
        startY = y
      }
    }

    const onPointerUp = () => {
      if (isDragging) {
        onEnd?.()
      }
      unsubscribeDocument()
    }

    const onTouchMove = (event) => {
      if (isDragging) {
        event.preventDefault()
      }
    }

    document.addEventListener('pointermove', onPointerMove)
    document.addEventListener('pointerup', onPointerUp)
    document.addEventListener('touchmove', onTouchMove, { passive: false })

    unsubscribeDocument = () => {
      document.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerup', onPointerUp)
      document.removeEventListener('touchmove', onTouchMove)
    }
  }

  element.addEventListener('pointerdown', onPointerDown)

  return () => {
    unsubscribeDocument()
    element.removeEventListener('pointerdown', onPointerDown)
  }
}
