'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNetworkStore } from '@/store/networkStore'
import { useUIStore } from '@/store/uiStore'

const SVG_W = 700
const SVG_H = 440

const COL = { input: 52, h1: 210, h2: 410, output: 600 }
const CENTER_Y = SVG_H / 2

const H1_DISPLAY = 14
const H2_DISPLAY = 10
const H1_REAL = 128
const H2_REAL = 64

function nodeYs(count: number): number[] {
  const pad = 32
  const spacing = (SVG_H - 2 * pad) / (count - 1)
  return Array.from({ length: count }, (_, i) => pad + i * spacing)
}

function edgeStroke(w: number, hasResult: boolean): string {
  if (!hasResult) return 'rgba(125,144,139,0.12)'
  const mag = Math.min(1, Math.abs(w) * 4)
  const alpha = 0.06 + mag * 0.5
  return w >= 0
    ? `rgba(155,255,254,${alpha.toFixed(2)})`
    : `rgba(201,179,255,${alpha.toFixed(2)})`
}

function edgeWidth(w: number, hasResult: boolean): number {
  if (!hasResult) return 0.35
  return Math.max(0.2, Math.min(2, Math.abs(w) * 2.5))
}

function nodeColor(v: number, hasResult: boolean): string {
  if (!hasResult || v <= 0) return 'var(--gv-bg-2)'
  const t = Math.min(1, v * 1.2)
  const r = Math.round(0   + t * 202)
  const g = Math.round(110 + t * 145)
  const b = Math.round(110 - t * 23)
  return `rgb(${r},${g},${b})`
}

function nodeGlow(v: number, isPred: boolean): string {
  if (isPred) return 'drop-shadow(0 0 8px rgba(202,255,135,0.9))'
  if (v > 0.5) return 'drop-shadow(0 0 6px rgba(155,255,254,0.8))'
  if (v > 0.1) return 'drop-shadow(0 0 3px rgba(155,255,254,0.4))'
  return 'none'
}

interface TooltipInfo {
  x: number; y: number; layer: string; index: number
  activation: number; preActivation?: number
}

