import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@design-system': fileURLToPath(new URL('./src/design-system', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // Modern browsers only — skips shipping legacy transforms/polyfills and
    // produces smaller, faster-parsing output.
    target: 'es2020',
    cssCodeSplit: true,
    // Split heavy third-party libraries into their own long-term-cacheable
    // chunks so they aren't re-downloaded when app code changes, and so no
    // single vendor blocks the main thread on first paint.
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui-vendor': ['@mui/material', '@mui/x-charts', '@emotion/react', '@emotion/styled'],
          'animation-vendor': ['framer-motion', 'gsap'],
          'dnd-vendor': ['@hello-pangea/dnd', 'react-beautiful-dnd'],
          'chart-vendor': ['recharts'],
          'analytics-vendor': ['posthog-js', '@posthog/react', 'web-vitals'],
        },
      },
    },
    // Raise the warning threshold so intentional vendor chunks don't spam the
    // build log.
    chunkSizeWarningLimit: 900,
  },
  server: {
    // host: true, // Allows the server to be accessed from external devices
    // port: 5173, // Optional: Specify the port (default is 5173)
    // open: true, // Optional: Opens the browser automatically
    host: false, // 👈 Force Vite to serve on localhost
    port: 5173, 
  },
})
