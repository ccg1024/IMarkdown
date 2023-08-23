import { Box } from '@chakra-ui/react'
import { EditorView } from '@codemirror/view'
import {
  useRef,
  UIEvent,
  ForwardRefRenderFunction,
  forwardRef,
  useImperativeHandle
} from 'react'

import { useEditor } from '../hooks/useEditor'

interface EditorProps {
  isVisible: boolean
}
interface Controller {
  scrollBarTimer: NodeJS.Timeout | null
}
export interface EditorRef {
  getDoc: () => string
  getEditor: () => EditorView
}

const controller: Controller = {
  scrollBarTimer: null
}

const InternalEditor: ForwardRefRenderFunction<EditorRef, EditorProps> = (
  props,
  ref
): JSX.Element => {
  const { isVisible } = props
  const containerRef = useRef<HTMLDivElement>(null)
  const editor = useEditor(containerRef)

  const handleEditorScroll = (e: UIEvent) => {
    if (controller.scrollBarTimer) {
      clearTimeout(controller.scrollBarTimer)
    }
    const target = e.target as HTMLDivElement
    if (target && target.classList.contains('is-scroll') === false) {
      target.classList.add('is-scroll')
    }
    controller.scrollBarTimer = setTimeout(() => {
      if (target) {
        target.classList.remove('is-scroll')
      }
    }, 1000)
  }

  useImperativeHandle(
    ref,
    () => {
      return {
        getDoc() {
          return editor?.state.doc.toString()
        },
        getEditor() {
          return editor
        }
      }
    },
    [editor]
  )

  return (
    <Box
      overflow="auto"
      width="100%"
      height="100%"
      id="editor_box"
      display={isVisible ? 'block' : 'none'}
    >
      <Box display="flex" flexDirection="column" height="100%" width="100%">
        <Box
          ref={containerRef}
          flexGrow={1}
          overflow="auto"
          pl={4}
          onScrollCapture={handleEditorScroll}
        ></Box>
      </Box>
    </Box>
  )
}

const Editor = forwardRef<EditorRef, EditorProps>(InternalEditor)

export default Editor
