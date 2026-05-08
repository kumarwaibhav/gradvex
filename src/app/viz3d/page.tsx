'use client'

import { useMemo, useRef, useCallback, useState } from 'react'
import dynamic from 'next/dynamic'
import { useModelLoader } from '@/hooks/useModelLoader'
import { useNetworkStore } from '@/store/networkStore'
import { useRealtimeInference } from '@/hooks/useRealtimeInference'
import { ConfidenceBar } from '@/components/prediction/ConfidenceBar'
import { clearCanvas, beginStroke, continueStroke } from '@/lib/utils/canvas'
import type { Activations3D } from '@/components/viz3d/NetworkMesh3D'
import { Eraser, Layers3, Zap, Activity } from 'lucide-react'

const Network3DScene = dynamic(
  () => import('@/components/viz3d/Network3DScene').then(m => m.Network3DScene),
  { ssr: false }
)

const DIGITS = ['0','1','2','3','4','5','6','7','8','9']

// ── Drawing canvas ────────────────────────────────────────────────────────────

function DrawGrid({ onChange }: { onChange: (canvas: HTMLCanvasElement) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)

  const getPos = useCallback((e: React.PointerEvent) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    isDrawing.current = true
    const ctx = canvasRef.current!.getContext('2d')!
    const pos = getPos(e)
    beginStroke(ctx, pos.x, pos.y, 12)
  }, [getPos])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDrawing.current) return
    e.preventDefault()
    const ctx = canvasRef.current!.getContext('2d')!
    const pos = getPos(e)
    continueStroke(ctx, pos.x, pos.y)
    // Fire inference every stroke pixel — RAF-throttled in useRealtimeInference
    // This is how the reference (nn-vis.noelith.dev) achieves live connection updates
    if (canvasRef.current) onChange(canvasRef.current)
  }, [getPos, onChange])

  const handlePointerUp = useCallback(() => {
    if (!isDrawing.current) return
    isDrawing.current = false
    // Final settled call on release
    if (canvasRef.current) onChange(canvasRef.current)
  }, [onChange])

  const handleClear = useCallback(() => {
    if (!canvasRef.current) return
    clearCanvas(canvasRef.current)
    onChange(canvasRef.current)
  }, [onChange])

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full mb-0.5">
        <span className="text-[10px] font-code" style={{ color: 'var(--gv-muted)' }}>Draw a digit</span>
        <span className="text-[10px] font-code" style={{ color: 'var(--gv-lime)' }}>● live 3D</span>
      </div>
      <canvas
        ref={canvasRef}
        width={224}
        height={224}
        className="rounded-xl cursor-crosshair touch-none block"
        style={{
          background: '#000',
          border: '1px solid color-mix(in srgb, var(--gv-cyan) 25%, transparent)',
          boxShadow: '0 0 20px color-mix(in srgb, var(--gv-cyan) 10%, transparent)',
          imageRendering: 'pixelated',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
      <button
        onClick={handleClear}
        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-code transition-colors"
        style={{
          border: '1px solid var(--gv-line)',
          color: 'var(--gv-muted)',
          background: 'var(--gv-panel)',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--gv-cyan)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--gv-muted)')}
      >
        <Eraser size={12} />
        Clear
      </button>
      <p className="text-[9px] font-code text-center" style={{ color: 'var(--gv-faint)' }}>
        One digit · centered · large
      </p>
    </div>
  )
}

// ── Layer stats strip ─────────────────────────────────────────────────────────

interface LayerStat {
  name: string
  count: number
  fired: number
  mean: number
  color: string
}

