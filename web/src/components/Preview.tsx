import { useState } from 'preact/hooks'
import { Box, Checkbox, Text } from '@chakra-ui/react'
import { useI18n } from '../i18n'

interface Props {
  originalUrl: string | null
  processedUrl: string | null
  processing: boolean
  error: string | null
}

export function Preview({ originalUrl, processedUrl, processing, error }: Props) {
  const [showOriginal, setShowOriginal] = useState(false)
  const { t } = useI18n()

  if (!originalUrl) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        h="full"
        minH="300px"
        color="fg.muted"
        fontSize="lg"
      >
        {t('imageInput.placeholder')}
      </Box>
    )
  }

  const displayUrl = showOriginal ? originalUrl : (processedUrl ?? originalUrl)

  return (
    <Box display="flex" flexDirection="column" gap="2" h="full">
      <Box display="flex" gap="2" alignItems="center">
        {processedUrl && (
          <Checkbox.Root checked={showOriginal} onCheckedChange={(e) => setShowOriginal(!!e.checked)}>
            <Checkbox.HiddenInput />
            <Checkbox.Control />
            <Checkbox.Label>{t('preview.showOriginal')}</Checkbox.Label>
          </Checkbox.Root>
        )}
        {processing && (
          <Text fontSize="sm" color="fg.muted">{t('preview.processing')}</Text>
        )}
        {error && (
          <Text fontSize="sm" color="red.500">{error}</Text>
        )}
      </Box>
      <Box flex="1" overflow="auto" display="flex" alignItems="start" justifyContent="center">
        <img
          src={displayUrl}
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
        />
      </Box>
    </Box>
  )
}
