'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/store/uiStore'
import { ChevronDown, CheckCircle2, XCircle, Zap, Brain, Layers, TrendingUp } from 'lucide-react'
import type { ArchMode } from '@/lib/model/types'

const ARCHITECTURES = [
  {
    mode: 'shallow' as ArchMode,
    label: 'Shallow MLP',
    sublabel: '784 → 10',
    params: 784 * 10 + 10,
    accuracy: '~92%',
    trainTime: 'Very fast',
    risk: 'High underfitting',
    description: 'A direct linear mapping from pixels to classes — no hidden representation is learned. The model draws a single hyperplane in 784-dimensional space for each digit class. Works surprisingly well on MNIST because digit classes are visually separable, but fails on ambiguous samples that require curve or edge detection.',
    realWorld: [
      'Spam filter with bag-of-words features',
      'Logistic regression for binary medical diagnosis',
      'Linear sentiment classifier on token counts',
    ],
    pros: [
      'Extremely fast to train and infer',
      'Easy to interpret — weights = pixel importance',
      'No vanishing gradient risk',
      'Minimal memory footprint',
    ],
    cons: [
      'Cannot learn non-linear boundaries',
      'Fails on complex patterns or hierarchies',
      'No hidden feature representation',
      'Saturates quickly — accuracy ceiling ~92%',
    ],
    layers: [
      { name: 'Input', size: 784, fn: 'none', desc: '784 pixel values from a 28×28 grayscale image, normalized to [0, 1]. Each pixel is one feature — no spatial structure is conveyed to the model.', color: 'var(--gv-muted)' },
      { name: 'Output', size: 10, fn: 'Softmax', desc: 'Raw logit scores converted to probabilities via Softmax. The class with the highest probability is the predicted digit.', color: 'var(--gv-lime)' },
    ],
  },
  {
    mode: 'standard' as ArchMode,
    label: 'Standard MLP',
    sublabel: '784 → 128 → 64 → 10',
    params: 784 * 128 + 128 + 128 * 64 + 64 + 64 * 10 + 10,
    accuracy: '>97%',
    trainTime: 'Fast (~30s)',
    risk: 'Low',
    description: 'Two hidden layers learn a hierarchy of visual features. Hidden 1 (128 neurons) detects primitive patterns — horizontal edges, vertical strokes, curves. Hidden 2 (64 neurons) combines those primitives into digit-level shape detectors. This is the GradVex model: 109,386 parameters trained on 60,000 MNIST images using Adam optimizer.',
    realWorld: [
      'Credit card fraud detection (tabular features)',
      'Customer churn prediction in SaaS',
      'Medical diagnosis from structured lab results',
      'Digit recognition in postal sorting (this exact task)',
      'Basic recommendation systems with user/item features',
    ],
    pros: [
      'Strong accuracy with minimal tuning',
      'Fast training on modern hardware',
      'Learns non-linear decision boundaries',
      'Hierarchical feature representation',
      'Generalizes well with proper regularization',
    ],
    cons: [
      'More complex than linear models — harder to explain',
      'Requires careful initialization',
      'Sensitive to learning rate choice',
      'Slower than linear models at inference',
    ],
    layers: [
      { name: 'Input', size: 784, fn: 'none', desc: '28×28 grayscale pixels flattened to a 784-dim vector. Normalized to [0, 1] by dividing raw uint8 values by 255.', color: 'var(--gv-muted)' },
      { name: 'Hidden 1', size: 128, fn: 'ReLU', desc: 'W¹ ∈ ℝ¹²⁸ˣ⁷⁸⁴, b¹ ∈ ℝ¹²⁸. Each neuron learns a linear combination of pixels, then ReLU zeroes negatives. These 128 neurons collectively detect stroke directions and edge orientations.', color: 'var(--gv-cyan)' },
      { name: 'Hidden 2', size: 64, fn: 'ReLU', desc: 'W² ∈ ℝ⁶⁴ˣ¹²⁸, b² ∈ ℝ⁶⁴. Receives compressed H1 features and combines them into higher-level shape detectors — loops, curves, intersections. 64 neurons is enough; more would overfit.', color: 'var(--gv-cyan)' },
      { name: 'Output', size: 10, fn: 'Softmax', desc: 'W³ ∈ ℝ¹⁰ˣ⁶⁴, b³ ∈ ℝ¹⁰. Projects 64-dim hidden representation to 10 logit scores, one per digit class. Softmax normalizes these to a probability distribution.', color: 'var(--gv-lime)' },
    ],
  },
  {
    mode: 'deep' as ArchMode,
    label: 'Deep MLP',
    sublabel: '784 → 256 → 128 → 64 → 32 → 10',
    params: 784 * 256 + 256 + 256 * 128 + 128 + 128 * 64 + 64 + 64 * 32 + 32 + 32 * 10 + 10,
    accuracy: '~98%',
    trainTime: 'Moderate',
    risk: 'Overfit risk high',
    description: 'Four hidden layers with a funnel architecture — 256→128→64→32. Each layer compresses the representation further, forcing the model to extract increasingly abstract features. Higher capacity means potentially higher accuracy, but also higher risk of memorizing training data. For MNIST, gains over standard MLP are marginal — the extra complexity mainly benefits noisier real-world data.',
    realWorld: [
      'NLP text classification with large feature spaces',
      'Genomic data analysis with thousands of gene features',
      'Financial risk scoring with many interaction terms',
      'Audio feature classification (MFCC-based speech)',
    ],
    pros: [
      'Highest representational capacity',
      'Can model very complex non-linear relationships',
      'Better generalization on noisy or high-dim data',
      'Allows intermediate supervision at each layer',
    ],
    cons: [
      'High parameter count — slow to train',
      'Prone to overfitting without regularization',
      'Vanishing/exploding gradients in very deep nets',
      'Marginal gains over standard MLP on simple tasks',
      'Harder to interpret hidden representations',
    ],
    layers: [
      { name: 'Input', size: 784, fn: 'none', desc: '784-dim pixel vector, normalized [0, 1].', color: 'var(--gv-muted)' },
      { name: 'Hidden 1', size: 256, fn: 'ReLU', desc: 'W¹ ∈ ℝ²⁵⁶ˣ⁷⁸⁴. High-capacity first layer captures broad pixel combinations. 256 neurons = 200,960 parameters in this layer alone.', color: 'var(--gv-cyan)' },
      { name: 'Hidden 2', size: 128, fn: 'ReLU', desc: 'W² ∈ ℝ¹²⁸ˣ²⁵⁶. First compression stage — halves representation from 256 to 128, forcing discarding of less useful H1 features.', color: 'var(--gv-cyan)' },
      { name: 'Hidden 3', size: 64, fn: 'ReLU', desc: 'W³ ∈ ℝ⁶⁴ˣ¹²⁸. Mid-level shape composition. Same as H2 in the standard model, but with richer incoming features.', color: 'var(--gv-cyan)' },
      { name: 'Hidden 4', size: 32, fn: 'ReLU', desc: 'W⁴ ∈ ℝ³²ˣ⁶⁴. Final compression before output — distills 64 features to 32 high-confidence digit-level signals.', color: 'var(--gv-violet)' },
      { name: 'Output', size: 10, fn: 'Softmax', desc: 'W⁵ ∈ ℝ¹⁰ˣ³². Class probability distribution.', color: 'var(--gv-lime)' },
    ],
  },
]

