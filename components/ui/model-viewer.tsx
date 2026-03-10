"use client"

import { useEffect, useRef, useState } from "react"

// Verified measurements from actual GLB binary data (all in meters, post Y/Z-swap transform)
// Assembly X spans -0.141 to +0.155m, center = 0.007m
// All parts: cy = 0.01720m, cz = 0.07838m (subtract to center at origin)
// SCALE = 27.027 maps 296mm real → ~8 Three.js units

const CY    = 0.01720   // Y center to subtract
const CZ    = 0.07838   // Z center to subtract  
const SCALE = 27.027    // meters → Three.js units
const ACX   = 0.007     // assembly X center in meters

const PARTS = [
  { file: "tilt rod (existing on customers blinds).glb",               label: "Tilt Rod",          desc: "Your existing blind tilt rod — TiltForge mounts onto this. Not included.",           color: "#778899", ref: true,  acx:  0.007,    explX: -8.0 },
  { file: "housing.glb",                                               label: "Housing",           desc: "Main structural enclosure — 3D-printed from standard filament.",                    color: "#0098ff", ref: false, acx: -0.07665,  explX: -5.5 },
  { file: "friction clutch stack.glb",                                 label: "Friction Clutch",   desc: "Tuned slip clutch — transmits torque, protects against overload.",                   color: "#888e92", ref: false, acx: -0.02652,  explX: -3.2 },
  { file: "IP one4 Locknut.glb",                                       label: "Lock Nut",          desc: "Standard ¼\" lock nut — off-the-shelf, replaceable anywhere.",                      color: "#888e92", ref: false, acx: -0.012,    explX: -2.1 },
  { file: "washer plate.glb",                                          label: "Washer Plate",      desc: "Preload bearing surface for the clutch stack.",                                      color: "#a7adb1", ref: false, acx: -0.017,    explX: -1.1 },
  { file: "housing cap.glb",                                           label: "Housing Cap",       desc: "Closes the drive housing — 3D-printed, individually replaceable.",                  color: "#dde2e4", ref: false, acx: -0.0011,   explX:  0.0 },
  { file: "pin carrier.glb",                                           label: "Pin Carrier",       desc: "Output stage — transfers cycloid motion to the output shaft.",                      color: "#dde2e4", ref: false, acx:  0.014,    explX:  1.1 },
  { file: "3mm steel pins.glb",                                        label: "3mm Steel Pins",    desc: "Hardened steel drive pins — standard off-the-shelf hardware.",                      color: "#a7adb1", ref: false, acx:  0.028,    explX:  2.3 },
  { file: "cycloid input gear.glb",                                    label: "Cycloid Disc",      desc: "Hypocycloid profile — delivers smooth, high-ratio gear reduction.",                  color: "#ff7043", ref: false, acx:  0.040,    explX:  3.5 },
  { file: "fixed housing virtual ring pins.glb",                       label: "Ring Pin Housing",  desc: "Fixed outer ring with virtual pins — reaction element of the cycloid stage.",        color: "#dde2e4", ref: false, acx:  0.05955,  explX:  4.7 },
  { file: "input gear attached to axle as input to cycloid drive.glb", label: "Input Gear + Axle", desc: "Motor-side input — connects motor rotation to cam and cycloid stage.",               color: "#c8ced2", ref: false, acx:  0.0806,   explX:  5.9 },
  { file: "cam axle.glb",                                              label: "Cam Axle",          desc: "Eccentric cam on motor shaft — drives the cycloid disc in its lobed orbit.",         color: "#546e7a", ref: false, acx:  0.100,    explX:  7.1 },
  { file: "tilt rod adapter - quarter inch square.glb",                label: "Tilt Rod Adapter",  desc: "Couples TiltForge output to standard ¼\" square tilt rods.",                       color: "#0098ff", ref: false, acx:  0.12235,  explX:  8.3 },
]

const toX = (acx: number) => (acx - ACX) * SCALE

type Mode = "assembled" | "exploded" | "rotating"

