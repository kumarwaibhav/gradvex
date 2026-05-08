'use client'

import { useRef, useEffect } from 'react'
import { useUIStore } from '@/store/uiStore'

// ── Network topology ─────────────────────────────────────────────────────────
const LAYER_DEFS = [
  { x: 0.06, count: 9 },
  { x: 0.28, count: 7 },
  { x: 0.52, count: 6 },
  { x: 0.74, count: 5 },
  { x: 0.92, count: 4 },
]

interface Node {
  x: number   // 0..1
  y: number   // 0..1
  layer: number
  activation: number
  targetActivation: number
  phase: number
  radius: number
}

interface Edge {
  fromIdx: number
  toIdx: number
  signal: number
  signalPos: number
  signalSpeed: number
  weight: number
}

function buildNetwork(): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  LAYER_DEFS.forEach((def, li) => {
    for (let ni = 0; ni < def.count; ni++) {
      nodes.push({
        x: def.x,
        y: (ni + 1) / (def.count + 1),
        layer: li,
        activation: Math.random() * 0.1,
        targetActivation: 0,
        phase: Math.random() * Math.PI * 2,
        radius: li === 0 ? 4.5 : li === LAYER_DEFS.length - 1 ? 7 : 5.5,
      })
    }
  })

  const edges: Edge[] = []
  for (let li = 0; li < LAYER_DEFS.length - 1; li++) {
    const fromNodes = nodes.filter(n => n.layer === li)
    const toNodes = nodes.filter(n => n.layer === li + 1)
    // Not fully connected — skip some for visual clarity
    fromNodes.forEach((fn, fi) => {
      toNodes.forEach((tn, ti) => {
        const skip = Math.abs(fi - ti) > LAYER_DEFS[li + 1].count * 0.7
        if (skip && Math.random() > 0.4) return
        edges.push({
          fromIdx: nodes.indexOf(fn),
          toIdx: nodes.indexOf(tn),
          signal: 0,
          signalPos: Math.random(),
          signalSpeed: 0.004 + Math.random() * 0.006,
          weight: 0.4 + Math.random() * 0.6,
        })
      })
    })
  }

  return { nodes, edges }
}

