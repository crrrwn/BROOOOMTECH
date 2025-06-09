import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 5000
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
