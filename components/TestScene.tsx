'use client'

import { Canvas } from '@react-three/fiber'

function Box() {
  return (
    <mesh rotation={[0.4, 0.2, 0]}>
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