export function NeuralHeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useUIStore()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let raf = 0

    // Theme colors
    const isDark = theme === 'dark'
    const CYAN_R = isDark ? 114 : 0
    const CYAN_G = isDark ? 241 : 122
    const CYAN_B = isDark ? 233 : 118
    const LIME_R = isDark ? 200 : 83
    const LIME_G = isDark ? 249 : 124
    const LIME_B = isDark ? 112 : 25
    const VIOLET_R = isDark ? 201 : 96
    const VIOLET_G = isDark ? 179 : 65
    const VIOLET_B = isDark ? 255 : 167
    const cyanRGBA = (a: number) => `rgba(${CYAN_R},${CYAN_G},${CYAN_B},${a.toFixed(3)})`
    const limeRGBA = (a: number) => `rgba(${LIME_R},${LIME_G},${LIME_B},${a.toFixed(3)})`
    const violetRGBA = (a: number) => `rgba(${VIOLET_R},${VIOLET_G},${VIOLET_B},${a.toFixed(3)})`

    // HiDPI
    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const W = () => canvas.offsetWidth
    const H = () => canvas.offsetHeight

    // Build network
    const { nodes, edges } = buildNetwork()

    // Cursor spring
    let mouseX = 0.5, mouseY = 0.5
    let springX = 0.5, springY = 0.5
    let velX = 0, velY = 0
    let isHovering = false

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      if (
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom
      ) {
        mouseX = (e.clientX - rect.left) / rect.width
        mouseY = (e.clientY - rect.top) / rect.height
        isHovering = true
      } else {
        isHovering = false
      }
    }
    window.addEventListener('mousemove', onMove)

    let t = 0
    const SPRING = 0.072
    const DAMPING = 0.78

    const animate = () => {
      t += 0.016
      const w = W(), h = H()

      ctx.clearRect(0, 0, w, h)

      // Spring physics — critical damped toward cursor
      velX = velX * DAMPING + (mouseX - springX) * SPRING * (1 - DAMPING) * 12
      velY = velY * DAMPING + (mouseY - springY) * SPRING * (1 - DAMPING) * 12
      springX += velX
      springY += velY

      // Ambient drift when no hover
      if (!isHovering) {
        mouseX = 0.5 + 0.28 * Math.sin(t * 0.22)
        mouseY = 0.5 + 0.18 * Math.cos(t * 0.17)
      }

      // Big cursor glow
      const gx = springX * w, gy = springY * h
      const glowR = Math.min(w, h) * 0.52
      const bgGrad = ctx.createRadialGradient(gx, gy, 0, gx, gy, glowR)
      bgGrad.addColorStop(0, cyanRGBA(isDark ? 0.07 : 0.05))
      bgGrad.addColorStop(0.4, cyanRGBA(isDark ? 0.03 : 0.02))
      bgGrad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, w, h)

      // Update node activations
      nodes.forEach(node => {
        const nx = node.x * w, ny = node.y * h
        const dx = nx - gx, dy = ny - gy
        const dist = Math.sqrt(dx * dx + dy * dy)
        const proximity = Math.max(0, 1 - dist / (w * 0.38))
        const idle = 0.08 + 0.05 * Math.sin(t * 1.1 + node.phase)
        node.targetActivation = Math.max(idle, proximity * 0.9)
        node.activation += (node.targetActivation - node.activation) * 0.09
      })

      // Propagate signal: high-activation nodes trigger outgoing edges
      edges.forEach(edge => {
        const fromNode = nodes[edge.fromIdx]
        const toNode = nodes[edge.toIdx]
        const activeEdge = fromNode.activation > 0.25

        if (activeEdge || edge.signal > 0.05) {
          edge.signalPos += edge.signalSpeed * (1 + fromNode.activation * 2)
          if (edge.signalPos > 1) {
            edge.signalPos = 0
            toNode.activation = Math.min(1, toNode.activation + fromNode.activation * 0.18 * edge.weight)
          }
          edge.signal = fromNode.activation * edge.weight
        } else {
          edge.signal *= 0.95
        }
      })

      // ── Draw edges ──────────────────────────────────────────────────────────
      edges.forEach(edge => {
        const fn = nodes[edge.fromIdx]
        const tn = nodes[edge.toIdx]
        const activity = (fn.activation + tn.activation) / 2
        if (activity < 0.04) return

        const fx = fn.x * w, fy = fn.y * h
        const tx2 = tn.x * w, ty2 = tn.y * h

        // Bezier control point for organic curves
        const cpx = (fx + tx2) / 2 + (fy - ty2) * 0.08
        const cpy = (fy + ty2) / 2

        ctx.beginPath()
        ctx.moveTo(fx, fy)
        ctx.quadraticCurveTo(cpx, cpy, tx2, ty2)
        const edgeAlpha = activity * 0.38 * edge.weight
        // Positive vs negative weight color
        const edgeColor = fn.layer % 2 === 0 ? cyanRGBA(edgeAlpha) : violetRGBA(edgeAlpha * 0.9)
        ctx.strokeStyle = edgeColor
        ctx.lineWidth = activity * 1.2
        ctx.stroke()

        // Signal pulse dot
        if (edge.signal > 0.2 && edge.signalPos > 0 && edge.signalPos < 1) {
          const t2 = edge.signalPos
          const mt = 1 - t2
          const px = mt * mt * fx + 2 * mt * t2 * cpx + t2 * t2 * tx2
          const py = mt * mt * fy + 2 * mt * t2 * cpy + t2 * t2 * ty2
          const pulseR = 3 + edge.signal * 3

          const pulseGrad = ctx.createRadialGradient(px, py, 0, px, py, pulseR * 2.5)
          pulseGrad.addColorStop(0, `rgba(255,255,255,${(edge.signal * 0.9).toFixed(2)})`)
          pulseGrad.addColorStop(0.5, cyanRGBA(edge.signal * 0.5))
          pulseGrad.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = pulseGrad
          ctx.beginPath()
          ctx.arc(px, py, pulseR * 2.5, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      // ── Draw nodes ──────────────────────────────────────────────────────────
      nodes.forEach(node => {
        const nx = node.x * w, ny = node.y * h
        const act = node.activation
        const r = node.radius + act * 5
        const isOutput = node.layer === LAYER_DEFS.length - 1

        // Outer glow
        if (act > 0.15) {
          const glowGrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, r * 4)
          const glowCol = isOutput ? limeRGBA(act * 0.3) : cyanRGBA(act * 0.25)
          glowGrad.addColorStop(0, glowCol)
          glowGrad.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = glowGrad
          ctx.beginPath()
          ctx.arc(nx, ny, r * 4, 0, Math.PI * 2)
          ctx.fill()
        }

        // Node fill
        const fillGrad = ctx.createRadialGradient(nx - r * 0.3, ny - r * 0.3, 0, nx, ny, r)
        if (isOutput) {
          fillGrad.addColorStop(0, limeRGBA(0.35 + act * 0.5))
          fillGrad.addColorStop(1, limeRGBA(0.12 + act * 0.2))
        } else {
          fillGrad.addColorStop(0, cyanRGBA(0.28 + act * 0.45))
          fillGrad.addColorStop(1, cyanRGBA(0.08 + act * 0.15))
        }
        ctx.fillStyle = fillGrad
        ctx.beginPath()
        ctx.arc(nx, ny, r, 0, Math.PI * 2)
        ctx.fill()

        // Node stroke
        const strokeCol = isOutput ? limeRGBA(0.4 + act * 0.55) : cyanRGBA(0.35 + act * 0.6)
        ctx.strokeStyle = strokeCol
        ctx.lineWidth = 1 + act * 0.8
        ctx.stroke()

        // Specular highlight
        if (act > 0.3) {
          const hiR = r * 0.35
          const hiGrad = ctx.createRadialGradient(nx - r * 0.25, ny - r * 0.3, 0, nx - r * 0.25, ny - r * 0.3, hiR)
          hiGrad.addColorStop(0, `rgba(255,255,255,${(act * 0.45).toFixed(2)})`)
          hiGrad.addColorStop(1, 'rgba(255,255,255,0)')
          ctx.fillStyle = hiGrad
          ctx.beginPath()
          ctx.arc(nx - r * 0.25, ny - r * 0.3, hiR, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      // Cursor dot
      const cursorGrad = ctx.createRadialGradient(gx, gy, 0, gx, gy, 18)
      cursorGrad.addColorStop(0, cyanRGBA(isDark ? 0.55 : 0.4))
      cursorGrad.addColorStop(0.4, cyanRGBA(isDark ? 0.15 : 0.1))
      cursorGrad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = cursorGrad
      ctx.beginPath()
      ctx.arc(gx, gy, 18, 0, Math.PI * 2)
      ctx.fill()

      raf = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('mousemove', onMove)
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    />
  )
}
