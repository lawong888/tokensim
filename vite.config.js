import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react({
    include: ['**/*.jsx', '**/*.js'] 
  })],
  esbuild: {
    jsx: 'react'
  },
  server: {
    host: 'localhost',
    port: 5174,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  }
})
