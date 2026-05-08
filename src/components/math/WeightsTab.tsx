'use client'

import { useState } from 'react'
import { useNetworkStore } from '@/store/networkStore'

type LayerKey = 'W1' | 'W2' | 'W3' | 'b1' | 'b2' | 'b3'

const WEIGHT_META: { key: LayerKey; label: string; shape: string; purpose: string }[] = [
  { key: 'W1', label: 'W1 Input to Hidden 1', shape: '128 x 784', purpose: 'Learns low-level stroke and pixel detectors.' },
  { key: 'b1', label: 'b1 Hidden 1 bias', shape: '128', purpose: 'Sets activation thresholds for first-layer features.' },
  { key: 'W2', label: 'W2 Hidden 1 to Hidden 2', shape: '64 x 128', purpose: 'Combines strokes into digit-part features.' },
  { key: 'b2', label: 'b2 Hidden 2 bias', shape: '64', purpose: 'Shifts thresholds for higher-level shape detectors.' },
  { key: 'W3', label: 'W3 Hidden 2 to Output', shape: '10 x 64', purpose: 'Maps learned features to digit class evidence.' },
  { key: 'b3', label: 'b3 Output bias', shape: '10', purpose: 'Adjusts baseline likelihood for each output class.' },
]

export function WeightsTab() {
  const { weights } = useNetworkStore()
  const [selected, setSelected] = useState<LayerKey>('W1')

  if (!weights) {
    return <p className="py-4 text-sm font-code gv-muted">Weights are still loading.</p>
  }

  const data = weights[selected]
  const meta = WEIGHT_META.find((m) => m.key === selected)!
  const isMatrix = Array.isArray(data[0])
  const flat = isMatrix ? (data as number[][]).flat() : (data as number[])
  const max = Math.max(...flat.map(Math.abs))
  const min = Math.min(...flat)
  const mean = flat.reduce((a, b) => a + b, 0) / flat.length
  const positive = flat.filter((v) => v > 0).length
  const negative = flat.filter((v) => v < 0).length

  return (
    <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
      <section className="gv-panel-readable rounded-2xl p-5">
        <p className="font-code text-[10px] uppercase gv-faint">Parameter block</p>
        <h3 className="mt-1 font-heading text-2xl font-semibold">{meta.label}</h3>
        <p className="mt-2 text-sm gv-muted">{meta.purpose}</p>
        <p className="mt-3 font-code text-xs gv-cyan">Shape: {meta.shape}</p>

        <div className="mt-5 grid gap-2">
          {WEIGHT_META.map((m) => (
            <button
              key={m.key}
              onClick={() => setSelected(m.key)}
              className="rounded-xl border px-3 py-2 text-left font-code text-xs transition-all"
              style={{
                background: selected === m.key ? 'var(--gv-cyan-soft)' : 'var(--gv-panel-strong)',
                borderColor: selected === m.key ? 'color-mix(in srgb, var(--gv-cyan) 35%, transparent)' : 'var(--gv-line)',
                color: selected === m.key ? 'var(--gv-cyan)' : 'var(--gv-muted)',
              }}
            >
              <span className="font-bold">{m.key}</span> <span className="opacity-70">{m.shape}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="gv-panel-readable rounded-2xl p-5">
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            ['Min', min.toFixed(4), 'var(--gv-coral)'],
            ['Mean', mean.toFixed(4), 'var(--gv-muted)'],
            ['Max |w|', max.toFixed(4), 'var(--gv-cyan)'],
            ['Sign split', `${positive}+ / ${negative}-`, 'var(--gv-lime)'],
          ].map(([label, value, color]) => (
            <div key={label} className="rounded-xl border p-3" style={{ borderColor: 'var(--gv-line)', background: 'var(--gv-bg-2)' }}>
              <p className="font-code text-[10px] uppercase gv-faint">{label}</p>
              <p className="mt-1 text-lg font-code font-semibold" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <p className="mb-2 font-code text-[10px] uppercase gv-faint">
            Heatmap: first {isMatrix ? '20 x 20 slice' : `${Math.min(flat.length, 128)} values`}
          </p>
          <div className="overflow-hidden rounded-xl border p-2" style={{ borderColor: 'var(--gv-line)', background: 'var(--gv-bg-2)' }}>
            <div className="flex flex-wrap gap-[2px]" style={{ maxWidth: isMatrix ? 438 : 360 }}>
              {flat.slice(0, isMatrix ? 400 : 128).map((v, i) => {
                const norm = Math.abs(v) / (max || 1)
                return (
                  <div
                    key={i}
                    title={v.toFixed(4)}
                    style={{
                      width: isMatrix ? 20 : 14,
                      height: isMatrix ? 20 : 14,
                      borderRadius: 4,
                      background: v >= 0
                        ? `color-mix(in srgb, var(--gv-cyan) ${Math.round(norm * 88)}%, var(--gv-bg-2))`
                        : `color-mix(in srgb, var(--gv-coral) ${Math.round(norm * 88)}%, var(--gv-bg-2))`,
                    }}
                  />
                )
              })}
            </div>
          </div>
          <p className="mt-3 text-xs gv-muted">
            Cyan cells excite downstream neurons; coral cells suppress them. Stronger intensity means the model relies more heavily on that connection.
          </p>
        </div>
      </section>
    </div>
  )
}
