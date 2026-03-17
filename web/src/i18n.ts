import { createContext } from 'preact'
import { useState, useContext, useCallback } from 'preact/hooks'
import type { ComponentChildren } from 'preact'
import { h } from 'preact'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Lang = 'en' | 'ja'

type Messages = Record<string, Record<string, string>>

// ---------------------------------------------------------------------------
// Message catalogue
// ---------------------------------------------------------------------------

export const messages: Record<Lang, Messages> = {
  en: {
    app: {
      title: 'NTSC/VHS Effect',
      subtitleBefore: 'A web UI for ',
      subtitleLink: 'zhuker/ntsc',
      subtitleAfter: ' — NTSC/VHS video artifact emulator',
      loading: 'Loading Pyodide... (this may take a moment)',
      apply: 'Apply',
      download: 'Download PNG',
      share: 'Share',
      realtimePreview: 'Realtime Preview',
      language: 'Language',
    },

    imageInput: {
      placeholder: 'Drop an image here or click to select',
    },

    processingSettings: {
      heading: 'Processing Settings',
      resolution: 'Resolution',
      crop: 'Crop',
      output: 'Output',
    },

    resolution: {
      original: 'Original',
      '486p': '486',
      '480p': '480',
      '243p': '243',
      '240p': '240',
      proportional: 'Scale all',
      heightOnly: 'Height only',
      heightOnlyDesc: 'Analog video has no horizontal pixel resolution — only scanline count matters. Use "Original size" output to restore correct aspect ratio.',
    },

    crop: {
      none: 'None',
      free: 'Free',
    },

    output: {
      sameAsProcessing: 'Same as processing',
      originalSize: 'Original size',
    },

    preset: {
      heading: 'Presets',
      'clean-broadcast': 'Clean Broadcast',
      'broadcast-ghost': 'Broadcast + Ghost',
      'vhs-standard': 'VHS Standard',
      'vhs-standard-ghost': 'VHS Standard + Ghost',
      'vhs-lp': 'VHS LP',
      'vhs-triple-speed': 'VHS Triple Speed',
      'vhs-ep-ghost': 'VHS EP + Ghost',
      'worn-tape': 'Worn Tape',
      random: 'Random',
    },

    section: {
      presets: 'Presets',
      effectAxes: 'Effect Axes',
      detailParameters: 'Detail Parameters',
      processingSettings: 'Processing Settings',
    },

    // --- Axes -----------------------------------------------------------------

    axis: {
      'ntsc.label': 'NTSC Signal',
      'ntsc.desc': 'Controls chroma lowpass filtering and preemphasis of the composite signal',
      'vhs.label': 'VHS Tape Speed',
      'vhs.desc': 'Emulates VHS recording quality \u2014 SP is best, EP (triple speed) is worst',
      'noise.label': 'Noise',
      'noise.desc': 'Adds luminance and chrominance noise to the signal',
      'ghost.label': 'Ghost',
      'ghost.desc': 'Adds ringing artifacts (ghost images) at edges due to signal reflection',
      'colorBleed.label': 'Color Bleed',
      'colorBleed.desc': 'Shifts chroma channels causing color to bleed into adjacent areas',
    },

    axisLevel: {
      off: 'Off',
      standard: 'Standard',
      degraded: 'Degraded',
      light: 'Light',
      heavy: 'Heavy',
      extreme: 'Extreme',
      SP: 'SP',
      LP: 'LP',
      EP: 'EP',
    },

    // --- Detail parameters ----------------------------------------------------

    compositePreemphasis: {
      label: 'Preemphasis',
      desc: 'Boosts high frequencies in composite signal; higher values produce sharper edges with more ringing artifacts',
    },
    chromaLowpassIn: {
      label: 'Chroma Lowpass In',
      desc: 'Applies lowpass filter to chroma before composite encoding, reducing color bandwidth',
    },
    chromaLowpassOut: {
      label: 'Chroma Lowpass Out',
      desc: 'Applies lowpass filter to chroma after composite decoding',
    },
    chromaLowpassOutLite: {
      label: 'Chroma Lowpass Out Lite',
      desc: 'Uses lighter TV-style chroma filtering instead of full NTSC decode',
    },

    videoNoise: {
      label: 'Video Noise',
      desc: 'Random luminance noise added to the signal, simulates analog static',
    },
    chromaNoise: {
      label: 'Chroma Noise',
      desc: 'Random noise in color channels, causes color speckles',
    },
    chromaPhaseNoise: {
      label: 'Chroma Phase Noise',
      desc: 'Random phase rotation of color signal per scanline, causes color shifting',
    },
    chromaLoss: {
      label: 'Chroma Loss',
      desc: 'Probability of losing color on a scanline, causes horizontal color dropout',
    },

    ringing: {
      label: 'Ringing',
      desc: 'Ghost/echo effect at sharp edges from bandwidth limitation (1.0 = off, lower = stronger)',
    },
    enableRinging2: {
      label: 'Ringing2 Mode',
      desc: 'Uses alternative ringing algorithm based on frequency response pattern',
    },
    ringingPower: {
      label: 'Ringing Power',
      desc: 'Strength of the Ringing2 frequency pattern',
    },
    freqNoiseSize: {
      label: 'Freq Noise Size',
      desc: 'Adds random noise to the frequency domain mask',
    },
    freqNoiseAmplitude: {
      label: 'Freq Noise Amplitude',
      desc: 'Amplitude of frequency domain noise',
    },

    colorBleedHoriz: {
      label: 'Horizontal',
      desc: 'Horizontal color shift in pixels',
    },
    colorBleedVert: {
      label: 'Vertical',
      desc: 'Vertical color shift in pixels',
    },
    colorBleedBefore: {
      label: 'Apply Before Effects',
      desc: 'Apply color bleed before other signal degradation',
    },

    subcarrierAmplitude: {
      label: 'Amplitude',
      desc: 'NTSC color subcarrier encoding strength',
    },
    subcarrierAmplitudeBack: {
      label: 'Amplitude Back',
      desc: 'NTSC color subcarrier decoding strength',
    },
    scanlinePhaseShift: {
      label: 'Phase Shift',
      desc: 'Phase shift between scanlines (NTSC uses 180\u00b0)',
    },
    scanlinePhaseShiftOffset: {
      label: 'Phase Shift Offset',
      desc: 'Additional phase offset added to each scanline',
    },

    vhsSharpen: {
      label: 'Sharpening',
      desc: 'VHS output sharpening amount',
    },
    vhsEdgeWave: {
      label: 'Edge Wave',
      desc: 'Horizontal edge distortion from tape transport instability',
    },
    vhsHeadSwitching: {
      label: 'Head Switching Noise',
      desc: 'Noise at the bottom of the frame from VHS head switching (needs height >= 486)',
    },
    vhsChromaVertBlend: {
      label: 'Chroma Vert Blend',
      desc: 'Blends adjacent scanline colors (VHS format behavior)',
    },
    vhsSvideoOut: {
      label: 'S-Video Out',
      desc: 'Outputs via S-Video, skipping composite re-encoding for cleaner color',
    },

    passes: {
      label: 'Passes',
      desc: 'Number of times to apply the effect; multiple passes increase degradation',
    },
    seed: {
      label: 'Seed',
      desc: 'Random seed for reproducible results',
    },

    // --- Detail section headings ---------------------------------------------

    detailSection: {
      composite: 'Composite Signal',
      noise: 'Noise',
      ringing: 'Ringing',
      colorBleed: 'Color Bleed',
      subcarrier: 'Subcarrier',
      vhs: 'VHS',
      processing: 'Processing',
    },

    // --- Preview --------------------------------------------------------------

    preview: {
      showOriginal: 'Show Original',
      processing: 'Processing...',
      error: 'Error',
      onionSkin: 'Compare',
      original: 'Original',
      processed: 'Processed',
      fitOriginal: 'Fit to Original',
      fitProcessed: 'Fit to Processed',
    },
  },

  // ==========================================================================
  // Japanese
  // ==========================================================================
  ja: {
    app: {
      title: 'NTSC/VHS エフェクト',
      subtitleBefore: '',
      subtitleLink: 'zhuker/ntsc',
      subtitleAfter: ' をブラウザで使えるようにしたものです',
      loading: 'Pyodide を読み込み中…（少々お待ちください）',
      apply: '\u9069\u7528',
      download: 'PNG ダウンロード',
      share: '共有',
      realtimePreview: 'リアルタイムプレビュー',
      language: '\u8a00\u8a9e',
    },

    imageInput: {
      placeholder: '\u753b\u50cf\u3092\u30c9\u30ed\u30c3\u30d7\u307e\u305f\u306f\u30af\u30ea\u30c3\u30af\u3067\u9078\u629e',
    },

    processingSettings: {
      heading: '\u51e6\u7406\u8a2d\u5b9a',
      resolution: '\u89e3\u50cf\u5ea6',
      crop: '\u30af\u30ed\u30c3\u30d7',
      output: '\u51fa\u529b',
    },

    resolution: {
      original: 'オリジナル',
      '486p': '486',
      '480p': '480',
      '243p': '243',
      '240p': '240',
      proportional: '縦横',
      heightOnly: '縦のみ',
      heightOnlyDesc: 'アナログ映像には横のピクセル解像度がなく、走査線数（縦）のみが解像度を決定します。出力を「元のサイズ」にするとアスペクト比が復元されます。',
    },

    crop: {
      none: 'なし',
      free: '自由',
    },

    output: {
      sameAsProcessing: '\u51e6\u7406\u30b5\u30a4\u30ba\u3068\u540c\u3058',
      originalSize: '\u5143\u306e\u30b5\u30a4\u30ba',
    },

    preset: {
      heading: '\u30d7\u30ea\u30bb\u30c3\u30c8',
      'clean-broadcast': 'クリーン放送',
      'broadcast-ghost': '放送 + ゴースト',
      'vhs-standard': 'VHS 標準',
      'vhs-standard-ghost': 'VHS 標準 + ゴースト',
      'vhs-lp': 'VHS 2倍',
      'vhs-triple-speed': 'VHS 3倍',
      'vhs-ep-ghost': 'VHS 3倍 + ゴースト',
      'worn-tape': '\u52a3\u5316\u30c6\u30fc\u30d7',
      random: '\u30e9\u30f3\u30c0\u30e0',
    },

    section: {
      presets: '\u30d7\u30ea\u30bb\u30c3\u30c8',
      effectAxes: '\u30a8\u30d5\u30a7\u30af\u30c8\u8ef8',
      detailParameters: '\u8a73\u7d30\u30d1\u30e9\u30e1\u30fc\u30bf',
      processingSettings: '\u51e6\u7406\u8a2d\u5b9a',
    },

    axis: {
      'ntsc.label': 'NTSC \u4fe1\u53f7',
      'ntsc.desc': '\u30b3\u30f3\u30dd\u30b8\u30c3\u30c8\u4fe1\u53f7\u306e\u30af\u30ed\u30de\u30ed\u30fc\u30d1\u30b9\u30d5\u30a3\u30eb\u30bf\u3068\u30d7\u30ea\u30a8\u30f3\u30d5\u30a1\u30b7\u30b9\u3092\u5236\u5fa1',
      'vhs.label': 'VHS \u30c6\u30fc\u30d7\u901f\u5ea6',
      'vhs.desc': 'VHS \u306e\u9332\u753b\u54c1\u8cea\u3092\u518d\u73fe\u2014SP \u304c\u6700\u9ad8\u3001EP\uff083\u500d\u901f\uff09\u304c\u6700\u4f4e',
      'noise.label': '\u30ce\u30a4\u30ba',
      'noise.desc': '\u8f1d\u5ea6\u30fb\u8272\u30ce\u30a4\u30ba\u3092\u4fe1\u53f7\u306b\u4ed8\u52a0',
      'ghost.label': '\u30b4\u30fc\u30b9\u30c8',
      'ghost.desc': '\u4fe1\u53f7\u53cd\u5c04\u306b\u3088\u308b\u30a8\u30c3\u30b8\u306e\u30ea\u30f3\u30ae\u30f3\u30b0\uff08\u30b4\u30fc\u30b9\u30c8\u50cf\uff09\u3092\u518d\u73fe',
      'colorBleed.label': '\u8272\u306b\u3058\u307f',
      'colorBleed.desc': '\u30af\u30ed\u30de\u30c1\u30e3\u30f3\u30cd\u30eb\u3092\u30b7\u30d5\u30c8\u3057\u96a3\u63a5\u9818\u57df\u306b\u8272\u304c\u306b\u3058\u3080',
    },

    axisLevel: {
      off: 'オフ',
      standard: '標準',
      degraded: '劣化',
      light: '軽度',
      heavy: '強度',
      extreme: '極度',
      SP: '標準',
      LP: '2倍',
      EP: '3倍',
    },

    compositePreemphasis: {
      label: '\u30d7\u30ea\u30a8\u30f3\u30d5\u30a1\u30b7\u30b9',
      desc: '\u30b3\u30f3\u30dd\u30b8\u30c3\u30c8\u4fe1\u53f7\u306e\u9ad8\u57df\u3092\u5f37\u8abf\uff1b\u5024\u304c\u9ad8\u3044\u307b\u3069\u30a8\u30c3\u30b8\u304c\u92ed\u304f\u306a\u308a\u30ea\u30f3\u30ae\u30f3\u30b0\u304c\u589e\u3059',
    },
    chromaLowpassIn: {
      label: '\u30af\u30ed\u30de\u30ed\u30fc\u30d1\u30b9 In',
      desc: '\u30b3\u30f3\u30dd\u30b8\u30c3\u30c8\u30a8\u30f3\u30b3\u30fc\u30c9\u524d\u306b\u30af\u30ed\u30de\u3078\u30ed\u30fc\u30d1\u30b9\u30d5\u30a3\u30eb\u30bf\u3092\u9069\u7528\u3057\u8272\u5e2f\u57df\u3092\u5236\u9650',
    },
    chromaLowpassOut: {
      label: '\u30af\u30ed\u30de\u30ed\u30fc\u30d1\u30b9 Out',
      desc: '\u30b3\u30f3\u30dd\u30b8\u30c3\u30c8\u30c7\u30b3\u30fc\u30c9\u5f8c\u306b\u30af\u30ed\u30de\u3078\u30ed\u30fc\u30d1\u30b9\u30d5\u30a3\u30eb\u30bf\u3092\u9069\u7528',
    },
    chromaLowpassOutLite: {
      label: '\u30af\u30ed\u30de\u30ed\u30fc\u30d1\u30b9 Out Lite',
      desc: '\u5b8c\u5168\u306a NTSC \u30c7\u30b3\u30fc\u30c9\u306e\u4ee3\u308f\u308a\u306b TV \u98a8\u306e\u8efd\u91cf\u30af\u30ed\u30de\u30d5\u30a3\u30eb\u30bf\u3092\u4f7f\u7528',
    },

    videoNoise: {
      label: '\u30d3\u30c7\u30aa\u30ce\u30a4\u30ba',
      desc: '\u4fe1\u53f7\u306b\u52a0\u308f\u308b\u30e9\u30f3\u30c0\u30e0\u306a\u8f1d\u5ea6\u30ce\u30a4\u30ba\u3067\u30a2\u30ca\u30ed\u30b0\u30b9\u30ce\u30fc\u3092\u518d\u73fe',
    },
    chromaNoise: {
      label: '\u30af\u30ed\u30de\u30ce\u30a4\u30ba',
      desc: '\u8272\u30c1\u30e3\u30f3\u30cd\u30eb\u306e\u30e9\u30f3\u30c0\u30e0\u30ce\u30a4\u30ba\u3067\u8272\u306e\u3061\u3089\u3064\u304d\u304c\u767a\u751f',
    },
    chromaPhaseNoise: {
      label: '\u30af\u30ed\u30de\u4f4d\u76f8\u30ce\u30a4\u30ba',
      desc: '\u8d70\u67fb\u7dda\u3054\u3068\u306e\u30e9\u30f3\u30c0\u30e0\u306a\u8272\u4fe1\u53f7\u4f4d\u76f8\u56de\u8ee2\u3067\u8272\u305a\u308c\u304c\u767a\u751f',
    },
    chromaLoss: {
      label: '\u30af\u30ed\u30de\u30ed\u30b9',
      desc: '\u8d70\u67fb\u7dda\u4e0a\u3067\u8272\u304c\u6b20\u843d\u3059\u308b\u78ba\u7387\u3067\u6c34\u5e73\u65b9\u5411\u306e\u8272\u629c\u3051\u3092\u518d\u73fe',
    },

    ringing: {
      label: '\u30ea\u30f3\u30ae\u30f3\u30b0',
      desc: '\u5e2f\u57df\u5236\u9650\u306b\u3088\u308b\u30a8\u30c3\u30b8\u306e\u30b4\u30fc\u30b9\u30c8/\u30a8\u30b3\u30fc\u52b9\u679c\uff081.0=\u30aa\u30d5\u3001\u4f4e\u3044\u307b\u3069\u5f37\u3044\uff09',
    },
    enableRinging2: {
      label: 'Ringing2 \u30e2\u30fc\u30c9',
      desc: '\u5468\u6ce2\u6570\u5fdc\u7b54\u30d1\u30bf\u30fc\u30f3\u306b\u57fa\u3065\u304f\u4ee3\u66ff\u30ea\u30f3\u30ae\u30f3\u30b0\u30a2\u30eb\u30b4\u30ea\u30ba\u30e0\u3092\u4f7f\u7528',
    },
    ringingPower: {
      label: '\u30ea\u30f3\u30ae\u30f3\u30b0\u5f37\u5ea6',
      desc: 'Ringing2 \u306e\u5468\u6ce2\u6570\u30d1\u30bf\u30fc\u30f3\u306e\u5f37\u3055',
    },
    freqNoiseSize: {
      label: '\u5468\u6ce2\u6570\u30ce\u30a4\u30ba\u30b5\u30a4\u30ba',
      desc: '\u5468\u6ce2\u6570\u9818\u57df\u30de\u30b9\u30af\u306b\u30e9\u30f3\u30c0\u30e0\u30ce\u30a4\u30ba\u3092\u4ed8\u52a0',
    },
    freqNoiseAmplitude: {
      label: '\u5468\u6ce2\u6570\u30ce\u30a4\u30ba\u632f\u5e45',
      desc: '\u5468\u6ce2\u6570\u9818\u57df\u30ce\u30a4\u30ba\u306e\u632f\u5e45',
    },

    colorBleedHoriz: {
      label: '\u6c34\u5e73',
      desc: '\u6c34\u5e73\u65b9\u5411\u306e\u8272\u30b7\u30d5\u30c8\u91cf\uff08\u30d4\u30af\u30bb\u30eb\uff09',
    },
    colorBleedVert: {
      label: '\u5782\u76f4',
      desc: '\u5782\u76f4\u65b9\u5411\u306e\u8272\u30b7\u30d5\u30c8\u91cf\uff08\u30d4\u30af\u30bb\u30eb\uff09',
    },
    colorBleedBefore: {
      label: '\u30a8\u30d5\u30a7\u30af\u30c8\u524d\u306b\u9069\u7528',
      desc: '\u4ed6\u306e\u4fe1\u53f7\u52a3\u5316\u306e\u524d\u306b\u8272\u306b\u3058\u307f\u3092\u9069\u7528',
    },

    subcarrierAmplitude: {
      label: '\u632f\u5e45',
      desc: 'NTSC \u8272\u526f\u642c\u9001\u6ce2\u306e\u30a8\u30f3\u30b3\u30fc\u30c9\u5f37\u5ea6',
    },
    subcarrierAmplitudeBack: {
      label: '\u632f\u5e45 (Back)',
      desc: 'NTSC \u8272\u526f\u642c\u9001\u6ce2\u306e\u30c7\u30b3\u30fc\u30c9\u5f37\u5ea6',
    },
    scanlinePhaseShift: {
      label: '\u4f4d\u76f8\u30b7\u30d5\u30c8',
      desc: '\u8d70\u67fb\u7dda\u9593\u306e\u4f4d\u76f8\u5dee\uff08NTSC \u306f 180\u00b0\uff09',
    },
    scanlinePhaseShiftOffset: {
      label: '\u4f4d\u76f8\u30b7\u30d5\u30c8\u30aa\u30d5\u30bb\u30c3\u30c8',
      desc: '\u8d70\u67fb\u7dda\u3054\u3068\u306b\u52a0\u7b97\u3055\u308c\u308b\u8ffd\u52a0\u4f4d\u76f8\u30aa\u30d5\u30bb\u30c3\u30c8',
    },

    vhsSharpen: {
      label: '\u30b7\u30e3\u30fc\u30d7\u30cd\u30b9',
      desc: 'VHS \u51fa\u529b\u306e\u30b7\u30e3\u30fc\u30d7\u30cd\u30b9\u91cf',
    },
    vhsEdgeWave: {
      label: '\u30a8\u30c3\u30b8\u30a6\u30a7\u30fc\u30d6',
      desc: '\u30c6\u30fc\u30d7\u8d70\u884c\u306e\u4e0d\u5b89\u5b9a\u3055\u306b\u3088\u308b\u6c34\u5e73\u65b9\u5411\u306e\u30a8\u30c3\u30b8\u6b6a\u307f',
    },
    vhsHeadSwitching: {
      label: 'ヘッドスイッチングノイズ',
      desc: 'VHSヘッド切替による画面下部のノイズ（高さ486以上で有効）',
    },
    vhsChromaVertBlend: {
      label: 'クロマ垂直ブレンド',
      desc: '\u96a3\u63a5\u8d70\u67fb\u7dda\u306e\u8272\u3092\u6df7\u5408\uff08VHS \u30d5\u30a9\u30fc\u30de\u30c3\u30c8\u306e\u7279\u6027\uff09',
    },
    vhsSvideoOut: {
      label: 'S\u30d3\u30c7\u30aa\u51fa\u529b',
      desc: 'S\u30d3\u30c7\u30aa\u3067\u51fa\u529b\u3057\u30b3\u30f3\u30dd\u30b8\u30c3\u30c8\u518d\u30a8\u30f3\u30b3\u30fc\u30c9\u3092\u30b9\u30ad\u30c3\u30d7\uff08\u8272\u304c\u304d\u308c\u3044\uff09',
    },

    passes: {
      label: '\u30d1\u30b9\u6570',
      desc: '\u30a8\u30d5\u30a7\u30af\u30c8\u306e\u9069\u7528\u56de\u6570\uff1b\u8907\u6570\u56de\u3067\u52a3\u5316\u304c\u5f37\u307e\u308b',
    },
    seed: {
      label: '\u30b7\u30fc\u30c9',
      desc: '\u518d\u73fe\u6027\u306e\u3042\u308b\u7d50\u679c\u3092\u5f97\u308b\u305f\u3081\u306e\u4e71\u6570\u30b7\u30fc\u30c9',
    },

    detailSection: {
      composite: '\u30b3\u30f3\u30dd\u30b8\u30c3\u30c8\u4fe1\u53f7',
      noise: '\u30ce\u30a4\u30ba',
      ringing: '\u30ea\u30f3\u30ae\u30f3\u30b0',
      colorBleed: '\u8272\u306b\u3058\u307f',
      subcarrier: '\u526f\u642c\u9001\u6ce2',
      vhs: 'VHS',
      processing: '\u51e6\u7406',
    },

    preview: {
      showOriginal: '元画像を表示',
      processing: '処理中...',
      error: 'エラー',
      onionSkin: '比較',
      original: '元画像',
      processed: '処理後',
      fitOriginal: '元画像サイズに合わせる',
      fitProcessed: '処理後サイズに合わせる',
    },
  },
}