export function NetworkVisualizer() {
  const { result, weights } = useNetworkStore()
  const { animating } = useUIStore()
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null)

  const h1Ys = useMemo(() => nodeYs(H1_DISPLAY), [])
  const h2Ys = useMemo(() => nodeYs(H2_DISPLAY), [])
  const outYs = useMemo(() => nodeYs(10), [])

  const h1Idx = useMemo(() =>
    Array.from({ length: H1_DISPLAY }, (_, i) => Math.floor(i * H1_REAL / H1_DISPLAY)), [])
  const h2Idx = useMemo(() =>
    Array.from({ length: H2_DISPLAY }, (_, i) => Math.floor(i * H2_REAL / H2_DISPLAY)), [])

  const animDelay = (d: number) =>
    animating ? { animation: `edgeFlow 1.1s ease-out ${d.toFixed(2)}s both` } : undefined

  const tx = tooltip ? Math.min(tooltip.x, SVG_W - 145) : 0
  const ty = tooltip ? Math.max(tooltip.y - 38, 8) : 0

  return (
    <div className="relative w-full">
      <svg width="100%" viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="block overflow-visible">

        {/* ─── Layer labels ─────────────────────────────── */}
        {[
          { x: COL.input,  label: 'Input',    sub: '784 px',     col: 'var(--gv-muted)' },
          { x: COL.h1,     label: 'Hidden 1', sub: '128·ReLU',   col: 'var(--gv-cyan)' },
          { x: COL.h2,     label: 'Hidden 2', sub: '64·ReLU',    col: 'var(--gv-cyan)' },
          { x: COL.output, label: 'Output',   sub: '10·Softmax', col: 'var(--gv-lime)' },
        ].map(({ x, label, sub, col }) => (
          <g key={label}>
            <text x={x} y={15} textAnchor="middle" style={{ fill: col }}
              fontSize={11} fontFamily="Space Grotesk" fontWeight="600">{label}</text>
            <text x={x} y={26} textAnchor="middle" style={{ fill: 'var(--gv-faint)' }}
              fontSize={9} fontFamily="JetBrains Mono">{sub}</text>
          </g>
        ))}

        {/* ─── Input pixel grid (28×28) ─────────────────── */}
        {result?.inputTensor
          ? Array.from({ length: 28 }, (_, row) =>
              Array.from({ length: 28 }, (_, col) => {
                const v = result.inputTensor[row * 28 + col]
                if (v < 0.02) return null
                const lum = Math.round(v * 255)
                return (
                  <rect key={`px-${row}-${col}`}
                    x={COL.input - 28 + col * 2} y={CENTER_Y - 28 + row * 2}
                    width={2} height={2}
                    fill={`rgb(${lum},${Math.round(lum*0.8+50)},${Math.round(lum*0.8+50)})`}
                  />
                )
              })
            )
          : <>
              <rect x={COL.input-28} y={CENTER_Y-28} width={56} height={56}
                style={{ fill: 'var(--gv-bg-2)', stroke: 'var(--gv-line)' }} rx={4}
                strokeWidth={1} />
              <text x={COL.input} y={CENTER_Y+4} textAnchor="middle"
                style={{ fill: 'var(--gv-faint)' }} fontSize={9} fontFamily="JetBrains Mono">28×28</text>
            </>
        }

        {/* ─── Input → H1 edges ─────────────────────────── */}
        {h1Ys.map((y, i) => {
          const w = weights?.W1[392]?.[h1Idx[i]] ?? 0
          return (
            <line key={`in-h1-${i}`}
              x1={COL.input} y1={CENTER_Y}
              x2={COL.h1} y2={y}
              stroke={edgeStroke(w, !!result)}
              strokeWidth={edgeWidth(w, !!result)}
              style={animDelay(i * 0.04)}
            />
          )
        })}

        {/* ─── H1 → H2 edges (first 5 H1 nodes) ─────────── */}
        {h1Ys.slice(0, 5).map((y1, i) =>
          h2Ys.map((y2, j) => {
            const w = weights?.W2[h1Idx[i]]?.[h2Idx[j]] ?? 0
            return (
              <line key={`h1h2-${i}-${j}`}
                x1={COL.h1} y1={y1} x2={COL.h2} y2={y2}
                stroke={edgeStroke(w, !!result)}
                strokeWidth={edgeWidth(w, !!result) * 0.65}
                style={animDelay(0.22 + j * 0.025)}
              />
            )
          })
        )}

        {/* ─── H2 → Output edges ────────────────────────── */}
        {h2Ys.map((y1, i) =>
          outYs.map((y2, j) => {
            const w = weights?.W3[h2Idx[i]]?.[j] ?? 0
            return (
              <line key={`h2out-${i}-${j}`}
                x1={COL.h2} y1={y1} x2={COL.output} y2={y2}
                stroke={edgeStroke(w, !!result)}
                strokeWidth={edgeWidth(w, !!result) * 0.8}
                style={animDelay(0.45 + j * 0.04)}
              />
            )
          })
        )}

        {/* ─── H1 nodes ─────────────────────────────────── */}
        {h1Ys.map((y, i) => {
          const idx  = h1Idx[i]
          const post = result?.layer1Post[idx] ?? 0
          const pre  = result?.layer1Pre[idx]  ?? 0
          return (
            <g key={`h1-${i}`} style={{ cursor: 'pointer' }}
              onMouseEnter={() => setTooltip({ x: COL.h1+16, y, layer: 'H1', index: idx, activation: post, preActivation: pre })}
              onMouseLeave={() => setTooltip(null)}>
              <motion.circle cx={COL.h1} cy={y}
                fill={nodeColor(post, !!result)}
                strokeWidth={1}
                style={{ stroke: post > 0.05 ? 'var(--gv-cyan)' : 'var(--gv-line)', filter: nodeGlow(post, false) }}
                initial={{ r: 5 }}
                animate={animating ? { r: [5, 7, 5.5] } : { r: 5 }}
                transition={{ delay: i * 0.02, duration: 0.4 }}
              />
            </g>
          )
        })}
        <text x={COL.h1} y={SVG_H-4} textAnchor="middle" style={{ fill: 'var(--gv-faint)' }} fontSize={8} fontFamily="JetBrains Mono">
          +{H1_REAL - H1_DISPLAY} more
        </text>

        {/* ─── H2 nodes ─────────────────────────────────── */}
        {h2Ys.map((y, i) => {
          const idx  = h2Idx[i]
          const post = result?.layer2Post[idx] ?? 0
          const pre  = result?.layer2Pre[idx]  ?? 0
          return (
            <g key={`h2-${i}`} style={{ cursor: 'pointer' }}
              onMouseEnter={() => setTooltip({ x: COL.h2+16, y, layer: 'H2', index: idx, activation: post, preActivation: pre })}
              onMouseLeave={() => setTooltip(null)}>
              <motion.circle cx={COL.h2} cy={y}
                fill={nodeColor(post, !!result)}
                strokeWidth={1}
                style={{ stroke: post > 0.05 ? 'var(--gv-cyan)' : 'var(--gv-line)', filter: nodeGlow(post, false) }}
                initial={{ r: 6 }}
                animate={animating ? { r: [6, 9, 6.5] } : { r: 6 }}
                transition={{ delay: 0.28 + i * 0.03, duration: 0.4 }}
              />
            </g>
          )
        })}
        <text x={COL.h2} y={SVG_H-4} textAnchor="middle" style={{ fill: 'var(--gv-faint)' }} fontSize={8} fontFamily="JetBrains Mono">
          +{H2_REAL - H2_DISPLAY} more
        </text>

        {/* ─── Output nodes ─────────────────────────────── */}
        {outYs.map((y, i) => {
          const prob  = result?.outputProbs[i]  ?? 0
          const logit = result?.outputLogits[i] ?? 0
          const isPred = result?.prediction === i
          return (
            <g key={`out-${i}`} style={{ cursor: 'pointer' }}
              onMouseEnter={() => setTooltip({ x: COL.output+18, y, layer: 'Out', index: i, activation: prob, preActivation: logit })}
              onMouseLeave={() => setTooltip(null)}>

              {/* Pulse ring for top prediction */}
              {isPred && animating && (
                <motion.circle cx={COL.output} cy={y} r={7}
                  fill="none" stroke="#caff87" strokeWidth={1}
                  animate={{ r: [7, 16], opacity: [0.8, 0] }}
                  transition={{ duration: 0.8, repeat: 1 }}
                />
              )}

              <motion.circle cx={COL.output} cy={y}
                fill={nodeColor(prob, !!result)}
                strokeWidth={isPred ? 2 : 1}
                style={{ stroke: isPred ? 'var(--gv-lime)' : 'var(--gv-line)', filter: nodeGlow(prob, isPred) }}
                initial={{ r: 7 }}
                animate={animating ? { r: [7, 10.5, 7.5] } : { r: 7 }}
                transition={{ delay: 0.5 + i * 0.04, duration: 0.4 }}
              />
              {/* Digit label */}
              <text x={COL.output + 16} y={y + 4} fontSize={13} fontFamily="JetBrains Mono"
                style={{ fill: isPred ? 'var(--gv-lime)' : 'var(--gv-muted)' }} fontWeight={isPred ? 'bold' : 'normal'}>
                {i}
              </text>
              {/* Probability */}
              {result && (
                <text x={COL.output + 30} y={y + 4} fontSize={9} fontFamily="JetBrains Mono"
                  style={{ fill: isPred ? 'var(--gv-lime)' : 'var(--gv-faint)' }}>
                  {(prob * 100).toFixed(0)}%
                </text>
              )}
            </g>
          )
        })}

        {/* ─── Hover tooltip ────────────────────────────── */}
        <AnimatePresence>
          {tooltip && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <rect x={tx} y={ty} width={138} height={52} rx={6}
                style={{ fill: 'var(--gv-panel-strong)', stroke: 'var(--gv-line)' }} strokeWidth={1} />
              <text x={tx+8} y={ty+16} fontSize={9} fontFamily="JetBrains Mono" style={{ fill: 'var(--gv-faint)' }}>
                {tooltip.layer}[{tooltip.index}]
              </text>
              <text x={tx+8} y={ty+30} fontSize={11} fontFamily="JetBrains Mono" style={{ fill: 'var(--gv-cyan)' }}>
                act: {tooltip.activation.toFixed(4)}
              </text>
              {tooltip.preActivation !== undefined && (
                <text x={tx+8} y={ty+44} fontSize={9} fontFamily="JetBrains Mono" style={{ fill: 'var(--gv-muted)' }}>
                  z: {tooltip.preActivation.toFixed(4)}
                </text>
              )}
            </motion.g>
          )}
        </AnimatePresence>
      </svg>

      {!result && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="font-code text-sm gv-faint">
            Draw a digit to fire the network
          </p>
        </div>
      )}
    </div>
  )
}
