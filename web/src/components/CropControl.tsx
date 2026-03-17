import { useState, useCallback, useRef, useEffect } from 'preact/hooks'
import ReactCrop from 'react-image-crop'
import type { Crop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Box, Button, Heading, Text } from '@chakra-ui/react'
import { useI18n } from '../i18n'
import type { CropArea } from '../types'

interface Props {
  originalUrl: string | null
  imageSize: { width: number; height: number } | null
  crop: CropArea | null
  onChange: (crop: CropArea | null) => void
}

const ASPECT_RATIOS: { label: string; value: number | null }[] = [
  { label: 'Free', value: null },
  { label: '4:3', value: 4 / 3 },
  { label: '3:2', value: 3 / 2 },
  { label: '16:9', value: 16 / 9 },
  { label: '1:1', value: 1 },
]

export function CropControl({ originalUrl, imageSize, crop, onChange }: Props) {
  const { t } = useI18n()
  const [reactCrop, setReactCrop] = useState<Crop | undefined>(undefined)
  const [aspect, setAspect] = useState<number | undefined>(4 / 3)
  const [showCrop, setShowCrop] = useState(true)
  const imgRef = useRef<HTMLImageElement | null>(null)

  const handleCropComplete = useCallback((_pixelCrop: PixelCrop, percentCrop: Crop) => {
    if (!percentCrop.width || !percentCrop.height) {
      onChange(null)
      return
    }
    onChange({
      x: percentCrop.x ?? 0,
      y: percentCrop.y ?? 0,
      width: percentCrop.width,
      height: percentCrop.height,
    })
  }, [onChange])

  const handleAspectChange = useCallback((ratio: number | null) => {
    setAspect(ratio ?? undefined)
    if (ratio && imageSize) {
      // Set initial centered crop for this aspect ratio
      const imgAspect = imageSize.width / imageSize.height
      let cropW: number, cropH: number
      if (imgAspect > ratio) {
        cropH = 100
        cropW = (ratio / imgAspect) * 100
      } else {
        cropW = 100
        cropH = (imgAspect / ratio) * 100
      }
      const newCrop: Crop = {
        unit: '%',
        x: (100 - cropW) / 2,
        y: (100 - cropH) / 2,
        width: cropW,
        height: cropH,
      }
      setReactCrop(newCrop)
      onChange({
        x: newCrop.x!,
        y: newCrop.y!,
        width: newCrop.width!,
        height: newCrop.height!,
      })
    }
  }, [imageSize, onChange])

  const handleReset = useCallback(() => {
    setReactCrop(undefined)
    onChange(null)
    setShowCrop(false)
  }, [onChange])

  // When image changes, recalculate crop for new aspect ratio
  const prevImageSizeRef = useRef(imageSize)
  useEffect(() => {
    const prev = prevImageSizeRef.current
    prevImageSizeRef.current = imageSize
    if (!showCrop || !imageSize) return

    if (aspect !== undefined) {
      handleAspectChange(aspect)
    } else {
      // Free crop: only reset if aspect ratio changed
      const prevRatio = prev ? prev.width / prev.height : null
      const newRatio = imageSize.width / imageSize.height
      if (prevRatio === null || Math.abs(prevRatio - newRatio) > 0.01) {
        setReactCrop(undefined)
        onChange(null)
      }
    }
  }, [originalUrl, imageSize])

  if (!originalUrl) return null

  return (
    <Box display="flex" flexDirection="column" gap="2">
      <Heading size="sm" fontWeight="semibold">{t('processingSettings.crop')}</Heading>
      <Box display="flex" gap="1" flexWrap="wrap">
        <Button size="xs" variant={!showCrop ? 'solid' : 'outline'} onClick={handleReset}>
          {t('crop.none')}
        </Button>
        {ASPECT_RATIOS.map(r => (
          <Button
            key={r.label}
            size="xs"
            variant={showCrop && aspect === (r.value ?? undefined) ? 'solid' : 'outline'}
            onClick={() => {
              setShowCrop(true)
              handleAspectChange(r.value)
            }}
          >
            {r.label === 'Free' ? t('crop.free') : r.label}
          </Button>
        ))}
      </Box>
      {showCrop && (
        <Box maxW="300px">
          <ReactCrop
            crop={reactCrop}
            onChange={(_, percentCrop) => setReactCrop(percentCrop)}
            onComplete={handleCropComplete}
            aspect={aspect}
          >
            <img
              ref={imgRef}
              src={originalUrl}
              style={{ maxWidth: '100%', display: 'block' }}
            />
          </ReactCrop>
          {crop && (
            <Text fontSize="xs" color="fg.muted" mt="1">
              {Math.round(crop.width)}% × {Math.round(crop.height)}%
            </Text>
          )}
        </Box>
      )}
    </Box>
  )
}
