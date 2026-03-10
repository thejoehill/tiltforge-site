"use client"

import { useEffect, useRef, useState } from "react"

// Assembly order along the X axis (left to right, matching exploded view)
// Positions are in Three.js units — will be auto-scaled to fit bounding boxes
const PARTS = [
  {
    file: "tilt_rod__existing_on_customers_blinds_.glb",
    label: "Tilt Rod",
    description: "Your existing blind tilt rod — no replacement needed",
    assembledX: -3.2,
    explodedX: -7.0,
    color: "#aaaaaa",
  },
  {
    file: "tilt_rod_adapter_-_quarter_inch_square.glb",
    label: "Tilt Rod Adapter",
    description: "Couples TiltForge output to standard ¼\" square tilt rods",
    assembledX: -2.4,
    explodedX: -5.5,
    color: "#0098ff",
  },
  {
    file: "friction_clutch_stack.glb",
    label: "Friction Clutch",
    description: "Tuned slip clutch — transmits torque, protects against overload, preserves manual control",
    assembledX: -1.4,
    explodedX: -3.8,
    color: "#ff6b35",
  },
  {
    file: "washer_plate.glb",
    label: "Washer Plate",
    description: "Preload bearing surface for clutch stack",
    assembledX: -0.6,
    explodedX: -2.2,
    color: "#888888",
  },
  {
    file: "pin_carrier.glb",
    label: "Pin Carrier",
    description: "Output stage — transfers cycloid motion to the output shaft",
    assembledX: 0.0,
    explodedX: -0.8,
    color: "#ff9500",
  },
  {
    file: "3mm_steel_pins.glb",
    label: "3mm Steel Pins",
    description: "Hardened steel drive pins — standard off-the-shelf hardware",
    assembledX: 0.0,
    explodedX: 0.4,
    color: "#cccccc",
  },
  {
    file: "fixed_housing_virtual_ring_pins.glb",
    label: "Ring Pin Housing",
    description: "Fixed outer ring with virtual pins — the reaction element of the cycloid stage",
    assembledX: 0.0,
    explodedX: 1.8,
    color: "#ff6b8a",
  },
  {
    file: "cycloid_input_gear.glb",
    label: "Cycloid Disc",
    description: "The heart of the drive — a hypocycloid profile that delivers smooth, high-ratio reduction",
    assembledX: 0.2,
    explodedX: 3.2,
    color: "#ff9500",
  },
  {
    file: "cam_axle.glb",
    label: "Cam Axle",
    description: "Eccentric cam on motor shaft — drives the cycloid disc in its lobed orbit",
    assembledX: 0.6,
    explodedX: 4.6,
    color: "#aaaaaa",
  },
  {
    file: "input_gear_attached_to_axle_as_input_to_cycloid_drive.glb",
    label: "Input Gear + Axle",
    description: "Motor-side input — connects motor rotation to the cam and cycloid stage",
    assembledX: 1.2,
    explodedX: 5.8,
    color: "#0098ff",
  },
  {
    file: "housing_cap.glb",
    label: "Housing Cap",
    description: "Closes the drive housing — 3D-printed, replaceable",
    assembledX: 1.8,
    explodedX: 7.0,
    color: "#334455",
  },
  {
    file: "housing.glb",
    label: "Housing",
    description: "Main structural enclosure — 3D-printed from standard filament",
    assembledX: 0.0,
    explodedX: 8.4,
    color: "#1a2a3a",
  },
  {
    file: "IP_one4_Locknut.glb",
    label: "Lock Nut",
    description: "Standard ¼\" lock nut — off-the-shelf, replaceable anywhere",
    assembledX: 2.4,
    explodedX: 9.6,
    color: "#888888",
  },
]

type ViewMode = "assembled" | "exploded" | "rotating"

