import { useState, useCallback } from 'preact/hooks'
import { Box, Button, Text } from '@chakra-ui/react'
import { Plus, Trash2 } from 'lucide-react'
import { useI18n } from '../i18n'
import { TextDragPreview } from './TextDragPreview'
import type { TextOverlayItem } from '../types'

interface Props {
  originalUrl: string | null
  items: TextOverlayItem[]
  onChange: (items: TextOverlayItem[]) => void
}

const PRESET_FONTS = [
  { label: 'Noto Sans JP', value: '"Noto Sans JP", sans-serif' },
  { label: 'Noto Serif JP', value: '"Noto Serif JP", serif' },
  { label: 'M PLUS Rounded 1c', value: '"M PLUS Rounded 1c", sans-serif' },
  { label: 'Sans-serif', value: 'sans-serif' },
  { label: 'Serif', value: 'serif' },
  { label: 'Monospace', value: 'monospace' },
]

let idCounter = 0

export function TextOverlay({ originalUrl, items, onChange }: Props) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [localFonts, setLocalFonts] = useState<{ label: string; value: string }[]>([])
  const [localFontsLoaded, setLocalFontsLoaded] = useState(false)

  // Try to load local fonts
  const loadLocalFonts = useCallback(async () => {
    if (localFontsLoaded) return
    try {
      // @ts-ignore - Local Font Access API
      const fonts = await window.queryLocalFonts()
      const seen = new Set<string>()
      const fontList: { label: string; value: string }[] = []
      for (const font of fonts) {
        if (!seen.has(font.family)) {
          seen.add(font.family)
          fontList.push({ label: font.family, value: `"${font.family}"` })
        }
      }
      fontList.sort((a, b) => a.label.localeCompare(b.label))
      setLocalFonts(fontList)
      setLocalFontsLoaded(true)
    } catch (_) {
      // API not available or permission denied
    }
  }, [localFontsLoaded])

  const addItem = useCallback(() => {
    const id = `text-${++idCounter}`
    const newItem: TextOverlayItem = {
      id,
      text: '',
      x: 50,
      y: 50,
      fontSize: 5,
      color: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 2,
      fontFamily: '"Noto Sans JP", sans-serif',
    }
    onChange([...items, newItem])
    setSelectedId(id)
  }, [items, onChange])

  const updateItem = useCallback((id: string, updates: Partial<TextOverlayItem>) => {
    onChange(items.map(it => it.id === id ? { ...it, ...updates } : it))
  }, [items, onChange])

  const removeItem = useCallback((id: string) => {
    onChange(items.filter(it => it.id !== id))
    if (selectedId === id) setSelectedId(null)
  }, [items, onChange, selectedId])

  if (!originalUrl) return null

  return (
    <Box display="flex" flexDirection="column" gap="2">
      <Box
        as="button"
        onClick={() => setOpen(!open)}
        fontWeight="semibold"
        textAlign="left"
        cursor="pointer"
        bg="transparent"
        border="none"
        borderTopWidth="1px"
        borderColor="border.default"
        pt="3"
        pl="0"
        pr="0"
        pb="0"
        color="inherit"
        fontSize="md"
      >
        {open ? '\u25BC' : '\u25B6'} {t('textOverlay.heading')}
      </Box>
      {open && (
        <Box display="flex" flexDirection="column" gap="3">
          <Button size="sm" variant="outline" onClick={addItem}>
            <Plus size={14} /> {t('textOverlay.addText')}
          </Button>

          {items.length > 0 && (
            <TextDragPreview
              originalUrl={originalUrl}
              items={items}
              onChange={onChange}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          )}

          {items.map(item => (
            <Box key={item.id} p="2" borderWidth="1px" borderColor={selectedId === item.id ? 'blue.400' : 'border.default'} borderRadius="md"
              onClick={() => setSelectedId(item.id)}>
              <Box display="flex" gap="2" alignItems="center" mb="2">
                <input
                  type="text"
                  value={item.text}
                  placeholder={t('textOverlay.placeholder')}
                  onInput={e => updateItem(item.id, { text: (e.target as HTMLInputElement).value })}
                  style={{ flex: 1, padding: '4px 8px', borderRadius: '4px', border: '1px solid #555', background: 'transparent', color: 'inherit' }}
                />
                <Button size="xs" variant="ghost" p="1" minW="auto" onClick={(e: Event) => { e.stopPropagation(); removeItem(item.id) }}>
                  <Trash2 size={14} />
                </Button>
              </Box>

              <Box display="flex" flexDirection="column" gap="2" fontSize="xs">
                <Box display="flex" alignItems="center" gap="2">
                  <Text flexShrink={0}>{t('textOverlay.fontSize')}</Text>
                  <input type="range" min={1} max={20} step={0.5} value={item.fontSize}
                    onInput={e => updateItem(item.id, { fontSize: Number((e.target as HTMLInputElement).value) })}
                    style={{ flex: 1 }} />
                  <Text w="30px" textAlign="right">{item.fontSize}%</Text>
                </Box>

                <Box display="flex" alignItems="center" gap="2">
                  <Text flexShrink={0}>{t('textOverlay.color')}</Text>
                  <input type="color" value={item.color}
                    onInput={e => updateItem(item.id, { color: (e.target as HTMLInputElement).value })} />
                  <Text flexShrink={0}>{t('textOverlay.strokeColor')}</Text>
                  <input type="color" value={item.strokeColor}
                    onInput={e => updateItem(item.id, { strokeColor: (e.target as HTMLInputElement).value })} />
                </Box>

                <Box display="flex" alignItems="center" gap="2">
                  <Text flexShrink={0}>{t('textOverlay.strokeWidth')}</Text>
                  <input type="range" min={0} max={10} step={0.5} value={item.strokeWidth}
                    onInput={e => updateItem(item.id, { strokeWidth: Number((e.target as HTMLInputElement).value) })}
                    style={{ flex: 1 }} />
                  <Text w="20px" textAlign="right">{item.strokeWidth}</Text>
                </Box>

                <Box display="flex" alignItems="center" gap="2">
                  <Text flexShrink={0}>{t('textOverlay.fontFamily')}</Text>
                  <select value={item.fontFamily}
                    onChange={e => updateItem(item.id, { fontFamily: e.currentTarget.value })}
                    style={{ flex: 1, padding: '2px 4px', borderRadius: '4px', border: '1px solid #555', background: 'transparent', color: 'inherit', fontSize: '12px' }}>
                    {PRESET_FONTS.map(f => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                    {localFonts.length > 0 && (
                      <optgroup label={t('textOverlay.localFonts')}>
                        {localFonts.map(f => (
                          <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  {!localFontsLoaded && 'queryLocalFonts' in window && (
                    <Button size="xs" variant="solid" onClick={loadLocalFonts} p="1" minW="auto" title={t('textOverlay.loadLocalFonts')}>
                      +
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}
