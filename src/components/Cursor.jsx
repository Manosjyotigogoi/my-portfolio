import { useEffect } from 'react'
import './Cursor.css'

export default function Cursor() {
  useEffect(() => {
    const cursor = document.getElementById('cursor')
    const ring   = document.getElementById('cursor-ring')

    const onMove = e => {
      // Show cursor on first move (matches original opacity:0 → 1)
      cursor.style.opacity = 1
      cursor.style.left = e.clientX + 'px'
      cursor.style.top  = e.clientY + 'px'
      ring.style.left   = e.clientX + 'px'
      ring.style.top    = e.clientY + 'px'

      const coords = document.getElementById('coords')
      if (coords) {
        const nx = ((e.clientX / window.innerWidth)  - 0.5).toFixed(3)
        const ny = ((e.clientY / window.innerHeight) - 0.5).toFixed(3)
        coords.textContent = `X: ${nx}  Y: ${ny}`
      }
    }
    const onDown = () => { cursor.classList.add('drag'); ring.classList.add('drag') }
    const onUp   = () => { cursor.classList.remove('drag'); ring.classList.remove('drag') }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('mouseup',   onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('mouseup',   onUp)
    }
  }, [])

  return (
    <>
      <div id="cursor"></div>
      <div id="cursor-ring"></div>
    </>
  )
}
