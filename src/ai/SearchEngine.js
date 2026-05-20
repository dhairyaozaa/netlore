/**
 * NETLORE Search Engine — Local AI Orchestrator
 *
 * Pipeline:
 *  1. Expand query via VibeEngine (synonym/concept injection)
 *  2. Rank corpus via BM25 (primary) + TF-IDF cosine (secondary)
 *  3. Apply era boost from EraClassifier (Naive Bayes)
 *  4. Apply vibe score overlay
 *  5. Merge & re-rank → top results with YouTube search queries
 *
 * No LLM APIs. No cloud. Runs entirely in the browser.
 */
import { TFIDF }          from './TFIDF.js'
import { BM25 }           from './BM25.js'
import { EraClassifier }  from './EraClassifier.js'
import { VibeEngine }     from './VibeEngine.js'
import { CORPUS }         from '@/data/corpus.js'

class SearchEngine {
  constructor() {
    this.ready      = false
    this.tfidf      = new TFIDF()
    this.bm25       = new BM25()
    this.classifier = new EraClassifier()
    this.vibe       = new VibeEngine()
    this.corpus     = CORPUS
  }

  /** Build all indexes from corpus. Call once at app startup. */
  init() {
    console.time('[NETLORE] AI init')
    this.tfidf.fit(this.corpus)
    this.bm25.fit(this.corpus)
    this.classifier.fit(this.corpus)
    this.ready = true
    console.timeEnd('[NETLORE] AI init')
    console.log(`[NETLORE] Indexed ${this.corpus.length} documents`)
    return this
  }

  /**
   * Search the corpus.
   * @param {string} rawQuery - Natural language query
   * @param {Object} opts
   * @param {number} opts.topN      - Max results (default 12)
   * @param {string} opts.eraFilter - Force filter to era year (optional)
   * @param {string} opts.typeFilter- Filter by type (video/meme/audio/archive)
   * @returns {Array} Results with scores and YouTube query strings
   */
  search(rawQuery, opts = {}) {
    if (!this.ready) this.init()
    const { topN = 12, eraFilter, typeFilter } = opts

    // 1. Query expansion
    const expanded = this.vibe.expand(rawQuery)

    // 2. BM25 ranking (primary signal)
    const bm25Results  = this.bm25.search(expanded, 50)
    const bm25Map      = {}
    bm25Results.forEach(({ i, score }) => { bm25Map[i] = score })
    const bm25Max      = Math.max(...Object.values(bm25Map), 0.001)

    // 3. TF-IDF cosine (secondary signal)
    const tfidfResults = this.tfidf.query(expanded, 50)
    const tfidfMap     = {}
    tfidfResults.forEach(({ i, score }) => { tfidfMap[i] = score })
    const tfidfMax     = Math.max(...Object.values(tfidfMap), 0.001)

    // 4. Era classification boost
    const eraPredictions = this.classifier.predict(rawQuery)
    const topEraYear     = eraPredictions[0]?.era
    const eraBoostMap    = {}
    eraPredictions.forEach(({ era, probability }) => {
      this.corpus.forEach((doc, i) => {
        if (Math.abs(doc.era - era) <= 2) {
          eraBoostMap[i] = (eraBoostMap[i] || 0) + probability * 0.4
        }
      })
    })

    // 5. Year mentions in raw query → hard boost
    const mentionedYears = this.vibe.detectYears(rawQuery)
    if (mentionedYears.length) {
      this.corpus.forEach((doc, i) => {
        if (mentionedYears.some(y => Math.abs(doc.era - y) <= 1)) {
          eraBoostMap[i] = (eraBoostMap[i] || 0) + 0.5
        }
      })
    }

    // 6. Vibe score
    const vibeScores = this.corpus.map(doc => this.vibe.vibeScore(rawQuery, doc))

    // 7. Merge scores
    const combinedScores = this.corpus.map((doc, i) => {
      const bm25Norm  = (bm25Map[i]  || 0) / bm25Max
      const tfidfNorm = (tfidfMap[i] || 0) / tfidfMax
      const eraBoost  = eraBoostMap[i] || 0
      const vibeSc    = vibeScores[i]  || 0

      return {
        i,
        score: bm25Norm * 0.45 + tfidfNorm * 0.25 + eraBoost * 0.2 + vibeSc * 0.1,
        breakdown: { bm25: bm25Norm, tfidf: tfidfNorm, era: eraBoost, vibe: vibeSc },
      }
    })

    combinedScores.sort((a, b) => b.score - a.score)

    // 8. Apply filters and shape output
    const results = combinedScores
      .filter(({ i }) => {
        const doc = this.corpus[i]
        if (eraFilter && String(doc.era) !== String(eraFilter)) return false
        if (typeFilter && doc.type && doc.type.toLowerCase() !== typeFilter.toLowerCase()) return false
        return true
      })
      .slice(0, topN)
      .map(({ i, score, breakdown }) => {
        const doc = this.corpus[i]
        return {
          ...doc,
          score,
          matchPct: Math.round(Math.min(score * 130, 99)),
          breakdown,
          youtubeQuery: doc.youtubeQuery || doc.title,
          predictedEra: topEraYear,
        }
      })
      .filter(r => r.score > 0.01)

    return {
      results,
      expandedQuery:  expanded,
      predictedEra:   topEraYear,
      eraPredictions: eraPredictions.slice(0, 3),
    }
  }

  /** Suggest related queries for a result */
  relatedQueries(doc) {
    const seeds = [...(doc.tags || []), ...(doc.vibes || [])].slice(0, 4)
    return seeds.map(seed => this.search(seed, { topN: 3 }).results).flat()
      .filter((r, i, arr) => arr.findIndex(x => x.id === r.id) === i && r.id !== doc.id)
      .slice(0, 4)
  }
}

// Singleton — initialized once
export const engine = new SearchEngine()
