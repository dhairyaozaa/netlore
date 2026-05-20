import { create } from 'zustand'

export const useStore = create((set, get) => ({
  view: 'home', setView: v => set({ view: v }),
  query: '', setQuery: q => set({ query: q }),

  // Search results
  results: [], setResults: r => set({ results: r }),
  searching: false, setSearching: s => set({ searching: s }),
  searchMeta: null, setSearchMeta: m => set({ searchMeta: m }),

  // Explore UI
  tab: 'all', setTab: t => set({ tab: t }),
  sort: 'match', setSort: s => set({ sort: s }),
  activeVibes: [], toggleVibe: v => set(s => ({
    activeVibes: s.activeVibes.includes(v) ? s.activeVibes.filter(x => x !== v) : [...s.activeVibes, v]
  })),

  // Video modal
  videoModal: null, setVideoModal: v => set({ videoModal: v }),
  ytVideos: {}, setYtVideos: (id, vids) => set(s => ({ ytVideos: { ...s.ytVideos, [id]: vids } })),
  ytLoading: {}, setYtLoading: (id, val) => set(s => ({ ytLoading: { ...s.ytLoading, [id]: val } })),

  // Likes
  liked: new Set(), toggleLike: id => set(s => {
    const liked = new Set(s.liked); liked.has(id) ? liked.delete(id) : liked.add(id); return { liked }
  }),

  // Timeline
  activeEra: 3, setActiveEra: i => set({ activeEra: i }),
  hoveredBar: null, setHoveredBar: b => set({ hoveredBar: b }),

  // Archive
  archiveMode: 'browse', setArchiveMode: m => set({ archiveMode: m }),
  scanPct: 0, setScanPct: p => set({ scanPct: p }),
  scanning: false, setScanning: s => set({ scanning: s }),
}))
