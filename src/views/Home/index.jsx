import React, { useState, useEffect, useRef } from 'react'
import { useStore } from '@/store/useStore'
import { Ticker, FloatingBadge } from '@/components'
import { STATS, ERAS, FEATURES, PIPELINE, TECH, VIBES } from '@/data'
import { engine } from '@/ai/SearchEngine.js'
import { useReveal } from '@/hooks/useReveal'

const PHRASE = 'Search the soul of the internet...'

// ── Hero ──────────────────────────────────────────────────────────────
function Hero() {
  const { setView, query, setQuery, setResults, setSearchMeta, setSearching } = useStore()
  const [typed, setTyped] = useState('')
  const idx = useRef(0)

  useEffect(() => {
    idx.current = 0; setTyped('')
    const t = setInterval(() => {
      if (idx.current < PHRASE.length) { setTyped(PHRASE.slice(0, idx.current + 1)); idx.current++ }
      else clearInterval(t)
    }, 52)
    return () => clearInterval(t)
  }, [])

  const doSearch = () => {
    if (!query.trim()) return
    setSearching(true)
    setView('explore')
    setTimeout(() => {
      const res = engine.search(query, { topN: 15 })
      setResults(res.results)
      setSearchMeta(res)
      setSearching(false)
    }, 10)
  }

  const quickSearch = v => { setQuery(v); setSearching(true); setView('explore'); setTimeout(() => { const res = engine.search(v, { topN: 15 }); setResults(res.results); setSearchMeta(res); setSearching(false) }, 10) }

  return (
    <section className="grid-bg" style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'110px 24px 80px', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', width:700, height:700, borderRadius:'50%', background:'radial-gradient(circle,rgba(0,245,255,.055) 0%,transparent 70%)', top:'5%', left:'-15%', pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(255,45,120,.055) 0%,transparent 70%)', bottom:'-5%', right:'-8%', pointerEvents:'none' }} />

      <FloatingBadge className="float-1" style={{ left:'4%', top:'22%' }} label="🧠 BM25 + Naive Bayes" title="Local AI — No Cloud" sub="105 docs indexed" subColor="var(--cyan)" />
      <FloatingBadge className="float-2 hide-md" style={{ right:'3%', top:'26%' }} accent="rgba(255,45,120,.2)" label="▶ trending search" title="Minecraft Era 2012" sub="↑ 847 queries today" subColor="var(--mag)" />
      <FloatingBadge className="float-3 hide-md" style={{ left:'5%', bottom:'20%' }} accent="rgba(181,123,238,.2)" label="● YouTube API · Live Results" />

      <div style={{ textAlign:'center', maxWidth:900, position:'relative', zIndex:1 }}>
        <div className="rv" style={{ marginBottom:26 }}>
          <span className="pill">
            <span className="pulse-dot" style={{ width:6, height:6, borderRadius:'50%', background:'var(--cyan)', display:'inline-block' }} />
            v1.0 · BM25 ranking · Naive Bayes era detection · YouTube live
          </span>
        </div>

        {/* Glitch title */}
        <h1 className="rv d1 hero-h" style={{ fontSize:76, fontWeight:900, lineHeight:1.01, letterSpacing:'-.04em', marginBottom:18, fontFamily:"'Space Mono',monospace" }}>
          NET<span className="neon">LORE</span>
        </h1>
        <p className="rv d1" style={{ fontSize:17, color:'var(--muted)', maxWidth:540, margin:'0 auto 10px', letterSpacing:'-.01em' }}>
          The Internet's Folklore Engine
        </p>
        <p className="rv d2" style={{ fontSize:14, color:'var(--muted)', maxWidth:520, margin:'0 auto 42px', lineHeight:1.65 }}>
          Local AI (BM25 + Naive Bayes + vibe expansion) searches 18 years of internet culture. Real YouTube results. No cloud. No APIs.
        </p>

        <div className="rv d3 srch-wrap" style={{ maxWidth:680, margin:'0 auto 16px' }}>
          <input className="srch" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && doSearch()} placeholder={typed} />
          <button className="srch-btn" onClick={doSearch}>→</button>
        </div>

        <div className="rv d4" style={{ display:'flex', flexWrap:'wrap', gap:7, justifyContent:'center', maxWidth:680, margin:'0 auto 34px' }}>
          {VIBES.slice(0,6).map(v => (
            <span key={v} className="vtag" onClick={() => quickSearch(v)}>{v}</span>
          ))}
        </div>

        <div className="rv d5" style={{ display:'flex', gap:14, justifyContent:'center' }}>
          <button className="btn" style={{ fontSize:15, padding:'14px 34px' }} onClick={doSearch}>Search the Lore</button>
          <button className="btn-o" style={{ fontSize:15, padding:'14px 26px' }} onClick={() => setView('timeline')}>Browse Timeline</button>
        </div>
      </div>
    </section>
  )
}

