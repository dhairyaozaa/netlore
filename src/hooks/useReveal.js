import { useEffect } from 'react'

export function useReveal(dep) {
  useEffect(() => {
    const els = document.querySelectorAll('.rv,.rl,.rr,.pk')
    els.forEach(el => el.classList.remove('on'))
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('on') }),
      { threshold: 0.1 }
    )
    const t = setTimeout(() => els.forEach(el => io.observe(el)), 60)
    return () => { clearTimeout(t); io.disconnect() }
  }, [dep])
}
