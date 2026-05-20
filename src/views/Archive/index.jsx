import React from 'react'
import { useStore } from '@/store/useStore'
import { useReveal } from '@/hooks/useReveal'
import { BOARDS } from '@/data'

const ARCHIVE = [
  { url:'web.archive.org/2012/minecraft-forums/survival-tips',  date:'Mar 14 2012', status:'Cached',   size:'2.3 MB' },
  { url:'web.archive.org/2011/newgrounds/animation-portal',     date:'Aug 07 2011', status:'Mirrored', size:'18.4 MB' },
  { url:'web.archive.org/2009/ytmnd/classic-sounds',            date:'Nov 22 2009', status:'Snapshot', size:'4.1 MB' },
  { url:'web.archive.org/2013/tumblr/original-vaporwave-post',  date:'Jun 03 2013', status:'Cached',   size:'890 KB' },
  { url:'web.archive.org/2007/ebaums-world/viral-videos',       date:'Jan 15 2007', status:'Partial',  size:'67.2 MB' },
  { url:'web.archive.org/2010/memebase/classic-rage-comics',    date:'Sep 12 2010', status:'Cached',   size:'14.1 MB' },
]

const SC = s => s==='Cached'?'var(--cyan)':s==='Mirrored'?'var(--purple)':'var(--amber)'
const SB = s => s==='Cached'?'rgba(0,245,255,.09)':s==='Mirrored'?'rgba(181,123,238,.09)':'rgba(255,184,0,.09)'
const SBd= s => s==='Cached'?'rgba(0,245,255,.2)':s==='Mirrored'?'rgba(181,123,238,.2)':'rgba(255,184,0,.2)'