const FN_INFO: Record<string, { formula: string; desc: string }> = {
  none: { formula: 'f(x) = x', desc: 'Identity — no transformation applied. Values pass through unchanged.' },
  ReLU: { formula: 'f(x) = max(0, x)', desc: 'Zeroes all negative activations, passes positives unchanged. Creates sparsity and avoids vanishing gradients.' },
  Softmax: { formula: 'f(xᵢ) = eˣⁱ / Σⱼeˣʲ', desc: 'Converts raw logit scores to a valid probability distribution summing to 1.' },
}

function ReluGraph() {
  return (
    <svg width="90" height="90" viewBox="0 0 80 80">
      <line x1="0" y1="40" x2="80" y2="40" stroke="var(--gv-line)" strokeWidth={1} />
      <line x1="40" y1="0" x2="40" y2="80" stroke="var(--gv-line)" strokeWidth={1} />
      <polyline points="0,80 40,40 80,0" fill="none" stroke="var(--gv-cyan)" strokeWidth={2}
        strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 4px var(--gv-cyan-soft))' }} />
      <text x="6" y="13" fontSize="8" fill="var(--gv-faint)" fontFamily="monospace">f(x)</text>
      <text x="62" y="38" fontSize="7" fill="var(--gv-faint)" fontFamily="monospace">x</text>
    </svg>
  )
}

