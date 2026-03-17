import { useState, useEffect, useRef, useCallback } from 'preact/hooks'
import { Box, Flex, Heading, Button, Checkbox } from '@chakra-ui/react'
import { useI18n } from './i18n'
import { ImageInput } from './components/ImageInput'
import { ResizeControls } from './components/ResizeControls'
import { PresetBar } from './components/PresetBar'
import { AxisControls } from './components/AxisControls'
import { DetailControls } from './components/DetailControls'
import { Preview } from './components/Preview'
import { DEFAULT_PARAMS, applyAxisPresets, COMBINED_PRESETS } from './presets'
import type { NtscParams, ProcessingSettings, AxisPresets, CombinedPresetName, WorkerOutMessage } from './types'

export function App() {
  const { t, lang, setLang } = useI18n()
  // Image state
  const [imageData, setImageData] = useState<Uint8Array | null>(null)
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null)
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [processedUrl, setProcessedUrl] = useState<string | null>(null)

  // Parameter state
  const [params, setParams] = useState<NtscParams>({ ...DEFAULT_PARAMS })
  const [axes, setAxes] = useState<AxisPresets>({
    ntsc: 'off', vhs: 'off', noise: 'off', ghost: 'off', colorBleed: 'off',
  })
  const [settings, setSettings] = useState<ProcessingSettings>({
    resizeHeight: 480, crop: null, outputHeight: null,
  })

  // UI state
  const [realtime, setRealtime] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [workerReady, setWorkerReady] = useState(false)

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

  // Process function
  const process = useCallback(() => {
    if (!imageData || !imageSize || !workerRef.current || !workerReady) return
    const id = ++requestIdRef.current
    setProcessing(true)
    setError(null)

    // Resolve output height: -1 means original size
    const resolvedSettings = {
      ...settings,
      outputHeight: settings.outputHeight === -1 ? imageSize.height : settings.outputHeight,
    }

    const data = imageData.slice() // copy for transfer
    workerRef.current.postMessage(
      { type: 'process', id, imageData: data, width: imageSize.width, height: imageSize.height, params, settings: resolvedSettings },
      [data.buffer]
    )
  }, [imageData, imageSize, params, settings, workerReady])

  // Realtime preview: debounce and auto-process on param change
  useEffect(() => {
    if (!realtime || !imageData) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(process, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [realtime, params, settings, process])

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
        <Flex alignItems="center" gap="2">
          <Heading size="xl" fontWeight="bold">{t('app.title')}</Heading>
          <Button size="xs" variant="outline" onClick={() => setLang(lang === 'en' ? 'ja' : 'en')}>
            {lang === 'en' ? 'JA' : 'EN'}
          </Button>
        </Flex>

        {!workerReady && (
          <Box p="3" bg="bg.muted" borderRadius="md" fontSize="sm">
            {t('app.loading')}
          </Box>
        )}

        <ImageInput onImageLoad={handleImageLoad} />
        <ResizeControls settings={settings} onChange={setSettings} />
        <PresetBar onSelect={handlePreset} />
        <AxisControls axes={axes} onChange={handleAxesChange} />
        <DetailControls params={params} onChange={setParams} />

        <Flex gap="2" alignItems="center" flexWrap="wrap">
          <Button onClick={process} disabled={!imageData || !workerReady || processing}>
            {t('app.apply')}
          </Button>
          <Checkbox.Root checked={realtime} onCheckedChange={(e) => setRealtime(!!e.checked)}>
            <Checkbox.HiddenInput />
            <Checkbox.Control />
            <Checkbox.Label>{t('app.realtimePreview')}</Checkbox.Label>
          </Checkbox.Root>
        </Flex>

        {processedUrl && (
          <Button variant="outline" onClick={handleDownload}>
            {t('app.download')}
          </Button>
        )}
      </Box>

      {/* Right Panel */}
      <Box flex="1" minW="0">
        <Preview
          originalUrl={originalUrl}
          processedUrl={processedUrl}
          processing={processing}
          error={error}
        />
      </Box>
    </Flex>
  )
}
