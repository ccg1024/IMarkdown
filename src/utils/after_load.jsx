export const toggleView = async (_event, value) => {
  if (value === 1) {  // just show preview part
    const t1 = document.getElementById("editor_Box")
    const t2 = document.getElementById("preview-scroll")

    t1.style.display = 'none'
    t2.style.display = 'block'
  } else if (value === 2) {  // just show editor part
    const t1 = document.getElementById("editor_Box")
    const t2 = document.getElementById("preview-scroll")

    t1.style.display = 'block'
    t2.style.display = 'none'
  }
}