function SoftmaxBar() {
  const probs = [0.03, 0.02, 0.72, 0.05, 0.04, 0.03, 0.04, 0.03, 0.02, 0.02]
  return (
    <svg width="130" height="68" viewBox="0 0 130 68">
      {probs.map((p, i) => (
        <rect key={i}
          x={i * 13 + 1} y={62 - p * 58} width={11} height={p * 58}
          fill={i === 2 ? 'var(--gv-lime)' : 'var(--gv-cyan)'}
          opacity={i === 2 ? 1 : 0.35}
          rx={2}
          style={i === 2 ? { filter: 'drop-shadow(0 0 4px var(--gv-lime-soft))' } : {}}
        />
      ))}
      {probs.map((_, i) => (
        <text key={i} x={i * 13 + 6.5} y={68} fontSize="6" textAnchor="middle"
          fill="var(--gv-faint)" fontFamily="monospace">{i}</text>
      ))}
    </svg>
  )
}

function LayerColumn({ size, displayCount, colorVar }: {
  size: number; displayCount: number; colorVar: string
}) {
  const maxH = 220
  const r = Math.max(3.5, Math.min(9, maxH / (displayCount * 2.2)))
  const spacing = Math.min(22, (maxH - r * 2) / Math.max(1, displayCount - 1))
  const totalH = (displayCount - 1) * spacing + r * 2
  const startY = (maxH - totalH) / 2 + r

  const isInput = colorVar === 'var(--gv-muted)'

  return (
    <g>
      {Array.from({ length: displayCount }, (_, i) => (
        <circle key={i}
          cx={0} cy={startY + i * spacing}
          r={r}
          fill={isInput ? 'var(--gv-bg-2)' : 'var(--gv-cyan-soft)'}
          stroke={colorVar}
          strokeWidth={1.2}
          style={{ filter: !isInput ? `drop-shadow(0 0 3px var(--gv-cyan-soft))` : 'none' }}
        />
      ))}
      {size > displayCount && (
        <text x={0} y={maxH + 18} textAnchor="middle" fontSize="8" fill="var(--gv-faint)" fontFamily="monospace">
          +{size - displayCount}
        </text>
      )}
    </g>
  )
}

