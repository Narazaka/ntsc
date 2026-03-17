import { useState, useCallback } from 'preact/hooks'
import { Box, Button, Text } from '@chakra-ui/react'
import { useI18n } from '../i18n'
import type { CropArea } from '../types'

type FitMode = 'original' | 'processed'

interface Props {
  originalUrl: string | null
  croppedOriginalUrl: string | null
  processedUrl: string | null
  processing: boolean
  error: string | null
  crop: CropArea | null
  onImageLoad?: (imageData: Uint8Array, width: number, height: number, originalUrl: string) => void
}

function processFile(file: File, onImageLoad: Props['onImageLoad']) {
  if (!onImageLoad || !file.type.startsWith('image/')) return
  const url = URL.createObjectURL(file)
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
        onImageLoad(new Uint8Array(buf), img.width, img.height, url)
      })
    }, 'image/png')
  }
  img.src = url
}

export function Preview({ originalUrl, croppedOriginalUrl, processedUrl, processing, error, crop, onImageLoad }: Props) {
  const [opacity, setOpacity] = useState(100)
  const [fitMode, setFitMode] = useState<FitMode>('processed')
  const [dragOver, setDragOver] = useState(false)
  const { t } = useI18n()

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer?.files[0]
    if (file) processFile(file, onImageLoad)
  }, [onImageLoad])

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const dropProps = {
    onDrop: handleDrop,
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
  }

  if (!originalUrl) {
    return (
      <Box
        {...dropProps}
        display="flex"
        alignItems="center"
        justifyContent="center"
        h="full"
        minH="300px"
        color="fg.muted"
        fontSize="lg"
        border="2px dashed"
        borderColor={dragOver ? 'blue.400' : 'transparent'}
        borderRadius="md"
        transition="border-color 0.2s"
      >
        {t('imageInput.placeholder')}
      </Box>
    )
  }

  const hasComparison = !!processedUrl
  // When fitting to processed, use the cropped original so sizes match
  const compOriginal = (fitMode === 'processed' && croppedOriginalUrl) ? croppedOriginalUrl : originalUrl
  const baseImg = fitMode === 'original' ? originalUrl : processedUrl!
  const overlayImg = fitMode === 'original' ? processedUrl! : compOriginal

  return (
    <Box {...dropProps} display="flex" flexDirection="column" gap="2" h="full">
      {/* Controls row */}
      <Box display="flex" gap="2" alignItems="center" flexWrap="wrap">
        {hasComparison && (
          <>
            {/* Opacity slider with jump buttons */}
            <Box display="flex" alignItems="center" gap="1" flex="1" minW="200px">
              <Button size="xs" variant="outline" p="1" minW="auto" onClick={() => setOpacity(0)}>
                <Text fontSize="xs">{t('preview.original')}</Text>
              </Button>
              <input
                type="range"
                min={0}
                max={100}
                value={opacity}
                onInput={e => setOpacity(Number((e.target as HTMLInputElement).value))}
                style={{ flex: 1 }}
              />
              <Button size="xs" variant="outline" p="1" minW="auto" onClick={() => setOpacity(100)}>
                <Text fontSize="xs">{t('preview.processed')}</Text>
              </Button>
            </Box>
            {/* Fit mode buttons */}
            <Box display="flex" gap="1">
              <Button
                size="xs"
                variant={fitMode === 'original' ? 'solid' : 'outline'}
                onClick={() => setFitMode('original')}
              >
                {t('preview.fitOriginal')}
              </Button>
              <Button
                size="xs"
                variant={fitMode === 'processed' ? 'solid' : 'outline'}
                onClick={() => setFitMode('processed')}
              >
                {t('preview.fitProcessed')}
              </Button>
            </Box>
          </>
        )}
        {processing && (
          <Text fontSize="sm" color="fg.muted">{t('preview.processing')}</Text>
        )}
        {error && (
          <Text fontSize="sm" color="red.500">{error}</Text>
        )}
      </Box>
      {/* Image display */}
      <Box
        flex="1"
        overflow="auto"
        display="flex"
        alignItems="start"
        justifyContent="center"
        border="2px dashed"
        borderColor={dragOver ? 'blue.400' : 'transparent'}
        borderRadius="md"
        transition="border-color 0.2s"
      >
        {hasComparison ? (
          opacity === 100 ? (
            // Processed only — single img for clean right-click copy
            <img
              src={processedUrl!}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          ) : opacity === 0 ? (
            // Original only
            <img
              src={originalUrl}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          ) : (
            // Onion skin comparison
            <Box position="relative" display="inline-block">
              {/* Base image (defines the size), not interactive */}
              <img
                src={baseImg}
                style={{ display: 'block', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', pointerEvents: 'none' }}
              />
              {/* Overlay image — receives pointer events for right-click */}
              {fitMode === 'original' && crop ? (
                <img
                  src={processedUrl!}
                  style={{
                    position: 'absolute',
                    left: `${crop.x}%`,
                    top: `${crop.y}%`,
                    width: `${crop.width}%`,
                    height: `${crop.height}%`,
                    objectFit: 'fill',
                    opacity: opacity / 100,
                  }}
                />
              ) : (
                <img
                  src={overlayImg}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    opacity: fitMode === 'original'
                      ? opacity / 100
                      : 1 - opacity / 100,
                  }}
                />
              )}
            </Box>
          )
        ) : (
          <img
            src={originalUrl}
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          />
        )}
      </Box>
    </Box>
  )
}
