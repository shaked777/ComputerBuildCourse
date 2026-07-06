import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative asset paths → the built app works from any URL:
  // Netlify/Vercel root, GitHub Pages subfolder, even a local file server.
  base: './',
  server: {
    // Honor the port assigned by the launcher (PORT env), else default.
    port: Number(process.env.PORT) || 5173,
    // Hardening for GHSA-67mh-4wv8-2f99 (dev-server only): don't let other
    // websites read responses from the local dev server via CORS.
    cors: false,
  },
})
