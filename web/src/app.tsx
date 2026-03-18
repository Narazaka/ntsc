import { useState, useEffect, useRef, useCallback } from 'preact/hooks'
import { Box, Flex, Heading, Button, Checkbox } from '@chakra-ui/react'
import { Github, Twitter, Copy, Download, Check } from 'lucide-react'
import { useI18n } from './i18n'
import { ImageInput } from './components/ImageInput'
import { ResizeControls } from './components/ResizeControls'
import { CropControl } from './components/CropControl'
import { PresetBar } from './components/PresetBar'
import { AxisControls } from './components/AxisControls'
import { DetailControls } from './components/DetailControls'
import { TextOverlay } from './components/TextOverlay'
import { Preview } from './components/Preview'
import { DEFAULT_PARAMS, applyAxisPresets, COMBINED_PRESETS } from './presets'
import type { NtscParams, ProcessingSettings, AxisPresets, CombinedPresetName, WorkerOutMessage, TextOverlayItem } from './types'

export function App() {
  const { t, lang, setLang } = useI18n()
  // Image state
  const [imageData, setImageData] = useState<Uint8Array | null>(null)
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null)
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [croppedOriginalUrl, setCroppedOriginalUrl] = useState<string | null>(null)
  const [processedUrl, setProcessedUrl] = useState<string | null>(null)

  // Text overlay state
  const [textOverlays, setTextOverlays] = useState<TextOverlayItem[]>([])

  // Parameter state
  const [params, setParams] = useState<NtscParams>({ ...DEFAULT_PARAMS, ...applyAxisPresets(COMBINED_PRESETS['vhs-ep-ghost']) })
  const [axes, setAxes] = useState<AxisPresets>({
    ...COMBINED_PRESETS['vhs-ep-ghost'],
  })
  const [settings, setSettings] = useState<ProcessingSettings>({
    resizeHeight: 486, resizeHeightOnly: false, crop: null, outputHeight: null,
  })

  // UI state
  const [realtime, setRealtime] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [workerReady, setWorkerReady] = useState(false)
  const [copied, setCopied] = useState(false)

  // Worker
  const workerRef = useRef<Worker | null>(null)
  const requestIdRef = useRef(0)
  const debounceRef = useRef<number | null>(null)

  // Initialize worker
  useEffect(() => {
    const worker = new Worker(
      new URL('./worker/ntsc-worker.ts', import.meta.url),
      { type: 'module' }
    )
    worker.onmessage = (e: MessageEvent<WorkerOutMessage>) => {
      const msg = e.data
      if (msg.type === 'ready') {
        setWorkerReady(true)
      } else if (msg.type === 'result') {
        if (msg.id === requestIdRef.current) {
          const blob = new Blob([msg.imageData as unknown as BlobPart], { type: 'image/png' })
          const url = URL.createObjectURL(blob)
          setProcessedUrl(prev => { if (prev) URL.revokeObjectURL(prev); return url })
          setProcessing(false)
        }
      } else if (msg.type === 'random-result') {
        if (msg.id === requestIdRef.current) {
          setParams(msg.params)
        }
      } else if (msg.type === 'error') {
        if (msg.id === requestIdRef.current || msg.id === -1) {
          setError(msg.message)
          setProcessing(false)
        }
      }
    }
    workerRef.current = worker
    return () => worker.terminate()
  }, [])

  // Load sample image on startup
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      canvas.toBlob((blob) => {
        if (!blob) return
        blob.arrayBuffer().then(buf => {
          setImageData(new Uint8Array(buf))
          setImageSize({ width: img.width, height: img.height })
          setOriginalUrl(URL.createObjectURL(blob))
        })
      }, 'image/png')
    }
    img.src = import.meta.env.BASE_URL + 'sample.jpg'
  }, [])

  // Compose image with text overlays
  // Compose image: draw text onto the cropped/original image
  // Uses croppedOriginalUrl if available (same as TextOverlay preview)
  const composeImage = useCallback(async (): Promise<Uint8Array> => {
    const srcUrl = croppedOriginalUrl ?? originalUrl
    if (!srcUrl || !imageSize || textOverlays.length === 0) {
      return imageData!.slice()
    }
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0)

        for (const item of textOverlays) {
          if (!item.text) continue
          const px = img.width * item.x / 100
          const py = img.height * item.y / 100
          const fsPx = img.height * item.fontSize / 100
          ctx.font = `${item.fontWeight} ${fsPx}px ${item.fontFamily}`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          if (item.strokeWidth > 0) {
            ctx.strokeStyle = item.strokeColor
            ctx.lineWidth = item.strokeWidth * (fsPx / 20)
            ctx.lineJoin = 'round'
            ctx.strokeText(item.text, px, py)
          }
          ctx.fillStyle = item.color
          ctx.fillText(item.text, px, py)
        }

        canvas.toBlob((blob) => {
          if (!blob) { resolve(imageData!.slice()); return }
          blob.arrayBuffer().then(buf => resolve(new Uint8Array(buf)))
        }, 'image/png')
      }
      img.src = srcUrl
    })
  }, [originalUrl, croppedOriginalUrl, imageSize, imageData, textOverlays])

  // Process function
  const process = useCallback(async () => {
    if (!imageData || !imageSize || !workerRef.current || !workerReady) return
    const id = ++requestIdRef.current
    setProcessing(true)
    setError(null)

    // Resolve output height: -1 means original size
    const resolvedSettings = {
      ...settings,
      outputHeight: settings.outputHeight === -1 ? imageSize.height : settings.outputHeight,
    }

    const hasText = textOverlays.some(t => t.text)
    const data = await composeImage()

    // If text overlays are present, compose already includes crop — skip it in worker
    const workerSettings = hasText && (croppedOriginalUrl || settings.crop)
      ? { ...resolvedSettings, crop: null }
      : resolvedSettings

    workerRef.current.postMessage(
      { type: 'process', id, imageData: data, width: imageSize.width, height: imageSize.height, params, settings: workerSettings },
      [data.buffer]
    )
  }, [imageData, imageSize, params, settings, workerReady, composeImage])

  // Realtime preview: debounce and auto-process on param change
  useEffect(() => {
    if (!realtime || !imageData) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(process, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [realtime, params, settings, process])

  // Generate cropped/resized version of original for comparison
  useEffect(() => {
    if (!originalUrl || !imageSize) {
      setCroppedOriginalUrl(null)
      return
    }
    // If no crop and no resize, cropped = original
    if (!settings.crop && !settings.resizeHeight) {
      setCroppedOriginalUrl(null)
      return
    }

    const img = new Image()
    img.onload = () => {
      let sx = 0, sy = 0, sw = img.width, sh = img.height

      // Apply crop (percent-based)
      if (settings.crop) {
        sx = Math.floor(img.width * settings.crop.x / 100)
        sy = Math.floor(img.height * settings.crop.y / 100)
        sw = Math.floor(img.width * settings.crop.width / 100)
        sh = Math.floor(img.height * settings.crop.height / 100)
      }

      // Determine output size
      let outW = sw, outH = sh
      if (settings.resizeHeight) {
        outH = settings.resizeHeight
        outW = settings.resizeHeightOnly ? sw : Math.floor(sw * outH / sh)
        // Ensure even
        outW = Math.floor(outW / 2) * 2
        outH = Math.floor(outH / 2) * 2
      }

      const canvas = document.createElement('canvas')
      canvas.width = outW
      canvas.height = outH
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH)

      const url = canvas.toDataURL('image/png')
      setCroppedOriginalUrl(prev => { if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev); return url })
    }
    img.src = originalUrl
  }, [originalUrl, imageSize, settings.crop, settings.resizeHeight, settings.resizeHeightOnly])

  // Handle image load
  const handleImageLoad = useCallback((data: Uint8Array, width: number, height: number, url: string) => {
    setImageData(data)
    setImageSize({ width, height })
    setOriginalUrl(prev => { if (prev) URL.revokeObjectURL(prev); return url })
    setProcessedUrl(null)
  }, [])

  // Handle axis change
  const handleAxesChange = useCallback((newAxes: AxisPresets) => {
    setAxes(newAxes)
    const overrides = applyAxisPresets(newAxes)
    setParams(prev => ({ ...prev, ...overrides }))
  }, [])

  // Handle combined preset
  const handlePreset = useCallback((name: CombinedPresetName) => {
    if (name === 'random') {
      if (!workerRef.current || !workerReady) return
      const id = ++requestIdRef.current
      workerRef.current.postMessage({ type: 'random', id, seed: params.seed })
      return
    }
    const axisPreset = COMBINED_PRESETS[name]
    setAxes(axisPreset)
    const overrides = applyAxisPresets(axisPreset)
    setParams(prev => ({ ...DEFAULT_PARAMS, ...overrides, seed: prev.seed }))
  }, [workerReady, params.seed])

  // Download
  const handleDownload = useCallback(() => {
    if (!processedUrl) return
    const a = document.createElement('a')
    a.href = processedUrl
    a.download = 'ntsc_output.png'
    a.click()
  }, [processedUrl])

  // Copy to clipboard
  const handleCopy = useCallback(async () => {
    if (!processedUrl) return
    const res = await fetch(processedUrl)
    const blob = await res.blob()
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (_) {
      // Clipboard API not supported or permission denied
    }
  }, [processedUrl])

  // Share
  const handleShare = useCallback(async () => {
    if (!processedUrl) return
    const res = await fetch(processedUrl)
    const blob = await res.blob()
    const file = new File([blob], 'ntsc_output.png', { type: 'image/png' })
    try {
      await navigator.share({ files: [file] })
    } catch (_) {
      // User cancelled or share failed
    }
  }, [processedUrl])

  // Share to X (Twitter)
  const handleShareX = useCallback(() => {
    const text = encodeURIComponent(t('app.shareXText'))
    window.open(`https://x.com/intent/tweet?text=${text}`, '_blank')
  }, [])

  return (
    <Flex
      h="100vh"
      gap="4"
      p="4"
      flexDirection={{ base: 'column', md: 'row' }}
    >
      {/* Left Panel */}
      <Box
        w={{ base: 'full', md: '350px' }}
        flexShrink={0}
        overflow="auto"
        display="flex"
        flexDirection="column"
        gap="4"
      >
        <Box>
          <Flex alignItems="center" gap="2" flexWrap="wrap">
            <Heading size="xl" fontWeight="bold">{t('app.title')}</Heading>
            <a href="https://github.com/Narazaka/ntsc" target="_blank" rel="noopener noreferrer" title="GitHub" style={{ display: 'flex', alignItems: 'center', color: 'inherit' }}>
              <Github size={20} />
            </a>
            <Button size="xs" variant="outline" onClick={() => setLang(lang === 'en' ? 'ja' : 'en')}>
              {lang === 'en' ? 'JA' : 'EN'}
            </Button>
          </Flex>
          <Box fontSize="xs" color="fg.muted" mt="1">
            {t('app.subtitleBefore')}
            <a href="https://github.com/zhuker/ntsc" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>{t('app.subtitleLink')}</a>
            {t('app.subtitleAfter')}
            {' / '}
            <a href="https://x.com/hashtag/NTSC_VHS_EFFECT" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>#NTSC_VHS_EFFECT</a>
          </Box>
        </Box>

        {!workerReady && (
          <Box p="3" bg="bg.muted" borderRadius="md" fontSize="sm">
            {t('app.loading')}
          </Box>
        )}

        <ImageInput onImageLoad={handleImageLoad} />

        <Flex gap="2" alignItems="center" flexWrap="wrap">
          <Button onClick={process} disabled={!imageData || !workerReady || processing}>
            {t('app.apply')}
          </Button>
          {processedUrl && (
            <>
              <Button variant="outline" onClick={handleDownload} p="1" minW="auto" title={t('app.download')}>
                <Download size={16} />
              </Button>
              {typeof navigator !== 'undefined' && navigator.canShare?.({ files: [new File([], '')] }) && (
                <Button variant="outline" onClick={handleShare}>
                  {t('app.share')}
                </Button>
              )}
              <Button variant={copied ? 'solid' : 'outline'} onClick={handleCopy} p="1" minW="auto" title={t('app.copy')}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </Button>
              <Button variant="outline" onClick={handleShareX} p="1" minW="auto" title={t('app.shareX')}>
                <Twitter size={16} />
              </Button>
            </>
          )}
          <Checkbox.Root checked={realtime} onCheckedChange={(e) => setRealtime(!!e.checked)}>
            <Checkbox.HiddenInput />
            <Checkbox.Control />
            <Checkbox.Label>{t('app.realtimePreview')}</Checkbox.Label>
          </Checkbox.Root>
        </Flex>

        <ResizeControls settings={settings} onChange={setSettings} />
        <CropControl
          originalUrl={originalUrl}
          imageSize={imageSize}
          crop={settings.crop}
          onChange={crop => setSettings(s => ({ ...s, crop }))}
        />
        <TextOverlay originalUrl={croppedOriginalUrl ?? originalUrl} items={textOverlays} onChange={setTextOverlays} />
        <PresetBar axes={axes} onSelect={handlePreset} />
        <AxisControls axes={axes} onChange={handleAxesChange} />
        <DetailControls params={params} onChange={setParams} />
      </Box>

      {/* Right Panel */}
      <Box flex="1" minW="0">
        <Preview
          originalUrl={originalUrl}
          croppedOriginalUrl={croppedOriginalUrl}
          processedUrl={processedUrl}
          processing={processing}
          error={error}
          crop={settings.crop}
          onImageLoad={handleImageLoad}
        />
      </Box>
    </Flex>
  )
}