// ---------------------------------------------------------------------------
// Flat key lookup helper
// ---------------------------------------------------------------------------

function flatLookup(lang: Lang, key: string): string {
  // key format: "group.subkey" e.g. "compositePreemphasis.label"
  const dot = key.indexOf('.')
  if (dot === -1) return key

  const group = key.slice(0, dot)
  const sub = key.slice(dot + 1)
  const val = messages[lang]?.[group]?.[sub]
  if (val !== undefined) return val

  // Fallback to English
  const fallback = messages.en?.[group]?.[sub]
  return fallback ?? key
}

// ---------------------------------------------------------------------------
// Context & hook
// ---------------------------------------------------------------------------

interface I18nContextValue {
  t: (key: string) => string
  lang: Lang
  setLang: (lang: Lang) => void
}

const I18nContext = createContext<I18nContextValue>({
  t: (key: string) => key,
  lang: 'en',
  setLang: () => {},
})

export function createI18nContext() {
  return I18nContext
}

export function useI18n(): I18nContextValue {
  return useContext(I18nContext)
}

// ---------------------------------------------------------------------------
// Provider component
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'ntsc-vhs-lang'

function getInitialLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'ja' || stored === 'en') return stored
  } catch { /* ignore */ }

  // Auto-detect from browser language
  if (typeof navigator !== 'undefined' && navigator.language.startsWith('ja')) {
    return 'ja'
  }
  return 'en'
}

export function I18nProvider({ children }: { children: ComponentChildren }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang)

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang)
    try {
      localStorage.setItem(STORAGE_KEY, newLang)
    } catch { /* ignore */ }
  }, [])

  const t = useCallback((key: string) => flatLookup(lang, key), [lang])

  return h(I18nContext.Provider, { value: { t, lang, setLang }, children })
}
