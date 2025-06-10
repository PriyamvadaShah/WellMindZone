import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // You can change this port if needed
    proxy: {
      '/socket.io': {
        target: 'http://localhost:6005',
        changeOrigin: true,
        ws: true, // Important for WebSockets!
      }
    }
  }
})