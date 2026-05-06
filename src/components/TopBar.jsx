import { useState } from 'react'
import { Link } from 'react-router-dom'
import './TopBar.css'

export default function TopBar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <header id="topbar">
        <Link to="/" id="logo">MJG // Portfolio</Link>

        {/* Desktop nav */}
        <nav className="topnav">
          <Link to="/">Home</Link>
          <Link to="/work">Skills</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/contact">Contact</Link>
        </nav>

        {/* Hamburger — mobile only */}
        <button
          className="topbar-hamburger"
          onClick={() => setOpen(prev => !prev)}
          aria-label="Toggle menu"
        >
          <span style={open ? { transform: 'rotate(45deg) translate(4px, 4px)' } : {}} />
          <span style={open ? { opacity: 0 } : {}} />
          <span style={open ? { transform: 'rotate(-45deg) translate(4px, -4px)' } : {}} />
        </button>
      </header>

      {/* Mobile dropdown nav */}
      <nav className={`topnav-mobile${open ? ' open' : ''}`}>
        <Link to="/"         onClick={() => setOpen(false)}>Home</Link>
        <Link to="/work"     onClick={() => setOpen(false)}>Skills</Link>
        <Link to="/projects" onClick={() => setOpen(false)}>Projects</Link>
        <Link to="/contact"  onClick={() => setOpen(false)}>Contact</Link>
      </nav>
    </>
  )
}