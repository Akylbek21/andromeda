import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'https://yadro.andromedaedu.kz',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
