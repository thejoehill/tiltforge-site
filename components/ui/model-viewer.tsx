"use client"

import { useEffect, useRef, useState } from "react"

// Tinkercad exports in meters. After Y/Z swap transform:
// All parts share Y center = 0.0172m, Z center = 0.0784m
// Assembly X spans -0.141m to +0.155m, center = 0.007m
// We shift each part so Y=0, Z=0, X = (partCenterX - assemblyCenterX) * SCALE
const SCALE = 27.027  // 8 Three.js units across 296mm assembly
const ASSM_CX = 0.007  // assembly X center in meters
const PART_CY = 0.0172 // shared Y center (meters, post-transform)
const PART_CZ = 0.0784 // shared Z center (meters, post-transform)

const PARTS = [
  { file: "tilt_rod__existing_on_customers_blinds_.glb",               label: "Tilt Rod",           description: "Your existing blind tilt rod — TiltForge mounts directly onto this. Not included.",           color: "#778899", reference: true,  cx:  0.007, explodedX: -8.0 },
  { file: "housing.glb",                                               label: "Housing",            description: "Main structural enclosure — 3D-printed from standard filament.",                             color: "#0098ff", reference: false, cx: -0.0767, explodedX: -5.5 },
  { file: "friction_clutch_stack.glb",                                 label: "Friction Clutch",    description: "Tuned slip clutch — transmits torque, protects against overload, preserves manual control.",  color: "#888e92", reference: false, cx: -0.0265, explodedX: -3.2 },
  { file: "IP_one4_Locknut.glb",                                       label: "Lock Nut",           description: "Standard ¼\" lock nut — off-the-shelf, replaceable anywhere.",                               color: "#888e92", reference: false, cx: -0.012,  explodedX: -2.0 },
  { file: "washer_plate.glb",                                          label: "Washer Plate",       description: "Preload bearing surface for the clutch stack.",                                                color: "#a7adb1", reference: false, cx: -0.017,  explodedX: -1.0 },
  { file: "housing_cap.glb",                                           label: "Housing Cap",        description: "Closes the drive housing — 3D-printed, individually replaceable.",                           color: "#dde2e4", reference: false, cx: -0.0011, explodedX:  0.1 },
  { file: "pin_carrier.glb",                                           label: "Pin Carrier",        description: "Output stage — transfers cycloid motion to the output shaft.",                                color: "#dde2e4", reference: false, cx:  0.014,  explodedX:  1.2 },
  { file: "3mm_steel_pins.glb",                                        label: "3mm Steel Pins",     description: "Hardened steel drive pins — standard off-the-shelf hardware.",                                color: "#a7adb1", reference: false, cx:  0.028,  explodedX:  2.4 },
  { file: "cycloid_input_gear.glb",                                    label: "Cycloid Disc",       description: "Hypocycloid profile — delivers smooth, high-ratio gear reduction.",                           color: "#ff7043", reference: false, cx:  0.040,  explodedX:  3.6 },
  { file: "fixed_housing_virtual_ring_pins.glb",                       label: "Ring Pin Housing",   description: "Fixed outer ring with virtual pins — reaction element of the cycloid stage.",                 color: "#dde2e4", reference: false, cx:  0.0596, explodedX:  4.8 },
  { file: "input_gear_attached_to_axle_as_input_to_cycloid_drive.glb", label: "Input Gear + Axle",  description: "Motor-side input — connects motor rotation to cam and cycloid stage.",                        color: "#c8ced2", reference: false, cx:  0.0806, explodedX:  6.0 },
  { file: "cam_axle.glb",                                              label: "Cam Axle",           description: "Eccentric cam on motor shaft — drives the cycloid disc in its lobed orbit.",                  color: "#546e7a", reference: false, cx:  0.100,  explodedX:  7.2 },
  { file: "tilt_rod_adapter_-_quarter_inch_square.glb",                label: "Tilt Rod Adapter",   description: "Couples TiltForge output to standard ¼\" square tilt rods.",                                 color: "#0098ff", reference: false, cx:  0.1224, explodedX:  8.5 },
]

