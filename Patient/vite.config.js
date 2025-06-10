import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const config = {
  socketUrl: 'https://wellmindzone-1.onrender.com',
  apiUrl: 'https://wellmindzone-1.onrender.com',
  isDev: true
}

export { config }

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/socket.io': {
        target: 'http://localhost:6005',
        changeOrigin: true,
        ws: true,
      }
    }
  }
})