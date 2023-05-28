import _ from 'lodash'
import PubSub from 'pubsub-js'
import { Box } from '@chakra-ui/react'
import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  createElement,
  Fragment,
  UIEventHandler
} from 'react'
import { unified } from 'unified'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeReact from 'rehype-react'
import { useSelector } from 'react-redux'

import * as remarkTags from './remark-tags'
import RemarkCode from './remark-code'
import pubsubConfig from '../../config/pubsub.config'
import { LiveScroll } from '../../types/renderer'
import { selectFileContent } from '../app/reducers/fileContentSlice'
import '../css/preview.css'

interface Props {
  isVisible: boolean
}

interface LineDataSet extends DOMStringMap {
  line: string
  endline: string
}

interface TimeoutContronl {
  debounceTimer: NodeJS.Timeout | null
  throttleTimer: NodeJS.Timeout | null
}
const timeoutContronl: TimeoutContronl = {
  debounceTimer: null,
  throttleTimer: null
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
        p: remarkTags.RemarkText,
        h1: remarkTags.RemarkHeading,
        h2: remarkTags.RemarkHeading,
        h3: remarkTags.RemarkHeading,
        h4: remarkTags.RemarkHeading,
        h5: remarkTags.RemarkHeading,
        h6: remarkTags.RemarkHeading,
        blockquote: remarkTags.RemarkQuote,
        a: remarkTags.RemarkLink,
        ul: remarkTags.RemarkUl,
        ol: remarkTags.RemarkOl,
        li: remarkTags.RemarkLi,
        table: remarkTags.RemarkTable,
        thead: remarkTags.RemarkThead,
        tbody: remarkTags.RemarkTbody,
        tr: remarkTags.RemarkTr,
        td: remarkTags.RemarkTd,
        th: remarkTags.RemarkTh,
        code: RemarkCode,
        pre: remarkTags.RemarkCodePre,
        img: remarkTags.RemarkImg,
        hr: remarkTags.RemarkHr
      }
    })
    .processSync(doc).result
}

const Preview: React.FC<Props> = React.memo(props => {
  const domRef = useRef<HTMLDivElement>(null)

  // sync scroll from editor
  useEffect(() => {
    const scrollToken = PubSub.subscribe(
      pubsubConfig.SYNC_SCROLL_TO_LIVE_PREVIEW,
      (_, scrollInfo: LiveScroll) => {
        if (!domRef.current.matches(':hover')) {
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
                // domRef.current.scrollTop = offsetFromTop - parentOffsetTop
                domRef.current.scrollTo({
                  top: offsetFromTop - parentOffsetTop,
                  behavior: 'smooth'
                })
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

                // domRef.current.scrollTop =
                //   offsetFromTop -
                //   parentOffsetTop +
                //   (elementHeight / totalRows) * offsetStart
                domRef.current.scrollTo({
                  top:
                    offsetFromTop -
                    parentOffsetTop +
                    (elementHeight / totalRows) * offsetStart,
                  behavior: 'smooth'
                })
                break
              } else if (childDomIndx === domRef.current.children.length - 1) {
                // domRef.current.scrollTop = childDom.offsetTop - parentOffsetTop
                domRef.current.scrollTo({
                  top: childDom.offsetTop - parentOffsetTop,
                  behavior: 'smooth'
                })
              }
            }
          }
        }
      }
    )

    return () => {
      PubSub.unsubscribe(scrollToken)
    }
  }, [])

  // modify padding
  useEffect(() => {
    const paddingToken = PubSub.subscribe(
      pubsubConfig.UPDATE_PADDING_BOTTOM,
      (_, paddingBottom: string) => {
        if (paddingBottom) {
          const previewBottom = document.getElementById('preview-bottom')
          previewBottom.style.paddingBottom = paddingBottom
        }
      }
    )

    return () => {
      PubSub.unsubscribe(paddingToken)
    }
  }, [])

  const handleScroll: UIEventHandler<HTMLDivElement> = useCallback(() => {
    if (!timeoutContronl.throttleTimer && domRef.current.matches(':hover')) {
      timeoutContronl.throttleTimer = setTimeout(() => {
        const parentOffsetTop = domRef.current.getBoundingClientRect().top
        const parentScrollTop = domRef.current.scrollTop
        if (
          parentScrollTop <=
          (domRef.current.children[0] as HTMLElement).offsetTop -
            parentOffsetTop
        ) {
          PubSub.publish(pubsubConfig.SYNC_SCROLL_FROM_PREVIEW, {
            line: 1,
            percent: 0
          })
          timeoutContronl.throttleTimer = null
          return
        }

        for (let idx = 0; idx < domRef.current.children.length; idx++) {
          let childDom = domRef.current.children[idx] as HTMLElement
          let nextChildDom =
            idx !== domRef.current.children.length
              ? (domRef.current.children[idx + 1] as HTMLElement)
              : null
          let childOffsetTop = childDom.offsetTop - parentOffsetTop
          let childHeight = childDom.offsetHeight
          if (
            parentScrollTop >= childOffsetTop &&
            nextChildDom &&
            parentScrollTop < nextChildDom.offsetTop - parentOffsetTop
          ) {
            let lineDataSet = childDom.dataset as LineDataSet
            let line = Number(lineDataSet.line)
            if (lineDataSet.endline) {
              let endline = Number(lineDataSet.endline)
              let totalRows = endline - line + 1
              let lineHeight = childHeight / totalRows
              let row
              for (row = 0; row < totalRows; row++) {
                if (
                  parentScrollTop >= childOffsetTop + row * lineHeight &&
                  parentScrollTop < childOffsetTop + (row + 1) * lineHeight
                ) {
                  let coveredPercent =
                    (parentScrollTop - (childOffsetTop + row * lineHeight)) /
                    lineHeight
                  PubSub.publish(pubsubConfig.SYNC_SCROLL_FROM_PREVIEW, {
                    line: line + row,
                    percent: coveredPercent
                  })
                  break
                }
              }
              if (row === totalRows) {
                PubSub.publish(pubsubConfig.SYNC_SCROLL_FROM_PREVIEW, {
                  line: endline,
                  percent: 1
                })
              }
              break
            } else {
              let coveredPercent =
                (parentScrollTop - childOffsetTop) / childHeight
              PubSub.publish(pubsubConfig.SYNC_SCROLL_FROM_PREVIEW, {
                line: line,
                percent: coveredPercent > 0 ? coveredPercent : 0
              })
              break
            }
          } // end if of check scroll position
        } // end for loop
        timeoutContronl.throttleTimer = null
      }, 500)
    }
  }, [])

  return (
    <Box
      id="live-preview"
      ref={domRef}
      overflow="auto"
      width="100%"
      paddingLeft={6}
      paddingRight={2}
      display={props.isVisible ? 'block' : 'none'}
      onScroll={handleScroll}
    >
      {props.isVisible && <PresentRehype />}
      <Box id="preview-bottom"></Box>
    </Box>
  )
})

const PresentRehype: React.FC = React.memo(() => {
  const [content, setContent] = useState<React.ReactNode>()
  const doc = useSelector(selectFileContent)

  // update preview
  useEffect(() => {
    if (timeoutContronl.debounceTimer) {
      clearTimeout(timeoutContronl.debounceTimer)
    }

    timeoutContronl.debounceTimer = setTimeout(() => {
      const md = updatePreview(doc)
      setContent(md)
    }, 300)
  }, [doc])

  return <>{content}</>
})

export default Preview
