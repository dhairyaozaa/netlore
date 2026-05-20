/**
 * NETLORE Corpus — Full Internet Culture Dataset
 * ~420 labeled documents spanning 2005–2023.
 * Merged from three source files for BM25, TF-IDF, and Naive Bayes Era Classifier.
 *
 * To extend: add entries to corpus_p1.js, corpus_p2.js, or corpus_p3.js
 * and re-import here. Models rebuild automatically at runtime.
 */
import { CORPUS_P1 } from './corpus_p1.js'
import { CORPUS_P2 } from './corpus_p2.js'
import { CORPUS_P3 } from './corpus_p3.js'

export const CORPUS = [...CORPUS_P1, ...CORPUS_P2, ...CORPUS_P3]
