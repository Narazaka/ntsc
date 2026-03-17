import { Box, Button, Heading, Flex } from '@chakra-ui/react'
import { COMBINED_PRESET_LABELS } from '../presets'
import { useI18n } from '../i18n'
import type { CombinedPresetName } from '../types'

interface Props {
  onSelect: (preset: CombinedPresetName) => void
}

const presetNames = Object.keys(COMBINED_PRESET_LABELS) as CombinedPresetName[]

export function PresetBar({ onSelect }: Props) {
  const { t } = useI18n()
  return (
    <Box display="flex" flexDirection="column" gap="2">
      <Heading size="sm" fontWeight="semibold">{t('section.presets')}</Heading>
      <Flex flexWrap="wrap" gap="2">
        {presetNames.map(name => (
          <Button key={name} size="sm" variant="outline" onClick={() => onSelect(name)}>
            {t(`preset.${name}`)}
          </Button>
        ))}
      </Flex>
    </Box>
  )
}
