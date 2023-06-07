import { FC, MouseEvent, MouseEventHandler, useCallback } from 'react'
import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react'
import { BsList, BsMarkdown } from 'react-icons/bs'
import { NavLink } from 'react-router-dom'
import { Global } from '@emotion/react'

const SideNav: FC = (): JSX.Element => {
  const clickMenu: MouseEventHandler = useCallback((event: MouseEvent) => {
    window.ipcAPI.openMenu(event.clientX, event.clientY)
  }, [])

  return (
    <Box
      backgroundColor={useColorModeValue('#171920', '#171920')}
      color={useColorModeValue('gray.300', 'gray.300')}
      width="220px"
    >
      <Flex
        alignItems="center"
        paddingY={2}
        paddingX={4}
        justifyContent="space-between"
      >
        <Box alignItems="center" display="flex">
          <BsMarkdown
            style={{
              fontSize: '1.5em',
              color: useColorModeValue(
                'var(--chakra-colors-blue-600)',
                'var(--chakra-colors-blue-600)'
              )
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
        </Box>

        <Box
          onClick={clickMenu}
          _hover={{ cursor: 'pointer', transform: 'scale(1.2, 1.2)' }}
          flexShrink={0}
        >
          <BsList />
        </Box>
      </Flex>

      {/*<NavItem path="main_window/recent_file">Recent Files</NavItem>*/}
      <NavItem path="/">Recent Files</NavItem>
      <NavItem path="main_window/folder">Folder</NavItem>
    </Box>
  )
}

function NavItem({ path, children }: any): JSX.Element {
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
            fontSize: '1.1em',
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
        {children}
      </NavLink>
    </>
  )
}

export default SideNav
