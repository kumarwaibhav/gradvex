'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useModelLoader } from '@/hooks/useModelLoader'
import { useNetworkStore } from '@/store/networkStore'
import { DrawingCanvas } from '@/components/canvas/DrawingCanvas'
import { NetworkVisualizer } from '@/components/network/NetworkVisualizer'
import { PredictionPanel } from '@/components/prediction/PredictionPanel'
import { BreakItBar } from '@/components/breakit/BreakItPanel'
import { WelcomeOverlay } from '@/components/onboarding/WelcomeOverlay'
import { ForwardPassTab } from '@/components/math/ForwardPassTab'
import { WeightsTab } from '@/components/math/WeightsTab'
import { BackpropTab } from '@/components/math/BackpropTab'
import { CircleHelp, Cpu, FunctionSquare, Layers, TrendingDown, Waves } from 'lucide-react'

type MathTab = 'forward' | 'weights' | 'backprop'

const LAYER_EXPLAINERS = [
  {
    label: 'Input',
    sub: '784 pixels',
    color: 'var(--gv-muted)',
    what: 'Your drawing as numbers',
    why: 'The canvas is resized to 28×28 px and each pixel becomes one number in [0, 1]. No spatial structure — just 784 raw values.',
    math: 'x ∈ ℝ⁷⁸⁴',
  },
  {
    label: 'Hidden 1',
    sub: '128 · ReLU',
    color: 'var(--gv-cyan)',
    what: 'Stroke & edge detectors',
    why: 'Each of the 128 neurons computes a weighted sum of all 784 pixels, then ReLU zeroes negatives. These neurons learn to fire on specific pen strokes.',
    math: 'a₁ = ReLU(W₁x + b₁)',
  },
  {
    label: 'Hidden 2',
    sub: '64 · ReLU',
    color: 'var(--gv-cyan)',
    what: 'Shape & part detectors',
    why: '64 neurons combine H1 stroke evidence into higher-level features — loops, curves, vertical segments. "Digit parts" emerge here.',
    math: 'a₂ = ReLU(W₂a₁ + b₂)',
  },
  {
    label: 'Output',
    sub: '10 · Softmax',
    color: 'var(--gv-lime)',
    what: 'Digit probabilities',
    why: 'One neuron per digit class. Softmax converts raw scores to probabilities summing to 1. The highest becomes the prediction.',
    math: 'ŷ = Softmax(W₃a₂ + b₃)',
  },
]