function Browse() {
  return (
    <div className="slide-up">
      <div className="col2" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22 }}>
        {[['2005–2010','Early Web','var(--mag)'],['2011–2015','Golden Era','var(--cyan)'],['2016–2020','Late Web','var(--amber)'],['2021–now','Modern Archive','var(--purple)']].map(([y,l,c]) => (
          <div key={y} className="rv card" style={{ padding:'14px 18px' }}>
            <div className="mono" style={{ fontSize:11, color:c, marginBottom:4 }}>{y}</div>
            <div style={{ fontWeight:700, fontSize:14 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
        {ARCHIVE.map((a,i) => (
          <div key={i} className={`arc-row rv d${i+1}`}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
              <div>
                <div className="mono" style={{ fontSize:12, color:'var(--amber)', marginBottom:3, wordBreak:'break-all' }}>{a.url}</div>
                <div style={{ display:'flex', gap:10, fontSize:11, color:'var(--muted)' }}>
                  <span>{a.date}</span><span>·</span><span>{a.size}</span>
                </div>
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
                <span className="mono" style={{ fontSize:11, padding:'3px 10px', borderRadius:5, color:SC(a.status), background:SB(a.status), border:`1px solid ${SBd(a.status)}` }}>{a.status}</span>
                <button className="btn-o btn-sm"
                  onClick={() => window.open(`https://${a.url}`, '_blank')}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='var(--amber)'; e.currentTarget.style.color='var(--amber)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='var(--b)'; e.currentTarget.style.color='var(--text)' }}>
                  Open ↗
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Scanner() {
  const { scanPct, setScanPct, scanning, setScanning } = useStore()
  const LOGS = ['→ Querying Wayback Machine CDX API…','→ Resolving cached DNS snapshots…','→ Extracting EXIF metadata from thumbnails…','→ Running OCR pipeline on archived images…','→ Building BM25 index for discovered artifacts…']

  const startScan = () => {
    setScanning(true); setScanPct(0)
    let p = 0
    const t = setInterval(() => {
      p += Math.random() * 3.5 + 0.8
      if (p >= 100) { setScanPct(100); setScanning(false); clearInterval(t) }
      else setScanPct(Math.min(p, 99.9))
    }, 90)
  }

  return (
    <div className="slide-up" style={{ padding:30, background:'var(--glass)', border:'1px solid var(--b)', borderRadius:14 }}>
      <div className="label" style={{ marginBottom:18 }}>// INTERNET ARCHAEOLOGY SCANNER</div>
      <div style={{ marginBottom:18 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7 }}>
          <span style={{ fontSize:13, color:'var(--muted)' }}>{scanning?'Scanning archive layers…':scanPct===100?'Scan complete — artifacts discovered':'Ready to scan'}</span>
          <span className="mono" style={{ fontSize:13, color:'var(--cyan)' }}>{scanPct.toFixed(1)}%</span>
        </div>
        <div style={{ height:5, background:'var(--surf2)', borderRadius:3, overflow:'hidden' }}>
          <div style={{ height:'100%', background:'linear-gradient(90deg,var(--cyan),var(--purple))', borderRadius:3, width:`${scanPct}%`, transition:'width .12s' }} />
        </div>
      </div>
      {(scanning||scanPct>0) && (
        <div className="mono" style={{ fontSize:11, color:'var(--muted)', lineHeight:2.1, marginBottom:16 }}>
          {LOGS.map((l,i) => <div key={i} style={{ opacity:scanPct>i*18?1:.22, transition:'opacity .5s', color:scanPct>i*18?'var(--cyan)':'var(--muted)' }}>{l}</div>)}
        </div>
      )}
      {scanPct===100 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:18 }}>
          {[['2,847','Pages found'],['394','Videos archived'],['1,203','Memes indexed']].map(([v,l]) => (
            <div key={l} style={{ textAlign:'center', padding:'13px 10px', background:'rgba(0,245,255,.06)', borderRadius:9 }}>
              <div className="mono" style={{ fontSize:22, fontWeight:800, color:'var(--cyan)' }}>{v}</div>
              <div style={{ fontSize:11, color:'var(--muted)', marginTop:3 }}>{l}</div>
            </div>
          ))}
        </div>
      )}
      <div style={{ display:'flex', gap:11 }}>
        <button className="btn" onClick={startScan} disabled={scanning} style={{ opacity:scanning?.6:1 }}>
          {scanning?'Scanning…':scanPct===100?'Scan Again':'Start Archaeology Scan'}
        </button>
        {scanPct===100&&<button className="btn-o">Export Results</button>}
      </div>
    </div>
  )
}

function Boards() {
  return (
    <div className="slide-up">
      <div className="mono" style={{ fontSize:12, color:'var(--muted)', marginBottom:18 }}>Community-curated memory boards — preserved internet moments</div>
      <div className="col3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
        {BOARDS.map((b,i) => (
          <div key={i} className={`mb-card rv d${(i%3)+1}`} style={{ background:`linear-gradient(135deg,${b.color}18,rgba(13,17,23,.95))`, border:`1px solid ${b.color}25`, padding:20 }}>
            <div className="mbo">{b.icon} Open Board</div>
            <div style={{ fontSize:22, marginBottom:11 }}>{b.icon}</div>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:5 }}>{b.title}</div>
            <div className="mono" style={{ fontSize:11, color:'var(--muted)', marginBottom:7 }}>by {b.author}</div>
            <div className="mono" style={{ fontSize:11, color:b.color }}>{b.count} artifacts</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ArchiveView() {
  const { archiveMode, setArchiveMode } = useStore()
  useReveal('arc'+archiveMode)

  return (
    <div style={{ paddingTop:56, minHeight:'100vh', padding:'76px 24px' }}>
      <div style={{ maxWidth:980, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:44 }}>
          <div className="rv" style={{ marginBottom:18 }}><span className="pill">📼 ARCHIVE ENGINE</span></div>
          <h1 className="rv d1" style={{ fontSize:46, fontWeight:800, letterSpacing:'-.04em', marginBottom:10 }}>Internet <span className="amb">Archaeology</span></h1>
          <p className="rv d2" style={{ color:'var(--muted)', fontSize:14 }}>Snapshots, mirrors, cached pages — routed through CORS proxy server.</p>
        </div>
        <div className="rv" style={{ display:'flex', gap:5, marginBottom:28, background:'var(--surf)', borderRadius:10, padding:4, border:'1px solid var(--b)' }}>
          {[['browse','Browse Archive'],['scan','Archaeology Mode'],['boards','Memory Boards']].map(([v,l]) => (
            <button key={v} className={`tab ${archiveMode===v?'at':''}`} style={{ flex:1 }} onClick={() => setArchiveMode(v)}>{l}</button>
          ))}
        </div>
        {archiveMode==='browse'&&<Browse/>}
        {archiveMode==='scan'&&<Scanner/>}
        {archiveMode==='boards'&&<Boards/>}
      </div>
    </div>
  )
}
