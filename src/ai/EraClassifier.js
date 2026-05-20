/**
 * Naive Bayes Era Classifier — Local AI Component
 * Classifies a query into an internet era (year range).
 * Trained at runtime from labeled corpus — no external training step needed.
 *
 * P(era|query) ∝ P(era) * ∏ P(term|era)
 * Using log-probabilities to avoid underflow.
 */
import { tokenize } from './TFIDF.js'

export class EraClassifier {
  constructor() {
    this.classPriors  = {}   // log P(era)
    this.termLikelihoods = {} // termLikelihoods[era][term] = log P(term|era)
    this.classes      = []
  }

  /** Train from labeled documents [{era, title, description, tags, vibes}] */
  fit(docs) {
    const classCounts = {}
    const termCounts  = {}  // termCounts[era][term]
    const totalTerms  = {}  // total terms per era

    docs.forEach(doc => {
      const era = String(doc.era)
      if (!classCounts[era]) { classCounts[era] = 0; termCounts[era] = {}; totalTerms[era] = 0 }
      classCounts[era]++

      const tokens = tokenize([doc.title, doc.description, ...(doc.tags||[]), ...(doc.vibes||[])].join(' '))
      tokens.forEach(t => {
        termCounts[era][t] = (termCounts[era][t] || 0) + 1
        totalTerms[era]++
      })
    })

    this.classes = Object.keys(classCounts).sort()
    const N = docs.length

    // Compute log priors
    this.classPriors = {}
    this.classes.forEach(era => {
      this.classPriors[era] = Math.log(classCounts[era] / N)
    })

    // Build global vocabulary
    const vocab = new Set()
    Object.values(termCounts).forEach(tc => Object.keys(tc).forEach(t => vocab.add(t)))
    const V = vocab.size

    // Compute log likelihoods with Laplace smoothing
    this.termLikelihoods = {}
    this.classes.forEach(era => {
      this.termLikelihoods[era] = {}
      const total = totalTerms[era]
      vocab.forEach(t => {
        const count = termCounts[era][t] || 0
        this.termLikelihoods[era][t] = Math.log((count + 1) / (total + V))
      })
    })

    return this
  }

  /** Predict era probabilities for a query. Returns [{era, probability}] sorted desc */
  predict(queryText) {
    const tokens = tokenize(queryText)

    const logScores = {}
    this.classes.forEach(era => {
      logScores[era] = this.classPriors[era]
      tokens.forEach(t => {
        if (this.termLikelihoods[era][t] !== undefined) {
          logScores[era] += this.termLikelihoods[era][t]
        }
      })
    })

    // Softmax for probabilities
    const maxScore = Math.max(...Object.values(logScores))
    const expScores = {}
    let expSum = 0
    Object.entries(logScores).forEach(([era, s]) => {
      expScores[era] = Math.exp(s - maxScore)
      expSum += expScores[era]
    })

    return this.classes
      .map(era => ({ era: Number(era), probability: expScores[era] / expSum }))
      .sort((a, b) => b.probability - a.probability)
  }

  /** Return the top predicted era year */
  topEra(queryText) {
    return this.predict(queryText)[0]
  }
}
