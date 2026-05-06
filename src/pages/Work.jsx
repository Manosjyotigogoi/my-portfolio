import { useEffect, useRef, useState } from 'react'
import './PageLayout.css'
import './Work.css'

const skillInfo = {
  'HTML': `HTML (HyperText Markup Language) is the foundational language of the web. Every website you visit is built on HTML — it defines the structure and meaning of web content using a system of elements and tags. From headings and paragraphs to forms, images, links, and multimedia, HTML gives browsers the blueprint they need to render a page. Modern HTML5 introduced semantic elements like article, section, and nav that make pages more accessible and SEO-friendly. It integrates seamlessly with CSS for styling and JavaScript for interactivity. HTML is used in web apps, email templates, browser extensions, and even hybrid mobile apps. Despite being decades old, it evolves continuously — supporting new APIs like Web Components, Canvas, and offline storage. Mastering HTML means understanding accessibility, document structure, and how browsers parse and render content. It is the first skill every web developer learns and the last they ever stop using.`,
  'CSS': `CSS (Cascading Style Sheets) is what transforms raw HTML structure into visually compelling interfaces. It controls everything visual — colors, typography, spacing, layout, animations, and responsive behavior. With CSS you can build complex grid systems, fluid layouts, glassmorphism effects, smooth transitions, and full-page animations — all without a single line of JavaScript. Modern CSS has evolved dramatically: Flexbox and Grid replaced decades of float hacks, custom properties enable dynamic theming, and features like container queries give fine-grained control. CSS is used in every web project — from simple blogs to enterprise dashboards and 3D transformed portfolio sites. It runs natively in the browser with zero runtime overhead. Mastering CSS means understanding the cascade, specificity, the box model, stacking contexts, and responsive design principles. It is both an art and a science — precise enough to pixel-perfect a layout, creative enough to animate an entire visual world.`,
  'Git': `Git is the world's most widely used version control system, created by Linus Torvalds in 2005. It tracks changes to files over time, enabling developers to collaborate, branch, merge, revert, and maintain a full history of every modification ever made to a codebase. Every major software project — open source or enterprise — relies on Git. GitHub, GitLab, and Bitbucket are built around it. Core concepts include commits, branches, merges, rebases, pull requests, and stash. Git enables parallel development workflows: teams of hundreds can work simultaneously without overwriting each other's changes. It is essential for CI/CD pipelines, code reviews, and deployment automation. Beyond collaboration, Git is a safety net — a bad change can always be reverted. Understanding Git deeply means knowing branching strategies like Git Flow, rebase vs merge tradeoffs, and how to resolve complex conflicts. It is the single most important tool in any developer's toolkit after their editor.`,
  'MongoDB': `MongoDB is a leading NoSQL document database that stores data as flexible JSON-like documents rather than rigid rows and columns. This makes it ideal for applications where data structures evolve rapidly — like user profiles, product catalogs, real-time feeds, and content management systems. Unlike relational databases, MongoDB scales horizontally through sharding, handles unstructured and semi-structured data natively, and integrates naturally with JavaScript and Node.js. The MongoDB Query Language supports rich filtering, aggregation pipelines, geospatial queries, and full-text search. It is used by companies like Forbes, eBay, and Adobe for high-volume workloads. MongoDB Atlas provides a fully managed cloud version with global clusters and built-in search. When paired with Express and Node.js in the MERN stack, MongoDB forms the persistence layer of some of the most popular web application architectures in use today.`,
  'Node.js': `Node.js is a JavaScript runtime built on Chrome's V8 engine that lets developers run JavaScript on the server side. Before Node.js, JavaScript was confined to browsers — Node broke that barrier in 2009, enabling full-stack JavaScript development. Its non-blocking, event-driven architecture makes it exceptionally efficient for I/O-heavy operations like handling thousands of concurrent API requests, streaming data, and real-time applications such as chat, gaming, and collaborative tools. Node.js powers the backends of Netflix, LinkedIn, Uber, and PayPal. It comes with npm, the world's largest package registry with over a million open-source libraries. Frameworks like Express, Fastify, and NestJS are built on top of it. Its single-language paradigm — JavaScript everywhere — reduces context switching and enables code sharing between client and server. Node.js fundamentally changed how web backends are built.`,
  'React': `React is a declarative, component-based JavaScript library for building user interfaces, developed and maintained by Meta. Since its open-source release in 2013, it has become the most popular frontend library in the world. React's core idea is simple but powerful: build your UI as a tree of reusable components, each managing its own state, and React efficiently updates the DOM only when necessary using its virtual DOM diffing algorithm. Hooks like useState, useEffect, and useReducer give functional components full lifecycle and state management capabilities. React's ecosystem is vast — React Router for navigation, Redux or Zustand for global state, and Next.js for full-stack React with SSR. It is used by Facebook, Instagram, Airbnb, and Atlassian. React Native extends the same model to mobile app development for iOS and Android, making React skills remarkably transferable across platforms.`,
  'JavaScript': `JavaScript is the programming language of the web — the only language that runs natively in every browser on the planet. Originally created in 1995, it has evolved into a powerful, multi-paradigm language supporting functional, object-oriented, and event-driven programming styles. JavaScript controls everything interactive on a webpage — from click handlers and form validation to complex SPAs and WebGL animations. Modern JavaScript (ES6+) introduced classes, arrow functions, destructuring, modules, async/await, and optional chaining. With Node.js, JavaScript runs on the server. With React Native or Electron, it builds mobile and desktop apps. It powers WebAssembly integrations, browser extensions, and serverless functions. JavaScript has been the most used programming language in the world for eight consecutive years according to Stack Overflow surveys.`,
  'C++': `C++ is a powerful, high-performance, compiled programming language that gives developers direct control over system resources and memory. Created by Bjarne Stroustrup in 1983, it adds object-oriented programming, generic programming via templates, and a rich standard library while maintaining C's raw speed. C++ is used in performance-critical domains: operating systems, game engines like Unreal Engine, real-time systems, embedded firmware, high-frequency trading, and scientific simulations. It underpins Chrome's V8 engine and Adobe's creative suite. For competitive programmers and CS students, C++ is the go-to language for Data Structures and Algorithms due to its STL offering vectors, maps, sets, queues, and sorting algorithms out of the box. Mastering C++ means understanding pointers, memory management, RAII, and the cost of every operation.`,
  'Python': `Python is a high-level, interpreted, dynamically typed programming language celebrated for its clean, readable syntax and extraordinary versatility. Created by Guido van Rossum and first released in 1991, Python has become the most popular programming language in the world. Its ecosystem covers everything: NumPy and Pandas for data manipulation, Matplotlib for visualization, scikit-learn and TensorFlow for machine learning, Django and FastAPI for web development, and Selenium for automation. It is the dominant language in data science, machine learning, and AI research. Python scripts automate repetitive tasks, process large datasets, scrape websites, and orchestrate cloud infrastructure. Companies like Google, Netflix, Instagram, and NASA use Python extensively. For a CS student exploring ML and scripting, Python is arguably the highest-leverage language to invest in.`,
  'Java': `Java is a class-based, object-oriented, statically typed programming language designed with the principle of write once, run anywhere — enabled by the Java Virtual Machine that runs compiled bytecode on any platform. Created by James Gosling at Sun Microsystems in 1995, Java became one of the most widely used programming languages in the world. It is the language most universities teach for foundational OOP concepts — encapsulation, inheritance, polymorphism, and abstraction. Java powers Android app development, enterprise backend systems, Spring Boot microservices, big data tools like Hadoop and Kafka, and large-scale distributed systems at Amazon, Google, and LinkedIn. Java's strong type system, garbage collection, robust exception handling, and mature tooling make it a reliable choice for large codebases maintained by big teams.`,
  'Three.js': `Three.js is a JavaScript library that makes WebGL — the browser's low-level 3D graphics API — accessible and productive. Without Three.js, creating 3D graphics in the browser requires hundreds of lines of raw shader code. Three.js abstracts that complexity into intuitive objects: scenes, cameras, geometries, materials, lights, and meshes. With it, you can build 3D product visualizers, interactive data landscapes, immersive portfolio experiences, game prototypes, and particle systems — all running directly in the browser. Three.js supports physically based rendering materials, shadow maps, post-processing effects, skeletal animation, and GLTF model loading. It integrates with React via React Three Fiber. Used by Apple for product showcases and by artists for generative visual experiences, Three.js sits at the intersection of code and creativity — one of the most expressive tools in the JavaScript ecosystem.`,
  'Vite': `Vite is a next-generation frontend build tool created by Evan You that has rapidly become the standard for modern JavaScript development. Its name means fast in French — and it lives up to that name. Unlike traditional bundlers like Webpack that bundle the entire application before serving it, Vite leverages native ES modules in the browser during development, serving files on demand with instant hot module replacement. Development servers start in milliseconds regardless of project size, and changes reflect in the browser almost instantaneously. For production, Vite uses Rollup to produce highly optimized, tree-shaken bundles. Vite supports React, Vue, Svelte, and vanilla JavaScript out of the box with minimal configuration. It has largely replaced Create React App in the React community and is now the recommended starter for most major frameworks.`,
  'TailwindCSS': `Tailwind CSS is a utility-first CSS framework that fundamentally changes how developers write styles. Instead of authoring custom CSS classes, Tailwind provides thousands of low-level utility classes that you compose directly in your HTML or JSX to build any design without leaving your markup. This approach eliminates context switching between HTML and CSS files, prevents specificity conflicts, and produces smaller final stylesheets through tree-shaking that removes unused utilities. Tailwind's design system is built around a thoughtful scale for spacing, typography, colors, shadows, and breakpoints — making it easy to maintain visual consistency. It is not opinionated about components, so you are never fighting the framework to get a custom design. Companies like GitHub, Shopify, and OpenAI use it in production. For developers who want complete design control with maximum development speed, Tailwind CSS has become the default choice.`,
}

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

