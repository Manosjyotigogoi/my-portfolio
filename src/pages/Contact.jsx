import { useRef, useState } from 'react'
import emailjs from '@emailjs/browser'
import './PageLayout.css'
import './Contact.css'

// ── Replace these with your EmailJS credentials ──────────────────
// ── Replace these with your EmailJS credentials ──────────────────
const EMAILJS_SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const EMAILJS_PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
// ─────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────

export default function Contact() {
  const formRef = useRef()
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [focused, setFocused] = useState(null)

  const handleSubmit = async e => {
    e.preventDefault()
    setStatus('sending')
    try {
      await emailjs.sendForm(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        formRef.current,
        { publicKey: EMAILJS_PUBLIC_KEY }
      )
      setStatus('sent')
      formRef.current.reset()
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="page-container">
      <div className="page-dot-grid"></div>

      <div className="page-header">
        <div className="page-eyebrow">
          <div className="page-eyebrow-line"></div>
          <span>Contact // Transmit</span>
        </div>
        <h1 className="page-title">GET IN<span className="page-title-outline"> TOUCH</span></h1>
        <p className="page-subtitle">
          Have a project in mind, want to collaborate, or just want to say hello?
          Send a message — I read everything.
        </p>
      </div>

      <div className="contact-layout">

        {/* Left — form */}
        <div className="contact-form-wrap">
          <form ref={formRef} onSubmit={handleSubmit} className="contact-form" noValidate>

            <div className={`field-group ${focused === 'name' ? 'field-active' : ''}`}>
              <label className="field-label">// Name</label>
              <input
                type="text"
                name="user_name"
                className="field-input"
                placeholder="Your name"
                required
                onFocus={() => setFocused('name')}
                onBlur={() => setFocused(null)}
              />
            </div>

            <div className={`field-group ${focused === 'email' ? 'field-active' : ''}`}>
              <label className="field-label">// Email</label>
              <input
                type="email"
                name="user_email"
                className="field-input"
                placeholder="your@email.com"
                required
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
              />
            </div>

            <div className={`field-group ${focused === 'subject' ? 'field-active' : ''}`}>
              <label className="field-label">// Subject</label>
              <input
                type="text"
                name="subject"
                className="field-input"
                placeholder="What's this about?"
                onFocus={() => setFocused('subject')}
                onBlur={() => setFocused(null)}
              />
            </div>

            <div className={`field-group ${focused === 'message' ? 'field-active' : ''}`}>
              <label className="field-label">// Message</label>
              <textarea
                name="message"
                className="field-input field-textarea"
                placeholder="Your message..."
                rows={6}
                required
                onFocus={() => setFocused('message')}
                onBlur={() => setFocused(null)}
              />
            </div>

            <button
              type="submit"
              className={`send-btn ${status}`}
              disabled={status === 'sending' || status === 'sent'}
            >
              {status === 'idle'    && <><span className="btn-prefix">{'>'}</span> Transmit Message</>}
              {status === 'sending' && <><span className="btn-prefix spin">◈</span> Sending…</>}
              {status === 'sent'    && <><span className="btn-prefix">✓</span> Message Sent</>}
              {status === 'error'   && <><span className="btn-prefix">✕</span> Failed — Retry</>}
            </button>

            {status === 'sent' && (
              <p className="form-feedback success">
                Transmission successful. I'll get back to you soon.
              </p>
            )}
            {status === 'error' && (
              <p className="form-feedback error">
                Something went wrong. Try emailing me directly.
              </p>
            )}
          </form>
        </div>

        {/* Right — info */}
        <div className="contact-info">
          <div className="info-block">
            <div className="info-label">// Location</div>
            <div className="info-value">Lovely Professional University, Punjab, India</div>
          </div>
          <div className="info-block">
            <div className="info-label">// Status</div>
            <div className="info-value info-status">
              <span className="status-dot"></span>
              Open to collaborate & learn
            </div>
          </div>
          <div className="info-block">
            <div className="info-label">// Connect</div>
            <div className="social-icons">
              <a
                className="social-icon-link"
                href="https://github.com/Manosjyotigogoi"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                title="github.com/Manosjyotigogoi"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.341-3.369-1.341-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
              </a>
              <a
                className="social-icon-link"
                href="https://www.linkedin.com/in/manosjyotigogoi"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                title="linkedin.com/in/manosjyotigogoi"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="contact-quote">
            <p>"Just like the never-ending Möbius strip, my growth and learning should never end."</p>
          </div>
        </div>
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