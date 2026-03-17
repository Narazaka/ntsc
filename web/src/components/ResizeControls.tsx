import { Box, Heading, Text } from '@chakra-ui/react'
import { useI18n } from '../i18n'
import type { ProcessingSettings } from '../types'

interface Props {
  settings: ProcessingSettings
  onChange: (settings: ProcessingSettings) => void
}

export function ResizeControls({ settings, onChange }: Props) {
  const { t } = useI18n()
  return (
    <Box display="flex" flexDirection="column" gap="3">
      <Heading size="sm" fontWeight="semibold">{t('section.processingSettings')}</Heading>

      <Box as="label" fontSize="sm" display="flex" flexDirection="column" gap="1">
        <Text fontSize="sm">{t('processingSettings.resolution')}</Text>
        <select
          value={settings.resizeHeight?.toString() ?? ''}
          onChange={e => onChange({
            ...settings,
            resizeHeight: e.currentTarget.value ? Number(e.currentTarget.value) : null,
          })}
          style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', border: '1px solid #555', background: 'transparent', color: 'inherit' }}
        >
          <option value="">{t('resolution.original')}</option>
          <option value="960">{t('resolution.960p')}</option>
          <option value="480">{t('resolution.480p')}</option>
          <option value="240">{t('resolution.240p')}</option>
        </select>
      </Box>

      <Box as="label" fontSize="sm" display="flex" flexDirection="column" gap="1">
        <Text fontSize="sm">{t('processingSettings.crop')}</Text>
        <select
          value={settings.crop ?? ''}
          onChange={e => onChange({
            ...settings,
            crop: (e.currentTarget.value || null) as ProcessingSettings['crop'],
          })}
          style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', border: '1px solid #555', background: 'transparent', color: 'inherit' }}
        >
          <option value="">{t('crop.none')}</option>
          <option value="4:3">4:3</option>
          <option value="3:2">3:2</option>
          <option value="16:9">16:9</option>
        </select>
      </Box>

      <Box as="label" fontSize="sm" display="flex" flexDirection="column" gap="1">
        <Text fontSize="sm">{t('processingSettings.output')}</Text>
        <select
          value={settings.outputHeight === -1 ? 'original' : settings.outputHeight?.toString() ?? ''}
          onChange={e => {
            const v = e.currentTarget.value
            onChange({
              ...settings,
              outputHeight: v === 'original' ? -1 : v ? Number(v) : null,
            })
          }}
          style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', border: '1px solid #555', background: 'transparent', color: 'inherit' }}
        >
          <option value="">{t('output.sameAsProcessing')}</option>
          <option value="original">{t('output.originalSize')}</option>
        </select>
      </Box>
    </Box>
  )
}