// ── Stats ─────────────────────────────────────────────────────────────
function Stats() {
  return (
    <section style={{ background:'var(--surf)', borderTop:'1px solid var(--b)', borderBottom:'1px solid var(--b)', padding:'34px 24px' }}>
      <div className="col2" style={{ maxWidth:840, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:20, textAlign:'center' }}>
        {STATS.map((s,i) => (
          <div key={s.label} className={`stat-card rv d${i+1}`}>
            <div style={{ fontSize:30, fontWeight:800, fontFamily:"'Space Mono',monospace", color:i%2===0?'var(--cyan)':'var(--mag)' }}>{s.val}</div>
            <div style={{ fontSize:12, color:'var(--muted)', marginTop:3 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Era Grid ──────────────────────────────────────────────────────────
function EraGrid() {
  const { setView, setQuery, setResults, setSearchMeta, setSearching } = useStore()

  const quickSearch = era => {
    setQuery(era.label); setSearching(true); setView('explore')
    setTimeout(() => {
      const res = engine.search(era.label + ' ' + era.peak, { topN: 15, eraFilter: era.year })
      setResults(res.results); setSearchMeta(res); setSearching(false)
    }, 10)
  }

  return (
    <section style={{ padding:'84px 24px', maxWidth:1060, margin:'0 auto' }}>
      <div style={{ textAlign:'center', marginBottom:52 }}>
        <div className="rv label" style={{ marginBottom:12 }}>// EXPLORE BY ERA</div>
        <h2 className="rv d1" style={{ fontSize:42, fontWeight:800, letterSpacing:'-.03em' }}>Dive into any <span className="mag">moment</span></h2>
      </div>
      <div className="col3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
        {ERAS.slice(0,6).map((era,i) => (
          <div key={i} className={`pk card d${(i%3)+1}`} style={{ padding:24 }} onClick={() => quickSearch(era)}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:'var(--muted)' }}>{era.year}</span>
              <span style={{ fontSize:20 }}>{era.icon}</span>
            </div>
            <div style={{ fontWeight:700, fontSize:16, marginBottom:5, color:era.color }}>{era.label}</div>
            <div style={{ fontSize:12, color:'var(--muted)', fontFamily:"'Space Mono',monospace", marginBottom:8 }}>{era.mood}</div>
            <div style={{ fontSize:11, color:'var(--muted)', lineHeight:1.5, marginBottom:10 }}>{era.peak}</div>
            <div style={{ fontSize:11, color:'var(--cyan)', fontFamily:"'Space Mono',monospace", display:'flex', alignItems:'center', gap:4, opacity:.7 }}>
              <span className="pulse-dot" style={{ width:5, height:5, borderRadius:'50%', background:'var(--cyan)', display:'inline-block' }} />
              search this era →
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Features ──────────────────────────────────────────────────────────
function Features() {
  return (
    <section style={{ padding:'0 24px 84px', maxWidth:1060, margin:'0 auto' }}>
      <div style={{ textAlign:'center', marginBottom:52 }}>
        <div className="rv label" style={{ marginBottom:12 }}>// LOCAL AI ENGINE</div>
        <h2 className="rv d1" style={{ fontSize:42, fontWeight:800, letterSpacing:'-.03em' }}>No cloud. <span className="neon">Pure algorithm.</span></h2>
        <p className="rv d2" style={{ color:'var(--muted)', marginTop:12, fontSize:14, maxWidth:500, margin:'12px auto 0' }}>
          BM25 ranking · Naive Bayes era classification · TF-IDF cosine similarity · Vibe query expansion. All in-browser.
        </p>
      </div>
      <div className="col3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
        {FEATURES.map((f,i) => (
          <div key={i} className={`card rv d${(i%3)+1}`} style={{ padding:26 }}>
            <div className="icon-box" style={{ width:46, height:46, borderRadius:11, background:f.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, marginBottom:18 }}>{f.icon}</div>
            <div style={{ fontWeight:700, fontSize:15, marginBottom:8 }}>{f.title}</div>
            <div style={{ fontSize:13, color:'var(--muted)', lineHeight:1.65 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Pipeline ──────────────────────────────────────────────────────────
function Pipeline() {
  return (
    <section style={{ padding:'0 24px 84px', maxWidth:920, margin:'0 auto' }}>
      <div className="gap2" style={{ display:'flex', gap:52, alignItems:'flex-start' }}>
        <div style={{ flex:1 }}>
          <div className="rl label" style={{ marginBottom:12 }}>// AI ARCHITECTURE</div>
          <h2 className="rl d1" style={{ fontSize:34, fontWeight:800, letterSpacing:'-.03em', marginBottom:14 }}>Runs entirely<br /><span className="mag">in your browser</span></h2>
          <p className="rl d2" style={{ color:'var(--muted)', lineHeight:1.7, marginBottom:22, fontSize:14 }}>Every algorithm computes locally. BM25 indexes at startup in ~50ms. Naive Bayes trains from corpus instantly. Zero network calls for AI.</p>
          <div className="rl d3" style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
            {TECH.map(t => (
              <span key={t} style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:'var(--cyan)', background:'rgba(0,245,255,.08)', border:'1px solid rgba(0,245,255,.2)', borderRadius:5, padding:'3px 10px' }}>{t}</span>
            ))}
          </div>
        </div>
        <div style={{ flex:1 }}>
          {PIPELINE.map((p,i) => (
            <div key={i} className={`pipe-row rr d${i+1}`}>
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:'var(--cyan)', minWidth:24, paddingTop:2 }}>{p.step}</span>
              <div>
                <div style={{ fontWeight:700, marginBottom:3, fontSize:14 }}>{p.label}</div>
                <div style={{ fontSize:12, color:'var(--muted)' }}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── CTA ───────────────────────────────────────────────────────────────
function CTA() {
  const { setView } = useStore()
  return (
    <section style={{ padding:'64px 24px 100px', textAlign:'center', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 50% 50%,rgba(0,245,255,.04) 0%,transparent 70%)', pointerEvents:'none' }} />
      <div className="rv label" style={{ marginBottom:18 }}>// BEGIN YOUR DIVE</div>
      <h2 className="rv d1" style={{ fontSize:50, fontWeight:800, letterSpacing:'-.04em', marginBottom:14 }}>The internet<br />never <span className="neon">forgets.</span></h2>
      <p className="rv d2" style={{ color:'var(--muted)', marginBottom:34, fontSize:16 }}>18 years of internet culture. BM25-ranked. Era-classified. YouTube-linked.</p>
      <div className="rv d3" style={{ display:'flex', gap:14, justifyContent:'center' }}>
        <button className="btn" style={{ fontSize:15, padding:'14px 34px' }} onClick={() => setView('explore')}>Launch NETLORE</button>
        <button className="btn-o" style={{ fontSize:15, padding:'14px 26px' }} onClick={() => setView('archive')}>Browse Archive</button>
      </div>
    </section>
  )
}

// ── Home View ─────────────────────────────────────────────────────────
export function HomeView() {
  useReveal('home')
  return (
    <div>
      <Hero />
      <Stats />
      <Ticker />
      <EraGrid />
      <div className="gl rv" style={{ maxWidth:700, margin:'0 auto 84px' }} />
      <Features />
      <Pipeline />
      <CTA />
    </div>
  )
}