export default function PlaygroundPage() {
  useModelLoader()
  const { modelLoaded, modelLoading, result } = useNetworkStore()
  const [mathTab, setMathTab] = useState<MathTab>('forward')

  // Scroll-hide the sticky sub-header (same pattern as navbar)
  const [subHeaderVisible, setSubHeaderVisible] = useState(true)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return
      ticking.current = true
      requestAnimationFrame(() => {
        const y = window.scrollY
        const delta = y - lastScrollY.current
        if (y < 80) setSubHeaderVisible(true)
        else if (delta > 6) setSubHeaderVisible(false)
        else if (delta < -6) setSubHeaderVisible(true)
        lastScrollY.current = y
        ticking.current = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const status = modelLoaded ? 'Model ready' : modelLoading ? 'Loading model' : 'Offline'

  return (
    <>
      <WelcomeOverlay />
      <div className="gv-page gv-page-band pb-10">

        {/* ── Sticky sub-header — hides on scroll down ───────────────────────── */}
        <motion.header
          className="sticky top-14 z-30 border-b px-4 py-3 glass"
          animate={{ y: subHeaderVisible ? 0 : -60, opacity: subHeaderVisible ? 1 : 0 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          style={{ borderColor: 'var(--gv-line)' }}
        >
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border"
                style={{ borderColor: 'var(--gv-line)', background: 'var(--gv-cyan-soft)' }}>
                <Cpu size={17} style={{ color: 'var(--gv-cyan)' }} />
              </div>
              <div>
                <h1 className="font-heading text-base font-semibold">Neural Lab</h1>
                <p className="text-xs gv-muted">Draw, infer, inspect, and experiment in one workspace.</p>
              </div>
            </div>
            <span className="gv-pill">
              <span className="gv-dot" style={{ background: modelLoaded ? 'var(--gv-lime)' : modelLoading ? 'var(--gv-cyan)' : 'var(--gv-coral)' }} />
              {status}
            </span>
          </div>
        </motion.header>

        <div className="mx-auto max-w-7xl px-4">

          {/* Hint banner */}
          <div className="my-4 flex items-start gap-2 rounded-xl border px-3 py-2 text-xs font-code"
            style={{ borderColor: 'color-mix(in srgb, var(--gv-lime) 26%, transparent)', background: 'var(--gv-lime-soft)', color: 'var(--gv-muted)' }}>
            <CircleHelp size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--gv-lime)' }} />
            <span>Draw one large, centered digit. Multi-digit strokes are detected separately when spacing is clear.</span>
          </div>

          {/* ── 3-col grid: canvas | network | prediction ─────────────────────── */}
          <div className="gv-lab-grid">

            {/* Left: canvas + input info only (Break It moved below) */}
            <aside className="flex flex-col gap-4">
              <section className="gv-panel rounded-2xl p-4 sm:p-5">
                <DrawingCanvas />
              </section>
              <section className="gv-panel rounded-xl p-4">
                <p className="font-code text-[10px] uppercase gv-faint">Input tensor</p>
                <code className="mt-1 block text-sm font-code gv-cyan">Float32[1, 784]</code>
                <p className="mt-1 text-xs gv-muted">28 × 28 pixels normalized 0 → 1.</p>
              </section>
            </aside>

            {/* Center: network viz */}
            <section className="gv-panel min-h-[460px] rounded-2xl p-4 sm:p-5">
              <div className="mb-4 flex flex-wrap items-center gap-3 border-b pb-3" style={{ borderColor: 'var(--gv-line)' }}>
                <div>
                  <h2 className="font-heading text-base font-semibold">Network Architecture</h2>
                  <p className="text-xs gv-muted">784 → 128 ReLU → 64 ReLU → 10 Softmax</p>
                </div>
                <span className="ml-auto gv-pill">
                  <Waves size={13} />
                  Hover nodes
                </span>
              </div>

              <div className="flex min-h-[360px] items-center overflow-hidden rounded-xl border"
                style={{ borderColor: 'var(--gv-line)', background: 'color-mix(in srgb, var(--gv-bg-2) 55%, transparent)' }}>
                <NetworkVisualizer />
              </div>

              <div className="mt-4 flex flex-wrap gap-3 border-t pt-3 text-[10px] font-code gv-muted" style={{ borderColor: 'var(--gv-line)' }}>
                <span className="inline-flex items-center gap-1.5"><i className="h-0.5 w-5 rounded-full" style={{ background: 'var(--gv-cyan)' }} /> positive weight</span>
                <span className="inline-flex items-center gap-1.5"><i className="h-0.5 w-5 rounded-full" style={{ background: 'var(--gv-violet)' }} /> negative weight</span>
                <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--gv-lime)' }} /> top prediction</span>
              </div>
            </section>

            {/* Right: prediction */}
            <aside className="prediction-column gv-panel rounded-2xl p-4 sm:p-5">
              <div className="mb-4">
                <p className="font-code text-[10px] uppercase gv-faint">Output layer</p>
                <h2 className="font-heading text-base font-semibold">Prediction</h2>
              </div>
              <PredictionPanel />
            </aside>
          </div>

          {/* ── Break It Mode — full-width horizontal bar ─────────────────────── */}
          <div className="mt-4">
            <BreakItBar />
          </div>

          {/* ── Layer explainers ─────────────────────────────────────────────── */}
          <div className="mt-4 gv-panel-solid rounded-2xl p-5">
            <p className="font-code text-[10px] uppercase gv-faint mb-4">What each layer does</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {LAYER_EXPLAINERS.map((l) => (
                <div key={l.label} className="rounded-xl p-4 flex flex-col gap-2"
                  style={{ background: 'var(--gv-bg-2)', border: '1px solid var(--gv-line)' }}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-semibold text-sm" style={{ color: l.color }}>{l.label}</h3>
                    <span className="font-code text-[9px] gv-faint">{l.sub}</span>
                  </div>
                  <p className="font-code text-[10px] uppercase" style={{ color: l.color }}>{l.what}</p>
                  <p className="text-xs gv-muted leading-5">{l.why}</p>
                  <code className="font-code text-[10px] gv-cyan mt-auto">{l.math}</code>
                </div>
              ))}
            </div>
          </div>

          {/* ── Inline math section ──────────────────────────────────────────── */}
          <div className="mt-4 gv-panel-solid rounded-2xl overflow-hidden">
            {/* Tab bar */}
            <div className="flex items-center gap-0 border-b" style={{ borderColor: 'var(--gv-line)', background: 'var(--gv-panel-strong)' }}>
              <div className="flex items-center gap-2 px-5 py-3 border-r" style={{ borderColor: 'var(--gv-line)' }}>
                <FunctionSquare size={14} style={{ color: 'var(--gv-cyan)' }} />
                <span className="font-heading font-semibold text-sm">Live Computation</span>
              </div>
              {([
                { id: 'forward', label: 'Forward Pass', icon: <Layers size={12} /> },
                { id: 'weights', label: 'Weight Inspector', icon: <Waves size={12} /> },
                { id: 'backprop', label: 'Backpropagation', icon: <TrendingDown size={12} /> },
              ] as const).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setMathTab(tab.id)}
                  className="flex items-center gap-1.5 px-4 py-3 font-code text-xs transition-colors"
                  style={{
                    background: mathTab === tab.id ? 'var(--gv-cyan-soft)' : 'transparent',
                    color: mathTab === tab.id ? 'var(--gv-cyan)' : 'var(--gv-muted)',
                    borderBottom: mathTab === tab.id ? '2px solid var(--gv-cyan)' : '2px solid transparent',
                  }}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-5">
              <AnimatePresence mode="wait">
                {!result ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <FunctionSquare size={32} className="mb-3" style={{ color: 'var(--gv-line)' }} />
                    <p className="font-heading text-lg font-semibold">Draw a digit to activate computation trace.</p>
                    <p className="gv-copy mt-2 max-w-lg text-sm">
                      Each matrix multiply, ReLU activation, Softmax probability, weight distribution, and gradient will appear here as the model runs.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key={mathTab}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                  >
                    {mathTab === 'forward' && <ForwardPassTab />}
                    {mathTab === 'weights' && <WeightsTab />}
                    {mathTab === 'backprop' && <BackpropTab />}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Forward pass formula */}
          <div className="mt-4 rounded-xl border px-4 py-3 font-code text-[11px] gv-muted" style={{ borderColor: 'var(--gv-line)', background: 'var(--gv-panel)' }}>
            <span className="font-semibold gv-cyan">Forward pass:</span>{' '}
            {'x ∈ ℝ⁷⁸⁴ → z₁ = W₁x + b₁ → a₁ = ReLU(z₁) → z₂ = W₂a₁ + b₂ → a₂ = ReLU(z₂) → z₃ = W₃a₂ + b₃ → ŷ = Softmax(z₃)'}
          </div>

        </div>
      </div>
    </>
  )
}
