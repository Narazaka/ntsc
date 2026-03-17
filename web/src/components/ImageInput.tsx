import { useCallback, useRef } from 'preact/hooks'
import { Box, Text } from '@chakra-ui/react'
import { useI18n } from '../i18n'

interface Props {
  onImageLoad: (imageData: Uint8Array, width: number, height: number, originalUrl: string) => void
}

export function ImageInput({ onImageLoad }: Props) {
  const { t } = useI18n()
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback((file: File) => {
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
  }, [onImageLoad])

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer?.files[0]
    if (file && file.type.startsWith('image/')) processFile(file)
  }, [processFile])

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
  }, [])

  const handleChange = useCallback((e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) processFile(file)
  }, [processFile])

  return (
    <Box
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => inputRef.current?.click()}
      border="2px dashed"
      borderColor="border"
      borderRadius="md"
      p="6"
      textAlign="center"
      cursor="pointer"
      _hover={{ borderColor: 'blue.500', bg: 'bg.muted' }}
    >
      <Text>{t('imageInput.placeholder')}</Text>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        style={{ display: 'none' }}
      />
    </Box>
  )
}
