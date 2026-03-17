import { Box, Button, Heading, Text } from '@chakra-ui/react'
import { useI18n } from '../i18n'
import type { AxisPresets } from '../types'

interface Props {
  axes: AxisPresets
  onChange: (axes: AxisPresets) => void
}

function AxisRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { label: string; value: string }[]
  onChange: (v: string) => void
}) {
  return (
    <Box display="flex" alignItems="center" gap="2">
      <Text fontSize="sm" flexShrink={0} minW="90px">{label}</Text>
      <Box display="flex" gap="1" flexWrap="wrap">
        {options.map(o => (
          <Button
            key={o.value}
            size="xs"
            variant={value === o.value ? 'solid' : 'outline'}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </Button>
        ))}
      </Box>
    </Box>
  )
}

export function AxisControls({ axes, onChange }: Props) {
  const { t } = useI18n()
  return (
    <Box display="flex" flexDirection="column" gap="2">
      <Heading size="sm" fontWeight="semibold">{t('section.effectAxes')}</Heading>
      <AxisRow
        label={t('axis.ntsc.label')}
        value={axes.ntsc}
        options={[
          { label: t('axisLevel.off'), value: 'off' },
          { label: t('axisLevel.standard'), value: 'standard' },
          { label: t('axisLevel.degraded'), value: 'degraded' },
        ]}
        onChange={v => onChange({ ...axes, ntsc: v as AxisPresets['ntsc'] })}
      />
      <AxisRow
        label={t('axis.vhs.label')}
        value={axes.vhs}
        options={[
          { label: t('axisLevel.off'), value: 'off' },
          { label: t('axisLevel.SP'), value: 'SP' },
          { label: t('axisLevel.LP'), value: 'LP' },
          { label: t('axisLevel.EP'), value: 'EP' },
        ]}
        onChange={v => onChange({ ...axes, vhs: v as AxisPresets['vhs'] })}
      />
      <AxisRow
        label={t('axis.noise.label')}
        value={axes.noise}
        options={[
          { label: t('axisLevel.off'), value: 'off' },
          { label: t('axisLevel.light'), value: 'light' },
          { label: t('axisLevel.heavy'), value: 'heavy' },
        ]}
        onChange={v => onChange({ ...axes, noise: v as AxisPresets['noise'] })}
      />
      <AxisRow
        label={t('axis.ghost.label')}
        value={axes.ghost}
        options={[
          { label: t('axisLevel.off'), value: 'off' },
          { label: t('axisLevel.light'), value: 'light' },
          { label: t('axisLevel.heavy'), value: 'heavy' },
        ]}
        onChange={v => onChange({ ...axes, ghost: v as AxisPresets['ghost'] })}
      />
      <AxisRow
        label={t('axis.colorBleed.label')}
        value={axes.colorBleed}
        options={[
          { label: t('axisLevel.off'), value: 'off' },
          { label: t('axisLevel.light'), value: 'light' },
          { label: t('axisLevel.heavy'), value: 'heavy' },
        ]}
        onChange={v => onChange({ ...axes, colorBleed: v as AxisPresets['colorBleed'] })}
      />
    </Box>
  )
}
