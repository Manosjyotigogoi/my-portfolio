import { useEffect, useRef } from 'react'
import './Loader.css'

export default function Loader({ onDone }) {
  const barRef = useRef()
  const subRef = useRef()
  const elRef  = useRef()

  useEffect(() => {
    const steps = ['Generating geometry…', 'Compiling shaders…', 'Charging bloom…', 'Online.']
    let pct = 0, step = 0
    const ticker = setInterval(() => {
      pct += Math.random() * 22
      if (pct >= 100) { pct = 100; clearInterval(ticker) }
      if (barRef.current) barRef.current.style.width = pct + '%'
      if (pct > step * 25 + 20 && step < steps.length) {
        if (subRef.current) subRef.current.textContent = steps[step++]
      }
    }, 90)
    const t = setTimeout(() => {
      if (elRef.current) elRef.current.classList.add('hidden')
      setTimeout(onDone, 1000)
    }, 2000)
    return () => { clearInterval(ticker); clearTimeout(t) }
  }, [onDone])

  return (
    <div id="loader" ref={elRef}>
      <div id="loader-title">Initializing</div>
      <div id="loader-bar-wrap"><div id="loader-bar" ref={barRef}></div></div>
      <div id="loader-sub" ref={subRef}>Loading hologram…</div>
    </div>
  )
}
