# NETLORE 🌐
### *The Internet's Folklore Engine*

> Local AI-powered search across 18 years of internet culture. Real YouTube results. No cloud. No LLM APIs.

---

## ⚡ Quick Start

```bash
# 1. Copy env and add your YouTube API key
cp .env.example .env
# Edit .env → add VITE_YOUTUBE_API_KEY

# 2. Install & run
npm install
npm run dev          # frontend → localhost:5173
node server/index.js # CORS proxy → localhost:3001 (optional)
```

### Docker
```bash
docker-compose up frontend          # prod → localhost:3000
docker-compose --profile dev up dev # dev hot-reload
docker-compose --profile proxy up proxy # CORS proxy server
```

---

## 🧠 Local AI — No Training Required

NETLORE runs **3 algorithms entirely in-browser**. No Python. No GPU. No external AI APIs.

### 1. BM25 (Okapi BM25)
The same ranking algorithm inside Elasticsearch and Lucene.
```
Score(q,d) = Σ IDF(qi) * [f(qi,d)*(k1+1)] / [f(qi,d) + k1*(1-b+b*|d|/avgdl)]
k1=1.5, b=0.75
```
- **No training required** — computed from corpus at runtime (~10ms for 105 docs)

### 2. Naive Bayes Era Classifier
Classifies queries into internet eras (2005–2022).
```
P(era|query) ∝ P(era) * ∏ P(term|era)   [log-space, Laplace smoothing]
```
- **"Trains" at runtime** from the labeled corpus in `src/data/corpus.js`
- No separate training step — reads corpus once on startup (~5ms)

### 3. TF-IDF + Cosine Similarity
Secondary signal for document ranking.
```
TF-IDF(t,d) = TF(t,d) * log((N+1)/(df(t)+1)) + 1
cos(q,d) = (q·d) / (|q|*|d|)
```
- **No training required** — builds inverted index at runtime

### 4. Vibe Query Expansion
Curated lexicon maps internet-culture concepts to related terms before search:
```
"old minecraft feels" → minecraft + let's play + 2012 + 2013 +
                        creeper + diamond + SkyDoesMinecraft + ...
```
- **No training required** — expert-curated dictionary in `src/ai/VibeEngine.js`

---

## 📊 The "Training Data"

The corpus in `src/data/corpus.js` **is** the training data. 105 labeled documents:

| Field | Description |
|-------|-------------|
| `era` | Year — used by Naive Bayes to learn per-era term distributions |
| `title` | Content title — primary text for BM25/TF-IDF |
| `description` | Full description — secondary signal |
| `tags[]` | Explicit topic labels |
| `vibes[]` | Aesthetic/cultural descriptors |
| `youtubeQuery` | Sent to YouTube API v3 when user clicks ▶ |

To **add more training data**: just append objects to the `CORPUS` array and reload. The models rebuild automatically.

---

## ▶ YouTube API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/library/youtube.googleapis.com)
2. Enable **YouTube Data API v3**
3. Create an **API Key** (restrict to YouTube Data API)
4. Add to `.env`:
   ```
   VITE_YOUTUBE_API_KEY=AIza...your_key_here
   ```
5. Optionally run the proxy server (`npm run server`) to keep the key server-side

**Without a key**: clicking ▶ shows a YouTube search link instead of embedding the video.

---

## 🏗 Architecture

```
netlore/
├── src/
│   ├── ai/
│   │   ├── TFIDF.js          ← TF-IDF vectorizer + cosine similarity
│   │   ├── BM25.js           ← Okapi BM25 ranking (k1=1.5, b=0.75)
│   │   ├── EraClassifier.js  ← Naive Bayes multi-class classifier
│   │   ├── VibeEngine.js     ← Query expansion + vibe lexicons
│   │   └── SearchEngine.js   ← Orchestrator (BM25 + NB + TF-IDF + vibe)
│   ├── data/
│   │   ├── corpus.js         ← 105 labeled internet culture documents
│   │   └── index.js          ← UI data (eras, stats, features)
│   ├── services/
│   │   └── youtube.js        ← YouTube Data API v3 client
│   ├── components/
│   │   ├── index.jsx         ← Nav, Ticker, Footer, FloatingBadge
│   │   └── VideoModal.jsx    ← YouTube embed player modal
│   └── views/
│       ├── Home/             ← Landing page with AI pipeline visualization
│       ├── Explore/          ← Live AI search + YouTube results
│       ├── Timeline/         ← Interactive era explorer + heatmap
│       └── Archive/          ← Wayback Machine browser + memory boards
├── server/
│   └── index.js              ← Express CORS proxy (YouTube + archive.org)
├── Dockerfile
└── docker-compose.yml
```

---

## 🔧 CORS Notes

CORS is handled at two levels:

1. **YouTube API** — called directly from browser with API key (no CORS issue). Optionally route through `/api/youtube/search` proxy to hide key.
2. **archive.org / Wayback Machine** — has CORS restrictions; routed through `server/index.js` at `/api/wayback` with explicit `Access-Control-Allow-Origin: *` headers.
3. **Dev proxy** — Vite's `server.proxy` forwards `/api/*` to `localhost:3001` in development.

---

## License
MIT
