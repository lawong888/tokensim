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
    host: true,
    strictPort: true,
    port: 5173,
    // Handle SPA fallback for client-side routing
    historyApiFallback: true,
    base: './'
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  }
})
