'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

function Box() {
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame(() => {
    meshRef.current.rotation.y += 0.01
    meshRef.current.rotation.x += 0.005
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#4DA3FF" />
    </mesh>
  )
}

export default function TestScene() {
  return (
    <Canvas camera={{ position: [3, 3, 3] }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} />
      <Box />
    </Canvas>
  )
}
