import React, {
  forwardRef,
  ForwardRefExoticComponent,
  ForwardRefRenderFunction,
  ReactNode,
  useImperativeHandle,
  useRef
} from 'react'
import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react'
import { Route, Routes } from 'react-router-dom'
import { BsSearch } from 'react-icons/bs'

import SideNav from './side-nav'
import SideRecentFiles from './side-recent-files'
import SideDirlist from './side-dirlist'

export interface SideBarRef {
  toggleNav: () => void
  toggleMid: () => void
}

type CompounedComponent = ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLElement> & React.RefAttributes<SideBarRef>
> & {
  __IMARKDOWN: boolean
}

const InternalSidebar: ForwardRefRenderFunction<
  SideBarRef,
  React.HTMLAttributes<HTMLElement>
> = (_props, ref) => {
  const sideNavRef = useRef<HTMLDivElement>(null)
  const midNavRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(
    ref,
    () => {
      function toggle(ref: React.MutableRefObject<HTMLDivElement>) {
        if (ref.current) {
          const { current: container } = ref
          if (container.style.display === 'none') {
            container.style.display = 'unset'
          } else {
            container.style.display = 'none'
          }
        }
      }

      return {
        toggleNav() {
          toggle(sideNavRef)
        },
        toggleMid() {
          toggle(midNavRef)
        }
      }
    },
    []
  )
  return (
    <>
      <SideNav ref={sideNavRef} />
      <Box
        ref={midNavRef}
        width="300px"
        height="100%"
        overflow="auto"
        className="hidde-scroll-bar"
        backgroundColor={useColorModeValue('#F4F4F3', 'blackAlpha.700')}
      >
        <Routes>
          <Route
            path="/"
            element={
              <RouteItem title="Recent File">
                <SideRecentFiles />
              </RouteItem>
            }
          />
          <Route
            path="main_window/folder"
            element={
              <RouteItem title="Folder">
                <SideDirlist />
              </RouteItem>
            }
          />
        </Routes>
      </Box>
    </>
  )
}

interface RouteItemProps {
  title: string
  children: ReactNode
}

function RouteItem({ title, children }: RouteItemProps): JSX.Element {
  return (
    <>
      <Flex
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        paddingBottom={4}
        position="sticky"
        zIndex={1}
        top={0}
        backgroundColor="unset"
      >
        <Text
          as="h1"
          padding={2}
          textAlign="center"
          userSelect={'none'}
          fontSize="1.1em"
          color={useColorModeValue('gray.400', 'gray.400')}
        >
          {title}
        </Text>
        <Box
          aria-label="search bar"
          display="flex"
          height="40px"
          width="90%"
          border="1px solid black"
          borderWidth="1px"
          borderColor={useColorModeValue('gray.200', 'gray.200')}
          borderStyle="solid"
          borderRadius="md"
          backgroundColor={useColorModeValue('white', 'black')}
          color={useColorModeValue('gray.600', 'gray.400')}
          justifyContent="center"
          alignItems="center"
          _hover={{ cursor: 'pointer' }}
        >
          <BsSearch />
        </Box>
      </Flex>
      {children}
    </>
  )
}

const Sidebar = forwardRef<SideBarRef, React.HTMLAttributes<HTMLElement>>(
  InternalSidebar
) as CompounedComponent

Sidebar.__IMARKDOWN = true

export default Sidebar
