import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { resolve } from 'path'
import { copyFileSync, existsSync, mkdirSync } from 'fs'

// Copy ntsc.py and ringPattern.npy to public/
const publicDir = resolve(__dirname, 'public')
if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true })
const parentDir = resolve(__dirname, '..')
if (existsSync(resolve(parentDir, 'ntsc.py'))) {
  copyFileSync(resolve(parentDir, 'ntsc.py'), resolve(publicDir, 'ntsc.py'))
  copyFileSync(resolve(parentDir, 'ringPattern.npy'), resolve(publicDir, 'ringPattern.npy'))
}

export default defineConfig({
  plugins: [preact()],
  worker: {
    format: 'es',
  },
})
