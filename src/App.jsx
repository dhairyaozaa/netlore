import React, { useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { Nav, Footer } from '@/components'
import { VideoModal } from '@/components/VideoModal'
import { HomeView }    from '@/views/Home'
import { ExploreView } from '@/views/Explore'
import { TimelineView } from '@/views/Timeline'
import { ArchiveView }  from '@/views/Archive'

export default function App() {
  const { view } = useStore()
  useEffect(() => { window.scrollTo({ top:0, behavior:'smooth' }) }, [view])

  return (
    <div className="scanlines">
      <Nav />
      <main>
        {view === 'home'     && <HomeView />}
        {view === 'explore'  && <ExploreView />}
        {view === 'timeline' && <TimelineView />}
        {view === 'archive'  && <ArchiveView />}
      </main>
      <Footer />
      <VideoModal />
    </div>
  )
}