function AccordionItem({ title, color, children }: { title: string; color?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--gv-line)' }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors"
        style={{ background: open ? 'var(--gv-cyan-soft)' : 'var(--gv-panel-strong)' }}
      >
        <span className="font-heading font-semibold text-sm" style={{ color: color ?? 'var(--gv-text)' }}>{title}</span>
        <ChevronDown size={16} style={{ color: 'var(--gv-muted)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden', background: 'var(--gv-panel)' }}
          >
            <div className="px-5 pb-5 pt-4 text-sm leading-relaxed" style={{ color: 'var(--gv-muted)' }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ArchitecturePage() {
  const { archMode, setArchMode } = useUIStore()
  const [activeLayer, setActiveLayer] = useState<number | null>(null)
  const selected = ARCHITECTURES.find((a) => a.mode === archMode) ?? ARCHITECTURES[1]

  const displayCounts = selected.layers.map((l) => {
    if (l.size <= 10) return l.size
    if (l.size <= 32) return Math.min(l.size, 8)
    if (l.size <= 64) return 9
    if (l.size <= 128) return 11
    if (l.size <= 256) return 13
    return 14
  })
  // Fixed viewBox: always 820×360, columns spread evenly
  const VW = 820
  const VH = 360
  const DIAGRAM_H = 270
  const nCols = selected.layers.length
  const colPad = 54
  const colSpan = (VW - colPad * 2) / (nCols - 1 || 1)
  const colXs = selected.layers.map((_, i) =>
    nCols === 1 ? VW / 2 : colPad + i * colSpan
  )

  return (
    <div className="gv-page gv-page-band">
      <div className="gv-container py-10">

        {/* Header */}
        <div className="mb-10">
          <div className="gv-kicker mb-4">
            <span className="gv-dot" />
            Architecture Explorer
          </div>
          <h1 className="font-heading font-bold text-4xl sm:text-5xl mb-3 gv-title">
            MLP Architecture
          </h1>
          <p className="text-base gv-copy max-w-2xl">
            Multilayer Perceptrons — the foundational building block of deep learning.
            Compare how shallow, standard, and deep designs trade capacity against simplicity.
            Click any layer to inspect its math.
          </p>
        </div>

        {/* What is an MLP */}
        <div className="gv-panel-readable rounded-2xl p-6 mb-8">
          <h2 className="font-heading font-semibold text-xl mb-4" style={{ color: 'var(--gv-text)' }}>
            What is a Multilayer Perceptron?
          </h2>
          <div className="grid sm:grid-cols-3 gap-4 mb-5">
            {[
              { icon: <Brain size={20} />, title: 'Inspired by biology', body: 'Loosely modeled on biological neurons. Each artificial neuron computes a weighted sum of inputs, adds a bias, then passes through an activation function.' },
              { icon: <Layers size={20} />, title: 'Layered hierarchy', body: 'Each layer transforms its input into a new representation. Deeper layers capture more abstract features — edges → shapes → objects.' },
              { icon: <TrendingUp size={20} />, title: 'Trained by backprop', body: 'Gradient descent + chain rule. The model computes its error, calculates how each weight contributed, then nudges weights in the direction that reduces error.' },
            ].map((c) => (
              <div key={c.title} className="rounded-xl p-4" style={{ background: 'var(--gv-bg-2)', border: '1px solid var(--gv-line)' }}>
                <div className="mb-2" style={{ color: 'var(--gv-cyan)' }}>{c.icon}</div>
                <h3 className="font-heading font-semibold text-sm mb-1" style={{ color: 'var(--gv-text)' }}>{c.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--gv-muted)' }}>{c.body}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl p-4 text-sm" style={{ background: 'var(--gv-cyan-soft)', border: '1px solid color-mix(in srgb, var(--gv-cyan) 25%, transparent)' }}>
            <span className="font-code text-xs font-bold" style={{ color: 'var(--gv-cyan)' }}>Real world: </span>
            <span style={{ color: 'var(--gv-muted)' }}>
              MLPs power credit card fraud detection (Stripe, PayPal), medical diagnosis support (IBM Watson Health),
              ad click-through prediction (Google, Meta), and of course handwriting recognition — the task you're
              visualizing in GradVex right now.
            </span>
          </div>
        </div>

        {/* Architecture selector */}
        <div className="flex flex-wrap gap-3 mb-6">
          {ARCHITECTURES.map((a) => (
            <button key={a.mode} onClick={() => { setArchMode(a.mode); setActiveLayer(null) }}
              className="px-5 py-2.5 rounded-xl text-sm font-code transition-all"
              style={{
                background: archMode === a.mode ? 'var(--gv-cyan-soft)' : 'var(--gv-panel-strong)',
                border: `1px solid ${archMode === a.mode ? 'color-mix(in srgb, var(--gv-cyan) 40%, transparent)' : 'var(--gv-line)'}`,
                color: archMode === a.mode ? 'var(--gv-cyan)' : 'var(--gv-muted)',
                boxShadow: archMode === a.mode ? '0 0 16px var(--gv-cyan-soft)' : 'none',
              }}>
              {a.label}
              <span className="ml-2 opacity-60 text-xs">{a.sublabel}</span>
            </button>
          ))}
        </div>

        {/* SVG Architecture Diagram — fixed viewBox, always fits */}
        <div className="gv-panel-readable rounded-2xl p-5 mb-5">
          <p className="font-code text-[10px] uppercase mb-3" style={{ color: 'var(--gv-faint)' }}>
            Network diagram — click a layer to inspect
          </p>
          <svg
            width="100%"
            viewBox={`0 0 ${VW} ${VH}`}
            preserveAspectRatio="xMidYMid meet"
            style={{ display: 'block', maxHeight: '340px' }}
          >
            {selected.layers.map((layer, i) => {
              const cx = colXs[i]
              const dc = displayCounts[i]
              const r = Math.max(4, Math.min(10, DIAGRAM_H / (dc * 2.4)))
              const sp = (DIAGRAM_H - r * 2) / Math.max(1, dc - 1)
              const totalLayerH = (dc - 1) * sp + r * 2
              const startY = (DIAGRAM_H - totalLayerH) / 2 + r

              return (
                <g key={i} onClick={() => setActiveLayer(activeLayer === i ? null : i)}
                  style={{ cursor: 'pointer' }}>

                  {/* Active highlight */}
                  {activeLayer === i && (
                    <rect
                      x={cx - r * 2.2} y={0} width={r * 4.4} height={DIAGRAM_H}
                      rx={8} style={{ fill: 'var(--gv-cyan-soft)', stroke: 'var(--gv-cyan)' }}
                      strokeWidth={0.8} opacity={0.6}
                    />
                  )}

                  {/* Edges to next layer */}
                  {i < selected.layers.length - 1 && (() => {
                    const nextDc = displayCounts[i + 1]
                    const nextCx = colXs[i + 1]
                    const nr = Math.max(4, Math.min(10, DIAGRAM_H / (nextDc * 2.4)))
                    const nsp = (DIAGRAM_H - nr * 2) / Math.max(1, nextDc - 1)
                    const nextTotalH = (nextDc - 1) * nsp + nr * 2
                    const nextStartY = (DIAGRAM_H - nextTotalH) / 2 + nr
                    const lines = []
                    const maxFrom = Math.min(dc, 7)
                    const maxTo = Math.min(nextDc, 7)
                    for (let ni = 0; ni < maxFrom; ni++) {
                      for (let nj = 0; nj < maxTo; nj++) {
                        const sy = startY + ni * sp
                        const ey = nextStartY + nj * nsp
                        lines.push(
                          <line key={`${ni}-${nj}`}
                            x1={cx + r} y1={sy}
                            x2={nextCx - nr} y2={ey}
                            stroke="var(--gv-cyan)" strokeWidth={0.55}
                            opacity={0.14}
                          />
                        )
                      }
                    }
                    return lines
                  })()}

                  {/* Nodes */}
                  {Array.from({ length: dc }, (_, ni) => {
                    const cy = startY + ni * sp
                    const isInput = layer.color === 'var(--gv-muted)'
                    return (
                      <circle key={ni}
                        cx={cx} cy={cy} r={r}
                        style={{
                          fill: isInput ? 'var(--gv-bg-2)' : 'var(--gv-cyan-soft)',
                          stroke: layer.color,
                        }}
                        strokeWidth={activeLayer === i ? 1.8 : 1.2}
                      />
                    )
                  })}

                  {/* +N more label */}
                  {layer.size > dc && (
                    <text x={cx} y={DIAGRAM_H - 2} textAnchor="middle"
                      fontSize="8" style={{ fill: 'var(--gv-faint)' }} fontFamily="monospace">
                      +{layer.size - dc}
                    </text>
                  )}

                  {/* Layer name */}
                  <text x={cx} y={DIAGRAM_H + 18} textAnchor="middle"
                    fontSize="11" fontFamily="Space Grotesk, sans-serif" fontWeight="600"
                    style={{ fill: activeLayer === i ? 'var(--gv-cyan)' : 'var(--gv-text)' }}>
                    {layer.name}
                  </text>
                  <text x={cx} y={DIAGRAM_H + 31} textAnchor="middle"
                    fontSize="9" fontFamily="monospace" style={{ fill: 'var(--gv-faint)' }}>
                    {layer.size.toLocaleString()}
                  </text>
                  {layer.fn !== 'none' && (
                    <text x={cx} y={DIAGRAM_H + 44} textAnchor="middle"
                      fontSize="9" fontFamily="monospace"
                      style={{ fill: layer.fn === 'Softmax' ? 'var(--gv-lime)' : 'var(--gv-cyan)' }}>
                      {layer.fn}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>

        {/* Layer detail card */}
        <AnimatePresence>
          {activeLayer !== null && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="gv-panel rounded-2xl p-5 mb-5">
              <div className="flex flex-wrap items-start gap-6">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <h3 className="font-heading font-semibold text-lg"
                      style={{ color: selected.layers[activeLayer].color === 'var(--gv-muted)' ? 'var(--gv-muted)' : 'var(--gv-cyan)' }}>
                      {selected.layers[activeLayer].name}
                    </h3>
                    <span className="font-code text-[10px] px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--gv-bg-2)', border: '1px solid var(--gv-line)', color: 'var(--gv-faint)' }}>
                      {selected.layers[activeLayer].size} neurons
                    </span>
                    {selected.layers[activeLayer].fn !== 'none' && (
                      <span className="font-code text-[10px] px-2 py-0.5 rounded-full"
                        style={{ background: 'var(--gv-cyan-soft)', border: '1px solid color-mix(in srgb, var(--gv-cyan) 30%, transparent)', color: 'var(--gv-cyan)' }}>
                        {selected.layers[activeLayer].fn}
                      </span>
                    )}
                  </div>
                  <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--gv-muted)' }}>
                    {selected.layers[activeLayer].desc}
                  </p>
                  <div className="rounded-xl p-4" style={{ background: 'var(--gv-bg-2)', border: '1px solid var(--gv-line)' }}>
                    <p className="font-code text-[10px] uppercase mb-1" style={{ color: 'var(--gv-faint)' }}>Activation function</p>
                    <p className="font-code text-base mb-1" style={{ color: 'var(--gv-cyan)' }}>
                      {FN_INFO[selected.layers[activeLayer].fn].formula}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--gv-muted)' }}>
                      {FN_INFO[selected.layers[activeLayer].fn].desc}
                    </p>
                  </div>
                </div>
                <div className="flex-none flex flex-col items-center gap-2">
                  {selected.layers[activeLayer].fn === 'ReLU' && (
                    <>
                      <p className="font-code text-[10px] uppercase" style={{ color: 'var(--gv-faint)' }}>ReLU graph</p>
                      <ReluGraph />
                    </>
                  )}
                  {selected.layers[activeLayer].fn === 'Softmax' && (
                    <>
                      <p className="font-code text-[10px] uppercase" style={{ color: 'var(--gv-faint)' }}>Softmax output</p>
                      <SoftmaxBar />
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats + description row */}
        <div className="grid sm:grid-cols-2 gap-5 mb-8">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <Zap size={14} />, label: 'Parameters', value: selected.params.toLocaleString(), col: 'var(--gv-cyan)' },
              { icon: <Layers size={14} />, label: 'Layers', value: String(selected.layers.length), col: 'var(--gv-muted)' },
              { icon: <TrendingUp size={14} />, label: 'MNIST Accuracy', value: selected.accuracy, col: 'var(--gv-lime)' },
              { icon: <Brain size={14} />, label: 'Overfit Risk', value: selected.risk, col: 'var(--gv-coral)' },
            ].map((s) => (
              <div key={s.label} className="gv-panel-solid rounded-xl p-4">
                <div className="flex items-center gap-1.5 mb-2" style={{ color: s.col }}>{s.icon}
                  <p className="font-code text-[10px] uppercase" style={{ color: 'var(--gv-faint)' }}>{s.label}</p>
                </div>
                <p className="font-heading text-xl font-bold" style={{ color: s.col }}>{s.value}</p>
              </div>
            ))}
          </div>
          {/* Description */}
          <div className="gv-panel-solid rounded-xl p-5 flex flex-col justify-between">
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--gv-muted)' }}>{selected.description}</p>
            <div>
              <p className="font-code text-[10px] uppercase mb-2" style={{ color: 'var(--gv-faint)' }}>Real-world use cases</p>
              <ul className="space-y-1">
                {selected.realWorld.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-xs" style={{ color: 'var(--gv-muted)' }}>
                    <span className="mt-1 flex-none w-1.5 h-1.5 rounded-full" style={{ background: 'var(--gv-lime)' }} />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Pros / Cons */}
        <div className="grid sm:grid-cols-2 gap-5 mb-10">
          <div className="gv-panel-readable rounded-2xl p-5">
            <h3 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2" style={{ color: 'var(--gv-lime)' }}>
              <CheckCircle2 size={16} /> Advantages
            </h3>
            <ul className="space-y-3">
              {selected.pros.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm" style={{ color: 'var(--gv-muted)' }}>
                  <span className="mt-0.5 flex-none rounded-lg p-1" style={{ background: 'var(--gv-lime-soft)' }}>
                    <CheckCircle2 size={12} style={{ color: 'var(--gv-lime)' }} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="gv-panel-readable rounded-2xl p-5">
            <h3 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2" style={{ color: 'var(--gv-coral)' }}>
              <XCircle size={16} /> Disadvantages
            </h3>
            <ul className="space-y-3">
              {selected.cons.map((c) => (
                <li key={c} className="flex items-start gap-3 text-sm" style={{ color: 'var(--gv-muted)' }}>
                  <span className="mt-0.5 flex-none rounded-lg p-1" style={{ background: 'var(--gv-coral-soft)' }}>
                    <XCircle size={12} style={{ color: 'var(--gv-coral)' }} />
                  </span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Educational accordions */}
        <div className="mb-10">
          <h2 className="font-heading font-bold text-2xl mb-5" style={{ color: 'var(--gv-text)' }}>
            Deep dive — concepts explained
          </h2>
          <div className="space-y-3">
            <AccordionItem title="Why ReLU? Why not sigmoid or tanh?" color="var(--gv-cyan)">
              <p className="mb-3">
                <strong style={{ color: 'var(--gv-cyan)' }}>ReLU: f(x) = max(0, x)</strong> — the most common hidden-layer activation since ~2012.
              </p>
              <p className="mb-3">
                Before ReLU, sigmoid (f(x) = 1/(1+e⁻ˣ)) was standard. The problem: sigmoid saturates — for large positive or negative inputs, the gradient approaches zero. In a deep network with 4+ layers, gradients shrink to near-zero before reaching early layers. This is the <strong>vanishing gradient problem</strong>, and it makes training slow or impossible.
              </p>
              <p className="mb-3">
                ReLU doesn&apos;t saturate for positive inputs — its gradient is always exactly 1 there. This makes gradients flow cleanly through many layers.
              </p>
              <p className="mb-3">
                <strong style={{ color: 'var(--gv-coral)' }}>Trade-off — &quot;dying ReLU&quot;:</strong> neurons with negative pre-activation get zero gradient and can stop learning entirely. Solutions: Leaky ReLU (f(x) = max(0.01x, x)), ELU, GELU (used in GPT/BERT).
              </p>
              <div className="rounded-lg p-3 text-xs font-code" style={{ background: 'var(--gv-bg-2)', color: 'var(--gv-muted)' }}>
                Real world: ResNet (image recognition), BERT (NLP), and this GradVex model all use ReLU or variants.
              </div>
            </AccordionItem>

            <AccordionItem title="Why Softmax at the output layer?" color="var(--gv-lime)">
              <p className="mb-3">
                The output layer produces 10 raw numbers called <strong>logits</strong> — one per digit class. Logits can be any real number (positive, negative, large, small). They&apos;re not probabilities yet.
              </p>
              <p className="mb-3">
                <strong style={{ color: 'var(--gv-lime)' }}>Softmax</strong> converts logits to a proper probability distribution:
                <br /><code className="font-code">p(class i) = e^logit_i / sum(e^logit_j for all j)</code>
              </p>
              <p className="mb-3">
                Key properties: (1) All outputs are positive. (2) All outputs sum to 1. (3) The highest logit gets the largest probability.
              </p>
              <p className="mb-3">
                The <strong>Cross-Entropy loss</strong> then measures how low the correct class&apos;s probability is: loss = -log(p_correct). If the model assigns 99% to the right class, loss ≈ 0.01. If it assigns 1%, loss ≈ 4.6.
              </p>
              <div className="rounded-lg p-3 text-xs font-code" style={{ background: 'var(--gv-bg-2)', color: 'var(--gv-muted)' }}>
                Real world: Every modern classifier ends with Softmax + Cross-Entropy — ChatGPT&apos;s token prediction, image classifiers, speech recognition label outputs.
              </div>
            </AccordionItem>

            <AccordionItem title="What do weights encode? What are biases?" color="var(--gv-violet)">
              <p className="mb-3">
                <strong style={{ color: 'var(--gv-violet)' }}>Weights</strong> are the model&apos;s learned parameters — a real number per connection. For H1, W¹[i][j] controls how strongly pixel j influences neuron i.
              </p>
              <p className="mb-3">
                In the first hidden layer, when you visualize a single neuron&apos;s 784 incoming weights as a 28×28 grid, you often see edge detectors — one neuron might have high positive weights in a horizontal band, effectively detecting horizontal strokes.
              </p>
              <p className="mb-3">
                <strong style={{ color: 'var(--gv-violet)' }}>Biases</strong> are per-neuron offsets added before activation. Without bias, every neuron&apos;s decision boundary must pass through the origin — losing a full degree of freedom. Adding bias b shifts the threshold: neuron fires when Wx + b &gt; 0 rather than Wx &gt; 0.
              </p>
              <p className="mb-3">
                Try GradVex&apos;s <strong>Break It mode → disable biases</strong>: the model struggles with off-center or unusually positioned digits.
              </p>
              <div className="rounded-lg p-3 text-xs font-code" style={{ background: 'var(--gv-bg-2)', color: 'var(--gv-muted)' }}>
                Initialization matters: weights start at random values (Xavier/He init) to break symmetry. If all weights start at 0, all neurons compute the same gradient and learn the same feature forever.
              </div>
            </AccordionItem>

            <AccordionItem title="How does training work? Backpropagation explained." color="var(--gv-coral)">
              <p className="mb-3">
                Training is the process of finding weights that minimize loss on the training set. The algorithm:
              </p>
              <ol className="list-decimal list-inside space-y-2 mb-3 text-sm">
                <li><strong>Forward pass</strong>: feed input through all layers, compute prediction and loss</li>
                <li><strong>Backward pass</strong>: compute ∂loss/∂weight for every weight using the chain rule</li>
                <li><strong>Update</strong>: subtract a small fraction of the gradient from each weight: w ← w − η·∂loss/∂w</li>
                <li><strong>Repeat</strong> over mini-batches of 32–256 samples for many epochs</li>
              </ol>
              <p className="mb-3">
                <strong style={{ color: 'var(--gv-coral)' }}>Adam optimizer</strong> (used in GradVex) improves plain gradient descent: it keeps a running mean and variance of past gradients and adapts the learning rate per-parameter. Effectively: parameters that rarely update get a larger nudge; noisy parameters get a smaller one.
              </p>
              <div className="rounded-lg p-3 text-xs font-code" style={{ background: 'var(--gv-bg-2)', color: 'var(--gv-muted)' }}>
                GradVex model was trained for 10 epochs, batch size 64, learning rate 1e-3 with Adam, achieving &gt;97% test accuracy in ~30 seconds on a CPU.
              </div>
            </AccordionItem>

            <AccordionItem title="MLP vs CNN vs Transformer — when to use which?" color="var(--gv-muted)">
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-code" style={{ minWidth: '480px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--gv-line)' }}>
                      {['Model', 'Input type', 'Spatial awareness', 'Best for', 'Weakness'].map(h => (
                        <th key={h} className="py-2 pr-4 text-left" style={{ color: 'var(--gv-faint)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['MLP', 'Fixed vectors', 'None — all pixels equal', 'Tabular data, simple images', 'No translation invariance'],
                      ['CNN', 'Grid (image/audio)', 'Local receptive fields', 'Images, video, audio', 'Long-range dependencies'],
                      ['Transformer', 'Sequences / patches', 'Attention over all positions', 'NLP, vision, multimodal', 'Quadratic cost with length'],
                    ].map(([model, ...rest]) => (
                      <tr key={model} style={{ borderBottom: '1px solid var(--gv-line)' }}>
                        <td className="py-2 pr-4 font-bold" style={{ color: 'var(--gv-cyan)' }}>{model}</td>
                        {rest.map((cell, i) => (
                          <td key={i} className="py-2 pr-4" style={{ color: 'var(--gv-muted)' }}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-xs" style={{ color: 'var(--gv-muted)' }}>
                Modern vision models (ViT) use Transformers. CNNs (ResNet, EfficientNet) still dominate edge devices. MLPs are the baseline — always try MLP on tabular data before anything else.
              </p>
            </AccordionItem>
          </div>
        </div>

        {/* Architecture comparison table */}
        <div className="gv-panel-solid rounded-2xl overflow-hidden mb-10">
          <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--gv-line)' }}>
            <h2 className="font-heading font-semibold text-base" style={{ color: 'var(--gv-text)' }}>Architecture comparison</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--gv-faint)' }}>Click a row to switch architecture</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-code" style={{ minWidth: '480px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--gv-line)' }}>
                  {['Architecture', 'Shape', 'Parameters', 'Accuracy', 'Train speed', 'Overfit risk'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left" style={{ color: 'var(--gv-faint)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ARCHITECTURES.map((a) => (
                  <tr key={a.mode} onClick={() => { setArchMode(a.mode); setActiveLayer(null) }}
                    className="transition-colors"
                    style={{
                      borderBottom: '1px solid var(--gv-line)',
                      background: archMode === a.mode ? 'var(--gv-cyan-soft)' : 'transparent',
                      cursor: 'pointer',
                    }}>
                    <td className="px-5 py-3 font-bold" style={{ color: archMode === a.mode ? 'var(--gv-cyan)' : 'var(--gv-text)' }}>{a.label}</td>
                    <td className="px-5 py-3" style={{ color: 'var(--gv-muted)' }}>{a.sublabel}</td>
                    <td className="px-5 py-3" style={{ color: 'var(--gv-muted)' }}>{a.params.toLocaleString()}</td>
                    <td className="px-5 py-3 font-bold" style={{ color: 'var(--gv-lime)' }}>{a.accuracy}</td>
                    <td className="px-5 py-3" style={{ color: 'var(--gv-muted)' }}>{a.trainTime}</td>
                    <td className="px-5 py-3" style={{ color: 'var(--gv-coral)' }}>{a.risk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
