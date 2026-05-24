/**
 * NETLORE Corpus — Full Internet Culture Dataset
 * 2500 labeled documents spanning 2005–2024.
 * Merged from 14 source files for BM25, TF-IDF, and Naive Bayes Era Classifier.
 */
import { CORPUS_P1 }  from './corpus_p1.js'
import { CORPUS_P2 }  from './corpus_p2.js'
import { CORPUS_P3 }  from './corpus_p3.js'
import { CORPUS_P4 }  from './corpus_p4.js'
import { CORPUS_P5 }  from './corpus_p5.js'
import { CORPUS_P6 }  from './corpus_p6.js'
import { CORPUS_P7 }  from './corpus_p7.js'
import { CORPUS_P8 }  from './corpus_p8.js'
import { CORPUS_P9 }  from './corpus_p9.js'
import { CORPUS_P10 } from './corpus_p10.js'
import { CORPUS_P11 } from './corpus_p11.js'
import { CORPUS_P12 } from './corpus_p12.js'
import { CORPUS_P13 } from './corpus_p13.js'
import { CORPUS_P14 } from './corpus_p14.js'

export const CORPUS = [
  ...CORPUS_P1,
  ...CORPUS_P2,
  ...CORPUS_P3,
  ...CORPUS_P4,
  ...CORPUS_P5,
  ...CORPUS_P6,
  ...CORPUS_P7,
  ...CORPUS_P8,
  ...CORPUS_P9,
  ...CORPUS_P10,
  ...CORPUS_P11,
  ...CORPUS_P12,
  ...CORPUS_P13,
  ...CORPUS_P14,
]
