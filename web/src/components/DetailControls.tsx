import { useState } from 'preact/hooks'
import { Box, Checkbox, Heading, Text } from '@chakra-ui/react'
import type { NtscParams } from '../types'

interface Props {
  params: NtscParams
  onChange: (params: NtscParams) => void
}

function SliderControl({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number
  onChange: (v: number) => void
}) {
  return (
    <Box as="label" fontSize="sm" display="flex" flexDirection="column" gap="1">
      <Text fontSize="sm">{label}: {Number.isInteger(step) ? value : value.toFixed(2)}</Text>
      <input type="range" min={min} max={max} step={step} value={value}
        onInput={e => onChange(Number((e.target as HTMLInputElement).value))}
        style={{ width: '100%' }}
      />
    </Box>
  )
}

function ToggleControl({ label, value, onChange }: {
  label: string; value: boolean; onChange: (v: boolean) => void
}) {
  return (
    <Checkbox.Root checked={value} onCheckedChange={(e) => onChange(!!e.checked)}>
      <Checkbox.HiddenInput />
      <Checkbox.Control />
      <Checkbox.Label>{label}</Checkbox.Label>
    </Checkbox.Root>
  )
}

function SelectControl({ label, value, options, onChange }: {
  label: string; value: number; options: number[]; onChange: (v: number) => void
}) {
  return (
    <Box as="label" fontSize="sm" display="flex" alignItems="center" gap="2">
      <Text fontSize="sm">{label}</Text>
      <select value={value} onChange={e => onChange(Number(e.currentTarget.value))}
        style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #555', background: 'transparent', color: 'inherit' }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </Box>
  )
}

export function DetailControls({ params, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const set = <K extends keyof NtscParams>(key: K, value: NtscParams[K]) =>
    onChange({ ...params, [key]: value })

  return (
    <Box display="flex" flexDirection="column" gap="2">
      <Box
        as="button"
        onClick={() => setOpen(!open)}
        fontWeight="semibold"
        textAlign="left"
        cursor="pointer"
        bg="transparent"
        border="none"
        p="0"
        color="inherit"
        fontSize="sm"
      >
        {open ? '\u25BC' : '\u25B6'} Detail Parameters
      </Box>
      {open && (
        <Box display="flex" flexDirection="column" gap="3" pl="2">
          <Heading size="xs" fontWeight="medium" color="fg.muted">Composite Signal</Heading>
          <SliderControl label="Preemphasis" value={params.compositePreemphasis} min={0} max={8} step={0.1} onChange={v => set('compositePreemphasis', v)} />
          <ToggleControl label="Chroma Lowpass In" value={params.chromaLowpassIn} onChange={v => set('chromaLowpassIn', v)} />
          <ToggleControl label="Chroma Lowpass Out" value={params.chromaLowpassOut} onChange={v => set('chromaLowpassOut', v)} />
          <ToggleControl label="Chroma Lowpass Out Lite" value={params.chromaLowpassOutLite} onChange={v => set('chromaLowpassOutLite', v)} />

          <Heading size="xs" fontWeight="medium" color="fg.muted">Noise</Heading>
          <SliderControl label="Video Noise" value={params.videoNoise} min={0} max={4200} step={1} onChange={v => set('videoNoise', v)} />
          <SliderControl label="Chroma Noise" value={params.chromaNoise} min={0} max={16384} step={1} onChange={v => set('chromaNoise', v)} />
          <SliderControl label="Chroma Phase Noise" value={params.chromaPhaseNoise} min={0} max={50} step={1} onChange={v => set('chromaPhaseNoise', v)} />
          <SliderControl label="Chroma Loss" value={params.chromaLoss} min={0} max={100000} step={100} onChange={v => set('chromaLoss', v)} />

          <Heading size="xs" fontWeight="medium" color="fg.muted">Ringing</Heading>
          <SliderControl label="Ringing" value={params.ringing} min={0.3} max={1.0} step={0.01} onChange={v => set('ringing', v)} />
          <ToggleControl label="Ringing2 Mode" value={params.enableRinging2} onChange={v => set('enableRinging2', v)} />
          <SliderControl label="Ringing Power" value={params.ringingPower} min={2} max={7} step={1} onChange={v => set('ringingPower', v)} />
          <SliderControl label="Freq Noise Size" value={params.freqNoiseSize} min={0} max={0.99} step={0.01} onChange={v => set('freqNoiseSize', v)} />
          <SliderControl label="Freq Noise Amplitude" value={params.freqNoiseAmplitude} min={0} max={5} step={0.1} onChange={v => set('freqNoiseAmplitude', v)} />

          <Heading size="xs" fontWeight="medium" color="fg.muted">Color Bleed</Heading>
          <SliderControl label="Horizontal" value={params.colorBleedHoriz} min={0} max={10} step={1} onChange={v => set('colorBleedHoriz', v)} />
          <SliderControl label="Vertical" value={params.colorBleedVert} min={0} max={10} step={1} onChange={v => set('colorBleedVert', v)} />
          <ToggleControl label="Apply Before Effects" value={params.colorBleedBefore} onChange={v => set('colorBleedBefore', v)} />

          <Heading size="xs" fontWeight="medium" color="fg.muted">Subcarrier</Heading>
          <SliderControl label="Amplitude" value={params.subcarrierAmplitude} min={1} max={100} step={1} onChange={v => set('subcarrierAmplitude', v)} />
          <SliderControl label="Amplitude Back" value={params.subcarrierAmplitudeBack} min={1} max={100} step={1} onChange={v => set('subcarrierAmplitudeBack', v)} />
          <SelectControl label="Phase Shift" value={params.scanlinePhaseShift} options={[0, 90, 180, 270]} onChange={v => set('scanlinePhaseShift', v)} />
          <SliderControl label="Phase Shift Offset" value={params.scanlinePhaseShiftOffset} min={0} max={3} step={1} onChange={v => set('scanlinePhaseShiftOffset', v)} />

          <Heading size="xs" fontWeight="medium" color="fg.muted">VHS</Heading>
          <SliderControl label="Sharpening" value={params.vhsSharpen} min={1} max={5} step={0.1} onChange={v => set('vhsSharpen', v)} />
          <SliderControl label="Edge Wave" value={params.vhsEdgeWave} min={0} max={10} step={1} onChange={v => set('vhsEdgeWave', v)} />
          <ToggleControl label="Chroma Vert Blend" value={params.vhsChromaVertBlend} onChange={v => set('vhsChromaVertBlend', v)} />
          <ToggleControl label="S-Video Out" value={params.vhsSvideoOut} onChange={v => set('vhsSvideoOut', v)} />

          <Heading size="xs" fontWeight="medium" color="fg.muted">Processing</Heading>
          <SliderControl label="Passes" value={params.passes} min={1} max={5} step={1} onChange={v => set('passes', v)} />
          <Box as="label" fontSize="sm" display="flex" flexDirection="column" gap="1">
            <Text fontSize="sm">Seed (empty = random)</Text>
            <input type="number"
              value={params.seed ?? ''}
              onInput={e => {
                const v = (e.target as HTMLInputElement).value
                set('seed', v === '' ? null : Number(v))
              }}
              style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', border: '1px solid #555', background: 'transparent', color: 'inherit' }}
            />
          </Box>
        </Box>
      )}
    </Box>
  )
}
