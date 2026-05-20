/**
 * Vibe Engine — Semantic Query Expander
 * Expands user queries using curated internet-culture lexicons.
 * No ML required — expert-curated synonym/concept maps.
 *
 * Example: "old minecraft feels" →
 *   expanded: "minecraft let's play survival crafting 2012 2013 creeper diamond
 *              SkyDoesMinecraft CaptainSparklez nostalgia golden era blocky"
 */

// ── Vibe → expanded terms map ─────────────────────────────────────────
export const VIBE_LEXICON = {
  // Aesthetics
  vaporwave:    ['vaporwave','aesthetic','mallsoft','synthwave','outrun','retrowave','a e s t h e t i c','windows 95','japanese','sunset','neon','grid','lo-fi'],
  lofi:         ['lofi','lo-fi','chill','study beats','rain','coffee','slow','mellow','jazzy','relaxing'],
  liminal:      ['liminal','backrooms','poolrooms','empty','abandoned','uncanny','eerie','fluorescent','hallway','school','hotel','backrooms','dreamcore','nostalgiacore'],
  cottagecore:  ['cottagecore','aesthetic','nature','cozy','forest','cottage','vintage','floral','mushroom','rustic'],
  darkweb:      ['deep web','dark web','creepypasta','horror','unknown','scary','disturbing','mystery','unsettling'],
  glitchcore:   ['glitch','error','artifact','corrupted','distorted','vhs','crt','static','noise'],

  // Eras by vibe
  'early youtube': ['early youtube','2005','2006','2007','viral','low quality','buffering','480p','subscribe','smosh','fred','ray william johnson'],
  'golden era':    ['2009','2010','2011','2012','golden age','classic','og','original','nostalgia','throwback'],
  'minecraft era': ['minecraft','2012','2013','survival','crafting','diamond','creeper','enderman','let\'s play','texture pack'],
  'vine era':      ['vine','6 second','loop','it is wednesday','do it','2013','2014','2015','2016','vine compilation'],
  'tumblr era':    ['tumblr','2011','2012','2013','reblog','aesthetic','quote','hipster','indie','pastel','fandom'],
  'tiktok era':    ['tiktok','2019','2020','2021','for you','fyp','trend','sound','dance','transition'],
  'pandemic':      ['pandemic','2020','quarantine','lockdown','zoom','toilet paper','covid','stay home','distance'],

  // Content types
  montage:      ['montage','quickscope','trickshot','cod','call of duty','360','no scope','optic','faze','mlg'],
  creepypasta:  ['creepypasta','scary','horror','slenderman','jeff the killer','ben drowned','lost episode','haunted','ritual'],
  'let\'s play':['let\'s play','lets play','walkthrough','playthrough','commentary','gameplay','gaming','reaction'],
  meme:         ['meme','rage comic','troll face','forever alone','me gusta','doge','pepe','chad','wojak','distracted boyfriend'],
  parody:       ['parody','song','parody song','minecraft song','animated','lego','animation'],

  // Moods
  nostalgic:    ['nostalgic','throwback','memories','remember','childhood','2000s','90s','old','classic','vintage'],
  cringe:       ['cringe','awkward','embarrassing','edgy','random','xd','rawr','scene','emo','cringeworthy'],
  wholesome:    ['wholesome','cute','heartwarming','nice','good','pure','precious','uwu','soft'],
  edgy:         ['edgy','dark','disturbing','shock','gross','weird','strange','bizarre','wtf'],

  // Platforms
  newgrounds:   ['newgrounds','flash','animation','stick figure','madness','foamy','there she is','shield','ng'],
  ytmnd:        ['ytmnd','you\'re the man now dog','loop','music','image','2004','2005','2006'],
  ebaumsworld:  ['ebaumsworld','ebaums','viral','funny','flash','stolen','compilation'],
  albinoblacksheep: ['albinoblacksheep','abs','flash','animation','badger badger','llama','end of the world'],
}

// ── Era year ranges ───────────────────────────────────────────────────
export const ERA_RANGES = [
  { label:'YouTube Genesis',  years:[2005,2006,2007,2008], color:'#ff2d78' },
  { label:'Meme Golden Age',  years:[2008,2009,2010,2011], color:'#ffb800' },
  { label:'Tumblr Era',       years:[2010,2011,2012,2013], color:'#b57bee' },
  { label:'Minecraft Era',    years:[2011,2012,2013,2014], color:'#00f5ff' },
  { label:'Vaporwave',        years:[2013,2014,2015,2016], color:'#b57bee' },
  { label:'Vine Era',         years:[2013,2014,2015,2016], color:'#ff2d78' },
  { label:'VSCO / E-Girl',    years:[2017,2018,2019],      color:'#ffb800' },
  { label:'Pandemic Net',     years:[2020,2021,2022],      color:'#00f5ff' },
  { label:'Liminal / Dreamy', years:[2021,2022,2023],      color:'#b57bee' },
]

// ── Explicit era mentions in text ─────────────────────────────────────
const ERA_PATTERN = /\b(200[5-9]|201[0-9]|202[0-4])\b/g

export class VibeEngine {
  /** Expand a query with vibe-related synonyms */
  expand(query) {
    const lower = query.toLowerCase()
    const extra = new Set()

    // Check each vibe key
    Object.entries(VIBE_LEXICON).forEach(([key, terms]) => {
      const keyMatches = lower.includes(key)
      const termMatch  = terms.some(t => lower.includes(t))
      if (keyMatches || termMatch) {
        terms.forEach(t => extra.add(t))
        if (keyMatches) extra.add(key)
      }
    })

    const expanded = [query, ...extra].join(' ')
    return expanded
  }

  /** Detect explicit year mentions */
  detectYears(query) {
    const matches = query.match(ERA_PATTERN)
    return matches ? matches.map(Number) : []
  }

  /** Get era label for a year */
  eraForYear(year) {
    return ERA_RANGES.find(r => r.years.includes(year)) || null
  }

  /** Score how well a document matches a vibe query (0–1) */
  vibeScore(query, doc) {
    const lower  = query.toLowerCase()
    const docStr = [doc.title, doc.description, ...(doc.tags||[]), ...(doc.vibes||[])].join(' ').toLowerCase()
    let score = 0
    let checks = 0

    Object.entries(VIBE_LEXICON).forEach(([key, terms]) => {
      if (lower.includes(key) || terms.some(t => lower.includes(t))) {
        checks++
        const hits = terms.filter(t => docStr.includes(t)).length
        score += hits / terms.length
      }
    })

    return checks > 0 ? score / checks : 0
  }
}
