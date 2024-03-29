import React from 'react'
import {
  Box,
  Flex,
  Text,
  Badge,
  Heading,
  Radio,
  Tooltip,
  RadioGroup,
  useColorModeValue
} from '@chakra-ui/react'
import { useActiveScroll } from '../hooks/useActiveScroll'

type SideFileItemNewProps = {
  uuid: string
  name: string
  time?: string
  desc?: string
  size?: string
  isChange: boolean
  isActive: boolean
  onClick: (filepath: string) => void
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'>

export const SideFileItemNew: React.FC<SideFileItemNewProps> = props => {
  const { uuid, name, time, desc, size, isChange, isActive, onClick, ...rest } =
    props

  useActiveScroll(uuid, isActive)

  return (
    <Box
      id={uuid}
      borderBottom="2px"
      borderStyle="solid"
      borderColor={useColorModeValue('gray.300', 'whiteAlpha.400')}
      backgroundColor={useColorModeValue(
        isActive ? 'blue.500' : 'unset',
        isActive ? 'whiteAlpha.200' : 'unset'
      )}
      onClick={isActive ? null : e => onClick(e.currentTarget.id)}
      _hover={{
        backgroundColor: useColorModeValue(
          isActive ? 'blue.500' : 'blue.50',
          isActive ? 'whiteAlpha.200' : 'whiteAlpha.100'
        ),
        cursor: 'pointer'
      }}
      {...rest}
    >
      <Flex
        overflow="hidden"
        alignItems="start"
        flexDirection="column"
        paddingX={2}
        paddingY={4}
      >
        <Box
          aria-label="file-item-head"
          display="flex"
          gap={2}
          alignItems="center"
          justifyContent="space-between"
          width="100%"
        >
          <Tooltip label={name} placement="auto" openDelay={1000}>
            <Heading
              width="100%"
              overflow="hidden"
              fontSize="1.2em"
              marginBottom={2}
              whiteSpace="nowrap"
              fontFamily="inherit"
              textOverflow="ellipsis"
              color={useColorModeValue(isActive ? 'white' : 'black', 'white')}
            >
              {name}
            </Heading>
          </Tooltip>
          {isChange && (
            <RadioGroup defaultValue="1">
              <Radio value="1" colorScheme="red" />
            </RadioGroup>
          )}
        </Box>

        <Box
          display="flex"
          alignItems="center"
          color={useColorModeValue(isActive ? 'white' : 'black', 'white')}
          gap={2}
          aria-label="file-item-middle"
        >
          <Text
            fontSize="0.8em"
            color={useColorModeValue(isActive ? 'white' : 'black', 'white')}
          >
            {time ? time : 'Unknow time'}
          </Text>
          <Badge fontSize="0.8em">{size}</Badge>
        </Box>

        <Text
          width="100%"
          overflow="hidden"
          fontSize="1em"
          whiteSpace="nowrap"
          textOverflow="ellipsis"
          color={useColorModeValue(isActive ? 'white' : 'black', 'white')}
        >
          {desc ? desc : 'no description'}
        </Text>
      </Flex>
    </Box>
  )
}
