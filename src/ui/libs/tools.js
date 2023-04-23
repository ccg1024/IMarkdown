// record which line the editor should scroll to
// export let editorScrollPos = 1

export function getScrollLine(previewScrollTop) {
  let editorScrollPos = 1
  const target = document.getElementById('preview-scroll').children
  if (target.length > 0) {
    const previewBody = target[0].children
    if (previewBody.length > 0) {
      const gap = previewBody[0].offsetTop - 1
      let earlyStop = false
      for (let i = 0; i < previewBody.length; i++) {
        if (previewScrollTop - previewBody[i].offsetTop + gap <= 0) {
          const item = i > 0 ? previewBody[i - 1] : previewBody[0]
          if (item.hasAttribute('data-sourcepos')) {
            let posString = item.getAttribute('data-sourcepos')
            editorScrollPos = /^(.*?):.+$/.exec(posString)[1]
            earlyStop = true
          }
          break
        }
      }
      if (!earlyStop) {
        let posString =
          previewBody[previewBody.length - 1].getAttribute('data-sourcepos')
        editorScrollPos = /^(.*?):.+$/.exec(posString)[1]
      }
    }
  }

  return editorScrollPos
}
