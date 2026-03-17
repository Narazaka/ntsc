import { Box, Heading, Text } from '@chakra-ui/react'
import type { AxisPresets } from '../types'

interface Props {
  axes: AxisPresets
  onChange: (axes: AxisPresets) => void
}

function AxisSelect({
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
    </Box>
  )
}

export function AxisControls({ axes, onChange }: Props) {
  return (
    <Box display="flex" flexDirection="column" gap="3">
      <Heading size="sm" fontWeight="semibold">Effect Axes</Heading>
      <AxisSelect
        label="NTSC Signal"
        value={axes.ntsc}
        options={[
          { label: 'Off', value: 'off' },
          { label: 'Standard', value: 'standard' },
          { label: 'Degraded', value: 'degraded' },
        ]}
        onChange={v => onChange({ ...axes, ntsc: v as AxisPresets['ntsc'] })}
      />
      <AxisSelect
        label="VHS Tape Speed"
        value={axes.vhs}
        options={[
          { label: 'Off', value: 'off' },
          { label: 'SP', value: 'SP' },
          { label: 'LP', value: 'LP' },
          { label: 'EP', value: 'EP' },
        ]}
        onChange={v => onChange({ ...axes, vhs: v as AxisPresets['vhs'] })}
      />
      <AxisSelect
        label="Noise"
        value={axes.noise}
        options={[
          { label: 'Off', value: 'off' },
          { label: 'Light', value: 'light' },
          { label: 'Heavy', value: 'heavy' },
        ]}
        onChange={v => onChange({ ...axes, noise: v as AxisPresets['noise'] })}
      />
      <AxisSelect
        label="Ghost"
        value={axes.ghost}
        options={[
          { label: 'Off', value: 'off' },
          { label: 'Light', value: 'light' },
          { label: 'Heavy', value: 'heavy' },
        ]}
        onChange={v => onChange({ ...axes, ghost: v as AxisPresets['ghost'] })}
      />
      <AxisSelect
        label="Color Bleed"
        value={axes.colorBleed}
        options={[
          { label: 'Off', value: 'off' },
          { label: 'Light', value: 'light' },
          { label: 'Heavy', value: 'heavy' },
        ]}
        onChange={v => onChange({ ...axes, colorBleed: v as AxisPresets['colorBleed'] })}
      />
    </Box>
  )
}
