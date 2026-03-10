"use client"

import { useEffect, useRef, useState } from "react"

// Colors verified by reading actual GLB binary data
const PARTS = [
  { file: "tilt_rod__existing_on_customers_blinds_.glb",               label: "Tilt Rod",          description: "Your existing blind tilt rod — no replacement needed",                                        color: "#a7adb1", assembledX: -2.8, explodedX: -7.5 },
  { file: "tilt_rod_adapter_-_quarter_inch_square.glb",                label: "Tilt Rod Adapter",  description: "Couples TiltForge output to standard ¼\" square tilt rods",                                 color: "#0098ff", assembledX: -2.0, explodedX: -5.5 },
  { file: "friction_clutch_stack.glb",                                 label: "Friction Clutch",   description: "Tuned slip clutch — transmits torque, protects against overload, preserves manual control", color: "#61676a", assembledX: -1.2, explodedX: -3.5 },
  { file: "washer_plate.glb",                                          label: "Washer Plate",      description: "Preload bearing surface for the clutch stack",                                               color: "#a7adb1", assembledX: -0.5, explodedX: -1.8 },
  { file: "pin_carrier.glb",                                           label: "Pin Carrier",       description: "Output stage — transfers cycloid motion to the output shaft",                               color: "#e8edf0", assembledX:  0.0, explodedX: -0.3 },
  { file: "3mm_steel_pins.glb",                                        label: "3mm Steel Pins",    description: "Hardened steel drive pins — standard off-the-shelf hardware",                               color: "#a7adb1", assembledX:  0.0, explodedX:  1.0 },
  { file: "fixed_housing_virtual_ring_pins.glb",                       label: "Ring Pin Housing",  description: "Fixed outer ring with virtual pins — reaction element of the cycloid stage",                color: "#e8edf0", assembledX:  0.0, explodedX:  2.4 },
  { file: "cycloid_input_gear.glb",                                    label: "Cycloid Disc",      description: "Hypocycloid profile — delivers smooth, high-ratio gear reduction",                          color: "#ff7043", assembledX:  0.4, explodedX:  3.8 },
  { file: "cam_axle.glb",                                              label: "Cam Axle",          description: "Eccentric cam on motor shaft — drives the cycloid disc in its lobed orbit",                 color: "#546e7a", assembledX:  0.8, explodedX:  5.0 },
  { file: "input_gear_attached_to_axle_as_input_to_cycloid_drive.glb", label: "Input Gear + Axle", description: "Motor-side input — connects motor rotation to cam and cycloid stage",                       color: "#dde2e4", assembledX:  1.4, explodedX:  6.2 },
  { file: "housing_cap.glb",                                           label: "Housing Cap",       description: "Closes the drive housing — 3D-printed, individually replaceable",                          color: "#e8edf0", assembledX:  1.8, explodedX:  7.4 },
  { file: "housing.glb",                                               label: "Housing",           description: "Main structural enclosure — 3D-printed from standard filament",                            color: "#0098ff", assembledX:  0.0, explodedX:  8.6 },
  { file: "IP_one4_Locknut.glb",                                       label: "Lock Nut",          description: "Standard ¼\" lock nut — off-the-shelf, replaceable anywhere",                              color: "#61676a", assembledX:  2.2, explodedX:  9.8 },
]

type ViewMode = "assembled" | "exploded" | "rotating"

