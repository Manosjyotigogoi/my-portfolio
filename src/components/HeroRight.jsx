import MobiusCanvas from './MobiusCanvas.jsx'
import './HeroRight.css'

export default function HeroRight() {
  return (
    <div id="right">
      <div id="panel-label">
        <span>Hologram // Projection</span>
        <div className="live-badge">Live</div>
      </div>

      <div className="corner corner-tl">
        <svg viewBox="0 0 22 22" fill="none">
          <path d="M1 21L1 1L21 1" stroke="#00eeff" strokeWidth="1" strokeOpacity="0.4"/>
        </svg>
      </div>
      <div className="corner corner-tr">
        <svg viewBox="0 0 22 22" fill="none">
          <path d="M1 21L1 1L21 1" stroke="#00eeff" strokeWidth="1" strokeOpacity="0.4"/>
        </svg>
      </div>
      <div className="corner corner-bl">
        <svg viewBox="0 0 22 22" fill="none">
          <path d="M1 21L1 1L21 1" stroke="#00eeff" strokeWidth="1" strokeOpacity="0.4"/>
        </svg>
      </div>
      <div className="corner corner-br">
        <svg viewBox="0 0 22 22" fill="none">
          <path d="M1 21L1 1L21 1" stroke="#00eeff" strokeWidth="1" strokeOpacity="0.4"/>
        </svg>
      </div>

      <MobiusCanvas />

      <div id="drag-hint">
        <div className="hint-line"></div>
        <div className="hint-text">Drag to rotate</div>
        <div className="hint-line"></div>
      </div>

      <div id="coords">X: 0.000 &nbsp; Y: 0.000</div>
    </div>
  )
}
