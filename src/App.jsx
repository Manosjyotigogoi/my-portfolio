import { Routes, Route } from 'react-router-dom'
import TopBar from './components/TopBar'
import Cursor from './components/Cursor'
import Scanlines from './components/Scanlines'
import Home from './pages/Home'
import Work from './pages/Work'
import Projects from './pages/Projects'
import Contact from './pages/Contact'

export default function App() {
  return (
    <>
      <Cursor />
      <Scanlines />
      <TopBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/work" element={<Work />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </>
  )
}
