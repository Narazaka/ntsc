import { render } from 'preact'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { I18nProvider } from './i18n'
import { App } from './app'
import './index.css'

render(
  <ChakraProvider value={defaultSystem}>
    <I18nProvider>
      <App />
    </I18nProvider>
  </ChakraProvider>,
  document.getElementById('app')!
)
