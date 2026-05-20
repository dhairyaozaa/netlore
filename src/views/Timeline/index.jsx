import React from 'react'
import { useStore } from '@/store/useStore'
import { useReveal } from '@/hooks/useReveal'
import { engine } from '@/ai/SearchEngine.js'
import { ERAS, HEATMAP } from '@/data'

function Heatmap() {
  const { activeEra, setActiveEra, hoveredBar, setHoveredBar } = useStore()
  return (
    <div className="rv" style={{ marginBottom:44, padding:22, background:'var(--glass)', border:'1px solid var(--b)', borderRadius:14 }}>
      <div className="label" style={{ marginBottom:14 }}>// CULTURAL ACTIVITY HEATMAP — indexed document density per year</div>
      <div style={{ display:'flex', gap:3, alignItems:'flex-end', height:80 }}>
        {HEATMAP.map((h,i) => (
          <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3, cursor:'pointer' }}
            onMouseEnter={() => setHoveredBar(i)} onMouseLeave={() => setHoveredBar(null)}
            onClick={() => setActiveEra(Math.min(i, ERAS.length-1))}>
            <div style={{ width:'100%', borderRadius:'2px 2px 0 0', minHeight:3, height:`${h.val}%`, background:hoveredBar===i?'var(--cyan)':i===activeEra?'rgba(0,245,255,.5)':'rgba(0,245,255,.18)', transition:'background .2s,height .3s' }} />
            <span style={{ fontSize:8, fontFamily:"'Space Mono',monospace", color:hoveredBar===i?'var(--cyan)':'var(--muted)', writingMode:'vertical-rl', transform:'rotate(180deg)', transition:'color .2s' }}>{h.year}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Rail() {
  const { activeEra, setActiveEra } = useStore()
  return (
    <div className="rv" style={{ position:'relative', marginBottom:48, overflowX:'auto', padding:'8px 0 18px' }}>
      <div style={{ display:'flex', alignItems:'center', minWidth:560 }}>
        {ERAS.map((e,i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', flex:1 }}>
            <div style={{ flex:1, height:2, background:i<=activeEra?'var(--cyan)':'var(--b)', transition:'background .4s' }} />
            <div className="tl-node" onClick={() => setActiveEra(i)} title={`${e.year} — ${e.label}`}
              style={{ width:14, height:14, borderRadius:'50%', background:i===activeEra?'var(--cyan)':i<activeEra?'rgba(0,245,255,.3)':'var(--bg)', border:`2px solid ${i<=activeEra?'var(--cyan)':'var(--b)'}`, boxShadow:i===activeEra?'0 0 18px rgba(0,245,255,.8)':'none', transition:'all .3s' }}>
              {i===activeEra && <div className="ping-ring" style={{ position:'absolute', inset:-1, borderRadius:'50%', border:'2px solid var(--cyan)' }} />}
            </div>
          </div>
        ))}
        <div style={{ flex:1, height:2, background:'var(--b)' }} />
      </div>
      <div style={{ display:'flex', minWidth:560, marginTop:7 }}>
        {ERAS.map((e,i) => (
          <div key={i} onClick={() => setActiveEra(i)} style={{ flex:1, textAlign:'center', fontSize:9, fontFamily:"'Space Mono',monospace", color:i===activeEra?'var(--cyan)':'var(--muted)', transition:'color .3s', cursor:'pointer' }}>{e.year}</div>
        ))}
      </div>
    </div>
  )
}

function EraDetail() {
  const { activeEra, setActiveEra, setView, setQuery, setResults, setSearchMeta, setSearching } = useStore()
  const era = ERAS[activeEra]

  const searchEra = () => {
    setQuery(era.label); setSearching(true); setView('explore')
    setTimeout(() => {
      const res = engine.search(era.label + ' ' + era.peak, { topN:15 })
      setResults(res.results); setSearchMeta(res); setSearching(false)
    }, 10)
  }

  return (
    <div key={activeEra} className="slide-up">
      <div className="gap2" style={{ display:'flex', gap:22, marginBottom:28 }}>
        <div style={{ flex:2, padding:30, background:'var(--glass)', border:`1px solid ${era.color}30`, borderRadius:16, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:0, right:0, width:200, height:200, background:`radial-gradient(circle at top right,${era.color}12,transparent 70%)`, pointerEvents:'none' }} />
          <div className="label" style={{ color:era.color, marginBottom:10 }}>{era.year} · ERA #{activeEra+1} OF {ERAS.length}</div>
          <div style={{ fontSize:36, marginBottom:8 }}>{era.icon}</div>
          <h2 style={{ fontSize:28, fontWeight:800, letterSpacing:'-.03em', color:era.color, marginBottom:7 }}>{era.label}</h2>
          <p style={{ color:'var(--muted)', fontSize:14, lineHeight:1.7, marginBottom:10 }}>
            The <strong style={{ color:'var(--text)' }}>{era.year}</strong> internet era — <em style={{ color:era.color }}>{era.mood}</em>.
          </p>
          <p style={{ fontSize:12, fontFamily:"'Space Mono',monospace", color:'var(--muted)', marginBottom:18, lineHeight:1.6 }}>{era.peak}</p>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <button className="btn btn-sm" onClick={searchEra}>Search This Era →</button>
            <button className="btn-o btn-sm" onClick={() => setView('archive')}>Browse Archive</button>
          </div>
        </div>
        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:12 }}>
          {[{label:'Mood',val:era.mood,c:'var(--amber)'},{label:'Peak Year',val:`${era.year}`,c:'var(--cyan)'},{label:'Archive Depth',val:'94%',c:'var(--mag)'},{label:'Nostalgia Score',val:'9.4/10',c:'var(--purple)'}].map(s => (
            <div key={s.label} className="era-detail-row"
              onMouseEnter={e => { e.currentTarget.style.borderColor=s.c+'55'; e.currentTarget.style.transform='translateX(4px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--b)'; e.currentTarget.style.transform='none' }}>
              <div style={{ fontSize:11, color:'var(--muted)', fontFamily:"'Space Mono',monospace", marginBottom:3 }}>{s.label}</div>
              <div style={{ fontWeight:700, fontSize:14, color:s.c }}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="label" style={{ marginBottom:12 }}>// ADJACENT ERAS</div>
      <div style={{ display:'flex', gap:10, overflowX:'auto', paddingBottom:6 }}>
        {ERAS.filter((_,i) => i !== activeEra).map((e,i) => (
          <div key={i} className="adj-era" onClick={() => setActiveEra(ERAS.indexOf(e))}
            onMouseEnter={el => { el.currentTarget.style.borderColor=e.color+'44'; el.currentTarget.style.transform='translateY(-4px)' }}
            onMouseLeave={el => { el.currentTarget.style.borderColor='var(--b)'; el.currentTarget.style.transform='none' }}>
            <div style={{ fontSize:18, marginBottom:5 }}>{e.icon}</div>
            <div style={{ fontWeight:700, fontSize:12, color:e.color, marginBottom:2 }}>{e.year}</div>
            <div style={{ fontSize:11, color:'var(--muted)' }}>{e.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TimelineView() {
  const { activeEra } = useStore()
  useReveal('tl'+activeEra)
  return (
    <div style={{ paddingTop:56, minHeight:'100vh', padding:'80px 24px' }}>
      <div style={{ maxWidth:1060, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:56 }}>
          <div className="rv" style={{ marginBottom:18 }}><span className="pill">🕰️ TIMELINE EXPLORER</span></div>
          <h1 className="rv d1" style={{ fontSize:50, fontWeight:800, letterSpacing:'-.04em', marginBottom:10 }}>Internet <span className="neon">Archaeology</span></h1>
          <p className="rv d2" style={{ color:'var(--muted)', fontSize:14 }}>Navigate 18 years of internet culture. Naive Bayes detects your era automatically.</p>
        </div>
        <Heatmap />
        <Rail />
        <EraDetail />
      </div>
    </div>
  )
}
