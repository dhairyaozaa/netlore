export const ERAS = [
  { year:2005, label:'YouTube Genesis',   color:'#ff2d78', icon:'▶', mood:'discovery & wonder',     peak:'Numa Numa · Charlie the Unicorn · Smosh' },
  { year:2008, label:'Meme Golden Age',   color:'#ffb800', icon:'★', mood:'chaos & creativity',     peak:'Rickroll · Rage Comics · LOLcats' },
  { year:2010, label:'Tumblr Aesthetic',  color:'#b57bee', icon:'✦', mood:'identity & expression',  peak:'Nyan Cat · Doge · Double Rainbow' },
  { year:2012, label:'Minecraft Era',     color:'#00f5ff', icon:'⬛', mood:'community & adventure', peak:'SkyDoesMinecraft · CaptainSparklez · OpTic' },
  { year:2014, label:'Vaporwave Rise',    color:'#b57bee', icon:'◈', mood:'nostalgia & surrealism',  peak:'Floral Shoppe · Aesthetic Tumblr · Mallsoft' },
  { year:2016, label:'Vine Finale',       color:'#ff2d78', icon:'⚡', mood:'brevity & humor',        peak:'It is Wednesday · Do It · RIP Vine' },
  { year:2018, label:'VSCO & E-Girl',     color:'#ffb800', icon:'◉', mood:'aesthetic curation',     peak:'Hydro Flask · Scrunchies · Alt TikTok' },
  { year:2020, label:'Pandemic Internet', color:'#00f5ff', icon:'∞', mood:'connection & irony',     peak:'Sea Shanties · Among Us · Cottagecore' },
  { year:2022, label:'Liminal Spaces',    color:'#b57bee', icon:'◌', mood:'dread & beauty',         peak:'Backrooms · Dreamcore · NPC TikTok' },
]

export const STATS = [
  { val:'105',    label:'indexed documents' },
  { val:'18yr',   label:'internet history' },
  { val:'100%',   label:'local inference' },
  { val:'BM25',   label:'ranking algorithm' },
]

export const FEATURES = [
  { icon:'🔮', title:'BM25 Semantic Search',     desc:'Okapi BM25 + TF-IDF cosine similarity ranks 105 documents in milliseconds. The same algorithm powering Elasticsearch.',  color:'rgba(0,245,255,.12)' },
  { icon:'🧠', title:'Naive Bayes Era Classifier', desc:'Trained at runtime on labeled corpus. Detects which internet era your query belongs to and boosts relevant results.',       color:'rgba(255,45,120,.1)'  },
  { icon:'📡', title:'Vibe Query Expansion',      desc:'Curated internet culture lexicons expand "old minecraft feels" into 40+ related terms before search begins.',               color:'rgba(181,123,238,.12)' },
  { icon:'▶',  title:'Live YouTube Results',       desc:'Top AI-ranked results resolve to real YouTube searches via Data API v3. Click any result to watch the actual video.',       color:'rgba(255,184,0,.1)'   },
  { icon:'📼', title:'Wayback Archive Engine',     desc:'Express proxy resolves archive.org snapshots with CORS headers, surfacing deleted pages and cached internet history.',      color:'rgba(0,245,255,.1)'   },
  { icon:'🌐', title:'Memory Boards',             desc:'Curate and save internet archaeology finds. Community-tagged collections organized by era and aesthetic.',                   color:'rgba(255,45,120,.09)' },
]

export const PIPELINE = [
  { step:'01', label:'Query Expand',  desc:'VibeEngine injects 10–40 synonyms using curated internet-culture lexicon' },
  { step:'02', label:'BM25 Rank',     desc:'Okapi BM25 scores all 105 corpus docs — k1=1.5, b=0.75, Laplace-smoothed' },
  { step:'03', label:'Era Boost',     desc:'Naive Bayes classifier boosts docs matching predicted era (±2 years)' },
  { step:'04', label:'YouTube Fetch', desc:'Top results\' YouTube queries hit Data API v3, real videos surface live' },
]

export const TECH = ['BM25','TF-IDF','Naive Bayes','Cosine Sim','YouTube API v3','CORS Proxy','Zustand']

export const VIBES = [
  '2012 Minecraft Parody','Early Creepypasta','Vaporwave 2014',
  'COD Montage Era','Old YouTube Intro Energy','Tumblr 2011 Aesthetic',
  'Newgrounds Flash Era','Numa Numa era','MSN Messenger vibes',
  'Liminal school hallways','Sea shanty TikTok','Among Us sus era',
]

export const HEATMAP = [
  {year:2005,val:28},{year:2006,val:35},{year:2007,val:42},
  {year:2008,val:55},{year:2009,val:62},{year:2010,val:70},
  {year:2011,val:75},{year:2012,val:95},{year:2013,val:88},
  {year:2014,val:80},{year:2015,val:72},{year:2016,val:68},
  {year:2017,val:65},{year:2018,val:78},{year:2019,val:82},
  {year:2020,val:90},{year:2021,val:85},{year:2022,val:70},
]

export const BOARDS = [
  { title:'2012 Minecraft World',   color:'#00f5ff', icon:'⬛', count:247, author:'NoobSlayer99' },
  { title:'Nyan Cat & Friends',     color:'#ff2d78', icon:'🌈', count:89,  author:'MemeArchive' },
  { title:'Vaporwave Collection',   color:'#b57bee', icon:'◈',  count:312, author:'AestheticBot' },
  { title:'Early Creepypasta Docs', color:'#ffb800', icon:'👁', count:54,  author:'ShadowReader' },
  { title:'Classic YT Intros',      color:'#00f5ff', icon:'★',  count:176, author:'IntroCollector' },
  { title:'MSN Messenger Era',      color:'#ff2d78', icon:'💬', count:428, author:'00sKid' },
]
