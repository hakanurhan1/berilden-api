import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // <-- Bu satır, hostingdeki dosya bulamama sorununu çözer
  build: {
    outDir: 'dist',
    sourcemap: true, // Hata ayıklamayı kolaylaştırır
  },
})