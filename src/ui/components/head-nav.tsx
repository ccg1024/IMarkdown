import PubSub from 'pubsub-js'
import {
  FC,
  useEffect,
  useState,
  useCallback,
  MouseEventHandler,
  MouseEvent,
  useRef
} from 'react'
import { Box, useColorModeValue } from '@chakra-ui/react'
import pubsubConfig from '../../config/pubsub.config'
import { HeadNave } from '../plugins/head-nav-extension'
import { Global } from '@emotion/react'

interface HeadNavProps {
  isVisibale: boolean
}

const HeadNavStyle = () => (
  <Global
    styles={{
      '.active-head-nav': {
        backgroundColor: useColorModeValue(
          'var(--chakra-colors-blue-200)',
          'var(--chakra-colors-whiteAlpha-200)'
        )
      },
      '.base-head-nav': {
        fontSize: '1.0em'
      },
      '.base-head-nav:hover': {
        cursor: 'pointer',
        backgroundColor: useColorModeValue(
          'var(--chakra-colors-blue-200)',
          'var(--chakra-colors-whiteAlpha-200)'
        )
      }
    }}
  />
)

const HeadNav: FC<HeadNavProps> = ({ isVisibale }): JSX.Element => {
  const [headAnchors, setHeadAnchors] = useState<HeadNave[]>([])
  const headRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const headToken = PubSub.subscribe(
      pubsubConfig.UPDATE_HEAD_NAV,
      (_, headNav: HeadNave[]) => {
        setHeadAnchors(headNav)
      }
    )
    const activeToken = PubSub.subscribe(
      pubsubConfig.ACTIVE_HEAD_NAV,
      (_, line: number) => {
        const headNavs = headRef.current.children
        let gate = false
        for (let idx = headNavs.length - 1; idx >= 0; idx--) {
          let headNav = headNavs[idx]
          headNav.classList.remove('active-head-nav')
          let lineData = (headNav as HTMLElement).dataset
          if (lineData.line && Number(lineData.line) <= line && !gate) {
            headNav.classList.add('active-head-nav')
            headNav.scrollIntoView({ block: 'nearest' })
            gate = true
          }
        }
      }
    )
    return () => {
      PubSub.unsubscribe(headToken)
      PubSub.unsubscribe(activeToken)
    }
  }, [])

  const onHeadAnchorClick: MouseEventHandler = useCallback(
    (event: MouseEvent) => {
      const { target } = event
      if (target) {
        const anchorLine = (target as HTMLElement).dataset
        if (anchorLine.line) {
          PubSub.publish(pubsubConfig.EXECUTE_HEAD_NAV, Number(anchorLine.line))
        }
      }
    },
    []
  )

  return (
    <Box
      ref={headRef}
      borderLeft="2px"
      borderColor={useColorModeValue('gray.200', 'gray.600')}
      borderStyle="solid"
      height="100%"
      display={isVisibale ? 'flex' : 'none'}
      flexDirection="column"
      width="250px"
      overflowX="hidden"
      onClick={onHeadAnchorClick}
      flexShrink={0}
      className="scroll-y-overlay"
    >
      <HeadNavStyle />
      {isVisibale &&
        headAnchors.map(headAnchor => (
          <Box
            key={headAnchor.headPos}
            data-line={headAnchor.headPos}
            paddingX={4}
            marginLeft={`${(+headAnchor.headLevel - 1) * 20}px`}
            className="base-head-nav"
          >
            {headAnchor.headText.replace(/^#+\s+?/, '')}
          </Box>
        ))}
    </Box>
  )
}

export default HeadNav
