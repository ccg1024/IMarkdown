// add node.js process to renderer global
import process from 'process'

// in broswer.js, the `global` is equal to `window`
// and the `global.process` is undefined
if (typeof global === 'undefined' || typeof global.process === 'undefined') {
  window.global = window
  window.process = process
}