export default function ModelViewer() {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<any>(null)
  const [mode, setMode] = useState<ViewMode>("assembled")
  const [activePart, setActivePart] = useState<number | null>(null)
  const [loadProgress, setLoadProgress] = useState(0)
  const [ready, setReady] = useState(false)
  const modeRef = useRef<ViewMode>("assembled")
  const activeRef = useRef<number | null>(null)

  useEffect(() => { modeRef.current = mode }, [mode])
  useEffect(() => { activeRef.current = activePart }, [activePart])

  useEffect(() => {
    if (!mountRef.current) return

    let THREE: any, GLTFLoader: any, OrbitControls: any
    let renderer: any, scene: any, camera: any, animFrameId: number
    let partMeshes: any[] = []
    let currentPositions: number[] = []
    let targetPositions: number[] = []
    let loadedCount = 0
    let destroyed = false

    const initThree = async () => {
      // Load Three.js from CDN
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js")

      THREE = (window as any).THREE

      // GLTFLoader inline (r128 compatible)
      const loaderScript = document.createElement("script")
      loaderScript.text = `
        (function() {
          if (THREE.GLTFLoader) return;
          // Minimal GLTFLoader stub using fetch + ObjectURL
          THREE.GLTFLoader = class {
            load(url, onLoad, onProgress, onError) {
              fetch(url)
                .then(r => r.arrayBuffer())
                .then(buf => {
                  const loader = new THREE.ObjectLoader();
                  // Parse GLB binary
                  const view = new DataView(buf);
                  const jsonLen = view.getUint32(12, true);
                  const jsonStr = new TextDecoder().decode(new Uint8Array(buf, 20, jsonLen));
                  const json = JSON.parse(jsonStr);
                  
                  // Get binary chunk
                  const binOffset = 20 + jsonLen + 8;
                  const binBuf = buf.slice(binOffset);
                  
                  onLoad({ scene: new THREE.Group(), json, binBuf });
                })
                .catch(onError);
            }
          };
        })();
      `
      document.head.appendChild(loaderScript)

      // Setup renderer
      const W = mountRef.current!.clientWidth
      const H = mountRef.current!.clientHeight || 500

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(W, H)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.outputEncoding = 3001 // sRGBEncoding
      renderer.shadowMap.enabled = true
      mountRef.current!.appendChild(renderer.domElement)

      scene = new THREE.Scene()
      camera = new THREE.PerspectiveCamera(45, W / H, 0.01, 100)
      camera.position.set(0, 3, 10)
      camera.lookAt(0, 0, 0)

      // Lighting
      const ambient = new THREE.AmbientLight(0xffffff, 0.6)
      scene.add(ambient)
      const key = new THREE.DirectionalLight(0xffffff, 1.2)
      key.position.set(5, 8, 5)
      key.castShadow = true
      scene.add(key)
      const fill = new THREE.DirectionalLight(0x0098ff, 0.3)
      fill.position.set(-5, -2, -3)
      scene.add(fill)
      const rim = new THREE.DirectionalLight(0xffffff, 0.4)
      rim.position.set(0, -5, -5)
      scene.add(rim)

      sceneRef.current = { THREE, renderer, scene, camera, partMeshes, currentPositions, targetPositions }

      // Load parts using fetch + GLB parser
      await loadAllParts(THREE, scene)
      if (destroyed) return

      setReady(true)
      animate()
    }

    const loadScript = (src: string) =>
      new Promise<void>((res, rej) => {
        if (document.querySelector(`script[src="${src}"]`)) { res(); return }
        const s = document.createElement("script")
        s.src = src
        s.onload = () => res()
        s.onerror = rej
        document.head.appendChild(s)
      })

    const loadAllParts = async (THREE: any, scene: any) => {
      const total = PARTS.length
      
      for (let i = 0; i < PARTS.length; i++) {
        if (destroyed) break
        const part = PARTS[i]
        
        try {
          const res = await fetch(`/models/${part.file}`)
          const buf = await res.arrayBuffer()
          const mesh = parseGLBToMesh(THREE, buf, part.color)
          
          // Scale and position
          const box = new THREE.Box3().setFromObject(mesh)
          const size = new THREE.Vector3()
          box.getSize(size)
          const maxDim = Math.max(size.x, size.y, size.z)
          if (maxDim > 0) {
            const scale = 1.5 / maxDim
            mesh.scale.setScalar(scale)
          }

          mesh.position.x = part.assembledX
          mesh.userData = { index: i, part }
          scene.add(mesh)
          partMeshes.push(mesh)
          currentPositions.push(part.assembledX)
          targetPositions.push(part.assembledX)
          
          loadedCount++
          setLoadProgress(Math.round((loadedCount / total) * 100))
        } catch (e) {
          console.warn(`Failed to load ${part.file}:`, e)
          // Add placeholder box
          const geo = new THREE.BoxGeometry(0.8, 0.8, 0.8)
          const mat = new THREE.MeshStandardMaterial({ color: part.color, metalness: 0.3, roughness: 0.6 })
          const mesh = new THREE.Mesh(geo, mat)
          mesh.position.x = part.assembledX
          mesh.userData = { index: i, part }
          scene.add(mesh)
          partMeshes.push(mesh)
          currentPositions.push(part.assembledX)
          targetPositions.push(part.assembledX)
          
          loadedCount++
          setLoadProgress(Math.round((loadedCount / total) * 100))
        }
      }
    }

    const parseGLBToMesh = (THREE: any, buf: ArrayBuffer, fallbackColor: string) => {
      const group = new THREE.Group()
      
      try {
        const view = new DataView(buf)
        const jsonLen = view.getUint32(12, true)
        const jsonStr = new TextDecoder().decode(new Uint8Array(buf, 20, jsonLen))
        const gltf = JSON.parse(jsonStr)

        const binStart = 20 + jsonLen + 8
        const binBuf = buf.slice(binStart)

        const getBuffer = (accessorIdx: number) => {
          const acc = gltf.accessors[accessorIdx]
          const bv = gltf.bufferViews[acc.bufferView]
          const offset = (bv.byteOffset || 0) + (acc.byteOffset || 0)
          const count = acc.count
          
          const typeMap: Record<string, number> = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 }
          const compCount = typeMap[acc.type] || 1
          
          if (acc.componentType === 5126) return new Float32Array(binBuf, offset, count * compCount)
          if (acc.componentType === 5123) return new Uint16Array(binBuf, offset, count * compCount)
          if (acc.componentType === 5125) return new Uint32Array(binBuf, offset, count * compCount)
          return new Float32Array(binBuf, offset, count * compCount)
        }

        for (const mesh of gltf.meshes || []) {
          for (const prim of mesh.primitives || []) {
            const geo = new THREE.BufferGeometry()
            
            if (prim.attributes.POSITION !== undefined) {
              const pos = getBuffer(prim.attributes.POSITION)
              geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pos), 3))
            }
            if (prim.attributes.NORMAL !== undefined) {
              const norm = getBuffer(prim.attributes.NORMAL)
              geo.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(norm), 3))
            }
            if (prim.indices !== undefined) {
              const idx = getBuffer(prim.indices)
              geo.setIndex(new THREE.BufferAttribute(new Uint32Array(idx), 1))
            }
            if (!prim.attributes.NORMAL) geo.computeVertexNormals()

            // Get material color from GLTF
            let color = fallbackColor
            if (prim.material !== undefined && gltf.materials?.[prim.material]) {
              const mat = gltf.materials[prim.material]
              const pbr = mat.pbrMetallicRoughness
              if (pbr?.baseColorFactor) {
                const [r, g, b] = pbr.baseColorFactor
                color = `rgb(${Math.round(r*255)},${Math.round(g*255)},${Math.round(b*255)})`
              }
            }

            const material = new THREE.MeshStandardMaterial({
              color,
              metalness: 0.4,
              roughness: 0.5,
            })
            const mesh3 = new THREE.Mesh(geo, material)
            group.add(mesh3)
          }
        }
      } catch (e) {
        console.warn("GLB parse error, using box:", e)
        const geo = new THREE.BoxGeometry(1, 1, 1)
        const mat = new THREE.MeshStandardMaterial({ color: fallbackColor, metalness: 0.3, roughness: 0.6 })
        group.add(new THREE.Mesh(geo, mat))
      }

      return group
    }

    let rotAngle = 0
    const animate = () => {
      if (destroyed) return
      animFrameId = requestAnimationFrame(animate)

      const m = modeRef.current
      const active = activeRef.current

      // Update target positions based on mode
      partMeshes.forEach((mesh, i) => {
        const part = PARTS[i]
        let tx = part.assembledX

        if (m === "exploded") {
          tx = part.explodedX
        } else if (m === "assembled") {
          tx = part.assembledX
          // Highlight active part
          if (active === i) tx += 0.4
        }

        // Smooth lerp
        currentPositions[i] += (tx - currentPositions[i]) * 0.08
        mesh.position.x = currentPositions[i]

        // Highlight active
        if (mesh.children) {
          mesh.traverse((child: any) => {
            if (child.isMesh) {
              child.material.emissive?.set(active === i ? 0x0098ff : 0x000000)
              child.material.emissiveIntensity = active === i ? 0.3 : 0
            }
          })
        }
      })

      // Slow rotation in assembled/rotating mode
      if (m === "rotating" || m === "assembled") {
        rotAngle += 0.005
        scene.rotation.y = rotAngle
      }

      renderer.render(scene, camera)
    }

    initThree().catch(console.error)

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return
      const W = mountRef.current.clientWidth
      const H = mountRef.current.clientHeight || 500
      renderer.setSize(W, H)
      camera.aspect = W / H
      camera.updateProjectionMatrix()
    }
    window.addEventListener("resize", handleResize)

    return () => {
      destroyed = true
      cancelAnimationFrame(animFrameId)
      window.removeEventListener("resize", handleResize)
      if (renderer && mountRef.current) {
        mountRef.current.removeChild(renderer.domElement)
        renderer.dispose()
      }
    }
  }, [])

  return (
    <div className="w-full rounded-lg overflow-hidden border border-border bg-background relative" style={{ height: 520 }}>
      {/* Loading overlay */}
      {!ready && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-background/90">
          <div className="w-48 h-1 bg-border rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">Loading model... {loadProgress}%</p>
        </div>
      )}

      {/* Three.js mount */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Mode controls */}
      <div className="absolute top-4 left-4 flex gap-2 z-10">
        {(["assembled", "exploded", "rotating"] as ViewMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
              mode === m
                ? "bg-primary text-white"
                : "bg-background/80 border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Part label on hover */}
      {activePart !== null && (
        <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none">
          <div className="bg-background/90 border border-primary/30 rounded-lg px-4 py-3 max-w-sm">
            <p className="text-sm font-semibold text-primary">{PARTS[activePart].label}</p>
            <p className="text-xs text-muted-foreground mt-1">{PARTS[activePart].description}</p>
          </div>
        </div>
      )}

      {/* Part list — exploded mode only */}
      {mode === "exploded" && ready && (
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-1 max-h-96 overflow-y-auto">
          {PARTS.map((p, i) => (
            <button
              key={i}
              onMouseEnter={() => setActivePart(i)}
              onMouseLeave={() => setActivePart(null)}
              className={`text-left px-2 py-1 rounded text-xs transition-all ${
                activePart === i
                  ? "bg-primary/20 text-primary border border-primary/40"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