function LayerStats({ activations }: { activations: Activations3D | null }) {
  const stats: LayerStat[] = useMemo(() => {
    if (!activations) return []
    const stat = (name: string, arr: number[], color: string, threshold = 0): LayerStat => {
      const fired = arr.filter(v => v > threshold).length
      const mean = arr.reduce((s, v) => s + v, 0) / arr.length
      return { name, count: arr.length, fired, mean, color }
    }
    return [
      stat('Input', activations.input, 'var(--gv-muted)', 0.05),
      stat('Hidden 1', activations.h1, 'var(--gv-cyan)', 0),
      stat('Hidden 2', activations.h2, 'var(--gv-cyan)', 0),
      stat('Output', activations.output, 'var(--gv-lime)', 0),
    ]
  }, [activations])

  if (!activations) return null

  return (
    <div className="flex items-center gap-3 px-5 py-2 overflow-x-auto border-b shrink-0"
      style={{
        borderColor: 'color-mix(in srgb, var(--gv-cyan) 8%, transparent)',
        background: 'color-mix(in srgb, var(--gv-bg) 85%, transparent)',
        backdropFilter: 'blur(16px)',
      }}>
      <Activity size={12} style={{ color: 'var(--gv-cyan)', flexShrink: 0 }} />
      <span className="text-[10px] font-code shrink-0" style={{ color: 'var(--gv-faint)' }}>Layer activations</span>
      <div className="h-3 border-l shrink-0" style={{ borderColor: 'var(--gv-line)' }} />
      {stats.map(s => (
        <div key={s.name} className="flex items-center gap-2 shrink-0">
          <span className="font-code text-[10px]" style={{ color: s.color }}>{s.name}</span>
          <div className="flex items-center gap-1">
            <div className="h-1 rounded-full" style={{
              width: `${Math.round(s.mean * 48)}px`,
              minWidth: '2px',
              maxWidth: '48px',
              background: s.color,
              opacity: 0.7,
            }} />
            <span className="font-code text-[9px]" style={{ color: 'var(--gv-faint)' }}>
              {s.fired}/{s.count} fired · {(s.mean * 100).toFixed(0)}% avg
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Prediction side panel ─────────────────────────────────────────────────────

function PredictionSide() {
  const { result } = useNetworkStore()

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-2">
        <span className="text-3xl font-heading font-bold" style={{ color: 'var(--gv-line)' }}>?</span>
        <p className="text-xs font-code" style={{ color: 'var(--gv-faint)' }}>Draw to predict</p>
      </div>
    )
  }

  const { prediction, confidence, outputProbs } = result
  const isLow = confidence < 0.5

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: isLow ? 'color-mix(in srgb, var(--gv-coral) 8%, transparent)' : 'var(--gv-cyan-soft)',
            border: `1px solid ${isLow ? 'color-mix(in srgb, var(--gv-coral) 30%, transparent)' : 'color-mix(in srgb, var(--gv-cyan) 30%, transparent)'}`,
            boxShadow: isLow ? 'none' : '0 0 16px color-mix(in srgb, var(--gv-cyan) 20%, transparent)',
          }}>
          <span className="text-4xl font-bold font-heading"
            style={{ color: isLow ? 'var(--gv-coral)' : 'var(--gv-cyan)' }}>
            {prediction}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-xs font-code" style={{ color: 'var(--gv-muted)' }}>Prediction</p>
          <p className="text-lg font-bold font-heading"
            style={{ color: confidence >= 0.9 ? 'var(--gv-lime)' : confidence >= 0.6 ? 'var(--gv-cyan)' : 'var(--gv-coral)' }}>
            {(confidence * 100).toFixed(1)}%
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-code mb-1" style={{ color: 'var(--gv-faint)' }}>Softmax — 10 classes</p>
        {DIGITS.map((label, i) => (
          <ConfidenceBar key={i} label={label} value={outputProbs[i]} isTop={i === prediction} />
        ))}
      </div>
    </div>
  )
}

// ── Controls bar ──────────────────────────────────────────────────────────────