// Convert real-world X center to Three.js assembled position
const toThree = (cx: number) => (cx - ASSM_CX) * SCALE

type ViewMode = "assembled" | "exploded" | "rotating"

export default function ModelViewer() {
  const mountRef   = useRef<HTMLDivElement>(null)
  const stateRef   = useRef<any>(null)
  const modeRef    = useRef<ViewMode>("assembled")
  const activeRef  = useRef<number | null>(null)
  const focusedRef = useRef<number | null>(null)

  const [mode,        setMode]        = useState<ViewMode>("assembled")
  const [activePart,  setActivePart]  = useState<number | null>(null)
  const [focusedPart, setFocusedPart] = useState<number | null>(null)
  const [progress,    setProgress]    = useState(0)
  const [ready,       setReady]       = useState(false)

  useEffect(() => { modeRef.current    = mode        }, [mode])
  useEffect(() => { activeRef.current  = activePart  }, [activePart])
  useEffect(() => { focusedRef.current = focusedPart }, [focusedPart])

  useEffect(() => {
    if (!mountRef.current) return
    let raf: number, dead = false

    ;(async () => {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js")
      if (dead) return
      const THREE = (window as any).THREE

      const W = mountRef.current!.clientWidth, H = 500
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(W, H)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      mountRef.current!.appendChild(renderer.domElement)

      const scene  = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(45, W / H, 0.01, 500)

      scene.add(new THREE.AmbientLight(0xffffff, 0.6))
      const key = new THREE.DirectionalLight(0xffffff, 1.2); key.position.set(5, 8, 5); scene.add(key)
      const fill = new THREE.DirectionalLight(0x88aaff, 0.4); fill.position.set(-5, 2, -3); scene.add(fill)
      const rim  = new THREE.DirectionalLight(0x0098ff, 0.3); rim.position.set(0, 3, -6); scene.add(rim)
      const bot  = new THREE.DirectionalLight(0xffffff, 0.2); bot.position.set(0, -5, 2); scene.add(bot)

      // Orbit
      const orbit = {
        theta: 0.4, phi: 1.15, radius: 14,
        targetTheta: 0.4, targetPhi: 1.15, targetRadius: 14,
        isDragging: false, lastX: 0, lastY: 0, didDrag: false,
        targetLookAt: new THREE.Vector3(0, 0, 0),
        currentLookAt: new THREE.Vector3(0, 0, 0),
        autoRotY: 0.4,
      }

      const canvas = renderer.domElement
      canvas.addEventListener("mousedown",  (e: MouseEvent)  => { orbit.isDragging = true; orbit.didDrag = false; orbit.lastX = e.clientX; orbit.lastY = e.clientY })
      window.addEventListener("mouseup",    ()               => { orbit.isDragging = false })
      window.addEventListener("mousemove",  (e: MouseEvent)  => {
        if (!orbit.isDragging) return
        orbit.didDrag = true
        orbit.targetTheta -= (e.clientX - orbit.lastX) * 0.012
        orbit.targetPhi    = Math.max(0.25, Math.min(Math.PI - 0.25, orbit.targetPhi + (e.clientY - orbit.lastY) * 0.012))
        orbit.lastX = e.clientX; orbit.lastY = e.clientY
      })
      canvas.addEventListener("wheel", (e: WheelEvent) => { e.preventDefault(); orbit.targetRadius = Math.max(3, Math.min(25, orbit.targetRadius + e.deltaY * 0.02)) }, { passive: false })

      let lastPinch = 0
      canvas.addEventListener("touchstart", (e: TouchEvent) => {
        if (e.touches.length === 1) { orbit.isDragging = true; orbit.didDrag = false; orbit.lastX = e.touches[0].clientX; orbit.lastY = e.touches[0].clientY }
        else if (e.touches.length === 2) lastPinch = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY)
      })
      canvas.addEventListener("touchend",  () => { orbit.isDragging = false })
      canvas.addEventListener("touchmove", (e: TouchEvent) => {
        e.preventDefault()
        if (e.touches.length === 1 && orbit.isDragging) {
          orbit.didDrag = true
          orbit.targetTheta -= (e.touches[0].clientX - orbit.lastX) * 0.012
          orbit.targetPhi    = Math.max(0.25, Math.min(Math.PI - 0.25, orbit.targetPhi + (e.touches[0].clientY - orbit.lastY) * 0.012))
          orbit.lastX = e.touches[0].clientX; orbit.lastY = e.touches[0].clientY
        } else if (e.touches.length === 2) {
          const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY)
          orbit.targetRadius = Math.max(3, Math.min(25, orbit.targetRadius - (d - lastPinch) * 0.06))
          lastPinch = d
        }
      }, { passive: false })

      // Click to focus
      const raycaster = new THREE.Raycaster()
      const mouse2d   = new THREE.Vector2()
      canvas.addEventListener("click", (e: MouseEvent) => {
        if (orbit.didDrag) return
        const rect = canvas.getBoundingClientRect()
        mouse2d.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1)
        raycaster.setFromCamera(mouse2d, camera)
        const targets: any[] = []
        meshes.forEach((g: any, gi: number) => g.traverse((c: any) => { if (c.isMesh) { c._pi = gi; targets.push(c) } }))
        const hits = raycaster.intersectObjects(targets, false)
        if (hits.length > 0) {
          const idx = hits[0].object._pi
          const nf  = focusedRef.current === idx ? null : idx
          setFocusedPart(nf); setActivePart(nf)
          if (nf !== null) {
            const px = modeRef.current === "exploded" ? PARTS[nf].explodedX : toThree(PARTS[nf].cx)
            orbit.targetLookAt.set(px, 0, 0); orbit.targetRadius = 5
          } else {
            orbit.targetLookAt.set(0, 0, 0); orbit.targetRadius = 14
          }
        } else {
          setFocusedPart(null); setActivePart(null)
          orbit.targetLookAt.set(0, 0, 0); orbit.targetRadius = 14
        }
      })

      // Load parts
      const meshes: any[] = [], curX: number[] = []
      for (let i = 0; i < PARTS.length; i++) {
        if (dead) return
        const p   = PARTS[i]
        const g   = await loadTinkercadGLB(THREE, `/models/${p.file}`, p.color, p.reference)
        const ax  = toThree(p.cx)
        g.position.set(ax, 0, 0)
        scene.add(g); meshes.push(g); curX.push(ax)
        setProgress(Math.round(((i + 1) / PARTS.length) * 100))
      }

      if (dead) return
      stateRef.current = { meshes, curX, orbit, THREE, renderer, scene, camera }
      setReady(true)

      const tick = () => {
        if (dead) return
        raf = requestAnimationFrame(tick)
        const s = stateRef.current, m = modeRef.current, act = activeRef.current, orb = s.orbit

        if (m !== "exploded" && !orb.isDragging && focusedRef.current === null) {
          orb.autoRotY += 0.004; orb.targetTheta = orb.autoRotY
        } else if (!orb.isDragging) { orb.autoRotY = orb.theta }

        orb.theta  += (orb.targetTheta  - orb.theta)  * 0.08
        orb.phi    += (orb.targetPhi    - orb.phi)    * 0.08
        orb.radius += (orb.targetRadius - orb.radius) * 0.08
        orb.currentLookAt.lerp(orb.targetLookAt, 0.08)

        const sp = Math.sin(orb.phi), cp = Math.cos(orb.phi)
        camera.position.set(
          orb.currentLookAt.x + orb.radius * sp * Math.sin(orb.theta),
          orb.currentLookAt.y + orb.radius * cp,
          orb.currentLookAt.z + orb.radius * sp * Math.cos(orb.theta)
        )
        camera.lookAt(orb.currentLookAt)

        s.meshes.forEach((mesh: any, i: number) => {
          const base = m === "exploded" ? PARTS[i].explodedX : toThree(PARTS[i].cx)
          const tx   = act === i ? base + (PARTS[i].reference ? 0 : 0.4) : base
          s.curX[i] += (tx - s.curX[i]) * 0.07
          mesh.position.x = s.curX[i]

          mesh.traverse((c: any) => {
            if (!c.isMesh) return
            c.material.emissive?.setHex(act === i ? 0x0055bb : 0x000000)
            c.material.emissiveIntensity = act === i ? 0.45 : 0
          })
        })

        s.renderer.render(s.scene, s.camera)
      }
      tick()

      const onResize = () => {
        if (!mountRef.current || !stateRef.current) return
        const W2 = mountRef.current.clientWidth
        stateRef.current.renderer.setSize(W2, 500)
        stateRef.current.camera.aspect = W2 / 500
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

  const resetFocus = () => {
    setFocusedPart(null); setActivePart(null)
    if (stateRef.current) { stateRef.current.orbit.targetLookAt.set(0,0,0); stateRef.current.orbit.targetRadius = 14 }
  }

  return (
    <div className="w-full rounded-xl overflow-hidden border border-border bg-[#080c10] relative select-none" style={{ height: 500 }}>
      {!ready && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-[#080c10]">
          <div className="w-48 h-px bg-border mb-4 relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-primary transition-all duration-200" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-muted-foreground font-mono tracking-widest">LOADING {progress}%</p>
          <p className="text-xs text-muted-foreground/40 mt-1">{PARTS[Math.min(Math.floor(progress / (100/PARTS.length)), PARTS.length-1)]?.label}</p>
        </div>
      )}

      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {ready && focusedPart === null && (
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <p className="text-xs text-white/20 tracking-wide whitespace-nowrap">Drag · Scroll to zoom · Click a part</p>
        </div>
      )}

      <div className="absolute top-4 left-4 flex gap-2 z-10">
        {(["assembled","exploded","rotating"] as ViewMode[]).map(m => (
          <button key={m} onClick={() => { setMode(m); resetFocus() }}
            className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-widest transition-all ${
              mode === m ? "bg-primary text-white shadow-lg shadow-primary/30"
                        : "bg-black/70 border border-white/10 text-white/40 hover:border-primary/40 hover:text-white/80"
            }`}>{m}</button>
        ))}
      </div>

      {mode === "exploded" && ready && (
        <div className="absolute top-12 right-3 z-10 flex flex-col gap-0.5 max-h-80 overflow-y-auto">
          {PARTS.map((p, i) => (
            <button key={i}
              onMouseEnter={() => setActivePart(i)}
              onMouseLeave={() => setActivePart(focusedPart)}
              onClick={() => {
                const nf = focusedPart === i ? null : i
                setFocusedPart(nf); setActivePart(nf)
                if (stateRef.current) {
                  stateRef.current.orbit.targetLookAt.set(nf !== null ? PARTS[i].explodedX : 0, 0, 0)
                  stateRef.current.orbit.targetRadius = nf !== null ? 5 : 14
                }
              }}
              className={`text-left px-2.5 py-1 rounded text-xs transition-all whitespace-nowrap flex items-center gap-2 ${
                activePart === i ? "bg-primary/20 text-primary border border-primary/30"
                  : p.reference   ? "text-white/20 italic hover:text-white/35"
                  : "text-white/35 hover:text-white/65"
              }`}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color, opacity: p.reference ? 0.4 : 1 }} />
              {p.label}
              {p.reference && <span className="text-[10px] text-white/20 ml-1">not included</span>}
            </button>
          ))}
        </div>
      )}

      {activePart !== null && (
        <div className="absolute bottom-4 left-4 right-28 pointer-events-none z-10">
          <div className="bg-black/85 border border-primary/20 rounded-lg px-4 py-3 max-w-sm backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-sm font-semibold text-primary">{PARTS[activePart].label}</p>
              {PARTS[activePart].reference && <span className="text-[10px] border border-white/15 text-white/35 px-1.5 py-0.5 rounded">NOT INCLUDED</span>}
            </div>
            <p className="text-xs text-white/55">{PARTS[activePart].description}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function loadScript(src: string): Promise<void> {
  return new Promise((res, rej) => {
    if ((window as any).THREE) { res(); return }
    const el = document.querySelector(`script[src="${src}"]`)
    if (el) { el.addEventListener("load", () => res()); return }
    const s = document.createElement("script"); s.src = src; s.onload = () => res(); s.onerror = rej
    document.head.appendChild(s)
  })
}

async function loadTinkercadGLB(THREE: any, url: string, fallbackColor: string, isReference: boolean): Promise<any> {
  const group = new THREE.Group()
  try {
    const buf  = (await (await fetch(url)).arrayBuffer()).slice(0)
    const dv   = new DataView(buf)
    const jlen = dv.getUint32(12, true)
    const gltf = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 20, jlen)))
    const bin  = buf.slice(20 + jlen + 8)
    const bdv  = new DataView(bin)

    const read = (idx: number) => {
      const acc  = gltf.accessors[idx]
      const bv   = gltf.bufferViews[acc.bufferView]
      const base = (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0)
      const nc   = ({ SCALAR:1, VEC2:2, VEC3:3, VEC4:4 } as any)[acc.type] ?? 1
      const str  = bv.byteStride ?? nc * 4
      if (acc.componentType === 5126) {
        const o = new Float32Array(acc.count * nc)
        for (let i = 0; i < acc.count; i++) for (let c = 0; c < nc; c++) o[i*nc+c] = bdv.getFloat32(base+i*str+c*4,true)
        return o
      }
      const o = new Uint32Array(acc.count)
      if (acc.componentType === 5125) for (let i=0;i<acc.count;i++) o[i]=bdv.getUint32(base+i*4,true)
      else                            for (let i=0;i<acc.count;i++) o[i]=bdv.getUint16(base+i*2,true)
      return o
    }

    for (const mesh of gltf.meshes ?? []) {
      for (const prim of mesh.primitives ?? []) {
        const geo = new THREE.BufferGeometry()

        if (prim.attributes?.POSITION != null) {
          const pos = read(prim.attributes.POSITION) as Float32Array
          // Apply Y/Z swap inline: newY = oldZ, newZ = -oldY
          const swapped = new Float32Array(pos.length)
          for (let i = 0; i < pos.length/3; i++) {
            swapped[i*3]   = pos[i*3]         // X unchanged
            swapped[i*3+1] = pos[i*3+2] - PART_CZ  // Y = oldZ - ZOffset (center on Y=0)
            swapped[i*3+2] = -pos[i*3+1] + PART_CY  // Z = -oldY + YOffset (center on Z=0... wait, flip)
          }
          // Actually center both: subtract the part's Y and Z center after transform
          // newY = oldZ - PART_CZ → centered at 0
          // newZ = -oldY - (-PART_CY) = -oldY + PART_CY → centered at 0
          geo.setAttribute("position", new THREE.BufferAttribute(swapped, 3))
        }

        if (prim.attributes?.COLOR_0 != null) {
          const acc = gltf.accessors[prim.attributes.COLOR_0]
          const raw = read(prim.attributes.COLOR_0) as Float32Array
          const nc2 = acc.type === "VEC4" ? 4 : 3
          if (nc2 === 3) {
            geo.setAttribute("color", new THREE.BufferAttribute(raw, 3))
          } else {
            const rgb = new Float32Array(acc.count*3)
            for (let i=0;i<acc.count;i++){rgb[i*3]=raw[i*4];rgb[i*3+1]=raw[i*4+1];rgb[i*3+2]=raw[i*4+2]}
            geo.setAttribute("color", new THREE.BufferAttribute(rgb, 3))
          }
        }

        if (prim.indices != null)
          geo.setIndex(new THREE.BufferAttribute(new Uint32Array(read(prim.indices)), 1))

        geo.computeVertexNormals()
        // Scale geometry directly
        geo.scale(SCALE, SCALE, SCALE)

        group.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
          color: prim.attributes?.COLOR_0 != null ? 0xffffff : fallbackColor,
          vertexColors: prim.attributes?.COLOR_0 != null,
          metalness: isReference ? 0.1 : 0.4,
          roughness: isReference ? 0.85 : 0.5,
          transparent: isReference, opacity: isReference ? 0.4 : 1.0,
        })))
      }
    }
  } catch(e) {
    console.warn(`Failed: ${url}`, e)
    group.add(new THREE.Mesh(new THREE.BoxGeometry(0.5,0.5,0.3), new THREE.MeshStandardMaterial({ color: fallbackColor })))
  }
  return group
}