export default function ModelViewer() {
  const mountRef   = useRef<HTMLDivElement>(null)
  const stateRef   = useRef<any>(null)
  const modeRef    = useRef<Mode>("assembled")
  const activeRef  = useRef<number | null>(null)
  const focusRef   = useRef<number | null>(null)

  const [mode,    setMode]    = useState<Mode>("assembled")
  const [active,  setActive]  = useState<number | null>(null)
  const [focused, setFocused] = useState<number | null>(null)
  const [pct,     setPct]     = useState(0)
  const [ready,   setReady]   = useState(false)

  useEffect(() => { modeRef.current  = mode    }, [mode])
  useEffect(() => { activeRef.current = active }, [active])
  useEffect(() => { focusRef.current  = focused }, [focused])

  useEffect(() => {
    if (!mountRef.current) return
    let raf: number, dead = false

    ;(async () => {
      // ── Three.js ─────────────────────────────────────────────────────────
      await new Promise<void>((res, rej) => {
        if ((window as any).THREE) { res(); return }
        const s = document.createElement("script")
        s.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
        s.onload = () => res(); s.onerror = rej
        document.head.appendChild(s)
      })
      if (dead) return
      const T = (window as any).THREE

      const W = mountRef.current!.clientWidth, H = 620
      const renderer = new T.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(W, H)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      mountRef.current!.appendChild(renderer.domElement)

      const scene  = new T.Scene()
      const camera = new T.PerspectiveCamera(40, W / H, 0.01, 500)

      // Lighting
      scene.add(new T.AmbientLight(0xffffff, 0.55))
      ;[
        { pos: [5, 8, 5],    int: 1.2, col: 0xffffff },
        { pos: [-5, 2, -3],  int: 0.4, col: 0x88aaff },
        { pos: [0, 3, -6],   int: 0.3, col: 0x0098ff },
        { pos: [0, -5, 2],   int: 0.2, col: 0xffffff },
      ].forEach(({ pos, int, col }) => {
        const l = new T.DirectionalLight(col, int)
        l.position.set(...pos as [number,number,number])
        scene.add(l)
      })

      // ── Orbit controller ─────────────────────────────────────────────────
      const orb = {
        th: 0.4, ph: 1.15, r: 10,
        tTh: 0.4, tPh: 1.15, tR: 10,
        drag: false, moved: false, lx: 0, ly: 0,
        look: new T.Vector3(), tLook: new T.Vector3(),
        autoTh: 0.4,
      }
      const cv = renderer.domElement
      const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))

      cv.addEventListener("mousedown",  (e: MouseEvent) => { orb.drag = true; orb.moved = false; orb.lx = e.clientX; orb.ly = e.clientY })
      window.addEventListener("mouseup", () => { orb.drag = false })
      window.addEventListener("mousemove", (e: MouseEvent) => {
        if (!orb.drag) return
        orb.moved = true
        orb.tTh -= (e.clientX - orb.lx) * 0.012
        orb.tPh  = clamp(orb.tPh + (e.clientY - orb.ly) * 0.012, 0.2, Math.PI - 0.2)
        orb.lx = e.clientX; orb.ly = e.clientY
      })
      cv.addEventListener("wheel", (e: WheelEvent) => {
        e.preventDefault(); orb.tR = clamp(orb.tR + e.deltaY * 0.02, 2, 25)
      }, { passive: false })

      let lp = 0
      cv.addEventListener("touchstart", (e: TouchEvent) => {
        if (e.touches.length === 1) { orb.drag = true; orb.moved = false; orb.lx = e.touches[0].clientX; orb.ly = e.touches[0].clientY }
        if (e.touches.length === 2)  lp = Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY)
      })
      cv.addEventListener("touchend", () => { orb.drag = false })
      cv.addEventListener("touchmove", (e: TouchEvent) => {
        e.preventDefault()
        if (e.touches.length === 1 && orb.drag) {
          orb.moved = true
          orb.tTh -= (e.touches[0].clientX - orb.lx) * 0.012
          orb.tPh  = clamp(orb.tPh + (e.touches[0].clientY - orb.ly) * 0.012, 0.2, Math.PI - 0.2)
          orb.lx = e.touches[0].clientX; orb.ly = e.touches[0].clientY
        }
        if (e.touches.length === 2) {
          const d = Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY)
          orb.tR = clamp(orb.tR - (d - lp) * 0.06, 2, 25); lp = d
        }
      }, { passive: false })

      // ── Click to focus ───────────────────────────────────────────────────
      const rc = new T.Raycaster(), m2 = new T.Vector2()
      cv.addEventListener("click", (e: MouseEvent) => {
        if (orb.moved) return
        const rect = cv.getBoundingClientRect()
        m2.set(((e.clientX-rect.left)/rect.width)*2-1, -((e.clientY-rect.top)/rect.height)*2+1)
        rc.setFromCamera(m2, camera)
        const targets: any[] = []
        meshes.forEach((g: any, gi: number) => g.traverse((c: any) => { if (c.isMesh) { c._i = gi; targets.push(c) } }))
        const hits = rc.intersectObjects(targets, false)
        if (hits.length) {
          const idx = hits[0].object._i
          const nf = focusRef.current === idx ? null : idx
          setFocused(nf); setActive(nf)
          orb.tLook.set(nf !== null ? (modeRef.current === "exploded" ? PARTS[nf].explX : toX(PARTS[nf].acx)) : 0, 0, 0)
          orb.tR = nf !== null ? 3.5 : 10
        } else {
          setFocused(null); setActive(null)
          orb.tLook.set(0, 0, 0); orb.tR = 13
        }
      })

      // ── Load parts ───────────────────────────────────────────────────────
      const meshes: any[] = [], curX: number[] = []
      for (let i = 0; i < PARTS.length; i++) {
        if (dead) return
        const p = PARTS[i]
        const g = await parsePart(T, `/models/${p.file}`, p.color, p.ref)
        g.position.set(toX(p.acx), 0, 0)
        scene.add(g); meshes.push(g); curX.push(toX(p.acx))
        setPct(Math.round(((i+1)/PARTS.length)*100))
      }
      if (dead) return
      stateRef.current = { meshes, curX, orb, T, renderer, scene, camera }
      setReady(true)

      // ── Render loop ──────────────────────────────────────────────────────
      const tick = () => {
        if (dead) return
        raf = requestAnimationFrame(tick)
        const s = stateRef.current, m = modeRef.current, act = activeRef.current, o = s.orb

        // Auto-rotate
        if (m !== "exploded" && !o.drag && focusRef.current === null) {
          o.autoTh += 0.004; o.tTh = o.autoTh
        } else if (!o.drag) { o.autoTh = o.th }

        // Smooth orbit
        o.th  += (o.tTh - o.th) * 0.08
        o.ph  += (o.tPh - o.ph) * 0.08
        o.r   += (o.tR  - o.r)  * 0.08
        o.look.lerp(o.tLook, 0.08)

        const sp = Math.sin(o.ph), cp = Math.cos(o.ph)
        camera.position.set(
          o.look.x + o.r * sp * Math.sin(o.th),
          o.look.y + o.r * cp,
          o.look.z + o.r * sp * Math.cos(o.th)
        )
        camera.lookAt(o.look)

        // Move parts
        s.meshes.forEach((mesh: any, i: number) => {
          const base = m === "exploded" ? PARTS[i].explX : toX(PARTS[i].acx)
          const tx   = act === i && !PARTS[i].ref ? base + 0.4 : base
          s.curX[i] += (tx - s.curX[i]) * 0.07
          mesh.position.x = s.curX[i]
          mesh.traverse((c: any) => {
            if (!c.isMesh) return
            c.material.emissive?.setHex(act === i ? 0x004499 : 0x000000)
            c.material.emissiveIntensity = act === i ? 0.4 : 0
          })
        })
        s.renderer.render(s.scene, s.camera)
      }
      tick()

      const onResize = () => {
        if (!mountRef.current || !stateRef.current) return
        const W2 = mountRef.current.clientWidth
        stateRef.current.renderer.setSize(W2, 620)
        stateRef.current.camera.aspect = W2 / 620
        stateRef.current.camera.updateProjectionMatrix()
      }
      window.addEventListener("resize", onResize)
    })()

    return () => {
      dead = true; cancelAnimationFrame(raf)
      if (stateRef.current?.renderer && mountRef.current) {
        try { mountRef.current.removeChild(stateRef.current.renderer.domElement) } catch {}
        stateRef.current.renderer.dispose()
      }
    }
  }, [])

  const reset = () => {
    setFocused(null); setActive(null)
    if (stateRef.current) { stateRef.current.orb.tLook.set(0,0,0); stateRef.current.orb.tR = 10 }
  }

  return (
    <div className="w-full select-none">

      {/* ── Full-width 3D canvas ── */}
      <div className="w-full rounded-xl overflow-hidden border border-border bg-[#080c10] relative" style={{ height: 620 }}>

        {/* Loading overlay */}
        {!ready && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-[#080c10]">
            <div className="w-48 h-px bg-border mb-4 relative overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-primary transition-all duration-200" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs text-muted-foreground font-mono tracking-widest">LOADING {pct}%</p>
            <p className="text-xs text-muted-foreground/40 mt-1">{PARTS[Math.min(Math.floor(pct/(100/PARTS.length)), PARTS.length-1)]?.label}</p>
          </div>
        )}

        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Hint */}
        {ready && active === null && (
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-xs text-white/20 tracking-wide whitespace-nowrap">
            Drag · Scroll to zoom · Click a part
          </p>
        )}

        {/* Mode buttons */}
        <div className="absolute top-4 left-4 flex gap-2 z-10">
          {(["assembled","exploded","rotating"] as Mode[]).map(m => (
            <button key={m} onClick={() => { setMode(m); reset() }}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-widest transition-all ${
                mode === m ? "bg-primary text-white shadow-lg shadow-primary/30"
                           : "bg-black/70 border border-white/10 text-white/40 hover:border-primary/40 hover:text-white/80"
              }`}>{m}</button>
          ))}
        </div>
      </div>

      {/* ── Bottom panel: part list + detail card ── */}
      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">

        {/* Part list — always visible */}
        <div className="md:col-span-2 rounded-xl border border-border bg-[#0d1117] p-4">
          <p className="text-xs text-white/30 font-mono tracking-widest uppercase mb-3">Components</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
            {PARTS.map((p, i) => (
              <button key={i}
                onMouseEnter={() => { if (!focused) setActive(i) }}
                onMouseLeave={() => { if (!focused) setActive(null) }}
                onClick={() => {
                  const nf = focused === i ? null : i
                  setFocused(nf); setActive(nf)
                  if (stateRef.current) {
                    stateRef.current.orb.tLook.set(nf !== null ? (mode === "exploded" ? PARTS[i].explX : toX(PARTS[i].acx)) : 0, 0, 0)
                    stateRef.current.orb.tR = nf !== null ? 3.5 : 10
                  }
                }}
                className={`text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 transition-all ${
                  active === i
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : p.ref
                      ? "text-white/25 hover:text-white/40 border border-transparent hover:border-white/10"
                      : "text-white/50 hover:text-white/80 border border-transparent hover:border-white/15"
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 border"
                  style={{ background: p.color, borderColor: p.ref ? "rgba(255,255,255,0.15)" : "transparent", opacity: p.ref ? 0.5 : 1 }}
                />
                <span className="truncate">{p.label}</span>
                {p.ref && <span className="text-[9px] text-white/20 ml-auto flex-shrink-0">—</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Detail card */}
        <div className="rounded-xl border border-border bg-[#0d1117] p-4 flex flex-col justify-between min-h-[140px]">
          {active !== null ? (
            <>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ background: PARTS[active].color, opacity: PARTS[active].ref ? 0.5 : 1 }}
                  />
                  <p className="text-sm font-semibold text-primary leading-tight">{PARTS[active].label}</p>
                  {PARTS[active].ref && (
                    <span className="text-[10px] border border-white/15 text-white/35 px-1.5 py-0.5 rounded ml-auto flex-shrink-0">NOT INCLUDED</span>
                  )}
                </div>
                <p className="text-sm text-white/65 leading-relaxed">{PARTS[active].desc}</p>
              </div>
              {focused !== null && (
                <button onClick={reset}
                  className="mt-3 text-xs text-white/30 hover:text-white/60 transition-colors text-left">
                  ← Back to full assembly
                </button>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
                </svg>
              </div>
              <p className="text-xs text-white/25">Click any part to see details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── GLB parser ────────────────────────────────────────────────────────────────
async function parsePart(T: any, url: string, fallback: string, isRef: boolean): Promise<any> {
  const group = new T.Group()
  try {
    const r = await fetch(url)
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const buf  = (await r.arrayBuffer()).slice(0)
    const dv   = new DataView(buf)
    const jlen = dv.getUint32(12, true)
    const gltf = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 20, jlen)))
    const bin  = buf.slice(20 + jlen + 8)
    const bdv  = new DataView(bin)

    // Read typed array from accessor, byte by byte (avoids alignment issues)
    const readAcc = (idx: number) => {
      const acc  = gltf.accessors[idx]
      const bv   = gltf.bufferViews[acc.bufferView]
      const base = (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0)
      const nc   = ({ SCALAR:1, VEC2:2, VEC3:3, VEC4:4 } as Record<string,number>)[acc.type] ?? 1
      const str  = bv.byteStride ?? nc * 4
      if (acc.componentType === 5126) { // float32
        const o = new Float32Array(acc.count * nc)
        for (let i = 0; i < acc.count; i++)
          for (let c = 0; c < nc; c++)
            o[i*nc+c] = bdv.getFloat32(base + i*str + c*4, true)
        return o
      }
      // uint32 or uint16 indices
      const o = new Uint32Array(acc.count)
      if (acc.componentType === 5125) for (let i=0;i<acc.count;i++) o[i] = bdv.getUint32(base+i*4, true)
      else                            for (let i=0;i<acc.count;i++) o[i] = bdv.getUint16(base+i*2, true)
      return o
    }

    for (const mesh of gltf.meshes ?? []) {
      for (const prim of mesh.primitives ?? []) {
        const geo = new T.BufferGeometry()

        // Positions: apply Y/Z swap + center offset in one pass
        if (prim.attributes?.POSITION != null) {
          const raw = readAcc(prim.attributes.POSITION) as Float32Array
          const n   = raw.length / 3
          const pos = new Float32Array(n * 3)
          // Part's local X center (raw meters) — geometry must be centered, world pos set via group.position
          let xmin = Infinity, xmax = -Infinity
          for (let i = 0; i < n; i++) { if (raw[i*3] < xmin) xmin = raw[i*3]; if (raw[i*3] > xmax) xmax = raw[i*3] }
          const pcx = (xmin + xmax) / 2
          for (let i = 0; i < n; i++) {
            pos[i*3]   = (raw[i*3]   - pcx) * SCALE  // X: local geometry centered at 0
            pos[i*3+1] = (raw[i*3+2] - CY)  * SCALE  // Y: was Z, subtract shared CY
            pos[i*3+2] = (-raw[i*3+1] - CZ) * SCALE  // Z: was -Y, subtract shared CZ
          }
          geo.setAttribute("position", new T.BufferAttribute(pos, 3))
        }

        // Vertex colors
        if (prim.attributes?.COLOR_0 != null) {
          const acc2 = gltf.accessors[prim.attributes.COLOR_0]
          const raw  = readAcc(prim.attributes.COLOR_0) as Float32Array
          const nc2  = acc2.type === "VEC4" ? 4 : 3
          if (nc2 === 3) {
            geo.setAttribute("color", new T.BufferAttribute(raw, 3))
          } else {
            const rgb = new Float32Array(acc2.count * 3)
            for (let i=0;i<acc2.count;i++) { rgb[i*3]=raw[i*4]; rgb[i*3+1]=raw[i*4+1]; rgb[i*3+2]=raw[i*4+2] }
            geo.setAttribute("color", new T.BufferAttribute(rgb, 3))
          }
        }

        // Indices
        if (prim.indices != null)
          geo.setIndex(new T.BufferAttribute(new Uint32Array(readAcc(prim.indices)), 1))

        geo.computeVertexNormals()

        group.add(new T.Mesh(geo, new T.MeshStandardMaterial({
          color: prim.attributes?.COLOR_0 != null ? 0xffffff : fallback,
          vertexColors: prim.attributes?.COLOR_0 != null,
          metalness: isRef ? 0.1 : 0.4,
          roughness: isRef ? 0.85 : 0.5,
          transparent: isRef,
          opacity: isRef ? 0.4 : 1.0,
        })))
      }
    }
  } catch(e) {
    console.warn(`Failed: ${url}`, e)
    group.add(new T.Mesh(new T.BoxGeometry(0.5, 0.5, 0.3), new T.MeshStandardMaterial({ color: fallback })))
  }
  // NOTE: group.position is set by caller — don't touch it here
  return group
}
