import { defineConfig } from 'vite'

export default defineConfig({
  base: '/', // Base path for production
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