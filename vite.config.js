import { defineConfig } from 'vite'

export default defineConfig({
  base: '/veronevanwormer-website/', // Updated to match your subdirectory
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: '/index.html'
      }
    }
  },
  server: {
    open: true
  }
})