import PubSub from 'pubsub-js'
import React, {
  useEffect,
  useState,
  createElement,
  Fragment,
  useRef
} from 'react'
import { Box } from '@chakra-ui/react'
import { unified } from 'unified'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeReact from 'rehype-react'
import { useSelector } from 'react-redux'

import {
  RemarkText,
  RemarkHeading,
  RemarkQuote,
  RemarkLink,
  RemarkUl,
  RemarkOl,
  RemarkLi,
  RemarkImg,
  RemarkTable,
  RemarkThead,
  RemarkTbody,
  RemarkTr,
  RemarkTd,
  RemarkTh,
  RemarkCodePre,
  RemarkHr
} from '../components/remark-tag'
import RemarkCode from './components/remark-code'

import { selectFileContent } from '../app/reducers/fileContentSlice'

import PubSubConfig from '../../config/frontend'

import '../../static/css/preview-scroll.css'

interface Props {
  isVisible: boolean
}

interface LineDataSet {
  line: number
  endline: number
}

interface TimeoutController {
  throttleTimer: any
  debounceTimer: any
}

// global controlls
const timeoutController: TimeoutController = {
  throttleTimer: null,
  debounceTimer: null
}

function updatePreview(doc: string): React.ReactNode {
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeReact, {
      createElement,
      Fragment,
      passNode: true,
      components: {
        p: RemarkText,
        h1: RemarkHeading,
        h2: RemarkHeading,
        h3: RemarkHeading,
        h4: RemarkHeading,
        h5: RemarkHeading,
        h6: RemarkHeading,
        blockquote: RemarkQuote,
        a: RemarkLink,
        ul: RemarkUl,
        ol: RemarkOl,
        li: RemarkLi,
        table: RemarkTable,
        thead: RemarkThead,
        tbody: RemarkTbody,
        tr: RemarkTr,
        td: RemarkTd,
        th: RemarkTh,
        code: RemarkCode,
        pre: RemarkCodePre,
        img: RemarkImg,
        hr: RemarkHr
      }
    })
    .processSync(doc).result
}

const NewPreview: React.FC<Props> = React.memo(props => {
  const domRef: React.MutableRefObject<any> = useRef(null)

  useEffect(() => {
    if (props.isVisible) {
      let token2 = PubSub.subscribe(
        PubSubConfig.syncUpdateDocScroll,
        (_msg: string, cursorLine: number) => {
          let jumped = false
          for (let childDom of domRef.current.children) {
            let lineDataSet: LineDataSet = childDom.dataset
            if (
              Number(lineDataSet.line) > cursorLine ||
              Number(lineDataSet.line) === cursorLine
            ) {
              let offsetFromTop = childDom.offsetTop
              let clientHeight = domRef.current.clientHeight
              domRef.current.scrollTop = offsetFromTop - clientHeight / 2
              jumped = true
              break
            } else if (
              Number(lineDataSet.endline) &&
              Number(lineDataSet.endline) >= cursorLine
            ) {
              let totalRows = lineDataSet.endline - lineDataSet.line
              let elementHeight = childDom.offsetHeight
              let offsetStart = cursorLine - lineDataSet.line
              let offsetFromTop = childDom.offsetTop
              let clientHeight = domRef.current.clientHeight

              domRef.current.scrollTop =
                offsetFromTop -
                clientHeight / 2 +
                (elementHeight / totalRows) * offsetStart
              jumped = true
              break
            }
          }
          if (!jumped) {
            domRef.current.scrollTop = domRef.current.scrollHeight
          }
        }
      )
      return () => {
        PubSub.unsubscribe(token2)
      }
    }
  }, [props.isVisible])

  return (
    <Box
      id="live-preview"
      ref={domRef}
      overflow="auto"
      width="100%"
      paddingX={2}
      display={props.isVisible ? 'block' : 'none'}
    >
      {props.isVisible && <PresentRehype />}
    </Box>
  )
})

const PresentRehype: React.FC = () => {
  const [content, setContent] = useState<React.ReactNode>()
  const doc = useSelector(selectFileContent)

  useEffect(() => {
    if (timeoutController.debounceTimer) {
      clearTimeout(timeoutController.debounceTimer)
    }

    timeoutController.debounceTimer = setTimeout(() => {
      const md = updatePreview(doc)
      setContent(<>{md}</>)
    }, 300)
  }, [doc])
  return <>{content}</>
}

export default NewPreview
