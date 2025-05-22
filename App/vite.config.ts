import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // host: true, // Allows the server to be accessed from external devices
    // port: 5173, // Optional: Specify the port (default is 5173)
    // open: true, // Optional: Opens the browser automatically
    host: false, // 👈 Force Vite to serve on localhost
    port: 5173, 
  },
})
