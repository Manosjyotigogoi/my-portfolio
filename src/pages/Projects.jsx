import { useEffect, useRef, useState, useCallback } from 'react'
import './PageLayout.css'
import './Projects.css'

const projects = [
  { id: '01', name: 'Online Voting System',
    desc: 'A secure voting application using file handling and authentication, enabling users to cast votes and automatically tally results. Built with a focus on data integrity and access control.',
    tech: ['C++', 'File Handling', 'Authentication'], tag: 'Systems',
    url: 'https://github.com/Manosjyotigogoi/Online-voting-system' },
  { id: '02', name: 'Assamese Character Recognition',
    desc: 'A complete system for handwritten Assamese numeral recognition based on stroke data collected via a GUI with a graphics tablet and stylus. Includes a trained ML pipeline for classification.',
    tech: ['Python', 'Machine Learning', 'GUI', 'Computer Vision'], tag: 'ML / AI',
    url: 'https://github.com/Manosjyotigogoi/Online-Handwritten-Assamese-Character-recognition-system' },
  { id: '03', name: 'Code-a-Hunt',
    desc: 'A hackathon project — a scavenger-hunt style coding challenge platform. Built under pressure in a competitive environment with a focus on delivering a working product fast.',
    tech: ['JavaScript', 'HTML', 'CSS'], tag: 'Hackathon',
    url: 'https://github.com/Manosjyotigogoi/code-a-hunt' },
  { id: '04', name: 'Buddy',
    desc: 'An experimental personal project tagged "Something crazy" — a creative exploration built to push boundaries and try out new ideas outside of academic constraints.',
    tech: ['Web', 'JavaScript'], tag: 'Experimental',
    url: 'https://github.com/Manosjyotigogoi/Buddy' },
  { id: '05', name: 'Portfolio Site',
    desc: 'This very portfolio — a Three.js holographic hero with a custom Möbius strip shader, post-processing bloom, particle system, and a full React + Vite architecture.',
    tech: ['React', 'Three.js', 'Vite', 'GLSL Shaders'], tag: 'Creative Dev',
    url: 'https://github.com/Manosjyotigogoi/Manosjyotigogoi.github.io' },
]

function useTyping(text, startDelay = 0, speed = 130) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  useEffect(() => {
    setDisplayed(''); setDone(false)
    let i = 0
    const t = setTimeout(() => {
      const iv = setInterval(() => {
        i++
        setDisplayed(text.slice(0, i))
        if (i >= text.length) { clearInterval(iv); setDone(true) }
      }, speed)
      return () => clearInterval(iv)
    }, startDelay)
    return () => clearTimeout(t)
  }, [text, startDelay, speed])
  return { displayed, done }
}

