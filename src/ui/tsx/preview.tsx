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
  RemarkCode
} from '../components/remark-tag'

import PubSubConfig from '../../config/frontend'

interface Props {
  doc: string
  openedPath: string
  isVisible: boolean
}

interface LineDataSet {
  line: number
  endline: number
}

interface UpdateDocInfo {
  doc: string
  file: string
}

function updatePreview(
  doc: string,
  openedPath: string,
  setContent: Function
): void {
  unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeReact, {
      createElement,
      Fragment,
      passNode: true,
      components: {
        p: props => <RemarkText {...props.node} {...props} />,
        h1: props => <RemarkHeading {...props.node} {...props} />,
        h2: props => <RemarkHeading {...props.node} {...props} />,
        h3: props => <RemarkHeading {...props.node} {...props} />,
        h4: props => <RemarkHeading {...props.node} {...props} />,
        h5: props => <RemarkHeading {...props.node} {...props} />,
        h6: props => <RemarkHeading {...props.node} {...props} />,
        blockquote: props => <RemarkQuote {...props.node} {...props} />,
        a: props => <RemarkLink {...props.node} {...props} />,
        ul: props => <RemarkUl {...props.node} {...props} />,
        ol: props => <RemarkOl {...props.node} {...props} />,
        li: props => <RemarkLi {...props.node} {...props} />,
        img: props => (
          <RemarkImg {...props.node} {...props} openedPath={openedPath} />
        ),
        table: props => <RemarkTable {...props.node} {...props} />,
        thead: RemarkThead,
        tbody: RemarkTbody,
        tr: props => <RemarkTr {...props.node} {...props} />,
        td: RemarkTd,
        th: RemarkTh,
        code: props => <RemarkCode {...props.node} {...props} />,
        pre: props => <RemarkCodePre {...props.node} {...props} />
      }
    })
    .process(doc)
    .then(file => {
      setContent(file.result)
    })
}

const NewPreview: React.FC<Props> = props => {
  const [Content, setContent] = useState(<Fragment />)
  const throttleRef: any = useRef(null)
  const debounceRef: any = useRef(null)
  const domRef: React.MutableRefObject<any> = useRef(null)
  const oldCursorLine: React.MutableRefObject<number> = useRef(1)

  useEffect(() => {
    updatePreview(props.doc, props.openedPath, setContent)
  }, [props.doc, props.openedPath])

  useEffect(() => {
    let token = PubSub.subscribe(
      PubSubConfig.updateSideBySidePre,
      (_data, data: UpdateDocInfo) => {
        if (!throttleRef.current) {
          throttleRef.current = setTimeout(() => {
            updatePreview(data.doc, data.file, setContent)
            throttleRef.current = null
          }, 500)
        }

        if (debounceRef.current) clearTimeout(debounceRef.current)

        debounceRef.current = setTimeout(() => {
          updatePreview(data.doc, data.file, setContent)
        }, 1500)
      }
    )

    let token2 = PubSub.subscribe(
      PubSubConfig.syncUpdateDocScroll,
      (_msg: string, cursorLine: number) => {
        if (true) {
          oldCursorLine.current = cursorLine
          for (let childDom of domRef.current.children) {
            let lineDataSet: LineDataSet = childDom.dataset
            if (Number(lineDataSet.line) > cursorLine) {
              childDom.scrollIntoView()
              childDom.scrollIntoView({ block: 'center', inline: 'nearest' })
              break
            }
            if (Number(lineDataSet.line) === cursorLine) {
              childDom.scrollIntoView()
              childDom.scrollIntoView({ block: 'center', inline: 'nearest' })
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
              break
            }
          }
        }
      }
    )
    return () => {
      PubSub.unsubscribe(token)
      PubSub.unsubscribe(token2)
    }
  }, [])

  return (
    <Box
      id="live-preview"
      ref={domRef}
      overflow="auto"
      width="100%"
      paddingX={2}
      display={props.isVisible ? 'block' : 'none'}
    >
      {props.isVisible && Content}
    </Box>
  )
}

export default NewPreview