function SkillDetail({ skill, onClose }) {
  const text = skillInfo[skill?.name] || ''
  const { displayed, done } = useTyping(text, 100, 18)
  if (!skill) return null
  return (
    <div className="skill-detail-panel">
      <div className="skill-detail-inner">
        <div className="skill-detail-eyebrow">
          <div className="page-eyebrow-line"></div>
          <span>SKILL // OVERVIEW</span>
        </div>
        <div className="skill-detail-header">
          <img src={skill.icon} alt={skill.name} className="skill-detail-icon" />
          <div>
            <h2 className="skill-detail-name">{skill.name}</h2>
            <span className="skill-detail-sub">{skill.sub}</span>
          </div>
        </div>
        <div className="skill-detail-bar" style={{ background: skill.accent, boxShadow: `0 0 10px ${skill.accent}66` }}></div>
        <p className={`skill-detail-text${!done ? ' typing-cursor' : ''}`}>{displayed}</p>
        <button className="skill-detail-close" onClick={onClose}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          CLOSE
        </button>
      </div>
    </div>
  )
}

function PanelIntro() {
  return (
    <div className="skill-detail-panel panel-intro">
      <div className="skill-detail-inner">
        <div className="skill-detail-eyebrow">
          <div className="page-eyebrow-line"></div>
          <span>SKILL // EXPLORER</span>
        </div>
        <h2 className="panel-intro-title">MY SKILLS</h2>
        <div className="panel-intro-divider"></div>
        <p className="panel-intro-text">
          Here you can explore all the skills I've built up so far — from languages and frameworks to tools I use daily.
        </p>
        <p className="panel-intro-text">
          The rotating cards are each one of my skills. <span className="panel-intro-accent">Drag &amp; rotate</span> the wheel freely to explore them.
        </p>
        <p className="panel-intro-text">
          The card that passes under the <span className="panel-intro-accent">pointer ▲</span> at the bottom gets highlighted. <span className="panel-intro-accent">Click it</span> to see full details appear here in this panel.
        </p>
        <div className="panel-intro-spin-hint">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1.5A6.5 6.5 0 1 1 1.5 8" stroke="#00e5ff" strokeWidth="1.2" strokeLinecap="round"/>
            <path d="M8 1.5L5.5 4M8 1.5L10.5 4" stroke="#00e5ff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Hit <strong>SPIN</strong> to discover a skill we share in common.</span>
        </div>
      </div>
    </div>
  )
}

