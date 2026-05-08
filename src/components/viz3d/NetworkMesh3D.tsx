'use client'

import { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import type { ModelWeights } from '@/lib/model/types'

// ── Layout constants ──────────────────────────────────────────────────────────
const LAYER_X = [-13.5, -4.5, 4.5, 13.5]
const INPUT_SPACING = 0.225
const HIDDEN1_SPACING = 0.275
const HIDDEN2_SPACING = 0.32
const OUTPUT_SPACING = 1.2
const PIXEL_W = 0.17
const PIXEL_MAX_DEPTH = 0.55
const NODE_RADIUS_HIDDEN = 0.16
const NODE_RADIUS_OUTPUT = 0.28
const DEFAULT_MAX_CONN = 24

// ── Colours ───────────────────────────────────────────────────────────────────

const DARK_TEAL   = new THREE.Color(0x071818)
const LIME_BRIGHT = new THREE.Color(0xcaff87)
const CYAN_BRIGHT = new THREE.Color(0x9bfffe)
const LIME_EDGE   = new THREE.Color(0x4ade80)   // positive weight = green
const CORAL_EDGE  = new THREE.Color(0xf87171)   // negative weight = red
const MID_GREY    = new THREE.Color(0x2a3a39)
const PIX_DARK    = new THREE.Color(0x091515)
const PIX_BRIGHT  = new THREE.Color(0xffffff)

function hiddenActivationColor(v: number): THREE.Color {
  return DARK_TEAL.clone().lerp(CYAN_BRIGHT, Math.max(0, Math.min(1, v)))
}
function outputActivationColor(v: number): THREE.Color {
  return DARK_TEAL.clone().lerp(LIME_BRIGHT, Math.max(0, Math.min(1, v)))
}
function pixelColor(v: number): THREE.Color {
  const t = Math.max(0, Math.min(1, v))
  return PIX_DARK.clone().lerp(PIX_BRIGHT, t * t)
}
function weightColor(w: number, maxMag: number): THREE.Color {
  const t = Math.min(Math.abs(w) / (maxMag + 1e-6), 1)
  return w >= 0 ? MID_GREY.clone().lerp(LIME_EDGE, t) : MID_GREY.clone().lerp(CORAL_EDGE, t)
}

// ── Input positions ───────────────────────────────────────────────────────────

function inputBasePositions(): THREE.Vector3[] {
  const pos: THREE.Vector3[] = []
  const offset = (27 * INPUT_SPACING) / 2
  for (let r = 0; r < 28; r++) {
    for (let c = 0; c < 28; c++) {
      pos.push(new THREE.Vector3(LAYER_X[0], offset - r * INPUT_SPACING, offset - c * INPUT_SPACING))
    }
  }
  return pos
}

function columnPositions(count: number, x: number, spacing: number): THREE.Vector3[] {
  const offset = ((count - 1) * spacing) / 2
  return Array.from({ length: count }, (_, i) =>
    new THREE.Vector3(x, offset - i * spacing, 0)
  )
}

// ── Connections: sort by |weight| * activation so lines come from drawn digit ─

interface ConnPair { a: THREE.Vector3; b: THREE.Vector3; w: number }

function topConnections(
  fromPos: THREE.Vector3[],
  toPos: THREE.Vector3[],
  // weights stored as weights[fromIdx][toIdx]  e.g. W1 is [784][128]
  weights: number[][],
  maxConn: number,
  fromActivations?: number[] | null,
): ConnPair[] {
  const pairs: ConnPair[] = []
  const hasActivations = fromActivations != null && fromActivations.some(v => v > 0.05)
  // fromPos.length == weights.length (e.g. 784 for W1)
  const nFrom = Math.min(fromPos.length, weights.length)

  for (let ti = 0; ti < toPos.length; ti++) {
    const indices = Array.from({ length: nFrom }, (_, i) => i)

    // Correct access: weights[fi][ti]  (column ti, all rows)
    if (hasActivations) {
      // Rank by |W[fi][ti]| × activation[fi] — lines come from where digit is drawn
      indices.sort((a, b) =>
        Math.abs((weights[b]?.[ti]) ?? 0) * (fromActivations![b] ?? 0) -
        Math.abs((weights[a]?.[ti]) ?? 0) * (fromActivations![a] ?? 0)
      )
      const top = indices.filter(fi => (fromActivations![fi] ?? 0) > 0.05).slice(0, maxConn)
      for (const fi of top) pairs.push({ a: fromPos[fi], b: toPos[ti], w: (weights[fi]?.[ti]) ?? 0 })
    } else {
      // No digit: show strongest weight connections across all from-nodes
      indices.sort((a, b) =>
        Math.abs((weights[b]?.[ti]) ?? 0) - Math.abs((weights[a]?.[ti]) ?? 0)
      )
      for (const fi of indices.slice(0, maxConn)) {
        pairs.push({ a: fromPos[fi], b: toPos[ti], w: (weights[fi]?.[ti]) ?? 0 })
      }
    }
  }
  return pairs
}

// ── Input pixel voxels ────────────────────────────────────────────────────────

function PixelVoxels({ activations }: { activations: number[] | null }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const geo = useMemo(() => new THREE.BoxGeometry(1, PIXEL_W * 0.92, PIXEL_W * 0.92), [])
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ toneMapped: false }), [])
  const basePos = useMemo(() => inputBasePositions(), [])
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useEffect(() => {
    if (!meshRef.current) return
    const col = new THREE.Color()
    for (let i = 0; i < 784; i++) {
      const v = activations ? Math.max(0, activations[i] ?? 0) : 0
      const depth = Math.max(0.03, v * PIXEL_MAX_DEPTH)
      dummy.position.set(basePos[i].x + depth / 2, basePos[i].y, basePos[i].z)
      dummy.scale.set(depth, 1, 1)
      dummy.rotation.set(0, 0, 0)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
      col.copy(pixelColor(v))
      meshRef.current.setColorAt(i, col)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
  }, [activations, basePos, dummy])

  return <instancedMesh ref={meshRef} args={[geo, mat, 784]} />
}

