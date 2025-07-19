// File: bleep-bot-frontend/vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // This is the new section that automates the build process
  build: {
    // This sets the output directory to the backend's static folder
    outDir: path.resolve(__dirname, '../bleep-bot/src/static'),
    // This ensures the old files are deleted before a new build
    emptyOutDir: true,
  },

  server: {
    allowedHosts: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
})