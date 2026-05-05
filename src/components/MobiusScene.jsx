import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import './MobiusScene.css'

export default function MobiusScene() {
  const containerRef = useRef()

  useEffect(() => {
    const container = containerRef.current
    let CW = container.clientWidth  || 560
    let CH = container.clientHeight || (window.innerHeight - 52)

    // ── Renderer ──────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(CW, CH)
    renderer.toneMapping         = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.65
    renderer.outputColorSpace    = THREE.SRGBColorSpace
    renderer.setClearColor(0x000000, 0)
    renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:1'
    container.appendChild(renderer.domElement)

    // ── Scene ─────────────────────────────────────────────────
    const scene = new THREE.Scene()
    // fog removed — was painting the right panel black and hiding the background image

    // ── Camera ────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(52, CW / CH, 0.1, 100)
    camera.position.set(0, 3.8, 9.5)
    camera.lookAt(0, 1.5, 0)

    // ── Bloom overlay canvas (CSS filter — preserves transparency) ──
    // UnrealBloomPass uses opaque internal framebuffers that paint the
    // right panel black. Instead we render the scene twice:
    //   1. Main canvas: direct renderer.render() — fully transparent bg
    //   2. Bloom canvas: same scene at half-res with CSS blur+brightness
    //      composited in screen blend-mode for a glow effect
    const bloomCanvas = document.createElement('canvas')
    bloomCanvas.width  = CW
    bloomCanvas.height = CH
    bloomCanvas.style.cssText = [
      'position:absolute', 'inset:0', 'width:100%', 'height:100%',
      'pointer-events:none', 'z-index:2',
      'filter:blur(14px) brightness(2.0)',
      'mix-blend-mode:screen', 'opacity:0.5'
    ].join(';')
    container.appendChild(bloomCanvas)

    const bloomRenderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, canvas: bloomCanvas })
    bloomRenderer.setPixelRatio(0.5)
    bloomRenderer.setSize(CW, CH, false)
    bloomRenderer.toneMapping         = THREE.ACESFilmicToneMapping
    bloomRenderer.toneMappingExposure = 1.2
    bloomRenderer.outputColorSpace    = THREE.SRGBColorSpace
    bloomRenderer.setClearColor(0x000000, 0)

    // ── Hologram shader ───────────────────────────────────────
    const holoVert = /* glsl */`
      varying vec3 vWorldPos;
      varying vec3 vNormal;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        vNormal   = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `
    const holoFrag = /* glsl */`
      varying vec3 vWorldPos;
      varying vec3 vNormal;
      uniform float uTime;
      uniform vec3  uColor;
      uniform float uOpacity;
      void main() {
        vec3 viewDir = normalize(cameraPosition - vWorldPos);
        float rim    = pow(1.0 - clamp(dot(vNormal, viewDir), 0.0, 1.0), 2.8);
        float scan   = sin(vWorldPos.y * 22.0 - uTime * 3.0) * 0.5 + 0.5;
        scan = pow(scan, 4.0) * 0.5;
        float flicker = sin(uTime * 53.7) * 0.04 + 0.96;
        float pulse = smoothstep(0.0, 0.04,
          abs(fract(vWorldPos.y * 0.5 - uTime * 0.15) - 0.5) - 0.46);
        float alpha = (rim * 0.65 + scan * 0.25 + 0.12 + pulse * 0.15) * uOpacity * flicker;
        vec3 col = uColor + vec3(scan * 0.3) + vec3(pulse * 0.4);
        gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
      }
    `

    function holoMat(color, opacity) {
      return new THREE.ShaderMaterial({
        vertexShader: holoVert, fragmentShader: holoFrag,
        uniforms: {
          uTime:    { value: 0 },
          uColor:   { value: new THREE.Color(color) },
          uOpacity: { value: opacity }
        },
        transparent: true, side: THREE.DoubleSide,
        depthWrite: false, blending: THREE.AdditiveBlending
      })
    }

    // ── Möbius strip (R=1.7, bigger than platform) ────────────
    function buildMobius(R = 1.7, w = 0.7, seg = 240, wSeg = 32) {
      const geo = new THREE.BufferGeometry()
      const pos = [], nor = [], uvArr = [], idx = []
      for (let i = 0; i <= seg; i++) {
        const t = (i / seg) * Math.PI * 2
        for (let j = 0; j <= wSeg; j++) {
          const s = (j / wSeg - 0.5) * w
          const x = (R + s * Math.cos(t * 0.5)) * Math.cos(t)
          const y =      s * Math.sin(t * 0.5)
          const z = (R + s * Math.cos(t * 0.5)) * Math.sin(t)
          const eps = 0.001, t2 = t + eps
          const dx = (R + s * Math.cos(t2*0.5)) * Math.cos(t2) - x
          const dy =  s * Math.sin(t2*0.5) - y
          const dz = (R + s * Math.cos(t2*0.5)) * Math.sin(t2) - z
          const dn = Math.hypot(dx, dy, dz) || 1
          pos.push(x, y, z)
          nor.push(dx/dn, dy/dn, dz/dn)
          uvArr.push(i/seg, j/wSeg)
        }
      }
      for (let i = 0; i < seg; i++) {
        for (let j = 0; j < wSeg; j++) {
          const a = i*(wSeg+1)+j, b = a+wSeg+1
          idx.push(a, b, a+1,  b, b+1, a+1)
        }
      }
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos,  3))
      geo.setAttribute('normal',   new THREE.Float32BufferAttribute(nor,  3))
      geo.setAttribute('uv',       new THREE.Float32BufferAttribute(uvArr, 2))
      geo.setIndex(idx)
      geo.computeVertexNormals()
      return geo
    }

    const mobiusGeo   = buildMobius()
    const mobiusGroup = new THREE.Group()
    const solidMat    = holoMat(0x00eeff, 0.15)

    mobiusGroup.add(new THREE.Mesh(mobiusGeo, solidMat))
    mobiusGroup.add(new THREE.Mesh(mobiusGeo, new THREE.MeshBasicMaterial({
      color: 0x00ffff, wireframe: true, transparent: true,
      opacity: 0.05, blending: THREE.AdditiveBlending, depthWrite: false
    })))
    // EdgeGeometry removed (commented out in original)

    mobiusGroup.position.set(0, 3.5, 0)
    mobiusGroup.rotation.x = 0.2
    scene.add(mobiusGroup)

    // ── Projection platform ───────────────────────────────────
    const platform = new THREE.Mesh(
      new THREE.CylinderGeometry(2.8, 3.0, 0.12, 128),
      new THREE.MeshStandardMaterial({
        color: 0x041520, metalness: 0.95, roughness: 0.15,
        emissive: 0x001a2e, emissiveIntensity: 0.6
      })
    )
    platform.position.y = 0.06
    scene.add(platform)

    // ── HUD ring texture ──────────────────────────────────────
    const hudCanvas = document.createElement('canvas')
    hudCanvas.width = 1024; hudCanvas.height = 1024
    const hctx = hudCanvas.getContext('2d')
    const cx = 512, cy = 512

    function drawHudRing(radius, dashLen, gapLen, opacity, lineWidth = 1) {
      hctx.save()
      hctx.strokeStyle = `rgba(0,220,255,${opacity})`
      hctx.lineWidth = lineWidth
      hctx.setLineDash([dashLen, gapLen])
      hctx.beginPath()
      hctx.arc(cx, cy, radius, 0, Math.PI * 2)
      hctx.stroke()
      hctx.restore()
    }

    // Solid outer ring
    hctx.strokeStyle = 'rgba(0,238,255,0.9)'
    hctx.lineWidth = 3
    hctx.setLineDash([])
    hctx.beginPath(); hctx.arc(cx, cy, 490, 0, Math.PI * 2); hctx.stroke()

    // Dashed inner rings
    drawHudRing(460, 18, 8,  0.5, 1.5)
    drawHudRing(420, 6,  14, 0.3, 1)
    drawHudRing(370, 30, 10, 0.6, 2)
    drawHudRing(310, 8,  8,  0.3, 1)
    drawHudRing(260, 20, 6,  0.5, 1.5)
    drawHudRing(200, 4,  10, 0.25, 1)
    drawHudRing(140, 15, 5,  0.45, 1.5)
    drawHudRing(80,  5,  5,  0.35, 1)

    // Tick marks
    for (let i = 0; i < 72; i++) {
      const angle = (i / 72) * Math.PI * 2
      const inner = i % 6 === 0 ? 460 : i % 3 === 0 ? 468 : 472
      hctx.save()
      hctx.strokeStyle = `rgba(0,238,255,${i % 6 === 0 ? 0.9 : 0.4})`
      hctx.lineWidth = i % 6 === 0 ? 2 : 1
      hctx.setLineDash([])
      hctx.beginPath()
      hctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner)
      hctx.lineTo(cx + Math.cos(angle) * 490,   cy + Math.sin(angle) * 490)
      hctx.stroke()
      hctx.restore()
    }

    // Dot nodes
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2
      hctx.save()
      hctx.fillStyle = i % 4 === 0 ? 'rgba(0,238,255,1)' : 'rgba(0,180,220,0.6)'
      hctx.shadowColor = '#00eeff'
      hctx.shadowBlur = 10
      hctx.beginPath()
      hctx.arc(cx + Math.cos(angle) * 490, cy + Math.sin(angle) * 490, i % 4 === 0 ? 5 : 3, 0, Math.PI * 2)
      hctx.fill()
      hctx.restore()
    }

    const hudTex = new THREE.CanvasTexture(hudCanvas)
    const hudPlane = new THREE.Mesh(
      new THREE.CircleGeometry(2.8, 128),
      new THREE.MeshBasicMaterial({
        map: hudTex, transparent: true, opacity: 1.0,
        blending: THREE.AdditiveBlending, depthWrite: false
      })
    )
    hudPlane.rotation.x = -Math.PI * 0.5
    hudPlane.position.y = 0.13
    scene.add(hudPlane)

    // Glowing outer rim torus
    const rimMat = new THREE.MeshBasicMaterial({
      color: 0x00eeff, transparent: true, opacity: 1.0,
      blending: THREE.AdditiveBlending
    })
    const outerRim = new THREE.Mesh(new THREE.TorusGeometry(2.8, 0.022, 8, 200), rimMat)
    outerRim.rotation.x = Math.PI * 0.5
    outerRim.position.y = 0.13
    scene.add(outerRim)

    // ── Radial floor glow ─────────────────────────────────────
    const glowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(7, 7),
      new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `
          varying vec2 vUv; uniform float uTime;
          void main(){
            vec2 p = vUv - 0.5;
            float d = length(p);
            float pulse = sin(uTime * 1.8) * 0.08 + 0.92;
            float glow = pow(max(0.0, 1.0 - d * 2.2), 2.5) * 0.2 * pulse;
            float ring = smoothstep(0.02, 0.0, abs(d - 0.42 + sin(uTime*1.2)*0.02)) * 0.2;
            gl_FragColor = vec4(0.0, 0.85, 1.0, glow + ring);
          }
        `,
        transparent: true, depthWrite: false,
        blending: THREE.AdditiveBlending, side: THREE.DoubleSide
      })
    )
    glowPlane.rotation.x = -Math.PI * 0.5
    glowPlane.position.y = 0.14
    scene.add(glowPlane)

    // ── Vertical light beams ──────────────────────────────────
    const beamPositions = [
      [0, 0],
      [0.18, 0.18], [-0.18, 0.18], [0.18, -0.18], [-0.18, -0.18],
      [0.35, 0], [-0.35, 0], [0, 0.35],
    ]

    const beamMeshes = beamPositions.map(([bx, bz], i) => {
      const height = 2.2 + Math.random() * 1.4
      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.035, height, 8, 1, true),
        new THREE.ShaderMaterial({
          uniforms: { uTime: { value: 0 }, uOffset: { value: i * 0.7 } },
          vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
          fragmentShader: `
            varying vec2 vUv; uniform float uTime; uniform float uOffset;
            void main(){
              float flicker = 0.7 + 0.3 * sin(uTime * 4.0 + uOffset * 3.14);
              float fade = pow(1.0 - vUv.y, 1.5) * flicker;
              gl_FragColor = vec4(0.0, 0.85, 1.0, fade * 0.35);
            }
          `,
          transparent: true, depthWrite: false,
          blending: THREE.AdditiveBlending, side: THREE.DoubleSide
        })
      )
      mesh.position.set(bx, 0.13 + height / 2, bz)
      scene.add(mesh)
      return mesh
    })

    // ── Lights ────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x001122, 2))

    const keyLight = new THREE.PointLight(0x00eeff, 4, 9)
    keyLight.position.set(0, 3.0, 0)
    scene.add(keyLight)

    // fillLight removed (commented out in original)

    const rimLight = new THREE.PointLight(0x00ffaa, 1.5, 8)
    rimLight.position.set(3, 1, 2)
    scene.add(rimLight)

    // ── Input ─────────────────────────────────────────────────
    let dragging = false
    let prev  = { x: 0, y: 0 }
    let vel   = { x: 0, y: 0 }
    let drag  = { x: 0, y: 0 }
    let tiltTarget  = { x: 0, y: 0 }
    let tiltCurrent = { x: 0, y: 0 }
    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2

    const onMouseMove = e => {
      mouseX = e.clientX; mouseY = e.clientY
      tiltTarget.y =  ((e.clientX / window.innerWidth)  - 0.5) * 2
      tiltTarget.x = -((e.clientY / window.innerHeight) - 0.5) * 2
      if (!dragging) return
      vel.y += (e.clientX - prev.x) * 0.007
      vel.x += (e.clientY - prev.y) * 0.007
      prev = { x: e.clientX, y: e.clientY }
      // also update coords display
      const nx = ((e.clientX / window.innerWidth)  - 0.5).toFixed(3)
      const ny = ((e.clientY / window.innerHeight) - 0.5).toFixed(3)
      const coordsEl = document.getElementById('coords')
      if (coordsEl) coordsEl.textContent = `X: ${nx}  Y: ${ny}`
    }
    const onMouseDown = e => {
      dragging = true; prev = { x: e.clientX, y: e.clientY }
      const cursor = document.getElementById('cursor')
      const ring   = document.getElementById('cursor-ring')
      if (cursor) cursor.classList.add('drag')
      if (ring)   ring.classList.add('drag')
    }
    const onMouseUp = () => {
      dragging = false
      const cursor = document.getElementById('cursor')
      const ring   = document.getElementById('cursor-ring')
      if (cursor) cursor.classList.remove('drag')
      if (ring)   ring.classList.remove('drag')
    }
    const onTouchStart = e => { dragging = true; prev = { x: e.touches[0].clientX, y: e.touches[0].clientY } }
    const onTouchEnd   = () => { dragging = false }
    const onTouchMove  = e => {
      tiltTarget.y =  ((e.touches[0].clientX / window.innerWidth)  - 0.5) * 2
      tiltTarget.x = -((e.touches[0].clientY / window.innerHeight) - 0.5) * 2
      if (!dragging) return
      vel.y += (e.touches[0].clientX - prev.x) * 0.007
      vel.x += (e.touches[0].clientY - prev.y) * 0.007
      prev = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }

    document.addEventListener('mousemove',  onMouseMove)
    document.addEventListener('mousedown',  onMouseDown)
    document.addEventListener('mouseup',    onMouseUp)
    document.addEventListener('touchstart', onTouchStart)
    document.addEventListener('touchend',   onTouchEnd)
    document.addEventListener('touchmove',  onTouchMove)

    // ── Resize ────────────────────────────────────────────────
    const onResize = () => {
      CW = container.clientWidth
      CH = container.clientHeight
      camera.aspect = CW / CH
      camera.updateProjectionMatrix()
      renderer.setSize(CW, CH)
      bloomRenderer.setSize(CW, CH, false)
      bloomCanvas.width  = CW
      bloomCanvas.height = CH
    }
    window.addEventListener('resize', onResize)

    // ── Animation loop ────────────────────────────────────────
    const clock = new THREE.Clock()
    let rafId

    function animate() {
      rafId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      vel.x *= 0.88; vel.y *= 0.88
      drag.x += vel.x; drag.y += vel.y
      drag.x = Math.max(-Math.PI * 0.45, Math.min(Math.PI * 0.45, drag.x))

      tiltCurrent.x += (tiltTarget.x * 0.28 - tiltCurrent.x) * 0.04
      tiltCurrent.y += (tiltTarget.y * 0.28 - tiltCurrent.y) * 0.04

      mobiusGroup.rotation.y = t * 0.22 + drag.y + tiltCurrent.y
      mobiusGroup.rotation.x = Math.sin(t * 0.28) * 0.15 + drag.x + tiltCurrent.x
      mobiusGroup.rotation.z = Math.cos(t * 0.18) * 0.07

      const floatY = Math.sin(t * 0.65) * 0.12
      mobiusGroup.position.y = 3.0 + floatY

      solidMat.uniforms.uTime.value = t
      glowPlane.material.uniforms.uTime.value = t
      beamMeshes.forEach(b => b.material.uniforms.uTime.value = t)

      const pulse = Math.sin(t * 2.2) * 0.35 + 0.65
      keyLight.intensity = 4 * pulse
      rimMat.opacity     = 0.65 + pulse * 0.2

      const rightStart = window.innerWidth - CW
      const rx = Math.max(-1, Math.min(1, ((mouseX - rightStart) / CW - 0.5) * 2))
      const ry = Math.max(-1, Math.min(1, (mouseY / window.innerHeight - 0.5) * 2))
      camera.position.x += (rx * 0.3 - camera.position.x) * 0.035
      camera.position.y += (3.8 - ry * 0.3 - camera.position.y) * 0.035
      camera.lookAt(0, 1.5, 0)

      renderer.render(scene, camera)
      bloomRenderer.render(scene, camera)
    }
    animate()

    // ── Cleanup ───────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId)
      document.removeEventListener('mousemove',  onMouseMove)
      document.removeEventListener('mousedown',  onMouseDown)
      document.removeEventListener('mouseup',    onMouseUp)
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchend',   onTouchEnd)
      document.removeEventListener('touchmove',  onTouchMove)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      bloomRenderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      if (container.contains(bloomCanvas)) {
        container.removeChild(bloomCanvas)
      }
    }
  }, [])

  return (
    <div id="right">
      <div id="canvas-container" ref={containerRef}></div>
      <div id="coords">X: 0.000 &nbsp; Y: 0.000</div>
    </div>
  )
}
