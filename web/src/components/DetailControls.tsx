import { useState } from 'preact/hooks'
import { Box, Checkbox, Heading, Text } from '@chakra-ui/react'
import { useI18n } from '../i18n'
import type { NtscParams } from '../types'

interface Props {
  params: NtscParams
  onChange: (params: NtscParams) => void
}

function SliderControl({ label, description, value, min, max, step, onChange }: {
  label: string; description?: string; value: number; min: number; max: number; step: number
  onChange: (v: number) => void
}) {
  return (
    <Box as="label" fontSize="sm" display="flex" flexDirection="column" gap="1">
      <Text fontSize="sm">{label}: {Number.isInteger(step) ? value : value.toFixed(2)}</Text>
      {description && <Text fontSize="xs" color="fg.muted">{description}</Text>}
      <input type="range" min={min} max={max} step={step} value={value}
        onInput={e => onChange(Number((e.target as HTMLInputElement).value))}
        style={{ width: '100%' }}
      />
    </Box>
  )
}

function ToggleControl({ label, description, value, onChange }: {
  label: string; description?: string; value: boolean; onChange: (v: boolean) => void
}) {
  return (
    <Box display="flex" flexDirection="column" gap="1">
      <Checkbox.Root checked={value} onCheckedChange={(e) => onChange(!!e.checked)}>
        <Checkbox.HiddenInput />
        <Checkbox.Control />
        <Checkbox.Label>{label}</Checkbox.Label>
      </Checkbox.Root>
      {description && <Text fontSize="xs" color="fg.muted" pl="6">{description}</Text>}
    </Box>
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
  const { t } = useI18n()
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
        borderTopWidth="1px"
        borderColor="border.default"
        pt="3"
        pl="0"
        pr="0"
        pb="0"
        color="inherit"
        fontSize="md"
      >
        {open ? '\u25BC' : '\u25B6'} {t('section.detailParameters')}
      </Box>
      {open && (
        <Box display="flex" flexDirection="column" gap="3" pl="2">
          <Heading size="sm" fontWeight="medium" color="fg.muted" mt="2">{t('detailSection.composite')}</Heading>
          <SliderControl label={t('compositePreemphasis.label')} description={t('compositePreemphasis.desc')} value={params.compositePreemphasis} min={0} max={8} step={0.1} onChange={v => set('compositePreemphasis', v)} />
          <ToggleControl label={t('chromaLowpassIn.label')} description={t('chromaLowpassIn.desc')} value={params.chromaLowpassIn} onChange={v => set('chromaLowpassIn', v)} />
          <ToggleControl label={t('chromaLowpassOut.label')} description={t('chromaLowpassOut.desc')} value={params.chromaLowpassOut} onChange={v => set('chromaLowpassOut', v)} />
          <ToggleControl label={t('chromaLowpassOutLite.label')} description={t('chromaLowpassOutLite.desc')} value={params.chromaLowpassOutLite} onChange={v => set('chromaLowpassOutLite', v)} />

          <Heading size="sm" fontWeight="medium" color="fg.muted" mt="2">{t('detailSection.noise')}</Heading>
          <SliderControl label={t('videoNoise.label')} description={t('videoNoise.desc')} value={params.videoNoise} min={0} max={4200} step={1} onChange={v => set('videoNoise', v)} />
          <SliderControl label={t('chromaNoise.label')} description={t('chromaNoise.desc')} value={params.chromaNoise} min={0} max={16384} step={1} onChange={v => set('chromaNoise', v)} />
          <SliderControl label={t('chromaPhaseNoise.label')} description={t('chromaPhaseNoise.desc')} value={params.chromaPhaseNoise} min={0} max={50} step={1} onChange={v => set('chromaPhaseNoise', v)} />
          <SliderControl label={t('chromaLoss.label')} description={t('chromaLoss.desc')} value={params.chromaLoss} min={0} max={100000} step={100} onChange={v => set('chromaLoss', v)} />

          <Heading size="sm" fontWeight="medium" color="fg.muted" mt="2">{t('detailSection.ringing')}</Heading>
          <SliderControl label={t('ringing.label')} description={t('ringing.desc')} value={params.ringing} min={0.3} max={1.0} step={0.01} onChange={v => set('ringing', v)} />
          <ToggleControl label={t('enableRinging2.label')} description={t('enableRinging2.desc')} value={params.enableRinging2} onChange={v => set('enableRinging2', v)} />
          <SliderControl label={t('ringingPower.label')} description={t('ringingPower.desc')} value={params.ringingPower} min={2} max={7} step={1} onChange={v => set('ringingPower', v)} />
          <SliderControl label={t('freqNoiseSize.label')} description={t('freqNoiseSize.desc')} value={params.freqNoiseSize} min={0} max={0.99} step={0.01} onChange={v => set('freqNoiseSize', v)} />
          <SliderControl label={t('freqNoiseAmplitude.label')} description={t('freqNoiseAmplitude.desc')} value={params.freqNoiseAmplitude} min={0} max={5} step={0.1} onChange={v => set('freqNoiseAmplitude', v)} />

          <Heading size="sm" fontWeight="medium" color="fg.muted" mt="2">{t('detailSection.colorBleed')}</Heading>
          <SliderControl label={t('colorBleedHoriz.label')} description={t('colorBleedHoriz.desc')} value={params.colorBleedHoriz} min={0} max={10} step={1} onChange={v => set('colorBleedHoriz', v)} />
          <SliderControl label={t('colorBleedVert.label')} description={t('colorBleedVert.desc')} value={params.colorBleedVert} min={0} max={10} step={1} onChange={v => set('colorBleedVert', v)} />
          <ToggleControl label={t('colorBleedBefore.label')} description={t('colorBleedBefore.desc')} value={params.colorBleedBefore} onChange={v => set('colorBleedBefore', v)} />

          <Heading size="sm" fontWeight="medium" color="fg.muted" mt="2">{t('detailSection.subcarrier')}</Heading>
          <SliderControl label={t('subcarrierAmplitude.label')} description={t('subcarrierAmplitude.desc')} value={params.subcarrierAmplitude} min={1} max={100} step={1} onChange={v => set('subcarrierAmplitude', v)} />
          <SliderControl label={t('subcarrierAmplitudeBack.label')} description={t('subcarrierAmplitudeBack.desc')} value={params.subcarrierAmplitudeBack} min={1} max={100} step={1} onChange={v => set('subcarrierAmplitudeBack', v)} />
          <SelectControl label={t('scanlinePhaseShift.label')} value={params.scanlinePhaseShift} options={[0, 90, 180, 270]} onChange={v => set('scanlinePhaseShift', v)} />
          <SliderControl label={t('scanlinePhaseShiftOffset.label')} description={t('scanlinePhaseShiftOffset.desc')} value={params.scanlinePhaseShiftOffset} min={0} max={3} step={1} onChange={v => set('scanlinePhaseShiftOffset', v)} />

          <Heading size="sm" fontWeight="medium" color="fg.muted" mt="2">{t('detailSection.vhs')}</Heading>
          <SliderControl label={t('vhsSharpen.label')} description={t('vhsSharpen.desc')} value={params.vhsSharpen} min={1} max={5} step={0.1} onChange={v => set('vhsSharpen', v)} />
          <SliderControl label={t('vhsEdgeWave.label')} description={t('vhsEdgeWave.desc')} value={params.vhsEdgeWave} min={0} max={10} step={1} onChange={v => set('vhsEdgeWave', v)} />
          <ToggleControl label={t('vhsChromaVertBlend.label')} description={t('vhsChromaVertBlend.desc')} value={params.vhsChromaVertBlend} onChange={v => set('vhsChromaVertBlend', v)} />
          <ToggleControl label={t('vhsSvideoOut.label')} description={t('vhsSvideoOut.desc')} value={params.vhsSvideoOut} onChange={v => set('vhsSvideoOut', v)} />

          <Heading size="sm" fontWeight="medium" color="fg.muted" mt="2">{t('detailSection.processing')}</Heading>
          <SliderControl label={t('passes.label')} description={t('passes.desc')} value={params.passes} min={1} max={5} step={1} onChange={v => set('passes', v)} />
          <Box as="label" fontSize="sm" display="flex" flexDirection="column" gap="1">
            <Text fontSize="sm">{t('seed.label')}</Text>
            <Text fontSize="xs" color="fg.muted">{t('seed.desc')}</Text>
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