function ControlsBar({ maxConn, setMaxConn }: { maxConn: number; setMaxConn: (v: number) => void }) {
  return (
    <div className="flex items-center gap-4 overflow-x-auto px-5 py-2.5 text-[11px] font-code shrink-0"
      style={{
        background: 'color-mix(in srgb, var(--gv-bg) 80%, transparent)',
        borderTop: '1px solid var(--gv-line)',
        backdropFilter: 'blur(20px)',
      }}>
      <div className="flex items-center gap-2 shrink-0">
        <span style={{ color: 'var(--gv-muted)' }}>Connections / neuron</span>
        <input
          type="range" min={4} max={64} step={4} value={maxConn}
          onChange={e => setMaxConn(Number(e.target.value))}
          className="w-28 accent-cyan-400"
        />
        <span style={{ color: 'var(--gv-cyan)' }}>{maxConn}</span>
      </div>
      <div className="h-3 border-l shrink-0" style={{ borderColor: 'var(--gv-line)' }} />
      {/* Legend: green = positive, red = negative */}
      <div className="flex items-center gap-1.5 shrink-0" style={{ color: 'var(--gv-faint)' }}>
        <div className="w-6 h-px rounded-full" style={{ background: '#4ade80' }} />
        <span>positive weight</span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0" style={{ color: 'var(--gv-faint)' }}>
        <div className="w-6 h-px rounded-full" style={{ background: '#f87171' }} />
        <span>negative weight</span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0" style={{ color: 'var(--gv-faint)' }}>
        <div className="w-3 h-3 rounded-sm" style={{ background: '#fff' }} />
        <span>bright pixel</span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0" style={{ color: 'var(--gv-faint)' }}>
        <div className="w-3 h-3 rounded-full" style={{ background: 'var(--gv-lime)' }} />
        <span>high activation</span>
      </div>
      <div className="ml-auto shrink-0 text-[10px]" style={{ color: 'var(--gv-faint)' }}>
        Drag · Scroll · Shift+drag
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Viz3DPage() {
  useModelLoader()
  const { result, weights, modelLoaded, modelLoading } = useNetworkStore()
  const { infer } = useRealtimeInference()
  const [maxConn, setMaxConn] = useState(24)

  const activations: Activations3D | null = useMemo(() => {
    if (!result) return null
    return {
      input: result.inputTensor,
      h1: result.layer1Post,
      h2: result.layer2Post,
      output: result.outputProbs,
    }
  }, [result])

  const handleDraw = useCallback((canvas: HTMLCanvasElement) => {
    infer(canvas)
  }, [infer])

  return (
    <div className="fixed inset-0 pt-14 flex flex-col" style={{ background: 'var(--gv-bg)', color: 'var(--gv-text)' }}>

      {/* Status bar */}
      <div className="flex items-center gap-3 px-5 py-2 border-b shrink-0"
        style={{
          borderColor: 'var(--gv-line)',
          background: 'color-mix(in srgb, var(--gv-panel) 85%, transparent)',
          backdropFilter: 'blur(20px)',
        }}>
        <Layers3 size={14} style={{ color: 'var(--gv-cyan)' }} />
        <span className="font-heading font-semibold text-sm" style={{ color: 'var(--gv-text)' }}>
          3D Neural Network Lab
        </span>
        <span className="text-[10px] font-code px-2 py-0.5 rounded-full"
          style={{
            background: modelLoaded ? 'var(--gv-lime-soft)' : 'var(--gv-cyan-soft)',
            border: `1px solid ${modelLoaded ? 'color-mix(in srgb, var(--gv-lime) 30%, transparent)' : 'color-mix(in srgb, var(--gv-cyan) 20%, transparent)'}`,
            color: modelLoaded ? 'var(--gv-lime)' : 'var(--gv-cyan)',
          }}>
          {modelLoaded ? '● 784→128→64→10 · Ready' : modelLoading ? '◌ Loading…' : '○ Offline'}
        </span>
        <div className="flex items-center gap-3 ml-auto text-[10px] font-code" style={{ color: 'var(--gv-faint)' }}>
          <span>109,386 parameters</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">97.67% MNIST accuracy</span>
          <span className="hidden md:inline">·</span>
          <span className="hidden md:inline">Pixel brightness = voxel depth</span>
        </div>
      </div>

      {/* Layer activation strip — only when result exists */}
      <LayerStats activations={activations} />

      {/* 3D canvas area */}
      <div className="flex-1 relative overflow-hidden">

        <div className="absolute inset-0">
          <Network3DScene weights={weights} activations={activations} maxConn={maxConn} />
        </div>

        {/* Left panel: draw */}
        <div className="absolute left-3 top-3 z-10 rounded-2xl p-4 max-sm:bottom-3 max-sm:top-auto max-sm:w-[calc(100%-1.5rem)]"
          style={{
            background: 'color-mix(in srgb, var(--gv-panel) 88%, transparent)',
            backdropFilter: 'blur(24px)',
            border: '1px solid var(--gv-line)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          }}>
          {modelLoading && (
            <div className="flex flex-col gap-2 w-56 mb-3">
              <div className="flex justify-between text-[10px] font-code" style={{ color: 'var(--gv-muted)' }}>
                <span>Loading model weights…</span>
              </div>
              <div className="h-1 rounded-full" style={{ background: 'var(--gv-bg-2)' }}>
                <div className="h-full rounded-full animate-pulse"
                  style={{ width: '60%', background: 'linear-gradient(90deg, var(--gv-cyan), var(--gv-lime))' }} />
              </div>
            </div>
          )}
          <DrawGrid onChange={handleDraw} />
        </div>

        {/* Right panel: predictions */}
        <div className="absolute right-3 top-3 z-10 w-56 rounded-2xl p-4 max-sm:hidden"
          style={{
            background: 'color-mix(in srgb, var(--gv-panel) 88%, transparent)',
            backdropFilter: 'blur(24px)',
            border: '1px solid var(--gv-line)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          }}>
          <p className="font-heading font-semibold text-sm mb-3" style={{ color: 'var(--gv-text)' }}>
            Prediction
          </p>
          <PredictionSide />
        </div>

        {/* What to look for guide — bottom center hint */}
        {result && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 max-sm:hidden">
            <div className="flex items-center gap-4 px-4 py-2 rounded-full text-[10px] font-code"
              style={{
                background: 'color-mix(in srgb, var(--gv-panel) 90%, transparent)',
                backdropFilter: 'blur(16px)',
                border: '1px solid var(--gv-line)',
                color: 'var(--gv-faint)',
              }}>
              <span style={{ color: '#fff' }}>White voxels</span> = bright pixels drawn
              <span className="opacity-40">·</span>
              <span style={{ color: '#4ade80' }}>Green</span> = excitatory weights
              <span className="opacity-40">·</span>
              <span style={{ color: '#f87171' }}>Red</span> = inhibitory weights
              <span className="opacity-40">·</span>
              <span style={{ color: 'var(--gv-lime)' }}>Lime</span> = output fired
            </div>
          </div>
        )}

        {/* Empty hint */}
        {!result && modelLoaded && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-2 text-center">
              <Zap size={28} style={{ color: 'color-mix(in srgb, var(--gv-cyan) 20%, transparent)' }} />
              <p className="text-sm font-code" style={{ color: 'color-mix(in srgb, var(--gv-cyan) 25%, transparent)' }}>
                Draw a digit to light up the network
              </p>
              <p className="text-[10px] font-code" style={{ color: 'color-mix(in srgb, var(--gv-muted) 30%, transparent)' }}>
                Pixels will rise · edges will glow · output will fire
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom legend + controls */}
      <ControlsBar maxConn={maxConn} setMaxConn={setMaxConn} />
    </div>
  )
}