function Modal({ skill, onCancel, onKnowMore }) {
  if (!skill) return null
  return (
    <div className="wheel-modal-overlay" onClick={onCancel}>
      <div className="wheel-modal-box" onClick={e => e.stopPropagation()}>
        <div className="wheel-modal-icon-box" style={{ background: skill.iconBg, border: `1px solid ${skill.iconBorder}` }}>
          <img src={skill.icon} alt={skill.name} />
        </div>
        <div className="wheel-modal-name">{skill.name}</div>
        <div className="wheel-modal-sub">{skill.sub}</div>
        <div className="wheel-modal-question">Want to know more?</div>
        <div className="wheel-modal-actions">
          <button className="wheel-modal-btn cancel" onClick={onCancel}>Cancel</button>
          <button className="wheel-modal-btn know-more" onClick={onKnowMore}>Know More</button>
        </div>
      </div>
    </div>
  )
}

function CommonSkillModal({ skill, onClose }) {
  if (!skill) return null
  return (
    <div className="wheel-modal-overlay" onClick={onClose}>
      <div className="wheel-modal-box common-skill-modal" onClick={e => e.stopPropagation()}>
        <div className="common-skill-top">
          <div className="common-skill-icon-wrap" style={{ background: skill.iconBg, border: `1px solid ${skill.iconBorder}` }}>
            <img src={skill.icon} alt={skill.name} />
          </div>
          <div className="common-skill-title-group">
            <div className="common-skill-we">We both know</div>
            <div className="common-skill-name" style={{ color: skill.accent, textShadow: `0 0 20px ${skill.accent}55` }}>
              {skill.name}!
            </div>
            <div className="common-skill-sub">{skill.sub}</div>
          </div>
        </div>
        <div className="common-skill-divider" style={{ background: `linear-gradient(90deg, transparent, ${skill.accent}66, transparent)` }}></div>
        <p className="common-skill-text">
          Looks like <strong>{skill.name}</strong> is something we share. That's already a solid foundation — and a great place to start building something together.
        </p>
        <button className="wheel-modal-btn know-more common-skill-btn" style={{ borderColor: `${skill.accent}55`, color: skill.accent }} onClick={onClose}>
          Nice, let's connect →
        </button>
      </div>
    </div>
  )
}

