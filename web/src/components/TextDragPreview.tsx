import { useCallback, useRef, useState } from 'preact/hooks'
import { Box } from '@chakra-ui/react'
import type { TextOverlayItem } from '../types'

interface Props {
  originalUrl: string
  items: TextOverlayItem[]
  onChange: (items: TextOverlayItem[]) => void
  selectedId: string | null
  onSelect: (id: string) => void
}

export function TextDragPreview({ originalUrl, items, onChange, selectedId, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState(0)
  const draggingRef = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null)

  const handleImageLoad = useCallback(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.clientHeight)
    }
  }, [])

  const handlePointerDown = useCallback((e: PointerEvent, item: TextOverlayItem) => {
    e.preventDefault()
    onSelect(item.id)
    const el = e.currentTarget as HTMLElement
    el.setPointerCapture(e.pointerId)
    draggingRef.current = { id: item.id, startX: e.clientX, startY: e.clientY, origX: item.x, origY: item.y }
  }, [onSelect])

  const handlePointerMove = useCallback((e: PointerEvent) => {
    const d = draggingRef.current
    if (!d || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const dx = (e.clientX - d.startX) / rect.width * 100
    const dy = (e.clientY - d.startY) / rect.height * 100
    const newX = Math.max(0, Math.min(100, d.origX + dx))
    const newY = Math.max(0, Math.min(100, d.origY + dy))
    onChange(items.map(it => it.id === d.id ? { ...it, x: newX, y: newY } : it))
  }, [items, onChange])

  const handlePointerUp = useCallback(() => {
    draggingRef.current = null
  }, [])

  return (
    <Box
      ref={containerRef}
      position="relative"
      display="inline-block"
      maxW="100%"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      userSelect="none"
    >
      <img src={originalUrl} onLoad={handleImageLoad} style={{ maxWidth: '100%', display: 'block' }} />
      {items.map(item => {
        const fsPx = containerHeight * item.fontSize / 100
        const strokePx = item.strokeWidth * (fsPx / 20)
        return (
        <Box
          key={item.id}
          position="absolute"
          left={`${item.x}%`}
          top={`${item.y}%`}
          transform="translate(-50%, -50%)"
          cursor="grab"
          onPointerDown={(e: PointerEvent) => handlePointerDown(e, item)}
          style={{
            fontSize: `${fsPx}px`,
            fontFamily: item.fontFamily,
            color: item.color,
            WebkitTextStroke: item.strokeWidth > 0 ? `${strokePx}px ${item.strokeColor}` : undefined,
            paintOrder: 'stroke fill',
            whiteSpace: 'nowrap',
            outline: selectedId === item.id ? '2px dashed rgba(0,150,255,0.8)' : 'none',
            outlineOffset: '2px',
          }}
        >
          {item.text || '...'}
        </Box>
        )
      })}
    </Box>
  )
}
