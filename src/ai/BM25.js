/**
 * BM25 (Okapi BM25) — Local AI Ranking Algorithm
 * Superior to TF-IDF for document ranking. No training required.
 * Robertson et al., 1994. Industry standard in search engines (Elasticsearch, Lucene).
 *
 * Score(q,d) = Σ IDF(qi) * [TF(qi,d)*(k1+1)] / [TF(qi,d) + k1*(1-b+b*|d|/avgdl)]
 */
import { tokenize } from './TFIDF.js'

const K1 = 1.5   // term frequency saturation
const B  = 0.75  // document length normalization

export class BM25 {
  constructor() {
    this.corpus    = []
    this.idf       = {}
    this.avgdl     = 0
  }

  fit(docs) {
    this.corpus = docs.map(d => tokenize(
      [d.title, d.description, ...(d.tags || []), ...(d.vibes || [])].join(' ')
    ))

    const N  = this.corpus.length
    this.avgdl = this.corpus.reduce((s, t) => s + t.length, 0) / N

    // Build document frequency map
    const df = {}
    this.corpus.forEach(tokens => {
      new Set(tokens).forEach(t => { df[t] = (df[t] || 0) + 1 })
    })

    // Precompute IDF: ln((N - df + 0.5) / (df + 0.5) + 1)
    Object.entries(df).forEach(([t, freq]) => {
      this.idf[t] = Math.log((N - freq + 0.5) / (freq + 0.5) + 1)
    })

    return this
  }

  /** Score all documents for a query, return array of {i, score} sorted desc */
  search(queryText, topN = 30) {
    const queryTerms = tokenize(queryText)
    const scores = this.corpus.map((docTokens, i) => {
      const dl = docTokens.length
      const tf = {}
      docTokens.forEach(t => { tf[t] = (tf[t] || 0) + 1 })

      const score = queryTerms.reduce((sum, term) => {
        const idf    = this.idf[term] || 0
        const f      = tf[term] || 0
        const denom  = f + K1 * (1 - B + B * dl / this.avgdl)
        return sum + idf * (f * (K1 + 1)) / denom
      }, 0)

      return { i, score }
    })

    scores.sort((a, b) => b.score - a.score)
    return scores.slice(0, topN)
  }
}
