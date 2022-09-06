import * as ReactRouter from 'react-router-dom'
import * as Chakra from '@chakra-ui/react'

// Docs:
// https://reactrouter.com/en/main/components/link
// https://chakra-ui.com/docs/components/link
export function StyledLink(props: ReactRouter.LinkProps & Chakra.LinkProps) {
  return <Chakra.Link as={ReactRouter.Link} color="teal.600" {...props} />
}
