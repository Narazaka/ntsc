import { Box, Button, Heading, Text } from '@chakra-ui/react'
import { useI18n } from '../i18n'
import type { ProcessingSettings } from '../types'

interface Props {
  settings: ProcessingSettings
  onChange: (settings: ProcessingSettings) => void
}

export function ResizeControls({ settings, onChange }: Props) {
  const { t } = useI18n()

  const resolutions: { label: string; value: number | null }[] = [
    { label: t('resolution.original'), value: null },
    { label: t('resolution.486p'), value: 486 },
    { label: t('resolution.480p'), value: 480 },
    { label: t('resolution.243p'), value: 243 },
    { label: t('resolution.240p'), value: 240 },
  ]

  const outputs: { label: string; value: number | null }[] = [
    { label: t('output.sameAsProcessing'), value: null },
    { label: t('output.originalSize'), value: -1 },
  ]

  return (
    <Box display="flex" flexDirection="column" gap="3">
      <Heading size="sm" fontWeight="semibold" borderTopWidth="1px" borderColor="border.default" pt="3">{t('section.processingSettings')}</Heading>

      <Box display="flex" flexDirection="column" gap="1">
        <Text fontSize="sm">{t('processingSettings.resolution')}</Text>
        <Box display="flex" gap="1" flexWrap="wrap">
          {resolutions.map(r => (
            <Button
              key={r.label}
              size="xs"
              variant={settings.resizeHeight === r.value ? 'solid' : 'outline'}
              onClick={() => onChange({ ...settings, resizeHeight: r.value })}
            >
              {r.label}
            </Button>
          ))}
        </Box>
        {settings.resizeHeight && (
          <Box>
            <Box display="flex" gap="1" mt="1">
              <Button
                size="xs"
                variant={!settings.resizeHeightOnly ? 'solid' : 'outline'}
                onClick={() => onChange({ ...settings, resizeHeightOnly: false })}
              >
                {t('resolution.proportional')}
              </Button>
              <Button
                size="xs"
                variant={settings.resizeHeightOnly ? 'solid' : 'outline'}
                onClick={() => onChange({ ...settings, resizeHeightOnly: true })}
              >
                {t('resolution.heightOnly')}
              </Button>
            </Box>
            {settings.resizeHeightOnly && (
              <Text fontSize="xs" color="fg.muted" mt="1">{t('resolution.heightOnlyDesc')}</Text>
            )}
          </Box>
        )}
      </Box>

      <Box display="flex" flexDirection="column" gap="1">
        <Text fontSize="sm">{t('processingSettings.output')}</Text>
        <Box display="flex" gap="1" flexWrap="wrap">
          {outputs.map(o => (
            <Button
              key={o.label}
              size="xs"
              variant={settings.outputHeight === o.value ? 'solid' : 'outline'}
              onClick={() => onChange({ ...settings, outputHeight: o.value })}
            >
              {o.label}
            </Button>
          ))}
        </Box>
      </Box>
    </Box>
  )
}