export default function ModelViewer() {
  const mountRef  = useRef<HTMLDivElement>(null)
  const stateRef  = useRef<any>(null)
  const modeRef   = useRef<ViewMode>("assembled")
  const activeRef = useRef<number | null>(null)

  const [mode,       setMode]       = useState<ViewMode>("assembled")
  const [activePart, setActivePart] = useState<number | null>(null)
  const [progress,   setProgress]   = useState(0)
  const [ready,      setReady]      = useState(false)

  useEffect(() => { modeRef.current   = mode        }, [mode])
  useEffect(() => { activeRef.current = activePart  }, [activePart])

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

      // Rich lighting setup to make geometry visible
      scene.add(new THREE.AmbientLight(0xffffff, 0.5))
      const key = new THREE.DirectionalLight(0xffffff, 1.4)
      key.position.set(5, 8, 5)
      scene.add(key)
      const fill = new THREE.DirectionalLight(0x88aaff, 0.5)
      fill.position.set(-5, 2, -3)
      scene.add(fill)
      const bottom = new THREE.DirectionalLight(0xffffff, 0.3)
      bottom.position.set(0, -5, 2)
      scene.add(bottom)
      const rim = new THREE.DirectionalLight(0x0098ff, 0.4)
      rim.position.set(0, 3, -6)
      scene.add(rim)

      const meshes: any[] = [], curX: number[] = []

      for (let i = 0; i < PARTS.length; i++) {
        if (dead) return
        const p = PARTS[i]
        const g = await loadTinkercadGLB(THREE, `/models/${p.file}`, p.color)
        g.position.x = p.assembledX
        scene.add(g)
        meshes.push(g)
        curX.push(p.assembledX)
        setProgress(Math.round(((i + 1) / PARTS.length) * 100))
      }

      if (dead) return
      stateRef.current = { meshes, curX, rotY: 0, THREE, renderer, scene, camera }
      setReady(true)

      const tick = () => {
        if (dead) return
        raf = requestAnimationFrame(tick)
        const s   = stateRef.current
        const m   = modeRef.current
        const act = activeRef.current

        s.meshes.forEach((mesh: any, i: number) => {
          const tx = m === "exploded"
            ? PARTS[i].explodedX
            : (m === "assembled" && act === i)
              ? PARTS[i].assembledX + 0.6
              : PARTS[i].assembledX

          s.curX[i] += (tx - s.curX[i]) * 0.07
          mesh.position.x = s.curX[i]

          mesh.traverse((c: any) => {
            if (!c.isMesh) return
            c.material.emissive?.setHex(act === i ? 0x0055bb : 0x000000)
            c.material.emissiveIntensity = act === i ? 0.5 : 0
          })
        })

        if (m !== "exploded") {
          s.rotY += 0.004
          s.scene.rotation.y = s.rotY
        } else {
          s.scene.rotation.y += (-0.3 - s.scene.rotation.y) * 0.04
        }

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

  return (
    <div className="w-full rounded-xl overflow-hidden border border-border bg-[#080c10] relative" style={{ height: 500 }}>
      {!ready && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-[#080c10]">
          <div className="w-48 h-px bg-border mb-4 relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-primary transition-all duration-200" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-muted-foreground font-mono tracking-widest">LOADING {progress}%</p>
          <p className="text-xs text-muted-foreground/50 mt-1">{PARTS[Math.min(Math.floor(progress / (100/PARTS.length)), PARTS.length-1)]?.label}</p>
        </div>
      )}

      <div ref={mountRef} className="w-full h-full" />

      <div className="absolute top-4 left-4 flex gap-2 z-10">
        {(["assembled","exploded","rotating"] as ViewMode[]).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-widest transition-all ${
              mode === m
                ? "bg-primary text-white shadow-lg shadow-primary/30"
                : "bg-black/70 border border-white/10 text-white/40 hover:border-primary/40 hover:text-white/80"
            }`}
          >{m}</button>
        ))}
      </div>

      {mode === "exploded" && ready && (
        <div className="absolute top-12 right-3 z-10 flex flex-col gap-0.5 max-h-80 overflow-y-auto">
          {PARTS.map((p, i) => (
            <button key={i}
              onMouseEnter={() => setActivePart(i)}
              onMouseLeave={() => setActivePart(null)}
              className={`text-left px-2.5 py-1 rounded text-xs transition-all whitespace-nowrap flex items-center gap-2 ${
                activePart === i ? "bg-primary/20 text-primary border border-primary/30" : "text-white/35 hover:text-white/65"
              }`}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
              {p.label}
            </button>
          ))}
        </div>
      )}

      {activePart !== null && (
        <div className="absolute bottom-4 left-4 right-4 pointer-events-none z-10">
          <div className="bg-black/85 border border-primary/20 rounded-lg px-4 py-3 max-w-sm backdrop-blur-sm">
            <p className="text-sm font-semibold text-primary">{PARTS[activePart].label}</p>
            <p className="text-xs text-white/55 mt-0.5">{PARTS[activePart].description}</p>
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
    const s = document.createElement("script")
    s.src = src; s.onload = () => res(); s.onerror = rej
    document.head.appendChild(s)
  })
}

async function loadTinkercadGLB(THREE: any, url: string, fallbackColor: string): Promise<any> {
  const group = new THREE.Group()
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    // Copy to a plain ArrayBuffer to avoid alignment issues
    const raw = await res.arrayBuffer()
    const buf = raw.slice(0)

    const dv      = new DataView(buf)
    const jsonLen = dv.getUint32(12, true)
    const jsonStr = new TextDecoder().decode(new Uint8Array(buf, 20, jsonLen))
    const gltf    = JSON.parse(jsonStr)

    // Binary chunk: header is at byte 20+jsonLen, data starts 8 bytes after
    const binOffset = 20 + jsonLen + 8
    // Copy bin into its own buffer for clean alignment
    const bin = buf.slice(binOffset)

    const readAccessor = (idx: number) => {
      const acc = gltf.accessors[idx]
      const bv  = gltf.bufferViews[acc.bufferView]
      const byteOffset = (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0)
      const typeComponents: Record<string, number> = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }
      const n = acc.count * (typeComponents[acc.type] ?? 1)

      // Always copy into new typed array — avoids alignment/stride issues
      const out = new ArrayBuffer(n * 4)
      const outView = new DataView(out)
      const stride = bv.byteStride ?? (typeComponents[acc.type] ?? 1) * 4

      if (acc.componentType === 5126) { // float32
        for (let i = 0; i < acc.count; i++) {
          const comps = typeComponents[acc.type] ?? 1
          for (let c = 0; c < comps; c++) {
            const srcByte = byteOffset + i * stride + c * 4
            outView.setFloat32((i * comps + c) * 4, new DataView(bin).getFloat32(srcByte, true), true)
          }
        }
        return new Float32Array(out)
      } else if (acc.componentType === 5125) { // uint32
        for (let i = 0; i < acc.count; i++) {
          const srcByte = byteOffset + i * 4
          outView.setUint32(i * 4, new DataView(bin).getUint32(srcByte, true), true)
        }
        return new Uint32Array(out)
      } else if (acc.componentType === 5123) { // uint16
        const out16 = new ArrayBuffer(acc.count * 2)
        const outView16 = new DataView(out16)
        for (let i = 0; i < acc.count; i++) {
          const srcByte = byteOffset + i * 2
          outView16.setUint16(i * 2, new DataView(bin).getUint16(srcByte, true), true)
        }
        return new Uint16Array(out16)
      }
      return new Float32Array(0)
    }

    for (const mesh of gltf.meshes ?? []) {
      for (const prim of mesh.primitives ?? []) {
        const geo = new THREE.BufferGeometry()

        // POSITION
        if (prim.attributes?.POSITION !== undefined) {
          const arr = readAccessor(prim.attributes.POSITION) as Float32Array
          geo.setAttribute("position", new THREE.BufferAttribute(arr, 3))
        }

        // COLOR_0 — use vertex colors if present
        if (prim.attributes?.COLOR_0 !== undefined) {
          const acc = gltf.accessors[prim.attributes.COLOR_0]
          const components = acc.type === "VEC4" ? 4 : 3
          const arr = readAccessor(prim.attributes.COLOR_0) as Float32Array
          if (components === 3) {
            geo.setAttribute("color", new THREE.BufferAttribute(arr, 3))
          } else {
            // Strip alpha channel
            const rgb = new Float32Array(acc.count * 3)
            for (let i = 0; i < acc.count; i++) {
              rgb[i*3]   = arr[i*4]
              rgb[i*3+1] = arr[i*4+1]
              rgb[i*3+2] = arr[i*4+2]
            }
            geo.setAttribute("color", new THREE.BufferAttribute(rgb, 3))
          }
        }

        // Indices
        if (prim.indices !== undefined) {
          const arr = readAccessor(prim.indices)
          geo.setIndex(new THREE.BufferAttribute(new Uint32Array(arr), 1))
        }

        geo.computeVertexNormals()

        const hasVertexColors = prim.attributes?.COLOR_0 !== undefined
        const mat = new THREE.MeshStandardMaterial({
          color: hasVertexColors ? 0xffffff : fallbackColor,
          vertexColors: hasVertexColors,
          metalness: 0.35,
          roughness: 0.55,
        })

        group.add(new THREE.Mesh(geo, mat))
      }
    }

    // Apply Tinkercad root coordinate transform
    const rootNode = gltf.nodes?.find((n: any) => Array.isArray(n.matrix))
    if (rootNode?.matrix) {
      const m4 = new THREE.Matrix4()
      m4.fromArray(rootNode.matrix)
      group.applyMatrix4(m4)
    }

    // Scale to ~1.5 units max dimension
    const box = new THREE.Box3().setFromObject(group)
    const sz  = new THREE.Vector3(); box.getSize(sz)
    const max = Math.max(sz.x, sz.y, sz.z)
    if (max > 0) group.scale.setScalar(1.5 / max)

    // Re-center
    box.setFromObject(group)
    const ctr = new THREE.Vector3(); box.getCenter(ctr)
    group.position.sub(ctr)

  } catch (e) {
    console.warn(`Failed to load ${url}:`, e)
    const geo = new THREE.BoxGeometry(0.6, 0.6, 0.4)
    const mat = new THREE.MeshStandardMaterial({ color: fallbackColor, metalness: 0.3, roughness: 0.6 })
    group.add(new THREE.Mesh(geo, mat))
  }
  return group
}
