"use client"

import { useEffect, useRef, useState } from "react"

const PARTS = [
  { file: "tilt_rod__existing_on_customers_blinds_.glb",               label: "Tilt Rod",          description: "Your existing blind tilt rod — TiltForge mounts directly onto this. Not included.",          color: "#778899", reference: true,  assembledX: -2.8, explodedX: -7.5 },
  { file: "tilt_rod_adapter_-_quarter_inch_square.glb",                label: "Tilt Rod Adapter",  description: "Couples TiltForge output to standard ¼\" square tilt rods.",                                color: "#0098ff", reference: false, assembledX: -2.0, explodedX: -5.5 },
  { file: "friction_clutch_stack.glb",                                 label: "Friction Clutch",   description: "Tuned slip clutch — transmits torque, protects against overload, preserves manual control.", color: "#61676a", reference: false, assembledX: -1.2, explodedX: -3.5 },
  { file: "washer_plate.glb",                                          label: "Washer Plate",      description: "Preload bearing surface for the clutch stack.",                                               color: "#a7adb1", reference: false, assembledX: -0.5, explodedX: -1.8 },
  { file: "pin_carrier.glb",                                           label: "Pin Carrier",       description: "Output stage — transfers cycloid motion to the output shaft.",                               color: "#e8edf0", reference: false, assembledX:  0.0, explodedX: -0.3 },
  { file: "3mm_steel_pins.glb",                                        label: "3mm Steel Pins",    description: "Hardened steel drive pins — standard off-the-shelf hardware.",                               color: "#a7adb1", reference: false, assembledX:  0.0, explodedX:  1.0 },
  { file: "fixed_housing_virtual_ring_pins.glb",                       label: "Ring Pin Housing",  description: "Fixed outer ring with virtual pins — reaction element of the cycloid stage.",                color: "#e8edf0", reference: false, assembledX:  0.0, explodedX:  2.4 },
  { file: "cycloid_input_gear.glb",                                    label: "Cycloid Disc",      description: "Hypocycloid profile — delivers smooth, high-ratio gear reduction.",                          color: "#ff7043", reference: false, assembledX:  0.4, explodedX:  3.8 },
  { file: "cam_axle.glb",                                              label: "Cam Axle",          description: "Eccentric cam on motor shaft — drives the cycloid disc in its lobed orbit.",                 color: "#546e7a", reference: false, assembledX:  0.8, explodedX:  5.0 },
  { file: "input_gear_attached_to_axle_as_input_to_cycloid_drive.glb", label: "Input Gear + Axle", description: "Motor-side input — connects motor rotation to cam and cycloid stage.",                       color: "#dde2e4", reference: false, assembledX:  1.4, explodedX:  6.2 },
  { file: "housing_cap.glb",                                           label: "Housing Cap",       description: "Closes the drive housing — 3D-printed, individually replaceable.",                          color: "#e8edf0", reference: false, assembledX:  1.8, explodedX:  7.4 },
  { file: "housing.glb",                                               label: "Housing",           description: "Main structural enclosure — 3D-printed from standard filament.",                            color: "#0098ff", reference: false, assembledX:  0.0, explodedX:  8.6 },
  { file: "IP_one4_Locknut.glb",                                       label: "Lock Nut",          description: "Standard ¼\" lock nut — off-the-shelf, replaceable anywhere.",                              color: "#61676a", reference: false, assembledX:  2.2, explodedX:  9.8 },
]

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

  useEffect(() => { modeRef.current   = mode        }, [mode])
  useEffect(() => { activeRef.current = activePart  }, [activePart])
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
      renderer.shadowMap.enabled = true
      mountRef.current!.appendChild(renderer.domElement)

      const scene  = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(45, W / H, 0.001, 200)
      camera.position.set(0, 2.5, 9)
      camera.lookAt(0, 0, 0)

      // Lights
      scene.add(new THREE.AmbientLight(0xffffff, 0.5))
      const key = new THREE.DirectionalLight(0xffffff, 1.4)
      key.position.set(5, 8, 5); scene.add(key)
      const fill = new THREE.DirectionalLight(0x88aaff, 0.5)
      fill.position.set(-5, 2, -3); scene.add(fill)
      scene.add(Object.assign(new THREE.DirectionalLight(0xffffff, 0.3), { position: { x: 0, y: -5, z: 2 } }))
      const rim = new THREE.DirectionalLight(0x0098ff, 0.4)
      rim.position.set(0, 3, -6); scene.add(rim)

      // ── Orbit state ────────────────────────────────────────────────────────
      const orbit = {
        theta: 0, phi: Math.PI / 3, radius: 9,
        targetTheta: 0, targetPhi: Math.PI / 3, targetRadius: 9,
        isDragging: false, lastX: 0, lastY: 0,
        targetLookAt: new THREE.Vector3(0, 0, 0),
        currentLookAt: new THREE.Vector3(0, 0, 0),
      }

      const canvas = renderer.domElement

      canvas.addEventListener("mousedown", (e: MouseEvent) => {
        orbit.isDragging = true
        orbit.lastX = e.clientX
        orbit.lastY = e.clientY
      })
      window.addEventListener("mouseup", () => { orbit.isDragging = false })
      window.addEventListener("mousemove", (e: MouseEvent) => {
        if (!orbit.isDragging) return
        const dx = e.clientX - orbit.lastX
        const dy = e.clientY - orbit.lastY
        orbit.targetTheta -= dx * 0.01
        orbit.targetPhi    = Math.max(0.2, Math.min(Math.PI - 0.2, orbit.targetPhi + dy * 0.01))
        orbit.lastX = e.clientX
        orbit.lastY = e.clientY
      })
      canvas.addEventListener("wheel", (e: WheelEvent) => {
        e.preventDefault()
        orbit.targetRadius = Math.max(2, Math.min(20, orbit.targetRadius + e.deltaY * 0.01))
      }, { passive: false })

      // Touch support
      let lastTouchDist = 0
      canvas.addEventListener("touchstart", (e: TouchEvent) => {
        if (e.touches.length === 1) {
          orbit.isDragging = true
          orbit.lastX = e.touches[0].clientX
          orbit.lastY = e.touches[0].clientY
        } else if (e.touches.length === 2) {
          lastTouchDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          )
        }
      })
      canvas.addEventListener("touchend", () => { orbit.isDragging = false })
      canvas.addEventListener("touchmove", (e: TouchEvent) => {
        e.preventDefault()
        if (e.touches.length === 1 && orbit.isDragging) {
          const dx = e.touches[0].clientX - orbit.lastX
          const dy = e.touches[0].clientY - orbit.lastY
          orbit.targetTheta -= dx * 0.01
          orbit.targetPhi = Math.max(0.2, Math.min(Math.PI - 0.2, orbit.targetPhi + dy * 0.01))
          orbit.lastX = e.touches[0].clientX
          orbit.lastY = e.touches[0].clientY
        } else if (e.touches.length === 2) {
          const dist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          )
          orbit.targetRadius = Math.max(2, Math.min(20, orbit.targetRadius - (dist - lastTouchDist) * 0.05))
          lastTouchDist = dist
        }
      }, { passive: false })

      // ── Raycaster for click-to-focus ────────────────────────────────────────
      const raycaster = new THREE.Raycaster()
      const mouse2d   = new THREE.Vector2()
      canvas.addEventListener("click", (e: MouseEvent) => {
        if (orbit.isDragging) return
        const rect = canvas.getBoundingClientRect()
        mouse2d.x = ((e.clientX - rect.left) / rect.width)  * 2 - 1
        mouse2d.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1
        raycaster.setFromCamera(mouse2d, camera)
        const hits = raycaster.intersectObjects(meshes.flatMap((g: any) => {
          const c: any[] = []; g.traverse((x: any) => { if (x.isMesh) c.push(x) }); return c
        }), false)
        if (hits.length > 0) {
          // Find which part was clicked
          const clickedMesh = hits[0].object
          const idx = meshes.findIndex((g: any) => {
            let found = false
            g.traverse((x: any) => { if (x === clickedMesh) found = true })
            return found
          })
          if (idx >= 0) {
            const newFocus = focusedRef.current === idx ? null : idx
            setFocusedPart(newFocus)
            setActivePart(newFocus)
            if (newFocus !== null) {
              // Zoom camera toward that part
              const px = PARTS[newFocus][modeRef.current === "exploded" ? "explodedX" : "assembledX"]
              orbit.targetLookAt.set(px, 0, 0)
              orbit.targetRadius = 3.5
            } else {
              orbit.targetLookAt.set(0, 0, 0)
              orbit.targetRadius = 9
            }
          }
        } else {
          // Click empty space = deselect
          setFocusedPart(null)
          setActivePart(null)
          orbit.targetLookAt.set(0, 0, 0)
          orbit.targetRadius = 9
        }
      })

      // ── Load parts ─────────────────────────────────────────────────────────
      const meshes: any[] = [], curX: number[] = []

      for (let i = 0; i < PARTS.length; i++) {
        if (dead) return
        const p = PARTS[i]
        const g = await loadTinkercadGLB(THREE, `/models/${p.file}`, p.color, p.reference)
        g.position.x = p.assembledX
        scene.add(g)
        meshes.push(g)
        curX.push(p.assembledX)
        setProgress(Math.round(((i + 1) / PARTS.length) * 100))
      }

      if (dead) return
      stateRef.current = { meshes, curX, orbit, THREE, renderer, scene, camera, raycaster }
      setReady(true)

      // ── Render loop ────────────────────────────────────────────────────────
      let autoRotY = 0
      const tick = () => {
        if (dead) return
        raf = requestAnimationFrame(tick)
        const s   = stateRef.current
        const m   = modeRef.current
        const act = activeRef.current
        const orb = s.orbit

        // Smooth orbit
        orb.theta  += (orb.targetTheta  - orb.theta)  * 0.08
        orb.phi    += (orb.targetPhi    - orb.phi)    * 0.08
        orb.radius += (orb.targetRadius - orb.radius) * 0.08
        orb.currentLookAt.lerp(orb.targetLookAt, 0.08)

        // Auto-rotate in assembled/rotating mode (pause if user is dragging or part focused)
        if (m !== "exploded" && !orb.isDragging && focusedRef.current === null) {
          autoRotY += 0.004
          orb.targetTheta = autoRotY
        }

        // Update camera from orbit
        const sinPhi = Math.sin(orb.phi)
        camera.position.set(
          orb.currentLookAt.x + orb.radius * sinPhi * Math.sin(orb.theta),
          orb.currentLookAt.y + orb.radius * Math.cos(orb.phi),
          orb.currentLookAt.z + orb.radius * sinPhi * Math.cos(orb.theta)
        )
        camera.lookAt(orb.currentLookAt)

        // Update part positions
        s.meshes.forEach((mesh: any, i: number) => {
          const base = m === "exploded" ? PARTS[i].explodedX : PARTS[i].assembledX
          const tx = (act === i && m !== "rotating") ? base + 0.5 : base
          s.curX[i] += (tx - s.curX[i]) * 0.07
          mesh.position.x = s.curX[i]

          mesh.traverse((c: any) => {
            if (!c.isMesh) return
            if (act === i) {
              c.material.emissive?.setHex(0x0055bb)
              c.material.emissiveIntensity = 0.5
            } else if (PARTS[i].reference) {
              c.material.emissive?.setHex(0x000000)
              c.material.emissiveIntensity = 0
              c.material.opacity = 0.45
              c.material.transparent = true
            } else {
              c.material.emissive?.setHex(0x000000)
              c.material.emissiveIntensity = 0
            }
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
      return () => window.removeEventListener("resize", onResize)
    })()

    return () => {
      dead = true
      cancelAnimationFrame(raf)
      if (stateRef.current?.renderer && mountRef.current) {
        try { mountRef.current.removeChild(stateRef.current.renderer.domElement) } catch {}
        stateRef.current.renderer.dispose()
      }
    }
  }, [])

  const handleModeChange = (m: ViewMode) => {
    setMode(m)
    setFocusedPart(null)
    setActivePart(null)
    if (stateRef.current) {
      stateRef.current.orbit.targetLookAt.set(0, 0, 0)
      stateRef.current.orbit.targetRadius = 9
    }
  }

  return (
    <div className="w-full rounded-xl overflow-hidden border border-border bg-[#080c10] relative select-none" style={{ height: 500 }}>
      {!ready && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-[#080c10]">
          <div className="w-48 h-px bg-border mb-4 relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-primary transition-all duration-200" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-muted-foreground font-mono tracking-widest">LOADING {progress}%</p>
          <p className="text-xs text-muted-foreground/40 mt-1">
            {PARTS[Math.min(Math.floor(progress / (100 / PARTS.length)), PARTS.length - 1)]?.label}
          </p>
        </div>
      )}

      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Controls hint */}
      {ready && !activePart && (
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <p className="text-xs text-white/25 tracking-wide whitespace-nowrap">
            Drag to orbit · Scroll to zoom · Click a part to focus
          </p>
        </div>
      )}

      {/* Mode buttons */}
      <div className="absolute top-4 left-4 flex gap-2 z-10">
        {(["assembled", "exploded", "rotating"] as ViewMode[]).map(m => (
          <button key={m} onClick={() => handleModeChange(m)}
            className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-widest transition-all ${
              mode === m
                ? "bg-primary text-white shadow-lg shadow-primary/30"
                : "bg-black/70 border border-white/10 text-white/40 hover:border-primary/40 hover:text-white/80"
            }`}
          >{m}</button>
        ))}
      </div>

      {/* Part list — exploded mode */}
      {mode === "exploded" && ready && (
        <div className="absolute top-12 right-3 z-10 flex flex-col gap-0.5 max-h-80 overflow-y-auto">
          {PARTS.map((p, i) => (
            <button key={i}
              onMouseEnter={() => setActivePart(i)}
              onMouseLeave={() => setActivePart(focusedPart)}
              onClick={() => {
                const newFocus = focusedPart === i ? null : i
                setFocusedPart(newFocus)
                setActivePart(newFocus)
                if (stateRef.current) {
                  const px = newFocus !== null ? PARTS[i].explodedX : 0
                  stateRef.current.orbit.targetLookAt.set(newFocus !== null ? px : 0, 0, 0)
                  stateRef.current.orbit.targetRadius = newFocus !== null ? 3.5 : 9
                }
              }}
              className={`text-left px-2.5 py-1 rounded text-xs transition-all whitespace-nowrap flex items-center gap-2 ${
                activePart === i
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : p.reference
                    ? "text-white/20 italic hover:text-white/40"
                    : "text-white/35 hover:text-white/65"
              }`}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0 border"
                style={{ background: p.color, borderColor: p.reference ? "#ffffff33" : "transparent", opacity: p.reference ? 0.5 : 1 }}
              />
              {p.label}
              {p.reference && <span className="text-white/20 text-[10px]">not included</span>}
            </button>
          ))}
        </div>
      )}

      {/* Active part tooltip */}
      {activePart !== null && (
        <div className="absolute bottom-4 left-4 right-4 pointer-events-none z-10">
          <div className="bg-black/85 border border-primary/20 rounded-lg px-4 py-3 max-w-sm backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-sm font-semibold text-primary">{PARTS[activePart].label}</p>
              {PARTS[activePart].reference && (
                <span className="text-[10px] border border-white/20 text-white/40 px-1.5 py-0.5 rounded">NOT INCLUDED</span>
              )}
            </div>
            <p className="text-xs text-white/55">{PARTS[activePart].description}</p>
            {focusedPart === activePart && (
              <p className="text-xs text-white/30 mt-1">Click again or click empty space to deselect</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function loadScript(src: string): Promise<void> {
  return new Promise((res, rej) => {
    if ((window as any).THREE) { res(); return }
    const el = document.querySelector(`script[src="${src}"]`)
    if (el) { el.addEventListener("load", () => res()); return }
    const s = document.createElement("script")
    s.src = src; s.onload = () => res(); s.onerror = rej
    document.head.appendChild(s)
  })
}

async function loadTinkercadGLB(THREE: any, url: string, fallbackColor: string, isReference: boolean): Promise<any> {
  const group = new THREE.Group()
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const raw = await res.arrayBuffer()
    const buf = raw.slice(0)
    const dv  = new DataView(buf)

    const jsonLen = dv.getUint32(12, true)
    const jsonStr = new TextDecoder().decode(new Uint8Array(buf, 20, jsonLen))
    const gltf    = JSON.parse(jsonStr)
    const bin     = buf.slice(20 + jsonLen + 8)
    const binDV   = new DataView(bin)

    const readAccessor = (idx: number) => {
      const acc  = gltf.accessors[idx]
      const bv   = gltf.bufferViews[acc.bufferView]
      const base = (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0)
      const typeComponents: Record<string, number> = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }
      const comps = typeComponents[acc.type] ?? 1
      const stride = bv.byteStride ?? comps * 4

      if (acc.componentType === 5126) {
        const out = new Float32Array(acc.count * comps)
        for (let i = 0; i < acc.count; i++)
          for (let c = 0; c < comps; c++)
            out[i * comps + c] = binDV.getFloat32(base + i * stride + c * 4, true)
        return out
      } else if (acc.componentType === 5125) {
        const out = new Uint32Array(acc.count)
        for (let i = 0; i < acc.count; i++)
          out[i] = binDV.getUint32(base + i * 4, true)
        return out
      } else {
        const out = new Uint32Array(acc.count)
        for (let i = 0; i < acc.count; i++)
          out[i] = binDV.getUint16(base + i * 2, true)
        return out
      }
    }

    for (const mesh of gltf.meshes ?? []) {
      for (const prim of mesh.primitives ?? []) {
        const geo = new THREE.BufferGeometry()

        if (prim.attributes?.POSITION !== undefined)
          geo.setAttribute("position", new THREE.BufferAttribute(readAccessor(prim.attributes.POSITION) as Float32Array, 3))

        if (prim.attributes?.COLOR_0 !== undefined) {
          const acc   = gltf.accessors[prim.attributes.COLOR_0]
          const comps = acc.type === "VEC4" ? 4 : 3
          const raw   = readAccessor(prim.attributes.COLOR_0) as Float32Array
          if (comps === 3) {
            geo.setAttribute("color", new THREE.BufferAttribute(raw, 3))
          } else {
            const rgb = new Float32Array(acc.count * 3)
            for (let i = 0; i < acc.count; i++) { rgb[i*3]=raw[i*4]; rgb[i*3+1]=raw[i*4+1]; rgb[i*3+2]=raw[i*4+2] }
            geo.setAttribute("color", new THREE.BufferAttribute(rgb, 3))
          }
        }

        if (prim.indices !== undefined)
          geo.setIndex(new THREE.BufferAttribute(new Uint32Array(readAccessor(prim.indices)), 1))

        geo.computeVertexNormals()

        const mat = new THREE.MeshStandardMaterial({
          color: prim.attributes?.COLOR_0 !== undefined ? 0xffffff : fallbackColor,
          vertexColors: prim.attributes?.COLOR_0 !== undefined,
          metalness: isReference ? 0.1 : 0.35,
          roughness: isReference ? 0.8 : 0.55,
          transparent: isReference,
          opacity: isReference ? 0.45 : 1.0,
        })
        group.add(new THREE.Mesh(geo, mat))
      }
    }

    // Tinkercad coordinate fix
    const rootNode = gltf.nodes?.find((n: any) => Array.isArray(n.matrix))
    if (rootNode?.matrix) {
      const m4 = new THREE.Matrix4(); m4.fromArray(rootNode.matrix); group.applyMatrix4(m4)
    }

    // Scale & center
    const box = new THREE.Box3().setFromObject(group)
    const sz  = new THREE.Vector3(); box.getSize(sz)
    const max = Math.max(sz.x, sz.y, sz.z)
    if (max > 0) group.scale.setScalar(1.5 / max)
    box.setFromObject(group)
    const ctr = new THREE.Vector3(); box.getCenter(ctr); group.position.sub(ctr)

  } catch (e) {
    console.warn(`Failed to load ${url}:`, e)
    const geo = new THREE.BoxGeometry(0.6, 0.6, 0.4)
    group.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: fallbackColor, metalness: 0.3, roughness: 0.6 })))
  }
  return group
}
