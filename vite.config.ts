import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// @ts-expect-error -- plain ESM shared with the Vercel function, no types
import { fetchChannelVideos } from './api/_feed.js'

/**
 * Serves /api/youtube during `npm run dev`.
 *
 * Vercel runs the functions in /api in production, but Vite knows nothing about
 * them, so without this the YouTube page 404s locally and the only way to see it
 * working is to deploy. This imports the same module the function does, so dev
 * and production can't drift.
 */
function youtubeApiDevServer(): Plugin {
  return {
    name: 'youtube-api-dev-server',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/youtube', async (req, res) => {
        const params = new URL(req.url ?? '', 'http://localhost').searchParams
        res.setHeader('content-type', 'application/json')
        try {
          const videos = await fetchChannelVideos(
            params.get('channelId') ?? '',
            Math.min(Number(params.get('limit')) || 12, 15),
          )
          res.end(JSON.stringify({ videos }))
        } catch (error) {
          res.statusCode = 502
          res.end(JSON.stringify({ error: String(error), videos: [] }))
        }
      })
    },
  }
}

// https://vite.dev/config/
//
// No manual chunking needed: three.js and framer-motion's heavier paths are
// reached through the dynamic import in Hero.tsx, which the bundler already
// splits into its own chunk. Keeping the config bare avoids fighting Rolldown's
// default chunking, which is better at this than a hand-written list.
export default defineConfig({
  plugins: [react(), tailwindcss(), youtubeApiDevServer()],
  resolve: {
    alias: {
      // Mirrors the "@/*" paths entry in tsconfig.app.json.
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
