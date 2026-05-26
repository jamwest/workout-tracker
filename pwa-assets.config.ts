import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  preset: {
    ...minimal2023Preset,
    apple: {
      sizes: [180],
      padding: 0.1,
    },
    maskable: {
      sizes: [512],
      padding: 0.15,
      resizeOptions: { background: '#0d0d0d' },
    },
    transparent: {
      sizes: [192, 512],
      padding: 0.05,
      resizeOptions: { background: '#0d0d0d' },
    },
  },
  images: ['public/flame.svg'],
})
