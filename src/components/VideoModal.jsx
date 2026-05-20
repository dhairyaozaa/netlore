import React, { useEffect, useState } from 'react'
import { useStore } from '@/store/useStore'
import { searchYouTube } from '@/services/youtube.js'

export function VideoModal() {
  const { videoModal, setVideoModal, ytVideos, setYtVideos } = useStore()
  const [activeIdx, setActiveIdx] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    if (!videoModal) return
    setActiveIdx(0)
    const onKey = e => { if (e.key === 'Escape') setVideoModal(null) }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [videoModal])

  // Fetch more results if needed
  useEffect(() => {
    if (!videoModal) return
    const { doc } = videoModal
    const existing = ytVideos[doc.id]
    if (!existing || existing.length < 3) {
      setLoadingMore(true)
      searchYouTube(doc.youtubeQuery, 4).then(vids => {
        setYtVideos(doc.id, vids)
        setLoadingMore(false)
      }).catch(() => setLoadingMore(false))
    }
  }, [videoModal?.doc?.id])

  if (!videoModal) return null
  const { doc } = videoModal
  const videos = ytVideos[doc.id] || (videoModal.video ? [videoModal.video] : [])
  const activeVideo = videos[activeIdx]

  return (
    <div className="vmodal-overlay" onClick={e => e.target === e.currentTarget && setVideoModal(null)}>
      <div className="vmodal" style={{ maxWidth: 920 }}>

        {/* ── Header ── */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', padding:'16px 20px', borderBottom:'1px solid var(--b)', gap:12 }}>
          <div style={{ minWidth:0 }}>
            {/* Era badge */}
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
              <span style={{ fontSize:10, fontFamily:"'Space Mono',monospace", color:doc.color, background:`${doc.color}18`, border:`1px solid ${doc.color}33`, borderRadius:4, padding:'2px 8px' }}>{doc.era}</span>
              <span style={{ fontSize:10, fontFamily:"'Space Mono',monospace", color:'var(--muted)', background:'rgba(255,255,255,.04)', borderRadius:4, padding:'2px 7px' }}>{doc.type}</span>
              {doc.matchPct && <span style={{ fontSize:10, fontFamily:"'Space Mono',monospace", color:'var(--cyan)' }}>{doc.matchPct}% match</span>}
            </div>

            {/* Title */}
            <div style={{ fontWeight:700, fontSize:15, lineHeight:1.35, color:'var(--text)', marginBottom:5 }}>
              {activeVideo?.title || doc.title}
            </div>

            {/* Channel name */}
            {activeVideo?.channel && (
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ width:18, height:18, borderRadius:'50%', background:`${doc.color}25`, border:`1px solid ${doc.color}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:doc.color, flexShrink:0 }}>▶</div>
                <span style={{ fontSize:12, color:doc.color, fontFamily:"'Space Mono',monospace", fontWeight:700 }}>{activeVideo.channel}</span>
                {activeVideo.publishedAt && (
                  <span style={{ fontSize:10, color:'var(--muted)', fontFamily:"'Space Mono',monospace" }}>
                    · {new Date(activeVideo.publishedAt).getFullYear()}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Close */}
          <button onClick={() => setVideoModal(null)}
            style={{ flexShrink:0, width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,.06)', border:'1px solid var(--b)', cursor:'pointer', color:'var(--muted)', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center', transition:'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--mag)'; e.currentTarget.style.color='var(--mag)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--b)'; e.currentTarget.style.color='var(--muted)' }}>
            ✕
          </button>
        </div>

        {/* ── Main area: video + sidebar ── */}
        <div style={{ display:'flex' }}>
          {/* Video embed */}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ position:'relative', paddingBottom:'56.25%', background:'#000' }}>
              {activeVideo?.embedUrl ? (
                <iframe src={activeVideo.embedUrl} title={activeVideo.title}
                  style={{ position:'absolute', inset:0, width:'100%', height:'100%', border:'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen />
              ) : (
                <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14, background:'rgba(0,0,0,.3)' }}>
                  <div style={{ fontSize:48, opacity:.3 }}>{doc.thumb}</div>
                  {loadingMore
                    ? <span style={{ fontSize:13, color:'var(--cyan)', fontFamily:"'Space Mono',monospace" }}>⟳ Loading video…</span>
                    : (
                      <div style={{ textAlign:'center', maxWidth:300 }}>
                        <div style={{ fontSize:13, color:'var(--muted)', marginBottom:12, lineHeight:1.5 }}>
                          Add <code style={{ color:'var(--amber)', fontFamily:"'Space Mono',monospace" }}>VITE_YOUTUBE_API_KEY</code> to .env for live videos
                        </div>
                        <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(doc.youtubeQuery)}`}
                          target="_blank" rel="noopener noreferrer"
                          style={{ fontSize:12, color:'var(--cyan)', fontFamily:"'Space Mono',monospace", textDecoration:'none', border:'1px solid rgba(0,245,255,.3)', borderRadius:6, padding:'7px 16px', display:'inline-block' }}>
                          Search on YouTube ↗
                        </a>
                      </div>
                    )}
                </div>
              )}
            </div>

            {/* Description */}
            {activeVideo?.description && (
              <div style={{ padding:'12px 16px', borderTop:'1px solid var(--b)', background:'rgba(0,0,0,.2)' }}>
                <div style={{ fontSize:12, color:'var(--muted)', lineHeight:1.6, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                  {activeVideo.description}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: alternate videos */}
          {videos.length > 1 && (
            <div style={{ width:200, flexShrink:0, borderLeft:'1px solid var(--b)', overflowY:'auto', maxHeight:400 }}>
              <div style={{ padding:'10px 12px', fontSize:10, fontFamily:"'Space Mono',monospace", color:'var(--muted)', borderBottom:'1px solid var(--b)' }}>
                {videos.length} RESULTS FOUND
              </div>
              {videos.map((v, i) => (
                <div key={i} onClick={() => setActiveIdx(i)}
                  style={{ padding:'10px 12px', cursor:'pointer', borderBottom:'1px solid var(--b)', background:activeIdx===i?'rgba(0,245,255,.06)':'transparent', transition:'background .2s' }}
                  onMouseEnter={e => { if(activeIdx!==i) e.currentTarget.style.background='rgba(255,255,255,.04)' }}
                  onMouseLeave={e => { e.currentTarget.style.background=activeIdx===i?'rgba(0,245,255,.06)':'transparent' }}>
                  {/* Thumbnail */}
                  <div style={{ width:'100%', paddingBottom:'56.25%', position:'relative', borderRadius:6, overflow:'hidden', marginBottom:7, background:'rgba(0,0,0,.4)' }}>
                    {v.thumbnail && (
                      <img src={v.thumbnail} alt={v.title} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
                    )}
                    {activeIdx === i && (
                      <div style={{ position:'absolute', inset:0, background:'rgba(0,245,255,.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <span style={{ fontSize:16, color:'var(--cyan)' }}>▶</span>
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize:11, fontWeight:600, lineHeight:1.3, color:activeIdx===i?'var(--cyan)':'var(--text)', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', marginBottom:4 }}>
                    {v.title}
                  </div>
                  <div style={{ fontSize:10, color:activeIdx===i?doc.color:'var(--muted)', fontFamily:"'Space Mono',monospace", overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {v.channel}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer: tags + watch link ── */}
        <div style={{ padding:'10px 16px', display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', borderTop:'1px solid var(--b)' }}>
          {doc.tags?.slice(0,5).map(t => (
            <span key={t} style={{ fontSize:10, fontFamily:"'Space Mono',monospace", color:'var(--muted)', background:'rgba(255,255,255,.04)', border:'1px solid var(--b)', borderRadius:4, padding:'2px 7px' }}>{t}</span>
          ))}
          {activeVideo?.watchUrl && (
            <a href={activeVideo.watchUrl} target="_blank" rel="noopener noreferrer"
              style={{ marginLeft:'auto', fontSize:11, color:'var(--cyan)', fontFamily:"'Space Mono',monospace", textDecoration:'none', flexShrink:0 }}>
              Watch on YouTube ↗
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
