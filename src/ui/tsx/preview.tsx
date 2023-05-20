import _ from 'lodash'
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
import { IScrollInfo } from './types/render'

import '../../static/css/preview-scroll.css'

interface Props {
  isVisible: boolean
}

interface LineDataSet extends DOMStringMap {
  line: string
  endline: string
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
  const domRef: React.MutableRefObject<HTMLDivElement> = useRef()

  useEffect(() => {
    if (props.isVisible) {
      let token2 = PubSub.subscribe(
        PubSubConfig.syncUpdateDocScroll,
        (_msg: string, scrollInfo: IScrollInfo) => {
          if (scrollInfo.line === -1) {
            domRef.current.scrollTop = 0
          } else {
            const parentOffsetTop = domRef.current.getBoundingClientRect().top
            for (
              let childDomIndx = 0;
              childDomIndx < domRef.current.children.length;
              childDomIndx++
            ) {
              let childDom = domRef.current.children[
                childDomIndx
              ] as HTMLElement
              let lineDataSet = childDom.dataset as LineDataSet
              if (
                Number(lineDataSet.line) > scrollInfo.line ||
                Number(lineDataSet.line) === scrollInfo.line
              ) {
                let offsetFromTop = childDom.offsetTop
                if (scrollInfo.percent && !lineDataSet.endline) {
                  offsetFromTop += childDom.offsetHeight * scrollInfo.percent
                }
                domRef.current.scrollTop = offsetFromTop - parentOffsetTop
                break
              } else if (
                Number(lineDataSet.endline) &&
                Number(lineDataSet.endline) >= scrollInfo.line
              ) {
                let totalRows =
                  Number(lineDataSet.endline) - Number(lineDataSet.line) + 1
                let elementHeight = childDom.offsetHeight
                let offsetStart = scrollInfo.line - Number(lineDataSet.line)
                let offsetFromTop = childDom.offsetTop

                domRef.current.scrollTop =
                  offsetFromTop -
                  parentOffsetTop +
                  (elementHeight / totalRows) * offsetStart
                break
              } else if (childDomIndx === domRef.current.children.length - 1) {
                domRef.current.scrollTop = childDom.offsetTop - parentOffsetTop
              }
            }
          }
        }
      )

      const paddingToken = PubSub.subscribe(
        PubSubConfig.updatePaddingChannel,
        (_mst: string, data: string) => {
          if (data) {
            const previewBottom = document.querySelector(
              '#preview-bottom'
            ) as HTMLDivElement
            previewBottom.style.paddingBottom = data
          }
        }
      )

      return () => {
        PubSub.unsubscribe(token2)
        PubSub.unsubscribe(paddingToken)
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
      <Box id="preview-bottom"></Box>
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
