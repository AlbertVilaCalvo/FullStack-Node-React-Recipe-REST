import * as React from 'react'
import { Heading } from '@chakra-ui/react'

export function H1({ children }: { children: React.ReactNode }) {
  return (
    <Heading as="h1" size="2xl">
      {children}
    </Heading>
  )
}

export function H2({ children }: { children: React.ReactNode }) {
  return (
    <Heading as="h2" size="xl">
      {children}
    </Heading>
  )
}
