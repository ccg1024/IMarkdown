import {
  Box,
  Flex,
  Text,
  Badge,
  Heading,
  useColorModeValue
} from '@chakra-ui/react'
import { RecentFilesPayload } from '../app/reducers/recentFilesSlice'
import { MarkTag } from './mark-head'

interface SideFileItemProps {
  detail: RecentFilesPayload
  isActive: boolean
  clickCallback: Function
}

export function SideFileItem(props: SideFileItemProps): JSX.Element {
  return (
    <Box
      id={props.detail.id}
      borderBottom="1px"
      borderStyle="solid"
      borderColor={useColorModeValue('gray.300', 'gray.500')}
      backgroundColor={useColorModeValue(
        props.isActive ? 'blue.500' : 'unset',
        props.isActive ? 'gray.600' : 'unset'
      )}
      onClick={
        props.isActive ? null : e => props.clickCallback(e.currentTarget.id)
      }
      _hover={{
        backgroundColor: useColorModeValue(
          props.isActive ? 'blue.500' : 'blue.50',
          props.isActive ? 'gray.600' : 'gray.800'
        ),
        cursor: 'pointer'
      }}
    >
      <Flex
        overflow="hidden"
        alignItems="start"
        flexDirection="column"
        paddingX={2}
        paddingY={4}
      >
        <Heading
          width="100%"
          fontSize="1.2em"
          overflow="hidden"
          marginBottom={2}
          whiteSpace="nowrap"
          fontFamily="inherit"
          textOverflow="ellipsis"
          color={useColorModeValue(props.isActive ? 'white' : 'black', 'white')}
        >
          {props.detail.title ? props.detail.title : 'Unname title'}
        </Heading>

        <Flex gap={2} alignItems="center">
          <Text
            fontSize="0.8em"
            color={useColorModeValue(
              props.isActive ? 'white' : 'black',
              'white'
            )}
          >
            {props.detail.date ? props.detail.date : 'Unknow time'}
          </Text>
          {props.detail.tag && <MarkTag tag={props.detail.tag} />}
        </Flex>

        <Text
          width="100%"
          overflow="hidden"
          fontSize="1em"
          whiteSpace="nowrap"
          textOverflow="ellipsis"
          color={useColorModeValue(props.isActive ? 'white' : 'black', 'white')}
        >
          {props.detail.desc ? props.detail.desc : 'no description'}
        </Text>

        {props.detail.isChange && (
          <Badge fontSize="0.8em" borderRadius="md" colorScheme="red">
            changed
          </Badge>
        )}
      </Flex>
    </Box>
  )
}