const skills = [
  { name:'HTML',       sub:'Markup Language',      accent:'#e34c26', iconBg:'rgba(227,76,38,0.15)',   iconBorder:'rgba(227,76,38,0.3)',   icon:'https://cdn.simpleicons.org/html5/e34c26' },
  { name:'CSS',        sub:'Style Sheet Language', accent:'#264de4', iconBg:'rgba(38,77,228,0.15)',   iconBorder:'rgba(38,77,228,0.3)',   icon:'https://cdn.simpleicons.org/css3/264de4' },
  { name:'Git',        sub:'Version Control',      accent:'#f05032', iconBg:'rgba(240,80,50,0.15)',   iconBorder:'rgba(240,80,50,0.3)',   icon:'https://cdn.simpleicons.org/git/f05032' },
  { name:'MongoDB',    sub:'Database',             accent:'#47a248', iconBg:'rgba(71,162,72,0.15)',   iconBorder:'rgba(71,162,72,0.3)',   icon:'https://cdn.simpleicons.org/mongodb/47a248' },
  { name:'Node.js',    sub:'Runtime Environment',  accent:'#68a063', iconBg:'rgba(104,160,99,0.15)',  iconBorder:'rgba(104,160,99,0.3)',  icon:'https://cdn.simpleicons.org/nodedotjs/68a063' },
  { name:'React',      sub:'UI Library',           accent:'#61dafb', iconBg:'rgba(97,218,251,0.15)',  iconBorder:'rgba(97,218,251,0.3)',  icon:'https://cdn.simpleicons.org/react/61dafb' },
  { name:'JavaScript', sub:'Programming Language', accent:'#f7df1e', iconBg:'rgba(247,223,30,0.15)',  iconBorder:'rgba(247,223,30,0.3)',  icon:'https://cdn.simpleicons.org/javascript/f7df1e' },
  { name:'C++',        sub:'Systems Language',     accent:'#00599c', iconBg:'rgba(0,89,156,0.15)',    iconBorder:'rgba(0,89,156,0.3)',    icon:'https://cdn.simpleicons.org/cplusplus/00599c' },
  { name:'Python',     sub:'ML & Scripting',       accent:'#3776ab', iconBg:'rgba(55,118,171,0.15)',  iconBorder:'rgba(55,118,171,0.3)',  icon:'https://cdn.simpleicons.org/python/3776ab' },
  { name:'Java',       sub:'OOP Fundamentals',     accent:'#f89820', iconBg:'rgba(248,152,32,0.15)',  iconBorder:'rgba(248,152,32,0.3)',  icon:'https://cdn.simpleicons.org/openjdk/f89820' },
  { name:'Three.js',   sub:'3D Web Graphics',      accent:'#ffffff', iconBg:'rgba(255,255,255,0.08)', iconBorder:'rgba(255,255,255,0.2)', icon:'https://cdn.simpleicons.org/threedotjs/ffffff' },
  { name:'Vite',       sub:'Build Tooling',        accent:'#646cff', iconBg:'rgba(100,108,255,0.15)', iconBorder:'rgba(100,108,255,0.3)', icon:'https://cdn.simpleicons.org/vite/646cff' },
  { name:'TailwindCSS',sub:'Utility Styling',      accent:'#38bdf8', iconBg:'rgba(56,189,248,0.15)',  iconBorder:'rgba(56,189,248,0.3)',  icon:'https://cdn.simpleicons.org/tailwindcss/38bdf8' },
]

