import { useState, useCallback } from 'preact/hooks'
import { Box, Text } from '@chakra-ui/react'
import { useI18n } from '../i18n'

interface Props {
  originalUrl: string | null
  processedUrl: string | null
  processing: boolean
  error: string | null
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

export function Preview({ originalUrl, processedUrl, processing, error, onImageLoad }: Props) {
  const [opacity, setOpacity] = useState(100) // 0=original, 100=processed
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

  return (
    <Box {...dropProps} display="flex" flexDirection="column" gap="2" h="full">
      <Box display="flex" gap="2" alignItems="center" flexWrap="wrap">
        {hasComparison && (
          <Box display="flex" alignItems="center" gap="2" flex="1" minW="200px">
            <Text fontSize="xs" color="fg.muted" flexShrink={0}>{t('preview.original')}</Text>
            <input
              type="range"
              min={0}
              max={100}
              value={opacity}
              onInput={e => setOpacity(Number((e.target as HTMLInputElement).value))}
              style={{ flex: 1 }}
            />
            <Text fontSize="xs" color="fg.muted" flexShrink={0}>{t('preview.processed')}</Text>
          </Box>
        )}
        {processing && (
          <Text fontSize="sm" color="fg.muted">{t('preview.processing')}</Text>
        )}
        {error && (
          <Text fontSize="sm" color="red.500">{error}</Text>
        )}
      </Box>
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
          <Box position="relative" display="inline-block">
            {/* Original image (bottom layer) */}
            <img
              src={originalUrl}
              style={{ display: 'block', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
            {/* Processed image (top layer with opacity) */}
            <img
              src={processedUrl}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                opacity: opacity / 100,
              }}
            />
          </Box>
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
