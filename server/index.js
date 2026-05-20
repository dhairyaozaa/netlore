/**
 * NETLORE — Express Proxy Server
 * Handles CORS for archive.org, YouTube, and other external APIs.
 * Run with: node server/index.js  (or npm run server)
 */
import express from 'express'
import cors from 'cors'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

// Load .env if present
try { require('dotenv').config() } catch {}

const app  = express()
const PORT = process.env.PORT || 3001

// ── CORS: allow all origins for dev, restrict in production ───────────
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['http://localhost:3000', 'https://your-domain.com']
    : '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())

// ── Pre-flight OPTIONS for all routes ────────────────────────────────
app.options('*', cors(corsOptions))

// ── YouTube proxy (server-side key protection) ────────────────────────
app.get('/api/youtube/search', async (req, res) => {
  const { q, maxResults = 10, pageToken } = req.query
  const API_KEY = process.env.YOUTUBE_API_KEY || process.env.VITE_YOUTUBE_API_KEY

  if (!API_KEY || API_KEY === 'YOUR_YOUTUBE_API_KEY_HERE') {
    return res.status(503).json({ error: 'YouTube API key not configured. Add YOUTUBE_API_KEY to .env' })
  }
  if (!q) return res.status(400).json({ error: 'Missing query parameter q' })

  try {
    const params = new URLSearchParams({
      part: 'snippet',
      q,
      type: 'video',
      maxResults,
      key: API_KEY,
      ...(pageToken ? { pageToken } : {}),
    })
    const resp = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`)
    const data = await resp.json()

    if (!resp.ok) throw new Error(data.error?.message || 'YouTube API error')

    // Add CORS headers explicitly on the response
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Cache-Control', 'public, max-age=300') // 5-min cache
    return res.json(data)
  } catch (err) {
    console.error('[YouTube proxy]', err.message)
    return res.status(500).json({ error: err.message })
  }
})

// ── Wayback Machine / archive.org CORS proxy ─────────────────────────
app.get('/api/wayback', async (req, res) => {
  const { url } = req.query
  if (!url) return res.status(400).json({ error: 'Missing url param' })

  try {
    const resp = await fetch(`https://archive.org/wayback/available?url=${encodeURIComponent(url)}`)
    const data = await resp.json()
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.json(data)
  } catch (err) {
    return res.status(502).json({ error: 'Wayback Machine unreachable' })
  }
})

// ── Health check ──────────────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok', service: 'NETLORE proxy' }))

app.listen(PORT, () => {
  console.log(`\n🌐 NETLORE proxy server running on http://localhost:${PORT}`)
  console.log(`   YouTube API: ${process.env.YOUTUBE_API_KEY ? '✓ configured' : '✗ missing key'}`)
})
