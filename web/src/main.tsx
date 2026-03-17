import { render } from 'preact'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { App } from './app'

render(
  <ChakraProvider value={defaultSystem}>
    <App />
  </ChakraProvider>,
  document.getElementById('app')!
)
