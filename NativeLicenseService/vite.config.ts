import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: 'src/renderer',
  publicDir: resolve(__dirname, 'public'),
  build: {
    outDir: '../../dist/renderer',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'src/renderer/index.html'),
    },
  },
  base: './',
  server: {
    port: 5174,
  },
  optimizeDeps: {
    include: [],
  },
})

