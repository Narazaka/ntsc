import { render } from 'preact'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { App } from './app'
import './index.css'

render(
  <ChakraProvider value={defaultSystem}>
    <App />
  </ChakraProvider>,
  document.getElementById('app')!
)
