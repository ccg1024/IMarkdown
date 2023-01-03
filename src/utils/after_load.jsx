export const toggleView = async (_event, value) => {
  if (value === 1) {  // just show preview part
    const t0 = document.getElementById("content_root")
    const t1 = document.getElementById("editor_Box")
    const t2 = document.getElementById("preview-scroll")

    t0.style.display = 'block'
    t1.style.display = 'none'
    t2.style.display = 'block'
    t2.style.width = "70%"
    t2.style.margin = "auto"
  } else if (value === 2) {  // just show editor part
    const t0 = document.getElementById("content_root")
    const t1 = document.getElementById("editor_Box")
    const t2 = document.getElementById("preview-scroll")

    t0.style.display = 'block'
    t1.style.display = 'block'
    t1.style.width = "70%"
    t1.style.margin = "auto"
    t2.style.display = 'none'
  } else if (value === 0) {  // show normal view, left editor, right preview
    const t0 = document.getElementById("content_root")
    const t1 = document.getElementById("editor_Box")
    const t2 = document.getElementById("preview-scroll")

    t0.style.display = 'grid'
    t1.style.display = 'block'
    t1.style.width = "100%"
    t1.style.margin = "0"
    t2.style.display = 'block'
    t2.style.width = "100%"
    t2.style.margin = '0'
  }
}
