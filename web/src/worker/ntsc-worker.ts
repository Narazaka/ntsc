import type { WorkerInMessage, WorkerOutMessage, NtscParams, ProcessingSettings } from '../types'

declare const self: Worker & typeof globalThis

let pyodide: any = null

function post(msg: WorkerOutMessage, transfer?: Transferable[]) {
  self.postMessage(msg, { transfer: transfer ?? [] })
}

async function initialize() {
  // Load Pyodide via dynamic import (ES module worker)
  // @ts-ignore - CDN URL import
  const { loadPyodide: _loadPyodide } = await import('https://cdn.jsdelivr.net/pyodide/v0.27.4/full/pyodide.mjs')
  pyodide = await _loadPyodide()
  await pyodide.loadPackage(['numpy', 'scipy', 'opencv-python'])

  // Fetch ntsc.py and ringPattern.npy from same origin
  // Derive base path from worker URL (handles subpath deployment like /ntsc/)
  const workerUrl = self.location.href
  const basePath = workerUrl.substring(0, workerUrl.lastIndexOf('/assets/') + 1) || '/'
  const [ntscPy, ringPattern] = await Promise.all([
    fetch(basePath + 'ntsc.py').then(r => r.text()),
    fetch(basePath + 'ringPattern.npy').then(r => r.arrayBuffer()),
  ])

  // Write to virtual FS
  pyodide.FS.mkdirTree('/ntsc')
  pyodide.FS.writeFile('/ntsc/ntsc.py', ntscPy)
  pyodide.FS.writeFile('/ntsc/ringPattern.npy', new Uint8Array(ringPattern))

  // Import ntsc module
  await pyodide.runPythonAsync(`
import sys
sys.path.insert(0, '/ntsc')
import ntsc
import cv2
import numpy as np
`)

  post({ type: 'ready' })
}

function pyBool(v: boolean): string {
  return v ? 'True' : 'False'
}

function buildPythonParams(params: NtscParams): string {
  const vhsSpeedMap = { SP: 'ntsc.VHSSpeed.VHS_SP', LP: 'ntsc.VHSSpeed.VHS_LP', EP: 'ntsc.VHSSpeed.VHS_EP' }
  return `
n = ntsc.Ntsc(random=ntsc.NumpyRandom(${params.seed ?? 'None'}))
n._composite_preemphasis = ${params.compositePreemphasis}
n._composite_preemphasis_cut = ${params.compositePreemphasisCut}
n._composite_in_chroma_lowpass = ${pyBool(params.chromaLowpassIn)}
n._composite_out_chroma_lowpass = ${pyBool(params.chromaLowpassOut)}
n._composite_out_chroma_lowpass_lite = ${pyBool(params.chromaLowpassOutLite)}
n._video_noise = ${params.videoNoise}
n._video_chroma_noise = ${params.chromaNoise}
n._video_chroma_phase_noise = ${params.chromaPhaseNoise}
n._video_chroma_loss = ${params.chromaLoss}
n._ringing = ${params.ringing}
n._enable_ringing2 = ${pyBool(params.enableRinging2)}
n._ringing_power = ${params.ringingPower}
n._ringing_shift = ${params.ringingShift}
n._freq_noise_size = ${params.freqNoiseSize}
n._freq_noise_amplitude = ${params.freqNoiseAmplitude}
n._color_bleed_horiz = ${params.colorBleedHoriz}
n._color_bleed_vert = ${params.colorBleedVert}
n._color_bleed_before = ${pyBool(params.colorBleedBefore)}
n._subcarrier_amplitude = ${params.subcarrierAmplitude}
n._subcarrier_amplitude_back = ${params.subcarrierAmplitudeBack}
n._video_scanline_phase_shift = ${params.scanlinePhaseShift}
n._video_scanline_phase_shift_offset = ${params.scanlinePhaseShiftOffset}
n._emulating_vhs = ${pyBool(params.emulatingVhs)}
n._output_vhs_tape_speed = ${vhsSpeedMap[params.vhsTapeSpeed]}
n._vhs_out_sharpen = ${params.vhsSharpen}
n._vhs_edge_wave = ${params.vhsEdgeWave}
n._vhs_head_switching = ${pyBool(params.vhsHeadSwitching)}
n._vhs_chroma_vert_blend = ${pyBool(params.vhsChromaVertBlend)}
n._vhs_svideo_out = ${pyBool(params.vhsSvideoOut)}
`
}

