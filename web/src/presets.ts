import type { NtscParams, AxisPresets, CombinedPresetName } from './types'

export const DEFAULT_PARAMS: NtscParams = {
  compositePreemphasis: 0,
  compositePreemphasisCut: 1000000,
  chromaLowpassIn: true,
  chromaLowpassOut: true,
  chromaLowpassOutLite: true,
  videoNoise: 2,
  chromaNoise: 0,
  chromaPhaseNoise: 0,
  chromaLoss: 0,
  ringing: 1.0,
  enableRinging2: false,
  ringingPower: 2,
  ringingShift: 0,
  freqNoiseSize: 0,
  freqNoiseAmplitude: 2,
  colorBleedHoriz: 0,
  colorBleedVert: 0,
  colorBleedBefore: true,
  subcarrierAmplitude: 50,
  subcarrierAmplitudeBack: 50,
  scanlinePhaseShift: 180,
  scanlinePhaseShiftOffset: 0,
  emulatingVhs: false,
  vhsTapeSpeed: 'SP',
  vhsSharpen: 1.5,
  vhsEdgeWave: 0,
  vhsHeadSwitching: false,
  vhsChromaVertBlend: true,
  vhsSvideoOut: false,
  passes: 1,
  seed: null,
}

// Axis preset values: returns partial NtscParams to merge
export function applyAxisPresets(axes: AxisPresets): Partial<NtscParams> {
  const p: Partial<NtscParams> = {}

  // NTSC signal
  switch (axes.ntsc) {
    case 'off':
      p.chromaLowpassIn = false
      p.chromaLowpassOut = false
      p.compositePreemphasis = 0
      break
    case 'standard':
      p.chromaLowpassIn = true
      p.chromaLowpassOut = true
      p.compositePreemphasis = 0
      break
    case 'degraded':
      p.chromaLowpassIn = true
      p.chromaLowpassOut = true
      p.compositePreemphasis = 4
      break
  }

  // VHS
  switch (axes.vhs) {
    case 'off':
      p.emulatingVhs = false
      break
    case 'SP':
    case 'LP':
    case 'EP':
      p.emulatingVhs = true
      p.vhsTapeSpeed = axes.vhs
      break
  }

  // Noise
  switch (axes.noise) {
    case 'off':
      p.videoNoise = 0
      p.chromaNoise = 0
      p.chromaPhaseNoise = 0
      break
    case 'light':
      p.videoNoise = 500
      p.chromaNoise = 2000
      p.chromaPhaseNoise = 0
      break
    case 'heavy':
      p.videoNoise = 2000
      p.chromaNoise = 8000
      p.chromaPhaseNoise = 20
      break
  }

  // Ghost
  switch (axes.ghost) {
    case 'off':
      p.ringing = 1.0
      break
    case 'light':
      p.ringing = 0.85
      break
    case 'heavy':
      p.ringing = 0.75
      break
    case 'extreme':
      p.ringing = 0.55
      break
  }

  // Color bleed
  switch (axes.colorBleed) {
    case 'off':
      p.colorBleedHoriz = 0
      p.colorBleedVert = 0
      break
    case 'light':
      p.colorBleedHoriz = 2
      p.colorBleedVert = 1
      break
    case 'heavy':
      p.colorBleedHoriz = 5
      p.colorBleedVert = 3
      break
  }

  return p
}

export const COMBINED_PRESETS: Record<Exclude<CombinedPresetName, 'random'>, AxisPresets> = {
  'clean-broadcast':   { ntsc: 'standard', vhs: 'off', noise: 'off',   ghost: 'off',   colorBleed: 'off' },
  'broadcast-ghost':   { ntsc: 'standard', vhs: 'off', noise: 'light', ghost: 'heavy', colorBleed: 'off' },
  'vhs-standard':      { ntsc: 'standard', vhs: 'SP',  noise: 'off',   ghost: 'off',   colorBleed: 'off' },
  'vhs-standard-ghost':{ ntsc: 'standard', vhs: 'SP',  noise: 'light', ghost: 'heavy', colorBleed: 'off' },
  'vhs-lp':            { ntsc: 'standard', vhs: 'LP',  noise: 'off',   ghost: 'off',   colorBleed: 'off' },
  'vhs-triple-speed':  { ntsc: 'standard', vhs: 'EP',  noise: 'off',   ghost: 'off',   colorBleed: 'off' },
  'vhs-ep-ghost':      { ntsc: 'standard', vhs: 'EP',  noise: 'light', ghost: 'extreme', colorBleed: 'off' },
  'worn-tape':         { ntsc: 'standard', vhs: 'EP',  noise: 'heavy', ghost: 'light',  colorBleed: 'light' },
}

export const COMBINED_PRESET_LABELS: Record<CombinedPresetName, string> = {
  'clean-broadcast': 'Clean Broadcast',
  'broadcast-ghost': 'Broadcast + Ghost',
  'vhs-standard': 'VHS Standard',
  'vhs-standard-ghost': 'VHS Standard + Ghost',
  'vhs-lp': 'VHS LP',
  'vhs-triple-speed': 'VHS Triple Speed',
  'vhs-ep-ghost': 'VHS EP + Ghost',
  'worn-tape': 'Worn Tape',
  'random': 'Random',
}
