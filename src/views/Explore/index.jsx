import React, { useEffect, useState, useRef } from 'react'
import { useStore } from '@/store/useStore'
import { useReveal } from '@/hooks/useReveal'
import { engine } from '@/ai/SearchEngine.js'
import { searchYouTube } from '@/services/youtube.js'
import { VIBES } from '@/data'

const AUTOFETCH_TOP = 8

// ── Sidebar ───────────────────────────────────────────────────────────
function Sidebar() {
  const { tab, setTab, sort, setSort, setResults, setSearchMeta, setSearching, query } = useStore()
  const eraSearch = y => {
    setSearching(true)
    setTimeout(() => { const r = engine.search(query || 'internet', { topN: 15, eraFilter: y }); setResults(r.results); setSearchMeta(r); setSearching(false) }, 10)
  }
  return (
    <aside className="hide-md" style={{ width: 220, flexShrink: 0 }}>
      <div style={{ position: 'sticky', top: 72 }}>
        <div className="label" style={{ marginBottom: 14 }}>// FILTERS</div>
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11, color: 'var(--muted2)', marginBottom: 9, fontWeight: 700, letterSpacing: '.05em' }}>TYPE</div>
          {['all','video','audio','meme','archive','music'].map(t => (
            <div key={t} className={`filter-row ${tab===t?'active':''}`} onClick={() => setTab(t)} style={{ textTransform:'capitalize' }}>
              {t}{tab===t&&<span style={{ fontSize:10 }}>✓</span>}
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11, color: 'var(--muted2)', marginBottom: 9, fontWeight: 700, letterSpacing: '.05em' }}>ERA</div>
          {[['2005–08',2006],['2009–11',2010],['2012–14',2012],['2015–17',2016],['2018–22',2020]].map(([l,y]) => (
            <div key={l} className="filter-row mono" style={{ fontSize:12 }} onClick={() => eraSearch(y)}>{l}</div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--muted2)', marginBottom: 9, fontWeight: 700, letterSpacing: '.05em' }}>SORT BY</div>
          {[['match','Vibe Match'],['era','Era Date']].map(([v,l]) => (
            <div key={v} className={`filter-row ${sort===v?'active':''}`} onClick={() => setSort(v)}>
              {l}{sort===v&&<span style={{ fontSize:10 }}>✓</span>}
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}

// ── Thumbnail ─────────────────────────────────────────────────────────
function Thumb({ doc, videos, loading, onClick }) {
  const [hov, setHov] = useState(false)
  const thumb    = videos?.[0]?.thumbnail
  const altThumb = videos?.[1]?.thumbnail

  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className="rthumb"
      style={{ width:148, minHeight:90, flexShrink:0, position:'relative', overflow:'hidden', cursor:'pointer',
        background:`linear-gradient(135deg,${doc.color}22,${doc.color}06)`,
        display:'flex', alignItems:'center', justifyContent:'center' }}>

      {loading && (
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,.4)', zIndex:2 }}>
          <span style={{ fontSize:16, color:'var(--cyan)', animation:'spin 1s linear infinite', display:'inline-block' }}>◌</span>
        </div>
      )}

      {thumb ? (
        <>
          <img src={hov && altThumb ? altThumb : thumb} alt={doc.title}
            style={{ width:'100%', height:'100%', objectFit:'cover', position:'absolute', inset:0, transition:'opacity .25s' }}
            onError={e => e.target.style.display='none'} />
          <div style={{ position:'absolute', inset:0, background:hov?'rgba(0,0,0,.45)':'rgba(0,0,0,.1)', display:'flex', alignItems:'center', justifyContent:'center', transition:'background .2s' }}>
            <div style={{ width:36, height:36, borderRadius:'50%',
              background:hov?'var(--cyan)':'rgba(0,0,0,.5)',
              border:'2px solid rgba(255,255,255,.8)',
              display:'flex', alignItems:'center', justifyContent:'center',
              transform:hov?'scale(1.1)':'scale(0.85)',
              transition:'all .22s cubic-bezier(.34,1.56,.64,1)',
              boxShadow:hov?'0 0 20px rgba(0,245,255,.6)':'none' }}>
              <span style={{ fontSize:13, color:hov?'#000':'#fff', marginLeft:2 }}>▶</span>
            </div>
          </div>
          <div style={{ position:'absolute', bottom:5, right:6, background:'rgba(0,0,0,.8)', borderRadius:3, padding:'1px 5px', fontSize:10, fontFamily:"'Space Mono',monospace", color:doc.color }}>{doc.era}</div>
        </>
      ) : (
        <>
          <span style={{ fontSize:30, zIndex:1 }}>{doc.thumb}</span>
          {hov && (
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,.5)' }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--cyan)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ fontSize:13, color:'#000', marginLeft:2 }}>▶</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Result Card ───────────────────────────────────────────────────────
function ResultCard({ doc, index }) {
  const { liked, toggleLike, setVideoModal, ytVideos, setYtVideos, ytLoading, setYtLoading } = useStore()
  const isLiked   = liked.has(doc.id)
  const videos    = ytVideos[doc.id]
  const loading   = ytLoading[doc.id]
  const channel   = videos?.[0]?.channel
  const matchColor= doc.matchPct>75?'var(--cyan)':doc.matchPct>50?'var(--amber)':'var(--muted)'

  const openVideo = async () => {
    if (videos?.length) { setVideoModal({ video:videos[0], doc }); return }
    setYtLoading(doc.id, true)
    const fetched = await searchYouTube(doc.youtubeQuery, 3)
    setYtVideos(doc.id, fetched)
    setYtLoading(doc.id, false)
    setVideoModal({ video:fetched[0]||null, doc })
  }

  return (
    <div className={`res-card rv d${Math.min(index+1,5)}`} style={{ display:'flex' }}>
      <Thumb doc={doc} videos={videos} loading={loading} onClick={openVideo} />

      <div style={{ flex:1, padding:'11px 13px', minWidth:0 }}>
        {/* Title row */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8, marginBottom:4 }}>
          <div style={{ fontWeight:700, fontSize:13, lineHeight:1.35, cursor:'pointer' }} onClick={openVideo}>{doc.title}</div>
          <span style={{ flexShrink:0, fontFamily:"'Space Mono',monospace", fontSize:10,
            color:matchColor, background:`${matchColor}14`, border:`1px solid ${matchColor}40`,
            borderRadius:4, padding:'2px 7px', whiteSpace:'nowrap' }}>{doc.matchPct}%</span>
        </div>

        {/* Channel name */}
        <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:6, minHeight:18 }}>
          {channel ? (
            <>
              <div style={{ width:14, height:14, borderRadius:'50%', background:`${doc.color}33`, border:`1px solid ${doc.color}66`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:7, color:doc.color, flexShrink:0 }}>▶</div>
              <span style={{ fontSize:11, color:doc.color, fontFamily:"'Space Mono',monospace", fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{channel}</span>
            </>
          ) : loading ? (
            <span style={{ fontSize:10, color:'var(--cyan)', fontFamily:"'Space Mono',monospace" }}>fetching channel…</span>
          ) : (
            <span style={{ fontSize:10, color:'var(--muted)', fontFamily:"'Space Mono',monospace", overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{doc.youtubeQuery?.slice(0,45)}</span>
          )}
        </div>

        {/* AI score mini-bars */}
        {doc.breakdown && (
          <div style={{ display:'flex', gap:8, marginBottom:6 }}>
            {[['BM25',doc.breakdown.bm25,'var(--cyan)'],['TF-IDF',doc.breakdown.tfidf,'var(--purple)'],['Era',doc.breakdown.era,'var(--amber)']].map(([k,v,c]) => (
              <div key={k} style={{ display:'flex', alignItems:'center', gap:3 }}>
                <span style={{ fontSize:9, fontFamily:"'Space Mono',monospace", color:'var(--muted)' }}>{k}</span>
                <div style={{ width:28, height:2, background:'rgba(255,255,255,.08)', borderRadius:1, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${Math.min(v*100,100)}%`, background:c, borderRadius:1 }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Badges + tags */}
        <div style={{ display:'flex', gap:5, marginBottom:5, flexWrap:'wrap' }}>
          <span style={{ fontSize:10, fontFamily:"'Space Mono',monospace", color:doc.color, background:`${doc.color}14`, borderRadius:3, padding:'1px 6px' }}>{doc.era}</span>
          <span style={{ fontSize:10, fontFamily:"'Space Mono',monospace", color:'var(--muted)', background:'rgba(255,255,255,.04)', borderRadius:3, padding:'1px 6px' }}>{doc.type}</span>
        </div>
        <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
          {doc.tags?.slice(0,4).map(t => (
            <span key={t} style={{ fontSize:9, color:'var(--muted)', fontFamily:"'Space Mono',monospace", background:'rgba(255,255,255,.03)', borderRadius:2, padding:'1px 5px', border:'1px solid var(--b)' }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding:'12px 10px 12px 0', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6, flexShrink:0 }}>
        {[
          { fn:openVideo, icon:loading?<span style={{ animation:'spin 1s linear infinite', display:'inline-block', fontSize:11 }}>◌</span>:'▶', active:false, ac:'var(--cyan)', bc:'rgba(0,245,255,.35)', bg:'rgba(0,245,255,.08)' },
          { fn:()=>toggleLike(doc.id), icon:isLiked?'♥':'♡', active:isLiked, ac:'var(--mag)', bc:isLiked?'var(--mag)':'var(--b)', bg:isLiked?'rgba(255,45,120,.1)':'transparent' },
        ].map(({fn,icon,ac,bc,bg},i) => (
          <button key={i} onClick={fn}
            style={{ width:32, height:32, borderRadius:'50%', border:`1px solid ${bc}`, background:bg, cursor:'pointer', color:ac, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', transition:'all .22s cubic-bezier(.34,1.56,.64,1)' }}
            onMouseEnter={e => { e.currentTarget.style.transform='scale(1.2)'; e.currentTarget.style.boxShadow=`0 0 12px ${ac}55` }}
            onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none' }}>
            {icon}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── AI Meta panel ─────────────────────────────────────────────────────
function AIMeta({ meta }) {
  if (!meta) return null
  return (
    <div style={{ padding:'12px 16px', background:'rgba(0,245,255,.04)', border:'1px solid rgba(0,245,255,.14)', borderRadius:10, marginBottom:14 }}>
      <div style={{ fontSize:11, fontFamily:"'Space Mono',monospace", color:'var(--cyan)', marginBottom:7 }}>🧠 AI ANALYSIS</div>
      <div style={{ display:'flex', gap:20, flexWrap:'wrap', alignItems:'flex-start' }}>
        <div>
          <div style={{ fontSize:9, color:'var(--muted)', marginBottom:3, letterSpacing:'.1em' }}>PREDICTED ERA</div>
          <div style={{ fontWeight:700, fontSize:16, color:'var(--amber)', fontFamily:"'Space Mono',monospace" }}>{meta.predictedEra}</div>
        </div>
        <div>
          <div style={{ fontSize:9, color:'var(--muted)', marginBottom:5, letterSpacing:'.1em' }}>CONFIDENCE</div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {meta.eraPredictions?.slice(0,4).map(p => (
              <div key={p.era} style={{ display:'flex', flexDirection:'column', gap:3, alignItems:'center' }}>
                <div style={{ width:34, height:3, background:'rgba(255,255,255,.08)', borderRadius:2, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${Math.round(p.probability*100)}%`, background:'var(--purple)', borderRadius:2 }} />
                </div>
                <span style={{ fontSize:9, fontFamily:"'Space Mono',monospace", color:'var(--muted)' }}>{p.era} <span style={{ color:'var(--purple)' }}>{Math.round(p.probability*100)}%</span></span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex:1, minWidth:160 }}>
          <div style={{ fontSize:9, color:'var(--muted)', marginBottom:3, letterSpacing:'.1em' }}>QUERY EXPANDED</div>
          <div style={{ fontSize:10, fontFamily:"'Space Mono',monospace", color:'var(--muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:280 }}>
            {meta.expandedQuery?.slice(0,80)}…
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Skeleton loader ───────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      {[...Array(6)].map((_,i) => (
        <div key={i} style={{ height:92, background:'var(--glass)', borderRadius:12, border:'1px solid var(--b)', overflow:'hidden', opacity:1-i*.12 }}>
          <div style={{ display:'flex', height:'100%' }}>
            <div style={{ width:148, background:'rgba(0,245,255,.04)', animation:`pulse 1.4s ease ${i*.1}s infinite` }} />
            <div style={{ flex:1, padding:14, display:'flex', flexDirection:'column', gap:8 }}>
              <div style={{ height:14, background:'rgba(255,255,255,.06)', borderRadius:4, width:`${70-i*5}%`, animation:`pulse 1.4s ease ${i*.1}s infinite` }} />
              <div style={{ height:10, background:'rgba(255,255,255,.04)', borderRadius:3, width:'35%', animation:`pulse 1.4s ease ${i*.12}s infinite` }} />
              <div style={{ height:8, background:'rgba(255,255,255,.03)', borderRadius:3, width:'55%', animation:`pulse 1.4s ease ${i*.14}s infinite` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Explore View ──────────────────────────────────────────────────────
export function ExploreView() {
  const { query, setQuery, tab, setTab, sort, results, setResults, setSearchMeta, searching, setSearching, searchMeta, activeVibes, toggleVibe, ytVideos, setYtVideos, ytLoading, setYtLoading } = useStore()
  const [localQuery, setLocalQuery] = useState(query||'')
  const fetchedRef = useRef(new Set())
  useReveal('explore'+results.length+tab)

  // Mount init
  useEffect(() => {
    if (!results.length && !searching) {
      const q = query || 'minecraft era 2012'
      setSearching(true)
      setTimeout(() => { const res = engine.search(q, { topN:15 }); setResults(res.results); setSearchMeta(res); setSearching(false) }, 10)
    }
  }, [])

  // Auto-fetch YouTube thumbnails + channel names
  useEffect(() => {
    if (!results.length || searching) return
    results.slice(0, AUTOFETCH_TOP).forEach(async doc => {
      if (fetchedRef.current.has(doc.id) || ytVideos[doc.id] || ytLoading[doc.id]) return
      fetchedRef.current.add(doc.id)
      setYtLoading(doc.id, true)
      try { const vids = await searchYouTube(doc.youtubeQuery, 2); setYtVideos(doc.id, vids) } catch {}
      setYtLoading(doc.id, false)
    })
  }, [results.map(r=>r.id).join(','), searching])

  const doSearch = q => {
    const sq = q ?? localQuery; if (!sq.trim()) return
    setQuery(sq); setSearching(true); fetchedRef.current = new Set()
    setTimeout(() => { const res = engine.search(sq, { topN:15 }); setResults(res.results); setSearchMeta(res); setSearching(false) }, 10)
  }

  const filtered = [...results]
    .filter(r => tab==='all' || r.type?.toLowerCase()===tab)
    .sort((a,b) => sort==='match' ? b.matchPct-a.matchPct : b.era-a.era)

  return (
    <div style={{ paddingTop:56, minHeight:'100vh' }}>
      <div style={{ maxWidth:1140, margin:'0 auto', padding:'28px 24px', display:'flex', gap:26 }}>
        <Sidebar />
        <main style={{ flex:1, minWidth:0 }}>

          {/* Search */}
          <div className="srch-wrap" style={{ marginBottom:13 }}>
            <input className="srch" style={{ padding:'12px 48px 12px 18px', fontSize:14, borderRadius:10 }}
              value={localQuery} onChange={e => setLocalQuery(e.target.value)}
              onKeyDown={e => e.key==='Enter'&&doSearch()}
              placeholder="Try: vaporwave 2014, creepypasta era, old minecraft parody…" />
            <button className="srch-btn" onClick={() => doSearch()}>→</button>
          </div>

          {/* Vibe tags */}
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:11 }}>
            {VIBES.slice(0,7).map(v => (
              <span key={v} className={`vtag ${activeVibes.includes(v)?'sel':''}`}
                onClick={() => { toggleVibe(v); setLocalQuery(v); doSearch(v) }}>{v}</span>
            ))}
          </div>

          {/* Type tabs */}
          <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:13 }}>
            {['all','video','audio','meme','archive','music'].map(t => (
              <button key={t} className={`tab ${tab===t?'at':''}`} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>

          <AIMeta meta={searchMeta} />

          <div style={{ fontSize:11, fontFamily:"'Space Mono',monospace", color:'var(--muted)', marginBottom:11 }}>
            {searching
              ? <span style={{ color:'var(--cyan)' }}>⟳ BM25 + Naive Bayes + vibe expansion running…</span>
              : <span>{filtered.length} results · <span style={{ color:'var(--cyan)' }}>"{query||'minecraft era 2012'}"</span> · thumbnails auto-loading · click ▶ to watch</span>
            }
          </div>

          {searching ? <Skeleton /> : (
            <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
              {filtered.length
                ? filtered.map((doc,i) => <ResultCard key={doc.id} doc={doc} index={i} />)
                : <div style={{ textAlign:'center', padding:60, color:'var(--muted)', fontFamily:"'Space Mono',monospace", fontSize:13 }}>No results. Try a different query.</div>
              }
            </div>
          )}

          <div style={{ marginTop:20, padding:'11px 15px', background:'rgba(255,184,0,.04)', border:'1px solid rgba(255,184,0,.13)', borderRadius:9, fontSize:11, color:'var(--muted)', fontFamily:"'Space Mono',monospace" }}>
            💡 Top {AUTOFETCH_TOP} results auto-fetch thumbnails + channel names from YouTube. Add <span style={{ color:'var(--amber)' }}>VITE_YOUTUBE_API_KEY</span> to .env
          </div>
        </main>
      </div>
    </div>
  )
}
