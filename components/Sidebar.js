export function Sidebar() {
  const div = document.createElement('div')
  div.className = 'sidebar'

  return {
    container: div,

    render: ({ type, description }) => {
      if (!type) {
        div.innerHTML = ''
        return
      }
      div.innerHTML = `<h1>${type}</h1><p>${description || ''}</p>`
    },
  }
}
