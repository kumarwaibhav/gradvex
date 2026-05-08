'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { NetworkMesh3D, type Activations3D } from './NetworkMesh3D'
import type { ModelWeights } from '@/lib/model/types'

interface Props {
  weights: ModelWeights | null
  activations: Activations3D | null
  maxConn?: number
}

function Lights() {
  return (
    <>
      <ambientLight intensity={1.4} />
      <hemisphereLight args={[0xffffff, 0x021616, 1.0]} position={[0, 20, 0]} />
      <directionalLight position={[18, 26, 24]} intensity={1.6} castShadow />
      <directionalLight position={[-20, 18, -18]} color={0xa8c5ff} intensity={0.9} />
      <pointLight position={[0, 12, -24]} color={0x88a4ff} intensity={0.8} distance={60} />
    </>
  )
}

export function Network3DScene({ weights, activations, maxConn = 24 }: Props) {
  return (
    <Canvas
      camera={{ position: [0, 2, 38], fov: 52 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <Lights />
      <Suspense fallback={null}>
        <NetworkMesh3D weights={weights} activations={activations} maxConn={maxConn} />
      </Suspense>
      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        minDistance={10}
        maxDistance={80}
        target={[0, 0, 0]}
        enablePan
        panSpeed={0.8}
        rotateSpeed={0.6}
        zoomSpeed={0.9}
      />
    </Canvas>
  )
}