function buildProcessingCode(settings: ProcessingSettings, passes: number): string {
  let code = ''

  // Crop (percent-based)
  if (settings.crop) {
    const { x, y, width, height } = settings.crop
    code += `
h, w = img.shape[:2]
cx = int(w * ${x} / 100)
cy = int(h * ${y} / 100)
cw = int(w * ${width} / 100)
ch = int(h * ${height} / 100)
img = img[cy:cy+ch, cx:cx+cw]
`
  }

  // Remember size after crop (before processing resize) for output
  code += `
_pre_h, _pre_w = img.shape[:2]
`

  // Resize for processing
  if (settings.resizeHeight) {
    if (settings.resizeHeightOnly) {
      code += `
h, w = img.shape[:2]
proc_h = ${settings.resizeHeight}
proc_h = proc_h // 2 * 2
proc_w = w // 2 * 2
img = cv2.resize(img, (proc_w, proc_h), interpolation=cv2.INTER_AREA)
`
    } else {
      code += `
h, w = img.shape[:2]
proc_h = ${settings.resizeHeight}
proc_w = int(w * proc_h / h)
proc_w = proc_w // 2 * 2
proc_h = proc_h // 2 * 2
img = cv2.resize(img, (proc_w, proc_h), interpolation=cv2.INTER_AREA)
`
    }
  } else {
    code += `
h, w = img.shape[:2]
proc_w = w // 2 * 2
proc_h = h // 2 * 2
if proc_w != w or proc_h != h:
    img = cv2.resize(img, (proc_w, proc_h), interpolation=cv2.INTER_AREA)
`
  }

  // Process
  code += `
dst = img.copy()
for i in range(${passes}):
    for field in range(2):
        n.composite_layer(dst, dst.copy(), field=field, fieldno=field)
`

  // Output resize — restore to pre-processing dimensions
  if (settings.outputHeight) {
    code += `
h, w = dst.shape[:2]
out_h = min(${settings.outputHeight}, _pre_h)
out_w = int(_pre_w * out_h / _pre_h)
if out_w != w or out_h != h:
    dst = cv2.resize(dst, (out_w, out_h), interpolation=cv2.INTER_LANCZOS4)
`
  }

  return code
}

async function processImage(msg: { id: number; imageData: Uint8Array; width: number; height: number; params: NtscParams; settings: ProcessingSettings }) {
  const { id, imageData, params, settings } = msg

  // Pass image data to Python
  pyodide.globals.set('img_bytes', pyodide.toPy(imageData))

  const code = `
img_array = np.frombuffer(bytes(img_bytes), dtype=np.uint8)
img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
${buildPythonParams(params)}
${buildProcessingCode(settings, params.passes)}
success, encoded = cv2.imencode('.png', dst)
result_bytes = encoded.tobytes()
out_h, out_w = dst.shape[:2]
`

  await pyodide.runPythonAsync(code)

  const resultBytes = pyodide.globals.get('result_bytes')
  const outW = pyodide.globals.get('out_w')
  const outH = pyodide.globals.get('out_h')
  const resultArray = new Uint8Array(resultBytes.toJs())

  post(
    { type: 'result', id, imageData: resultArray, width: outW, height: outH },
    [resultArray.buffer]
  )
}

async function handleRandom(msg: { id: number; seed: number | null }) {
  const code = `
import json
_rntsc = ntsc.random_ntsc(seed=${msg.seed ?? 'None'})
_rparams = {
    'compositePreemphasis': _rntsc._composite_preemphasis,
    'compositePreemphasisCut': _rntsc._composite_preemphasis_cut,
    'chromaLowpassIn': _rntsc._composite_in_chroma_lowpass,
    'chromaLowpassOut': _rntsc._composite_out_chroma_lowpass,
    'chromaLowpassOutLite': _rntsc._composite_out_chroma_lowpass_lite,
    'videoNoise': _rntsc._video_noise,
    'chromaNoise': _rntsc._video_chroma_noise,
    'chromaPhaseNoise': _rntsc._video_chroma_phase_noise,
    'chromaLoss': _rntsc._video_chroma_loss,
    'ringing': _rntsc._ringing,
    'enableRinging2': _rntsc._enable_ringing2,
    'ringingPower': _rntsc._ringing_power,
    'ringingShift': _rntsc._ringing_shift,
    'freqNoiseSize': _rntsc._freq_noise_size,
    'freqNoiseAmplitude': _rntsc._freq_noise_amplitude,
    'colorBleedHoriz': _rntsc._color_bleed_horiz,
    'colorBleedVert': _rntsc._color_bleed_vert,
    'colorBleedBefore': _rntsc._color_bleed_before,
    'subcarrierAmplitude': _rntsc._subcarrier_amplitude,
    'subcarrierAmplitudeBack': _rntsc._subcarrier_amplitude_back,
    'scanlinePhaseShift': _rntsc._video_scanline_phase_shift,
    'scanlinePhaseShiftOffset': _rntsc._video_scanline_phase_shift_offset,
    'emulatingVhs': _rntsc._emulating_vhs,
    'vhsTapeSpeed': {ntsc.VHSSpeed.VHS_SP: 'SP', ntsc.VHSSpeed.VHS_LP: 'LP', ntsc.VHSSpeed.VHS_EP: 'EP'}[_rntsc._output_vhs_tape_speed],
    'vhsSharpen': _rntsc._vhs_out_sharpen,
    'vhsEdgeWave': _rntsc._vhs_edge_wave,
    'vhsChromaVertBlend': _rntsc._vhs_chroma_vert_blend,
    'vhsSvideoOut': _rntsc._vhs_svideo_out,
    'passes': 1,
    'seed': ${msg.seed ?? 'None'},
}
_rparams_json = json.dumps(_rparams)
`
  await pyodide.runPythonAsync(code)
  const paramsJson = pyodide.globals.get('_rparams_json')
  const params = JSON.parse(paramsJson)

  post({ type: 'random-result', id: msg.id, params })
}

self.onmessage = async (e: MessageEvent<WorkerInMessage>) => {
  try {
    const msg = e.data
    if (msg.type === 'process') {
      await processImage(msg)
    } else if (msg.type === 'random') {
      await handleRandom(msg)
    }
  } catch (err: any) {
    post({ type: 'error', id: e.data.id, message: err.message ?? String(err) })
  }
}

initialize().catch(err => {
  post({ type: 'error', id: -1, message: `Failed to initialize Pyodide: ${err.message}` })
})
