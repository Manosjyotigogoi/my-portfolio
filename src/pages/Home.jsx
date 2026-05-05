import { useState, useCallback } from 'react'
import Loader from '../components/Loader'
import MobiusScene from '../components/MobiusScene'
import './Home.css'

export default function Home() {
  const [loaded, setLoaded] = useState(false)
  const onDone = useCallback(() => setLoaded(true), [])

  return (
    <>
      <Loader onDone={onDone} />
      <section id="hero">

        {/* LEFT */}
        <div id="left">
          <div className="eyebrow">
            <div className="eyebrow-line"></div>
            <div className="eyebrow-text">Identity // v2.0.26</div>
          </div>

          <div id="name-block">
            <div id="name-first">Manos Jyoti</div>
            <div id="name-last">Gogoi</div>
          </div>

          <div className="roles">
            <div className="role-tag" data-text="Developer">Developer</div>
            <div className="role-tag" data-text="Designer">Designer</div>
            <div className="role-tag" data-text="Creator">Creator</div>
          </div>

          <div className="divider"></div>

          <div id="bio-box">
            <p>A developer and designer who builds at the intersection of code and
            creativity — obsessed with precision in craft, from system architecture
            to the weight of a single typeface. Every project is a pursuit of
            clarity, elegance, and intent.</p>
          </div>

          <div id="quote-box">
            <p>Just like the never-ending Möbius strip, my growth
            and learning should never end.</p>
          </div>

          <div className="nav-dots">
            <div className="dot active"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <span className="nav-label">01 / Hero</span>
          </div>
        </div>

        {/* RIGHT — Three.js canvas only, no UI clutter */}
        <MobiusScene />

      </section>
    </>
  )
}
