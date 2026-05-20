import React, { useState, useEffect, useRef } from 'react'
import { useStore } from '@/store/useStore'
import { VIBES } from '@/data'
import { engine } from '@/ai/SearchEngine.js'

// ── Nav ───────────────────────────────────────────────────────────────
export function Nav() {
  const { view, setView, query, setQuery, setResults, setSearchMeta, setSearching } = useStore()

  const doSearch = async () => {
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

  return (
    <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:200, borderBottom:'1px solid var(--b)', backdropFilter:'blur(20px)', background:'rgba(3,7,18,.9)', padding:'0 28px', display:'flex', alignItems:'center', height:56, gap:16 }}>
      <span onClick={() => setView('home')} style={{ fontWeight:900, fontSize:17, letterSpacing:'-.02em', cursor:'pointer', flexShrink:0, fontFamily:"'Space Mono',monospace" }}>
        NET<span className="neon">LORE</span>
      </span>
      <div className="hide-sm" style={{ flex:1, maxWidth:380 }}>
        {view !== 'home' && (
          <div className="srch-wrap">
            <input className="srch" style={{ padding:'9px 42px 9px 14px', fontSize:13, borderRadius:9 }}
              value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch()}
              placeholder="Search internet folklore…" />
            <button className="srch-btn" style={{ right:7, width:30, height:30, borderRadius:5, fontSize:14 }} onClick={doSearch}>→</button>
          </div>
        )}
      </div>
      <div style={{ display:'flex', gap:20, alignItems:'center', flexShrink:0, marginLeft:'auto' }}>
        <div className="hide-md" style={{ display:'flex', gap:20 }}>
          {[['explore','Explore'],['timeline','Timeline'],['archive','Archive']].map(([v,l]) => (
            <span key={v} className={`nl ${view===v?'an':''}`} onClick={() => setView(v)}>{l}</span>
          ))}
        </div>
        <button className="btn btn-sm" onClick={() => setView('explore')}>Launch</button>
      </div>
    </nav>
  )
}

// ── Ticker ────────────────────────────────────────────────────────────
export function Ticker() {
  return (
    <div style={{ overflow:'hidden', borderTop:'1px solid var(--b)', borderBottom:'1px solid var(--b)', background:'var(--surf)', padding:'11px 0' }}>
      <div style={{ display:'flex', animation:'ticker 30s linear infinite', width:'200%', whiteSpace:'nowrap' }}>
        {[...VIBES,...VIBES].map((v,i) => (
          <span key={i} style={{ fontFamily:"'Space Mono',monospace", fontSize:12, marginRight:44, flexShrink:0, color:i%4===0?'var(--cyan)':i%4===2?'var(--mag)':'var(--muted)' }}>
            {i%3===0?'✦':i%3===1?'▶':'●'} {v}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Footer ────────────────────────────────────────────────────────────
export function Footer() {
  return (
    <footer style={{ borderTop:'1px solid var(--b)', padding:'26px 32px', display:'flex', justifyContent:'space-between', alignItems:'center', color:'var(--muted)', fontSize:12, fontFamily:"'Space Mono',monospace", flexWrap:'wrap', gap:16 }}>
      <span>NET<span style={{ color:'var(--cyan)' }}>LORE</span> · fully local AI · no cloud · BM25 + Naive Bayes</span>
      <div style={{ display:'flex', gap:20 }}>
        {['Docs','GitHub','Community'].map(l => (
          <span key={l} className="nl" style={{ fontSize:12 }}>{l}</span>
        ))}
      </div>
    </footer>
  )
}

// ── FloatingBadge ─────────────────────────────────────────────────────
export function FloatingBadge({ className, style, accent='var(--b)', label, title, sub, subColor }) {
  return (
    <div className={className} style={{ position:'absolute', background:'var(--glass)', border:`1px solid ${accent}`, borderRadius:12, padding:'11px 15px', backdropFilter:'blur(14px)', maxWidth:185, zIndex:1, ...style }}>
      <div style={{ fontSize:11, color:'var(--muted)', fontFamily:"'Space Mono',monospace", marginBottom:title?4:0 }}>{label}</div>
      {title && <div style={{ fontSize:13, fontWeight:700, marginBottom:sub?3:0 }}>{title}</div>}
      {sub && <div style={{ fontSize:11, color:subColor, fontFamily:"'Space Mono',monospace" }}>{sub}</div>}
    </div>
  )
}
