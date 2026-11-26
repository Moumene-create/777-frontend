import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The 7.77 API only allows the dev origin http://localhost:5173, so the
// dev/preview servers must not silently fall back to another port.
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
  preview: {
    port: 5173,
    strictPort: true,
  },
})