export default function Projects() {
  const eyebrow      = useTyping('Projects // Build Log', 400, 110)
  const titleMain    = useTyping('PROJ',  eyebrow.done ? 100 : 9999, 140)
  const titleOutline = useTyping('ECTS',  titleMain.done ? 80 : 9999, 140)
  const subtitle     = useTyping(
    "A collection of things I've built — from hackathon sprints to ML research to creative web experiments.",
    titleOutline.done ? 200 : 9999, 55
  )

  const [cardStates, setCardStates] = useState(projects.map(() => 'hidden'))
  const timers = useRef([])

  const trackRef    = useRef(null)
  const viewportRef  = useRef(null)
  const offsetRef   = useRef(0)
  const velRef      = useRef(0)
  const isDragging  = useRef(false)
  const startX      = useRef(0)
  const startOffset = useRef(0)
  const rafRef      = useRef(null)
  const didDrag     = useRef(false)

  useEffect(() => {
    if (!subtitle.done) return
    timers.current.forEach(clearTimeout); timers.current = []
    projects.forEach((_, i) => {
      timers.current.push(setTimeout(() =>
        setCardStates(prev => { const s = [...prev]; s[i] = 'glitching'; return s }),
        i * 150 + 80
      ))
      timers.current.push(setTimeout(() =>
        setCardStates(prev => { const s = [...prev]; s[i] = 'visible'; return s }),
        i * 150 + 80 + 480
      ))
    })
    return () => timers.current.forEach(clearTimeout)
  }, [subtitle.done])

  const clamp = useCallback((val) => {
    const track = trackRef.current
    if (!track) return val
    const container = track.parentElement
    const maxScroll = -(track.scrollWidth - container.clientWidth + 48)
    return Math.min(0, Math.max(maxScroll, val))
  }, [])

  const applyOffset = useCallback((val) => {
    if (!trackRef.current) return
    offsetRef.current = val
    trackRef.current.style.transform = `translateX(${val}px)`
  }, [])

  const momentumLoop = useCallback(() => {
    velRef.current *= 0.92
    applyOffset(clamp(offsetRef.current + velRef.current))
    if (Math.abs(velRef.current) > 0.4) {
      rafRef.current = requestAnimationFrame(momentumLoop)
    }
  }, [applyOffset, clamp])

  // ── Mouse drag ──────────────────────────────────────────────
  const onMouseDown = useCallback((e) => {
    // ignore right-click
    if (e.button !== 0) return
    cancelAnimationFrame(rafRef.current)
    isDragging.current  = true
    didDrag.current     = false
    startX.current      = e.clientX
    startOffset.current = offsetRef.current
    velRef.current      = 0
    e.preventDefault()
  }, [])

  const onMouseMove = useCallback((e) => {
    if (!isDragging.current) return
    const dx = e.clientX - startX.current
    if (Math.abs(dx) > 4) didDrag.current = true
    velRef.current = dx - (offsetRef.current - startOffset.current)
    applyOffset(clamp(startOffset.current + dx))
  }, [applyOffset, clamp])

  const onMouseUp = useCallback(() => {
    if (!isDragging.current) return
    isDragging.current = false
    rafRef.current = requestAnimationFrame(momentumLoop)
  }, [momentumLoop])

  // ── Two-finger trackpad / wheel scroll ──────────────────────
  const onWheel = useCallback((e) => {
    // horizontal wheel OR two-finger trackpad (deltaX)
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : 0
    if (delta === 0) return
    e.preventDefault()
    cancelAnimationFrame(rafRef.current)
    velRef.current = -delta * 0.5
    applyOffset(clamp(offsetRef.current - delta))
    rafRef.current = requestAnimationFrame(momentumLoop)
  }, [applyOffset, clamp, momentumLoop])

  // ── Touch (single finger on mobile, two-finger on trackpad) ─
  const touchStartX = useRef(0)
  const touchStartOffset = useRef(0)

  const onTouchStart = useCallback((e) => {
    cancelAnimationFrame(rafRef.current)
    isDragging.current    = true
    didDrag.current       = false
    touchStartX.current   = e.touches[0].clientX
    touchStartOffset.current = offsetRef.current
    velRef.current        = 0
  }, [])

  const onTouchMove = useCallback((e) => {
    if (!isDragging.current) return
    const dx = e.touches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 4) didDrag.current = true
    velRef.current = dx - (offsetRef.current - touchStartOffset.current)
    applyOffset(clamp(touchStartOffset.current + dx))
  }, [applyOffset, clamp])

  const onTouchEnd = useCallback(() => {
    if (!isDragging.current) return
    isDragging.current = false
    rafRef.current = requestAnimationFrame(momentumLoop)
  }, [momentumLoop])

  // ── Nav buttons ──────────────────────────────────────────────
  const SCROLL_STEP = 370
  const scrollBy = useCallback((dir) => {
    cancelAnimationFrame(rafRef.current)
    velRef.current = dir * SCROLL_STEP * 0.18
    applyOffset(clamp(offsetRef.current + dir * SCROLL_STEP))
  }, [applyOffset, clamp])

  useEffect(() => {
    const vp = viewportRef.current
    if (vp) vp.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup',   onMouseUp)
    return () => {
      if (vp) vp.removeEventListener('wheel', onWheel)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup',   onMouseUp)
      cancelAnimationFrame(rafRef.current)
    }
  }, [onMouseMove, onMouseUp, onWheel])

  return (
    <div className="page-container">
      <div className="page-dot-grid"></div>

      <div className="page-header">
        <div className="page-eyebrow">
          <div className="page-eyebrow-line"></div>
          <span className={!eyebrow.done ? 'typing-cursor' : ''}>{eyebrow.displayed}</span>
        </div>
        <h1 className="page-title">
          <span className={!titleMain.done ? 'typing-cursor' : ''}>{titleMain.displayed}</span>
          <span className={`page-title-outline${!titleOutline.done && titleMain.done ? ' typing-cursor' : ''}`}>
            {titleOutline.displayed}
          </span>
        </h1>
        <p className="page-subtitle">
          <span className={!subtitle.done ? 'typing-cursor' : ''}>{subtitle.displayed}</span>
        </p>
      </div>

      {subtitle.done && (
        <div className="carousel-hint">
          <svg width="16" height="10" fill="none" viewBox="0 0 16 10">
            <path d="M1 5h14M1 5l3.5-3.5M1 5l3.5 3.5M15 5l-3.5-3.5M15 5l-3.5 3.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Drag to explore
        </div>
      )}

      <div className="carousel-nav">
        <button className="carousel-nav-btn" onClick={() => scrollBy(1)} aria-label="Previous">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className="carousel-nav-btn" onClick={() => scrollBy(-1)} aria-label="Next">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div
        className="projects-carousel-viewport"
        ref={viewportRef}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="projects-track" ref={trackRef}>
          {projects.map((p, i) => (
            <a
              key={p.id}
              className={[
                'project-card',
                cardStates[i] === 'glitching' ? 'glitching' : '',
                cardStates[i] === 'visible'   ? 'visible'   : '',
              ].join(' ').trim()}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => { if (didDrag.current) e.preventDefault() }}
              draggable={false}
            >
              <div className="project-card-inner">
                <div className="project-top">
                  <span className="project-id">{p.id}</span>
                  <span className="project-tag">{p.tag}</span>
                </div>
                <h2 className="project-name">{p.name}</h2>
                <p className="project-desc">{p.desc}</p>
                <div className="project-tech">
                  {p.tech.map(t => <span className="tech-chip" key={t}>{t}</span>)}
                </div>
                <div className="project-arrow">
                  <span>View on GitHub</span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 7H13M13 7L7 1M13 7L7 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
              <div className="project-card-glow"></div>
            </a>
          ))}
        </div>

        <div className="carousel-fade-left"></div>
        <div className="carousel-fade-right"></div>
      </div>

      <div className="page-corner page-corner-tl">
        <svg viewBox="0 0 22 22" fill="none"><path d="M1 21L1 1L21 1" stroke="#00eeff" strokeWidth="1" strokeOpacity="0.35"/></svg>
      </div>
      <div className="page-corner page-corner-br">
        <svg viewBox="0 0 22 22" fill="none"><path d="M1 21L1 1L21 1" stroke="#00eeff" strokeWidth="1" strokeOpacity="0.35"/></svg>
      </div>
    </div>
  )
}