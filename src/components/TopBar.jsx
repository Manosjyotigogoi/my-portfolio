import { Link } from 'react-router-dom'
import './TopBar.css'

export default function TopBar() {
  return (
    <header id="topbar">
      <Link to="/" id="logo">MJG // Portfolio</Link>
      <nav className="topnav">
        <Link to="/">Home</Link>
        <Link to="/work">Skills</Link>
        <Link to="/projects">Projects</Link>
        <Link to="/contact">Contact</Link>
      </nav>
    </header>
  )
}
