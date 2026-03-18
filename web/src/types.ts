export interface TextOverlayItem {
  id: string
  text: string
  x: number           // percent 0-100
  y: number           // percent 0-100
  fontSize: number     // percent of image height
  color: string
  strokeColor: string
  strokeWidth: number
  fontFamily: string
}

export interface NtscParams {
  // Composite signal
  compositePreemphasis: number       // 0..8
  compositePreemphasisCut: number    // Hz, default 1000000
  chromaLowpassIn: boolean
  chromaLowpassOut: boolean
  chromaLowpassOutLite: boolean

  // Noise
  videoNoise: number                 // 0..4200
  chromaNoise: number                // 0..16384
  chromaPhaseNoise: number           // 0..50
  chromaLoss: number                 // 0..100000

  // Ringing
  ringing: number                    // 0.3..1.0 (1.0 = off)
  enableRinging2: boolean
  ringingPower: number               // 2..7
  ringingShift: number
  freqNoiseSize: number              // 0..0.99
  freqNoiseAmplitude: number         // 0..5

  // Color bleed
  colorBleedHoriz: number            // 0..10
  colorBleedVert: number             // 0..10
  colorBleedBefore: boolean

  // Subcarrier
  subcarrierAmplitude: number        // 1..100
  subcarrierAmplitudeBack: number    // 1..100
  scanlinePhaseShift: number         // 0, 90, 180, 270
  scanlinePhaseShiftOffset: number   // 0..3

  // VHS
  emulatingVhs: boolean
  vhsTapeSpeed: 'SP' | 'LP' | 'EP'
  vhsSharpen: number                 // 1..5
  vhsEdgeWave: number                // 0..10
  vhsHeadSwitching: boolean
  vhsChromaVertBlend: boolean
  vhsSvideoOut: boolean

  // Processing
  passes: number                     // 1..5
  seed: number | null
}

export interface CropArea {
  x: number      // percent 0-100
  y: number      // percent 0-100
  width: number  // percent 0-100
  height: number // percent 0-100
}

export interface ProcessingSettings {
  resizeHeight: number | null        // null = original
  resizeHeightOnly: boolean          // true = only shrink height, keep original width
  crop: CropArea | null              // null = no crop
  outputHeight: number | null        // null = same as processing
}

export type AxisLevel = 'off' | 'light' | 'heavy' | 'extreme'
export type VhsAxisLevel = 'off' | 'SP' | 'LP' | 'EP'

export interface AxisPresets {
  ntsc: 'off' | 'standard' | 'degraded'
  vhs: VhsAxisLevel
  noise: AxisLevel
  ghost: AxisLevel
  colorBleed: AxisLevel
}

export type CombinedPresetName =
  | 'clean-broadcast'
  | 'broadcast-ghost'
  | 'vhs-standard'
  | 'vhs-standard-ghost'
  | 'vhs-lp'
  | 'vhs-triple-speed'
  | 'vhs-ep-ghost'
  | 'worn-tape'
  | 'random'

// Worker messages
export interface WorkerProcessMessage {
  type: 'process'
  id: number
  imageData: Uint8Array
  width: number
  height: number
  params: NtscParams
  settings: ProcessingSettings
}

export interface WorkerRandomMessage {
  type: 'random'
  id: number
  seed: number | null
}

export type WorkerInMessage = WorkerProcessMessage | WorkerRandomMessage

export interface WorkerReadyMessage {
  type: 'ready'
}

export interface WorkerResultMessage {
  type: 'result'
  id: number
  imageData: Uint8Array
  width: number
  height: number
}

export interface WorkerErrorMessage {
  type: 'error'
  id: number
  message: string
}

export interface WorkerRandomResultMessage {
  type: 'random-result'
  id: number
  params: NtscParams
}

export type WorkerOutMessage =
  | WorkerReadyMessage
  | WorkerResultMessage
  | WorkerErrorMessage
  | WorkerRandomResultMessage
