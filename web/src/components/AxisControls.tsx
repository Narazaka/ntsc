import { Box, Heading, Text } from '@chakra-ui/react'
import { useI18n } from '../i18n'
import type { AxisPresets } from '../types'

interface Props {
  axes: AxisPresets
  onChange: (axes: AxisPresets) => void
}

function AxisSelect({
  label,
  description,
  value,
  options,
  onChange,
}: {
  label: string
  description?: string
  value: string
  options: { label: string; value: string }[]
  onChange: (v: string) => void
}) {
  return (
    <Box as="label" fontSize="sm" display="flex" flexDirection="column" gap="1">
      <Text fontSize="sm">{label}</Text>
      <select
        value={value as string}
        onChange={e => onChange(e.currentTarget.value)}
        style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', border: '1px solid #555', background: 'transparent', color: 'inherit' }}
      >
        {options.map(o => (
          <option key={o.value as string} value={o.value as string}>{o.label}</option>
        ))}
      </select>
      {description && <Text fontSize="xs" color="fg.muted">{description}</Text>}
    </Box>
  )
}

export function AxisControls({ axes, onChange }: Props) {
  const { t } = useI18n()
  return (
    <Box display="flex" flexDirection="column" gap="3">
      <Heading size="sm" fontWeight="semibold">{t('section.effectAxes')}</Heading>
      <AxisSelect
        label={t('axis.ntsc.label')}
        description={t('axis.ntsc.desc')}
        value={axes.ntsc}
        options={[
          { label: t('axisLevel.off'), value: 'off' },
          { label: t('axisLevel.standard'), value: 'standard' },
          { label: t('axisLevel.degraded'), value: 'degraded' },
        ]}
        onChange={v => onChange({ ...axes, ntsc: v as AxisPresets['ntsc'] })}
      />
      <AxisSelect
        label={t('axis.vhs.label')}
        description={t('axis.vhs.desc')}
        value={axes.vhs}
        options={[
          { label: t('axisLevel.off'), value: 'off' },
          { label: t('axisLevel.SP'), value: 'SP' },
          { label: t('axisLevel.LP'), value: 'LP' },
          { label: t('axisLevel.EP'), value: 'EP' },
        ]}
        onChange={v => onChange({ ...axes, vhs: v as AxisPresets['vhs'] })}
      />
      <AxisSelect
        label={t('axis.noise.label')}
        description={t('axis.noise.desc')}
        value={axes.noise}
        options={[
          { label: t('axisLevel.off'), value: 'off' },
          { label: t('axisLevel.light'), value: 'light' },
          { label: t('axisLevel.heavy'), value: 'heavy' },
        ]}
        onChange={v => onChange({ ...axes, noise: v as AxisPresets['noise'] })}
      />
      <AxisSelect
        label={t('axis.ghost.label')}
        description={t('axis.ghost.desc')}
        value={axes.ghost}
        options={[
          { label: t('axisLevel.off'), value: 'off' },
          { label: t('axisLevel.light'), value: 'light' },
          { label: t('axisLevel.heavy'), value: 'heavy' },
        ]}
        onChange={v => onChange({ ...axes, ghost: v as AxisPresets['ghost'] })}
      />
      <AxisSelect
        label={t('axis.colorBleed.label')}
        description={t('axis.colorBleed.desc')}
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
