// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // --- THIS IS THE FIX ---
  // Use absolute paths (default) instead of relative paths.
  base: '/', 
  // ---------------------
  build: {
    outDir: 'dist',
    // You probably don't need this rollupOptions block.
    // Vite finds /index.html at the root by default.
    // You can likely remove it.
    rollupOptions: {
      input: '/index.html', 
    },
  },
})