export default function Work() {
  const eyebrow      = useTyping('Skills // Proficiency', 400, 110)
  const titleMain    = useTyping('SKILL', eyebrow.done ? 100 : 9999, 140)
  const titleOutline = useTyping('SET',   titleMain.done ? 80 : 9999, 140)
  const subtitle     = useTyping(
    '1st-year CS student at Lovely Professional University — building at the intersection of code, creativity, and curiosity.',
    titleOutline.done ? 200 : 9999, 55
  )

  // Gate wheel + panel on titleOutline.done (heading fully typed)
  const wheelReady = titleOutline.done

  const containerRef = useRef(null)
  const canvasRef    = useRef(null)
  const rotYRef      = useRef(0)
  const spinningRef  = useRef(false)

  const [modalSkill,  setModalSkill]  = useState(null)
  const [detailSkill, setDetailSkill] = useState(null)
  const [panelOpen,   setPanelOpen]   = useState(false)
  const [commonSkill, setCommonSkill] = useState(null)
  const [isSpinning,  setIsSpinning]  = useState(false)

  useEffect(() => {
    // Only mount Three.js scene once heading is done
    if (!wheelReady) return

    const THREE = window.THREE
    if (!THREE) return

    let raf1, raf2, animId, ro, rendererRef 
    let onMouseMove, onMouseUp, handleSpin, handleWheel, canvas

    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        canvas    = canvasRef.current
        const container = containerRef.current
        if (!canvas || !container) return

        const W0 = container.clientWidth  || 800
        const H0 = container.clientHeight || 600

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
        rendererRef = renderer
        renderer.setClearColor(0x000000, 0)
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
        renderer.setSize(W0, H0, false)

        const scene  = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(55, W0 / H0, 0.1, 200)
        camera.position.set(0, 3, 13)
        camera.lookAt(0, -1, 0)

        function onResize() {
          const w = container.clientWidth
          const h = container.clientHeight
          if (!w || !h) return
          renderer.setSize(w, h, false)
          camera.aspect = w / h
          camera.updateProjectionMatrix()
        }
        ro = new ResizeObserver(onResize)
        ro.observe(container)

        scene.add(new THREE.AmbientLight(0x001a1a, 6))
        const lTop = new THREE.PointLight(0x00e5ff, 6, 40); lTop.position.set(0, 14, 0); scene.add(lTop)
        scene.add(new THREE.PointLight(0x00aacc, 3, 22)).position.set(0, 2, 8)
        scene.add(new THREE.PointLight(0x004455, 2, 18)).position.set(-7, 2, -5)

        const root = new THREE.Group(); scene.add(root)
        const N = skills.length
        // Bigger radius
        const CARD_R = 5.8

        const cardPositions3D = skills.map((_, i) => {
          const angle = (i / N) * Math.PI * 2
          return new THREE.Vector3(Math.sin(angle) * CARD_R, 0, Math.cos(angle) * CARD_R)
        })

        const layer = document.getElementById('wheel-card-layer')
        layer.innerHTML = ''
        const cardEls = skills.map((sk, i) => {
          const wrap = document.createElement('div')
          wrap.className = 'wh-card'
          wrap.style.setProperty('--accent', sk.accent)
          wrap.style.setProperty('--icon-bg', sk.iconBg)
          wrap.style.setProperty('--icon-border', sk.iconBorder)
          wrap.style.setProperty('--card-glow', `0 0 20px ${sk.accent}22`)
          wrap.innerHTML = `<div class="wh-card-inner"><div class="wh-icon-box"><img src="${sk.icon}" alt="${sk.name}" loading="lazy"/></div><div class="wh-card-name">${sk.name}</div><div class="wh-card-sub">${sk.sub}</div><div class="wh-accent-bar"></div></div>`
          wrap.addEventListener('click', () => {
            if (spinningRef.current) return
            window.dispatchEvent(new CustomEvent('wheel-card-click', { detail: sk }))
          })
          layer.appendChild(wrap)
          return wrap
        })

        let isDragging = false, prevX = 0, velX = 0, autoRotate = true

        canvas.addEventListener('mousedown', e => { if (spinningRef.current) return; isDragging = true; prevX = e.clientX; velX = 0; autoRotate = false })
        onMouseMove = e => { if (!isDragging) return; velX = (e.clientX - prevX) * 0.006; rotYRef.current += velX; prevX = e.clientX }
        onMouseUp = () => { isDragging = false }
        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup', onMouseUp)
        canvas.addEventListener('touchstart', e => { if (spinningRef.current) return; isDragging = true; prevX = e.touches[0].clientX; velX = 0; autoRotate = false; e.preventDefault() }, { passive: false })
        canvas.addEventListener('touchmove', e => { if (!isDragging) return; velX = (e.touches[0].clientX - prevX) * 0.006; rotYRef.current += velX; prevX = e.touches[0].clientX; e.preventDefault() }, { passive: false })
        canvas.addEventListener('touchend', () => { isDragging = false })
        // ✅ ADD HERE
        handleWheel = (e) => {
        if (spinningRef.current) return;

        autoRotate = false;

        const delta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY)
        ? e.deltaX
        : e.deltaY;

        velX += delta * 0.0006;

        e.preventDefault();
        };

canvas.addEventListener('wheel', handleWheel, { passive: false });

          handleSpin = function() {
          if (spinningRef.current) return
          spinningRef.current = true
          autoRotate = false
          isDragging = false
          velX = 0

          // Pick a random target skill index
          const targetIdx = Math.floor(Math.random() * skills.length)

          // The front card is the one whose world angle relative to camera is ~0
          // Card i is at angle (i/N)*2π in local space; after rotY, world angle = rotY + (i/N)*2π
          // Front = angle closest to 0 mod 2π (i.e. z positive = toward camera)
          // To put card targetIdx at front: need rotY such that sin(rotY + targetAngle) ≈ 0 and cos > 0
          // i.e. rotY + targetAngle = 2π*k → rotY = -targetAngle + 2π*k
          const targetAngle = (targetIdx / N) * Math.PI * 2
          const startRot = rotYRef.current

          // How many full extra rotations (6–10)
          const extraRounds = 6 + Math.floor(Math.random() * 5)
          // Compute the nearest landing rotY >= startRot + 6 full rounds that puts targetIdx at front
          const baseTarget = -targetAngle + Math.PI * 2 * extraRounds
          // Normalize: find k so that baseTarget + 2π*k > startRot + 6*2π - ε
          const minTarget = startRot + Math.PI * 2 * (extraRounds - 0.5)
          let k = Math.ceil((minTarget - baseTarget) / (Math.PI * 2))
          const totalTarget = baseTarget + Math.PI * 2 * k

          const duration = 3200
          const startTime = performance.now()

          function spinLoop(now) {
            const elapsed = now - startTime
            const t = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - t, 3)
            rotYRef.current = startRot + (totalTarget - startRot) * eased
            if (t < 1) {
              requestAnimationFrame(spinLoop)
            } else {
              // Snap exactly to target
              rotYRef.current = totalTarget
              spinningRef.current = false
              window.dispatchEvent(new CustomEvent('wheel-spin-done', { detail: skills[targetIdx] }))
            }
          }
          requestAnimationFrame(spinLoop)
        }
        window.addEventListener('wheel-spin-start', handleSpin)

        const projected = new THREE.Vector3()
        let lastPointerIdx = -1

        function updateCards() {
          const W = container.clientWidth
          const H = container.clientHeight
          if (!W || !H) return

          // Compute depth for each card
          const depths = skills.map((_, i) => {
            const worldPos = cardPositions3D[i].clone().applyEuler(new THREE.Euler(0, rotYRef.current, 0))
            // depth: how much the card faces the camera (z component normalized)
            const depth = (worldPos.z / CARD_R + 1) / 2
            return { i, worldPos, depth }
          })

          // Find the single front card — strictly the one with maximum depth
          let frontIdx = depths.reduce((best, cur) => cur.depth > best.depth ? cur : best, depths[0]).i

          depths.forEach(({ i, worldPos, depth }) => {
            projected.copy(worldPos).project(camera)
            const sx = (projected.x * 0.5 + 0.5) * W
            const sy = (1 - (projected.y * 0.5 + 0.5)) * H
            const el = cardEls[i]
            el.style.left = sx + 'px'
            el.style.top  = sy + 'px'
            el.style.zIndex  = Math.round(depth * 100)
            el.style.opacity = (0.35 + depth * 0.65).toFixed(3)
            el.style.pointerEvents = depth > 0.3 ? 'all' : 'none'

            // Only THE front card gets the pointer class
            const isFront = i === frontIdx
            const baseScale = 0.65 + depth * 0.35
            const scale = isFront ? baseScale * 1.22 : baseScale
            el.style.transform = `translate(-50%,-50%) scale(${scale.toFixed(3)})`
            if (isFront) el.classList.add('wh-card--pointer')
            else el.classList.remove('wh-card--pointer')
          })

          if (frontIdx !== lastPointerIdx) {
            lastPointerIdx = frontIdx
            window.dispatchEvent(new CustomEvent('wheel-pointer-change', { detail: skills[frontIdx] }))
          }
        }

        const clock = new THREE.Clock()
        function animate() {
          animId = requestAnimationFrame(animate)
          const t = clock.getElapsedTime()
          if (autoRotate && !spinningRef.current) rotYRef.current += 0.004
          else if (!isDragging && !spinningRef.current) { velX *= 0.91; rotYRef.current += velX }
          root.rotation.y = rotYRef.current
          lTop.intensity = 5 + Math.sin(t * 0.7) * 1.5
          updateCards()
          renderer.render(scene, camera)
        }
        animate()
      })
    })

    return () => {
    cancelAnimationFrame(raf1)
    cancelAnimationFrame(raf2)
    cancelAnimationFrame(animId)
    if (ro) ro.disconnect()
    if (rendererRef) rendererRef.dispose()
    const layer = document.getElementById('wheel-card-layer')
    if (layer) layer.innerHTML = ''
    // ✅ properly remove all window listeners
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
    window.removeEventListener('wheel-spin-start', handleSpin)
    canvas.removeEventListener('wheel', handleWheel)
}
  }, [wheelReady])

  useEffect(() => {
    const h = e => setModalSkill(e.detail)
    window.addEventListener('wheel-card-click', h)
    return () => window.removeEventListener('wheel-card-click', h)
  }, [])

  useEffect(() => {
    const h = e => { setIsSpinning(false); setCommonSkill(e.detail) }
    window.addEventListener('wheel-spin-done', h)
    return () => window.removeEventListener('wheel-spin-done', h)
  }, [])

  function handleSpin() {
    if (isSpinning) return
    setIsSpinning(true)
    window.dispatchEvent(new CustomEvent('wheel-spin-start'))
  }

  function handleKnowMore()   { setDetailSkill(modalSkill); setPanelOpen(true); setModalSkill(null) }
  function handleCancel()     { setModalSkill(null) }
  function handleClosePanel() { setPanelOpen(false); setTimeout(() => setDetailSkill(null), 400) }

  return (
    <div className="page-container work-page-container">
      <div className="page-dot-grid"></div>

      <div className="work-left">
        <div className="page-header">
          <div className="page-eyebrow">
            <div className="page-eyebrow-line"></div>
            <span className={!eyebrow.done ? 'typing-cursor' : ''}>{eyebrow.displayed}</span>
          </div>
          <h1 className="page-title">
            <span className={!titleMain.done ? 'typing-cursor' : ''}>{titleMain.displayed}</span>
            <span className={`page-title-outline${!titleOutline.done && titleMain.done ? ' typing-cursor' : ''}`}>{titleOutline.displayed}</span>
          </h1>
          <p className="page-subtitle">
            <span className={!subtitle.done ? 'typing-cursor' : ''}>{subtitle.displayed}</span>
          </p>
        </div>

        {/* Wheel only mounts after heading is done */}
        {wheelReady && (
          <div className="wheel-container" ref={containerRef}>
            <canvas ref={canvasRef} className="wheel-canvas" />
            <div id="wheel-card-layer" className="wheel-card-layer"></div>

            {/* Triangle pointer — bottom-center, points UP at the single front card */}
            <div className="wheel-dial-arrow">
              <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
                {/* Simple upward-pointing triangle, cyan to match page */}
                <polygon
                  points="12,0 0,16 24,16"
                  fill="rgba(0,229,255,0.15)"
                  stroke="#00e5ff"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Spin button — moved up */}
            <button
              className={`wheel-spin-btn${isSpinning ? ' spinning' : ''}`}
              onClick={handleSpin}
              disabled={isSpinning}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M6.5 1A5.5 5.5 0 1 1 1 6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                <path d="M6.5 1L4 3.5M6.5 1L9 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {isSpinning ? 'SPINNING...' : 'SPIN'}
            </button>

            <div className="wheel-hints">
              <div className="wheel-hint">
                <svg width="13" height="17" fill="none" viewBox="0 0 13 17"><rect x="1" y="1" width="11" height="15" rx="5.5" stroke="currentColor" strokeWidth="1.1"/><circle cx="6.5" cy="5.5" r="1.8" fill="currentColor"/></svg>
                Drag to rotate
              </div>
              <div className="wheel-hint">
                <svg width="14" height="14" fill="none" viewBox="0 0 14 14"><path d="M2 7h10M8.5 3.5l3.5 3.5-3.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Click a card
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right panel — only shown after heading is done */}
      {wheelReady && (
        <div className="work-right open">
          {detailSkill && panelOpen
            ? <SkillDetail skill={detailSkill} onClose={handleClosePanel} />
            : <PanelIntro />
          }
        </div>
      )}

      <Modal skill={modalSkill} onCancel={handleCancel} onKnowMore={handleKnowMore} />
      <CommonSkillModal skill={commonSkill} onClose={() => setCommonSkill(null)} />

      <div className="page-corner page-corner-tl">
        <svg viewBox="0 0 22 22" fill="none"><path d="M1 21L1 1L21 1" stroke="#00eeff" strokeWidth="1" strokeOpacity="0.35"/></svg>
      </div>
      <div className="page-corner page-corner-br">
        <svg viewBox="0 0 22 22" fill="none"><path d="M1 21L1 1L21 1" stroke="#00eeff" strokeWidth="1" strokeOpacity="0.35"/></svg>
      </div>
    </div>
  )
}