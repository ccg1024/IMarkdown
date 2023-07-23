import React, {
  forwardRef,
  ForwardRefExoticComponent,
  ForwardRefRenderFunction,
  MouseEvent,
  MouseEventHandler,
  useCallback,
  useLayoutEffect,
  useState
} from 'react'
import {
  Box,
  Flex,
  IconButton,
  Text,
  useColorModeValue
} from '@chakra-ui/react'
import { BsList, BsMarkdown, BsFileRichtext, BsFolder } from 'react-icons/bs'
import { NavLink } from 'react-router-dom'
import { Global } from '@emotion/react'

type CompoundedComponent = ForwardRefExoticComponent<
  React.RefAttributes<HTMLDivElement>
> & {
  __IMARKDOWN: boolean
}

const InternalSideNav: ForwardRefRenderFunction<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
> = (_props, ref) => {
  const [isMac, setIsMac] = useState<boolean>(true)
  const clickMenu: MouseEventHandler = useCallback((event: MouseEvent) => {
    window.ipcAPI.openMenu(event.clientX, event.clientY)
  }, [])

  useLayoutEffect(() => {
    if (window.ipcAPI.getPlatform() !== 'darwin') {
      setIsMac(false)
    }
  }, [])

  return (
    <Box
      ref={ref}
      backgroundColor={useColorModeValue('#171920', 'blackAlpha.400')}
      color={useColorModeValue('gray.300', 'gray.300')}
      width="220px"
    >
      <Global
        styles={{
          '.draggable': {
            WebkitAppRegion: 'drag'
          },
          '.no-draggable': {
            WebkitAppRegion: 'no-drag'
          }
        }}
      />
      <Flex
        alignItems="center"
        paddingY={2}
        paddingX={4}
        justifyContent="space-between"
        className="draggable"
      >
        <Box alignItems="center" display="flex">
          {!isMac && (
            <>
              <BsMarkdown
                style={{
                  fontSize: '1.5em'
                }}
              />
              <Text
                marginLeft={2}
                fontSize="1.1em"
                textAlign="left"
                userSelect="none"
              >
                imarkdown
              </Text>
            </>
          )}
        </Box>

        <IconButton
          className="no-draggable"
          aria-label="menu"
          onClick={clickMenu}
          icon={<BsList />}
          size="sm"
          variant="ghost"
          fontSize="20px"
          _hover={{
            backgroundColor: useColorModeValue(
              'whiteAlpha.400',
              'whiteAlpha.400'
            )
          }}
        />
      </Flex>

      {/*<NavItem path="main_window/recent_file">Recent Files</NavItem>*/}
      <NavItem path="/" icon={<BsFileRichtext />}>
        Recent Files
      </NavItem>
      <NavItem path="main_window/folder" icon={<BsFolder />}>
        Folder
      </NavItem>
    </Box>
  )
}

type NavItemProps = {
  path: string
  icon?: React.ReactNode
  children: React.ReactNode
}

function NavItem(props: NavItemProps): JSX.Element {
  const { path, icon, children } = props
  return (
    <>
      <Global
        styles={{
          '.active-side-nav': {
            backgroundColor: 'var(--chakra-colors-whiteAlpha-200)'
          },
          '.no-active:hover': {
            backgroundColor: 'var(--chakra-colors-whiteAlpha-200)'
          },
          '.nav-item': {
            display: 'block',
            paddingTop: 'var(--chakra-space-2)',
            paddingBottom: 'var(--chakra-space-2)',
            paddingLeft: 'var(--chakra-space-4)',
            paddingRight: 'var(--chakra-space-4)',
            fontSize: '1.0em',
            userSelect: 'none'
          }
        }}
      />
      <NavLink
        to={path}
        className={({ isActive }) =>
          isActive ? 'active-side-nav nav-item' : 'no-active nav-item'
        }
      >
        <Flex gap={2} alignItems="center">
          {icon && icon}
          {children}
        </Flex>
      </NavLink>
    </>
  )
}

const SideNav = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(InternalSideNav) as CompoundedComponent

SideNav.__IMARKDOWN = true

export default SideNav
