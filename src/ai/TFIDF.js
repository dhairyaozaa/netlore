/**
 * TF-IDF Vectorizer — Local AI Component
 * No external APIs. No training required.
 * Computes term frequency–inverse document frequency weights from corpus at runtime.
 */

// ── Tokenizer ─────────────────────────────────────────────────────────
const STOP_WORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with',
  'is','was','are','were','be','been','has','have','had','do','did','does',
  'this','that','these','those','i','you','he','she','it','we','they',
  'what','which','who','how','when','where','why','all','any','both',
  'each','few','more','most','other','some','such','no','not','only',
  'same','so','than','too','very','can','will','just','from','about',
])

export function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1 && !STOP_WORDS.has(t))
}

// ── TF-IDF ────────────────────────────────────────────────────────────
export class TFIDF {
  constructor() {
    this.documents  = []   // raw tokenized docs
    this.vocab      = {}   // term → index
    this.idf        = []   // idf[termIdx]
    this.docVectors = []   // sparse tf-idf vectors [{termIdx: weight}]
    this.docNorms   = []   // L2 norms for cosine similarity
  }

  /** Add corpus documents and build the index */
  fit(docs) {
    // Tokenize all docs
    this.documents = docs.map(d => tokenize(
      [d.title, d.description, ...(d.tags || []), ...(d.vibes || [])].join(' ')
    ))

    // Build vocabulary
    const termDocCount = {}
    this.documents.forEach(tokens => {
      const seen = new Set(tokens)
      seen.forEach(t => { termDocCount[t] = (termDocCount[t] || 0) + 1 })
    })

    // Only keep terms that appear in at least 1 doc (all) but not all docs
    let idx = 0
    Object.entries(termDocCount).forEach(([term, count]) => {
      this.vocab[term] = idx++
    })

    const N = this.documents.length

    // Compute IDF for each term
    this.idf = new Float32Array(idx)
    Object.entries(termDocCount).forEach(([term, count]) => {
      this.idf[this.vocab[term]] = Math.log((N + 1) / (count + 1)) + 1
    })

    // Compute TF-IDF vectors
    this.docVectors = this.documents.map(tokens => {
      const tf = {}
      tokens.forEach(t => { tf[t] = (tf[t] || 0) + 1 })
      const total = tokens.length || 1
      const vec = {}
      Object.entries(tf).forEach(([t, count]) => {
        const i = this.vocab[t]
        if (i !== undefined) vec[i] = (count / total) * this.idf[i]
      })
      return vec
    })

    // Precompute L2 norms
    this.docNorms = this.docVectors.map(vec => {
      const sumSq = Object.values(vec).reduce((s, v) => s + v * v, 0)
      return Math.sqrt(sumSq) || 1
    })

    return this
  }

  /** Vectorize a query string */
  transform(query) {
    const tokens = tokenize(query)
    const tf = {}
    tokens.forEach(t => { tf[t] = (tf[t] || 0) + 1 })
    const total = tokens.length || 1
    const vec = {}
    Object.entries(tf).forEach(([t, count]) => {
      const i = this.vocab[t]
      if (i !== undefined) vec[i] = (count / total) * this.idf[i]
    })
    return vec
  }

  /** Cosine similarity between a query vector and all doc vectors */
  cosineSimilarities(queryVec) {
    const qNorm = Math.sqrt(Object.values(queryVec).reduce((s, v) => s + v * v, 0)) || 1
    return this.docVectors.map((docVec, i) => {
      let dot = 0
      Object.entries(queryVec).forEach(([k, qw]) => {
        if (docVec[k]) dot += qw * docVec[k]
      })
      return dot / (qNorm * this.docNorms[i])
    })
  }

  /** Get top-N most similar docs for a query */
  query(text, topN = 20) {
    const vec   = this.transform(text)
    const sims  = this.cosineSimilarities(vec)
    const pairs = sims.map((score, i) => ({ i, score }))
    pairs.sort((a, b) => b.score - a.score)
    return pairs.slice(0, topN)
  }
}
