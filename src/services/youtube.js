/**
 * NETLORE — YouTube Data API v3 Service
 *
 * Strategy (in order):
 *  1. Direct YouTube API call using VITE_YOUTUBE_API_KEY (browser-safe, works without server)
 *  2. Proxy fallback via /api/youtube/search (only if Express server is running)
 *  3. Graceful no-key fallback (returns empty array, UI shows YouTube search link)
 *
 * VITE_ prefix means the key is intentionally client-side.
 * To hide the key server-side, run `npm run server` and remove VITE_ prefix.
 */

const API_KEY    = import.meta.env.VITE_YOUTUBE_API_KEY
const DIRECT_URL = 'https://www.googleapis.com/youtube/v3/search'
const PROXY_URL  = '/api/youtube/search'

let _proxyAvailable = null   // cached: null=unknown, true/false

/** Check once if the proxy server is up */
async function proxyAvailable() {
  if (_proxyAvailable !== null) return _proxyAvailable
  try {
    const r = await fetch('/api/health', { signal: AbortSignal.timeout(800) })
    _proxyAvailable = r.ok
  } catch {
    _proxyAvailable = false
  }
  return _proxyAvailable
}

/**
 * Search YouTube for videos.
 * @param {string} query  - search terms
 * @param {number} max    - max results (default 4)
 * @returns {Promise<YouTubeVideo[]>}
 */
export async function searchYouTube(query, max = 4) {
  if (!query?.trim()) return []

  const params = new URLSearchParams({ q: query, maxResults: max })

  // ── 1. Direct API (fastest, no server needed) ──────────────────────
  const hasKey = API_KEY && API_KEY !== 'YOUR_YOUTUBE_API_KEY_HERE'
  if (hasKey) {
    try {
      const url = `${DIRECT_URL}?${params}&part=snippet&type=video&key=${API_KEY}`
      const resp = await fetch(url, { signal: AbortSignal.timeout(8000) })
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        console.warn('[YouTube] API error:', err?.error?.message || resp.status)
        // Don't fall through on auth errors (wrong key)
        if (resp.status === 400 || resp.status === 403) return []
      } else {
        const data = await resp.json()
        return shapeResults(data)
      }
    } catch (err) {
      console.warn('[YouTube] Direct call failed:', err.message)
    }
  }

  // ── 2. Proxy fallback (only if server is running) ──────────────────
  if (!hasKey || await proxyAvailable()) {
    try {
      const resp = await fetch(`${PROXY_URL}?${params}`, {
        signal: AbortSignal.timeout(8000),
      })
      if (resp.ok) {
        const data = await resp.json()
        if (!data.error) return shapeResults(data)
      }
    } catch {
      // proxy not running — silent fail
    }
  }

  // ── 3. No key / all failed ─────────────────────────────────────────
  if (!hasKey) {
    console.info(
      '[NETLORE] No YouTube API key. Add VITE_YOUTUBE_API_KEY to .env\n' +
      'Get one free at: https://console.cloud.google.com/apis/library/youtube.googleapis.com'
    )
  }
  return []
}

/** Shape raw YouTube API response into clean objects */
function shapeResults(data) {
  if (!data?.items?.length) return []
  return data.items
    .filter(item => item.id?.videoId)
    .map(item => ({
      videoId:     item.id.videoId,
      title:       decodeEntities(item.snippet?.title || ''),
      channel:     item.snippet?.channelTitle || '',
      description: item.snippet?.description || '',
      publishedAt: item.snippet?.publishedAt || '',
      thumbnail:
        item.snippet?.thumbnails?.medium?.url ||
        item.snippet?.thumbnails?.high?.url   ||
        item.snippet?.thumbnails?.default?.url || '',
      embedUrl:  `https://www.youtube.com/embed/${item.id.videoId}?autoplay=1&rel=0&modestbranding=1`,
      watchUrl:  `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }))
}

/** Decode HTML entities in YouTube titles (e.g. &amp; → &) */
function decodeEntities(str) {
  return str
    .replace(/&amp;/g,  '&')
    .replace(/&lt;/g,   '<')
    .replace(/&gt;/g,   '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g,  "'")
}

/** Direct embed URL from a video ID */
export function embedUrl(videoId) {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`
}
