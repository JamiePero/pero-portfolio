import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
//
// No manual chunking needed: three.js and framer-motion's heavier paths are
// reached through the dynamic import in Hero.tsx, which the bundler already
// splits into its own chunk. Keeping the config bare avoids fighting Rolldown's
// default chunking, which is better at this than a hand-written list.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Mirrors the "@/*" paths entry in tsconfig.app.json.
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