// ── Sphere node layer ─────────────────────────────────────────────────────────

interface NodeLayerProps {
  positions: THREE.Vector3[]
  radius: number
  activations: number[] | null
  isOutput?: boolean
  segments?: number
}

function NodeLayer({ positions, radius, activations, isOutput = false, segments = 8 }: NodeLayerProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const geo = useMemo(() => new THREE.SphereGeometry(radius, segments, segments), [radius, segments])
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ toneMapped: false }), [])
  const count = positions.length
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useEffect(() => {
    if (!meshRef.current) return
    positions.forEach((pos, i) => {
      dummy.position.copy(pos)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [positions, dummy])

  useEffect(() => {
    if (!meshRef.current) return
    const col = new THREE.Color()
    for (let i = 0; i < count; i++) {
      const v = activations ? (activations[i] ?? 0) : 0
      col.copy(isOutput ? outputActivationColor(v) : hiddenActivationColor(v))
      meshRef.current.setColorAt(i, col)
    }
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
  }, [activations, count, isOutput])

  return <instancedMesh ref={meshRef} args={[geo, mat, count]} />
}

// ── Connection lines ──────────────────────────────────────────────────────────

interface ConnectionLinesProps { pairs: ConnPair[]; maxMag: number; opacity?: number }

function ConnectionLines({ pairs, maxMag, opacity = 0.55 }: ConnectionLinesProps) {
  const [geo, mat] = useMemo(() => {
    const positions = new Float32Array(pairs.length * 6)
    const colors = new Float32Array(pairs.length * 6)
    const col = new THREE.Color()
    pairs.forEach((pair, i) => {
      const b = i * 6
      positions[b]     = pair.a.x; positions[b + 1] = pair.a.y; positions[b + 2] = pair.a.z
      positions[b + 3] = pair.b.x; positions[b + 4] = pair.b.y; positions[b + 5] = pair.b.z
      col.copy(weightColor(pair.w, maxMag))
      colors[b]     = col.r; colors[b + 1] = col.g; colors[b + 2] = col.b
      colors[b + 3] = col.r; colors[b + 4] = col.g; colors[b + 5] = col.b
    })
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    const m = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity })
    return [g, m]
  }, [pairs, maxMag, opacity])

  return <lineSegments args={[geo, mat]} />
}

