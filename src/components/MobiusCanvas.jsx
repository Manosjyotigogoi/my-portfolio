import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass }     from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass }     from 'three/addons/postprocessing/OutputPass.js'

export default function MobiusCanvas() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let CW = container.clientWidth  || 480
    let CH = container.clientHeight || (window.innerHeight - 52)

    // ── Renderer ────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(CW, CH)
    renderer.toneMapping         = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    renderer.outputColorSpace    = THREE.SRGBColorSpace
    container.appendChild(renderer.domElement)

    // ── Scene ────────────────────────────────────────────────────
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x000000, 0.055)

    // ── Camera ───────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(46, CW / CH, 0.1, 100)
    camera.position.set(0, 1.8, 7.2)
    camera.lookAt(0, 1.0, 0)

    // ── Post-processing ──────────────────────────────────────────
    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    const bloom = new UnrealBloomPass(new THREE.Vector2(CW, CH), 1.8, 0.5, 0.08)
    composer.addPass(bloom)
    composer.addPass(new OutputPass())

    // ── Hologram Shader ──────────────────────────────────────────
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
        float scan = sin(vWorldPos.y * 22.0 - uTime * 3.0) * 0.5 + 0.5;
        scan = pow(scan, 4.0) * 0.5;
        float flicker = sin(uTime * 53.7) * 0.04 + 0.96;
        float pulse = smoothstep(0.0, 0.04,
          abs(fract(vWorldPos.y * 0.5 - uTime * 0.15) - 0.5) - 0.46);
        float alpha = (rim * 0.65 + scan * 0.25 + 0.12 + pulse * 0.15)
                      * uOpacity * flicker;
        vec3 col = uColor + vec3(scan * 0.3) + vec3(pulse * 0.4);
        gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
      }
    `

    function holoMat(color, opacity) {
      return new THREE.ShaderMaterial({
        vertexShader:   holoVert,
        fragmentShader: holoFrag,
        uniforms: {
          uTime:    { value: 0 },
          uColor:   { value: new THREE.Color(color) },
          uOpacity: { value: opacity }
        },
        transparent: true,
        side:        THREE.DoubleSide,
        depthWrite:  false,
        blending:    THREE.AdditiveBlending
      })
    }

    // ── Möbius Geometry ──────────────────────────────────────────
    function buildMobius(R = 1.25, w = 0.58, seg = 240, wSeg = 32) {
      const geo  = new THREE.BufferGeometry()
      const pos  = [], nor = [], uvArr = [], idx = []

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
    const solidMat    = holoMat(0x00eeff, 0.6)

    mobiusGroup.add(new THREE.Mesh(mobiusGeo, solidMat))
    mobiusGroup.add(new THREE.Mesh(mobiusGeo, new THREE.MeshBasicMaterial({
      color: 0x00ffff, wireframe: true, transparent: true,
      opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false
    })))
    mobiusGroup.add(new THREE.LineSegments(
      new THREE.EdgesGeometry(mobiusGeo, 8),
      new THREE.LineBasicMaterial({
        color: 0x44ffff, transparent: true, opacity: 1.0,
        blending: THREE.AdditiveBlending
      })
    ))

    mobiusGroup.position.set(0, 2.2, 0)
    mobiusGroup.rotation.x = 0.2
    scene.add(mobiusGroup)

    // ── Name Ring ────────────────────────────────────────────────
    const rc = document.createElement('canvas')
    rc.width = 2048; rc.height = 96
    const rctx = rc.getContext('2d')
    rctx.font = 'bold 42px sans-serif'
    rctx.fillStyle = '#ffd700'
    rctx.textAlign = 'center'; rctx.textBaseline = 'middle'
    rctx.shadowColor = '#ffaa00'; rctx.shadowBlur = 22
    rctx.fillText('— MANOS JYOTI GOGOI — MANOS JYOTI GOGOI —', 1024, 48)

    const nameRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.98, 0.05, 2, 200),
      new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(rc),
        transparent: true, opacity: 0.85,
        blending: THREE.AdditiveBlending, depthWrite: false
      })
    )
    nameRing.rotation.x = Math.PI * 0.5
    nameRing.position.set(0, 2.2, 0)
    scene.add(nameRing)

    // ── Platform ─────────────────────────────────────────────────
    const platform = new THREE.Mesh(
      new THREE.CylinderGeometry(2.5, 2.7, 0.18, 128),
      new THREE.MeshStandardMaterial({ color: 0x040c14, metalness: 0.95, roughness: 0.25 })
    )
    platform.position.y = 0.09
    scene.add(platform)

    const platTop = new THREE.Mesh(
      new THREE.CircleGeometry(2.5, 128),
      new THREE.MeshBasicMaterial({ color: 0x002233, transparent: true, opacity: 0.5 })
    )
    platTop.rotation.x = -Math.PI * 0.5
    platTop.position.y = 0.19
    scene.add(platTop)

    const rimMat = new THREE.MeshBasicMaterial({
      color: 0x00eeff, transparent: true, opacity: 1.0,
      blending: THREE.AdditiveBlending
    })
    const outerRim = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.028, 8, 200), rimMat)
    outerRim.rotation.x = Math.PI * 0.5
    outerRim.position.y = 0.19
    scene.add(outerRim)

    ;[1.8, 1.2, 0.72].forEach((r, i) => {
      const m = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.014, 8, 200),
        new THREE.MeshBasicMaterial({
          color: 0x00ccff, transparent: true,
          opacity: 0.42 - i * 0.1,
          blending: THREE.AdditiveBlending
        })
      )
      m.rotation.x = Math.PI * 0.5
      m.position.y = 0.19
      scene.add(m)
    })

    ;[
      [[0,0],[0.5,0],[0.75,0.25],[1.4,0.25]],
      [[0,0],[-0.5,0],[-0.75,-0.25],[-1.4,-0.25]],
      [[0,0],[0,-0.5],[0.25,-0.75],[0.25,-1.35]],
      [[0,0],[0,0.5],[-0.25,0.75],[-0.25,1.35]],
    ].forEach(pts => {
      const g = new THREE.BufferGeometry().setFromPoints(
        pts.map(p => new THREE.Vector3(p[0], 0.20, p[1]))
      )
      scene.add(new THREE.Line(g, new THREE.LineBasicMaterial({
        color: 0x00eeff, transparent: true, opacity: 0.28,
        blending: THREE.AdditiveBlending
      })))
    })

    // ── Beam ─────────────────────────────────────────────────────
    const beamMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:  { value: 0 },
        uColor: { value: new THREE.Color(0x00eeff) }
      },
      vertexShader: /* glsl */`
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
      `,
      fragmentShader: /* glsl */`
        varying vec2 vUv; uniform float uTime; uniform vec3 uColor;
        void main() {
          float a = (1.0 - vUv.y) * 0.14;
          a *= 0.7 + (sin(vUv.y * 32.0 - uTime * 3.5) * 0.5 + 0.5) * 0.3;
          gl_FragColor = vec4(uColor, a);
        }
      `,
      transparent: true, side: THREE.DoubleSide,
      depthWrite: false, blending: THREE.AdditiveBlending
    })

    const beam = new THREE.Mesh(new THREE.ConeGeometry(0.038, 2.1, 64, 1, true), beamMat)
    beam.position.set(0, 1.24, 0)
    beam.rotation.x = Math.PI
    scene.add(beam)

    for (let i = 0; i < 14; i++) {
      const f = i / 14
      const rm = new THREE.Mesh(
        new THREE.RingGeometry(f*0.92 - 0.006, f*0.92 + 0.006, 128),
        new THREE.MeshBasicMaterial({
          color: 0x00eeff, transparent: true, opacity: (1-f)*0.16,
          side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false
        })
      )
      rm.rotation.x = -Math.PI * 0.5
      rm.position.y = 0.20 + f * 2.1
      scene.add(rm)
    }

    // ── Particles ────────────────────────────────────────────────
    const PC = 1100
    const pArr   = new Float32Array(PC * 3)
    const pSpeed = new Float32Array(PC)
    for (let i = 0; i < PC; i++) {
      const a = Math.random() * Math.PI * 2
      const r = 0.3 + Math.random() * 3.2
      pArr[i*3]   = Math.cos(a) * r
      pArr[i*3+1] = Math.random() * 5.0
      pArr[i*3+2] = Math.sin(a) * r
      pSpeed[i]   = 0.0018 + Math.random() * 0.005
    }
    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute('position', new THREE.Float32BufferAttribute(pArr, 3))
    scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: 0x00eeff, size: 0.018, transparent: true, opacity: 0.55,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
    })))

    // ── Lights ───────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x001122, 3))
    const keyLight = new THREE.PointLight(0x00eeff, 6, 9)
    keyLight.position.set(0, 3.0, 0)
    scene.add(keyLight)
    const fillLight = new THREE.PointLight(0x0033ff, 3, 12)
    fillLight.position.set(-3, 1, -2)
    scene.add(fillLight)
    const rimLight = new THREE.PointLight(0x00ffaa, 2, 8)
    rimLight.position.set(3, 1, 2)
    scene.add(rimLight)

    // ── Input ────────────────────────────────────────────────────
    let dragging = false
    let prev  = { x: 0, y: 0 }
    let vel   = { x: 0, y: 0 }
    let drag  = { x: 0, y: 0 }
    let tiltTarget  = { x: 0, y: 0 }
    let tiltCurrent = { x: 0, y: 0 }
    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2

    const cursorEl   = document.getElementById('cursor')
    const cursorRing = document.getElementById('cursor-ring')

    const onMouseDown = (e) => {
      dragging = true
      prev = { x: e.clientX, y: e.clientY }
      cursorEl?.classList.add('drag')
      cursorRing?.classList.add('drag')
    }
    const onMouseUp = () => {
      dragging = false
      cursorEl?.classList.remove('drag')
      cursorRing?.classList.remove('drag')
    }
    const onMouseMove = (e) => {
      mouseX = e.clientX; mouseY = e.clientY
      tiltTarget.y =  ((e.clientX / window.innerWidth)  - 0.5) * 2
      tiltTarget.x = -((e.clientY / window.innerHeight) - 0.5) * 2
      if (!dragging) return
      vel.y += (e.clientX - prev.x) * 0.007
      vel.x += (e.clientY - prev.y) * 0.007
      prev = { x: e.clientX, y: e.clientY }
    }
    const onTouchStart = (e) => {
      dragging = true
      prev = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    const onTouchEnd   = () => { dragging = false }
    const onTouchMove  = (e) => {
      tiltTarget.y = ((e.touches[0].clientX / window.innerWidth)  - 0.5) * 2
      tiltTarget.x = -((e.touches[0].clientY / window.innerHeight) - 0.5) * 2
      if (!dragging) return
      vel.y += (e.touches[0].clientX - prev.x) * 0.007
      vel.x += (e.touches[0].clientY - prev.y) * 0.007
      prev = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }

    document.addEventListener('mousedown',  onMouseDown)
    document.addEventListener('mouseup',    onMouseUp)
    document.addEventListener('mousemove',  onMouseMove)
    document.addEventListener('touchstart', onTouchStart)
    document.addEventListener('touchend',   onTouchEnd)
    document.addEventListener('touchmove',  onTouchMove)

    // ── Resize ───────────────────────────────────────────────────
    const onResize = () => {
      CW = container.clientWidth
      CH = container.clientHeight
      camera.aspect = CW / CH
      camera.updateProjectionMatrix()
      renderer.setSize(CW, CH)
      composer.setSize(CW, CH)
      bloom.resolution.set(CW, CH)
    }
    window.addEventListener('resize', onResize)

    // ── Animation Loop ───────────────────────────────────────────
    const clock = new THREE.Clock()
    let animId

    function animate() {
      animId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      vel.x *= 0.88; vel.y *= 0.88
      drag.x += vel.x; drag.y += vel.y
      drag.x = Math.max(-Math.PI * 0.45, Math.min(Math.PI * 0.45, drag.x))

      tiltCurrent.x += (tiltTarget.x * 0.28 - tiltCurrent.x) * 0.04
      tiltCurrent.y += (tiltTarget.y * 0.28 - tiltCurrent.y) * 0.04

      mobiusGroup.rotation.y = t * 0.22 + drag.y + tiltCurrent.y
      mobiusGroup.rotation.x = Math.sin(t * 0.28) * 0.15 + drag.x + tiltCurrent.x
      mobiusGroup.rotation.z = Math.cos(t * 0.18) * 0.07

      const floatY = Math.sin(t * 0.65) * 0.14
      mobiusGroup.position.y = 2.2 + floatY
      nameRing.position.y    = 2.2 + floatY
      nameRing.rotation.y    = t * 0.17

      solidMat.uniforms.uTime.value = t
      beamMat.uniforms.uTime.value  = t

      const pulse = Math.sin(t * 2.2) * 0.35 + 0.65
      keyLight.intensity = 6 * pulse
      rimMat.opacity     = 0.75 + pulse * 0.25

      const pa = pGeo.attributes.position.array
      for (let i = 0; i < PC; i++) {
        pa[i*3+1] += pSpeed[i]
        if (pa[i*3+1] > 5.2) {
          const a = Math.random() * Math.PI * 2
          const r = 0.3 + Math.random() * 3.0
          pa[i*3]   = Math.cos(a) * r
          pa[i*3+1] = 0.05
          pa[i*3+2] = Math.sin(a) * r
        }
      }
      pGeo.attributes.position.needsUpdate = true

      const rightStart = window.innerWidth - CW
      const rx = Math.max(-1, Math.min(1, ((mouseX - rightStart) / CW - 0.5) * 2))
      const ry = Math.max(-1, Math.min(1, (mouseY / window.innerHeight - 0.5) * 2))
      camera.position.x += (rx * 0.4 - camera.position.x) * 0.035
      camera.position.y += (1.8 - ry * 0.3 - camera.position.y) * 0.035
      camera.lookAt(0, 1.1, 0)

      composer.render()
    }

    animate()

    // ── Cleanup ──────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('mousedown',  onMouseDown)
      document.removeEventListener('mouseup',    onMouseUp)
      document.removeEventListener('mousemove',  onMouseMove)
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchend',   onTouchEnd)
      document.removeEventListener('touchmove',  onTouchMove)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return <div ref={containerRef} id="canvas-container" style={{ position: 'absolute', inset: 0 }} />
}
