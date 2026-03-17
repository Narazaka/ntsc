import { Box, Button, Heading, Flex } from '@chakra-ui/react'
import { COMBINED_PRESET_LABELS, COMBINED_PRESETS } from '../presets'
import { useI18n } from '../i18n'
import type { AxisPresets, CombinedPresetName } from '../types'

interface Props {
  axes: AxisPresets
  onSelect: (preset: CombinedPresetName) => void
}

const presetNames = Object.keys(COMBINED_PRESET_LABELS) as CombinedPresetName[]

function axesMatch(a: AxisPresets, b: AxisPresets): boolean {
  return a.ntsc === b.ntsc && a.vhs === b.vhs && a.noise === b.noise && a.ghost === b.ghost && a.colorBleed === b.colorBleed
}

export function PresetBar({ axes, onSelect }: Props) {
  const { t } = useI18n()

  const activePreset = presetNames.find(name => {
    if (name === 'random') return false
    return axesMatch(axes, COMBINED_PRESETS[name])
  }) ?? null

  return (
    <Box display="flex" flexDirection="column" gap="2">
      <Heading size="sm" fontWeight="semibold">{t('section.presets')}</Heading>
      <Flex flexWrap="wrap" gap="2">
        {presetNames.map(name => (
          <Button
            key={name}
            size="sm"
            variant={name === activePreset ? 'solid' : 'outline'}
            onClick={() => onSelect(name)}
          >
            {t(`preset.${name}`)}
          </Button>
        ))}
      </Flex>
    </Box>
  )
}
