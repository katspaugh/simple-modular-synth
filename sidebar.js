export function initSidebar(container) {
  return {
    render: (module) => {
      if (!module) {
        container.innerHTML = ''
        return
      }
      container.innerHTML = `<h1>${module.type}</h1><p>${module.description || ''}</p>`
    },
  }
}