// ── Layer labels ──────────────────────────────────────────────────────────────

function LayerLabel({ x, text, color }: { x: number; text: string; color: string }) {
  const canvas = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 320; c.height = 64
    const ctx = c.getContext('2d')!
    ctx.clearRect(0, 0, 320, 64)
    ctx.fillStyle = color
    ctx.font = 'bold 20px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(text, 160, 42)
    return c
  }, [text, color])
  const texture = useMemo(() => new THREE.CanvasTexture(canvas), [canvas])
  return (
    <sprite position={[x, -17, 0]} scale={[7, 1.75, 1]}>
      <spriteMaterial map={texture} transparent depthWrite={false} />
    </sprite>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export interface Activations3D {
  input: number[]
  h1: number[]
  h2: number[]
  output: number[]
}

interface Props {
  weights: ModelWeights | null
  activations: Activations3D | null
  maxConn?: number
}

export function NetworkMesh3D({ weights, activations, maxConn = DEFAULT_MAX_CONN }: Props) {
  const pos = useMemo(() => ({
    h1: columnPositions(128, LAYER_X[1], HIDDEN1_SPACING),
    h2: columnPositions(64,  LAYER_X[2], HIDDEN2_SPACING),
    output: columnPositions(10, LAYER_X[3], OUTPUT_SPACING),
  }), [])

  const inputPos = useMemo(() => inputBasePositions(), [])
  const acts = activations

  const maxMags = useMemo(() => {
    if (!weights) return [1, 1, 1]
    // weights[fi][ti] — iterate all rows and all columns
    const maxOf = (W: number[][]) => {
      let m = 0
      for (const row of W) for (const v of row) { const a = Math.abs(v); if (a > m) m = a }
      return m || 1
    }
    return [maxOf(weights.W1), maxOf(weights.W2), maxOf(weights.W3)]
  }, [weights])

  // Recompute connections when activations change — so lines track the drawn digit
  const connPairs = useMemo(() => {
    if (!weights) return [[], [], []] as ConnPair[][]
    return [
      topConnections(inputPos, pos.h1, weights.W1, maxConn, acts?.input),
      topConnections(pos.h1,  pos.h2, weights.W2, maxConn, acts?.h1),
      topConnections(pos.h2,  pos.output, weights.W3, 64,  acts?.h2),
    ]
  }, [weights, inputPos, pos, maxConn, acts])

  return (
    <group>
      {connPairs[0].length > 0 && <ConnectionLines pairs={connPairs[0]} maxMag={maxMags[0]} opacity={0.32} />}
      {connPairs[1].length > 0 && <ConnectionLines pairs={connPairs[1]} maxMag={maxMags[1]} opacity={0.55} />}
      {connPairs[2].length > 0 && <ConnectionLines pairs={connPairs[2]} maxMag={maxMags[2]} opacity={0.68} />}

      <PixelVoxels activations={acts?.input ?? null} />
      <NodeLayer positions={pos.h1}     radius={NODE_RADIUS_HIDDEN} activations={acts?.h1     ?? null} />
      <NodeLayer positions={pos.h2}     radius={NODE_RADIUS_HIDDEN} activations={acts?.h2     ?? null} />
      <NodeLayer positions={pos.output} radius={NODE_RADIUS_OUTPUT} activations={acts?.output ?? null} isOutput segments={12} />

      <LayerLabel x={LAYER_X[0]} text="Input  784 pixels"    color="#849493" />
      <LayerLabel x={LAYER_X[1]} text="Hidden 1  128·ReLU"   color="#9bfffe" />
      <LayerLabel x={LAYER_X[2]} text="Hidden 2  64·ReLU"    color="#9bfffe" />
      <LayerLabel x={LAYER_X[3]} text="Output  10·Softmax"   color="#caff87" />
    </group>
  )
}
