// Cấu hình Vite cho frontend QLHV — plugin React và proxy API/uploads tới backend local
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Chuyển tiếp request /api và /uploads sang server backend (port 5000)
    proxy: {
      '/api': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
    },
  },
})
