'use client'

import { useBreakItStore } from '@/store/breakItStore'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { FlaskConical, RotateCcw } from 'lucide-react'

// ── Vertical (original) variant ───────────────────────────────────────────────

const experiments = [
  {
    title: 'Disable biases',
    body: 'Sets every b term to zero. Neurons lose their learned thresholds, so off-center or faint strokes become harder to classify.',
  },
  {
    title: 'Weight noise',
    body: 'Adds random perturbation to learned weights. This simulates corrupted training or model drift in production systems.',
  },
  {
    title: 'Zero layer weights',
    body: 'Cuts an entire information path. W1 removes pixel-to-feature learning, W2 removes shape composition, W3 removes final class mapping.',
  },
]

// ── Horizontal bar variant (used in playground below the grid) ────────────────

export function BreakItBar() {
  const {
    active, biasDisabled, weightNoise, zeroedLayers,
    score, total,
    setActive, toggleBias, setNoise, toggleLayer, resetAll,
  } = useBreakItStore()

  return (
    <div className="gv-panel-solid rounded-2xl overflow-hidden">
      {/* Header row */}
      <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b"
        style={{ borderColor: 'var(--gv-line)', background: 'var(--gv-panel-strong)' }}>
        <div className="flex items-center gap-2">
          <FlaskConical size={14} style={{ color: active ? 'var(--gv-coral)' : 'var(--gv-faint)' }} />
          <span className="font-heading font-semibold text-sm">Break It Mode</span>
          <span className="font-code text-[10px] gv-faint">— damage the network and watch it fail</span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          {total > 0 && (
            <span className="font-code text-[10px]" style={{ color: 'var(--gv-coral)' }}>
              Score: {score}/{total}
            </span>
          )}
          <Switch checked={active} onCheckedChange={setActive} />
        </div>
      </div>

      {/* Controls row — only when active */}
      {active && (
        <div className="flex flex-wrap items-start gap-5 px-5 py-4">

          {/* Disable biases */}
          <div className="flex items-center gap-3 min-w-[180px]">
            <div className="flex-1">
              <p className="text-xs font-code font-semibold">Disable biases</p>
              <p className="text-[10px] gv-muted mt-0.5">Removes learned thresholds</p>
            </div>
            <Switch checked={biasDisabled} onCheckedChange={toggleBias} />
          </div>

          <div className="h-8 border-l self-center" style={{ borderColor: 'var(--gv-line)' }} />

          {/* Weight noise */}
          <div className="flex-1 min-w-[180px] max-w-[260px]">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs font-code font-semibold">Weight noise</p>
                <p className="text-[10px] gv-muted">Randomly distorts connections</p>
              </div>
              <span className="text-xs font-code ml-3"
                style={{ color: weightNoise > 0.3 ? 'var(--gv-coral)' : weightNoise > 0 ? 'var(--gv-lime)' : 'var(--gv-muted)' }}>
                {Math.round(weightNoise * 100)}%
              </span>
            </div>
            <Slider
              min={0} max={1} step={0.01}
              value={[weightNoise]}
              onValueChange={(vals) => setNoise(typeof vals === 'number' ? vals : (vals as number[])[0])}
            />
          </div>

          <div className="h-8 border-l self-center" style={{ borderColor: 'var(--gv-line)' }} />

          {/* Zero layer */}
          <div className="min-w-[160px]">
            <p className="text-xs font-code font-semibold mb-1">Zero layer weights</p>
            <div className="flex gap-2">
              {[
                { idx: 1, label: 'W1', hint: 'Pixels → features' },
                { idx: 2, label: 'W2', hint: 'Features → shapes' },
                { idx: 3, label: 'W3', hint: 'Shapes → digits' },
              ].map(({ idx, label, hint }) => {
                const selected = zeroedLayers.includes(idx)
                return (
                  <button
                    key={idx}
                    onClick={() => toggleLayer(idx)}
                    title={hint}
                    className="flex-1 rounded-lg border py-1.5 text-xs font-code transition-all"
                    style={{
                      background: selected ? 'var(--gv-coral-soft)' : 'var(--gv-panel-strong)',
                      borderColor: selected ? 'color-mix(in srgb, var(--gv-coral) 42%, transparent)' : 'var(--gv-line)',
                      color: selected ? 'var(--gv-coral)' : 'var(--gv-muted)',
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
            {zeroedLayers.length > 0 && (
              <p className="mt-1 text-[10px] font-code" style={{ color: 'var(--gv-coral)' }}>
                W{zeroedLayers.join(', W')} zeroed
              </p>
            )}
          </div>

          <div className="h-8 border-l self-center" style={{ borderColor: 'var(--gv-line)' }} />

          <Button variant="outline" size="sm" onClick={resetAll} className="font-code text-xs self-center">
            <RotateCcw size={12} className="mr-1.5" />
            Reset
          </Button>
        </div>
      )}

      {/* Collapsed state — show experiment descriptions horizontally */}
      {!active && (
        <div className="flex flex-wrap gap-3 px-5 py-3">
          {experiments.map((item) => (
            <div key={item.title} className="flex-1 min-w-[160px] rounded-lg border p-3"
              style={{ borderColor: 'var(--gv-line)', background: 'var(--gv-bg-2)' }}>
              <p className="text-[11px] font-code font-semibold">{item.title}</p>
              <p className="mt-0.5 text-[10px] leading-4 gv-muted">{item.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Original vertical panel (kept for backwards compat) ───────────────────────

export function BreakItPanel() {
  const {
    active, biasDisabled, weightNoise, zeroedLayers,
    score, total,
    setActive, toggleBias, setNoise, toggleLayer, resetAll,
  } = useBreakItStore()

  return (
    <div className="gv-panel rounded-xl p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlaskConical size={14} style={{ color: active ? 'var(--gv-coral)' : 'var(--gv-faint)' }} />
          <span className="text-xs font-code font-bold">Break It Mode</span>
        </div>
        <Switch checked={active} onCheckedChange={setActive} />
      </div>

      {total > 0 && (
        <p className="mb-2 text-[10px] font-code gv-muted">
          Experiment score: <span className="gv-coral">{score}/{total}</span>
        </p>
      )}

      {active && (
        <div className="space-y-4 border-t pt-3" style={{ borderColor: 'var(--gv-line)' }}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-code">Disable biases</p>
              <p className="text-[10px] leading-4 gv-muted">Removes learned thresholds.</p>
            </div>
            <Switch checked={biasDisabled} onCheckedChange={toggleBias} />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="text-xs font-code">Weight noise</p>
                <p className="text-[10px] gv-muted">Randomly distorts connections.</p>
              </div>
              <span className="text-xs font-code"
                style={{ color: weightNoise > 0.3 ? 'var(--gv-coral)' : weightNoise > 0 ? 'var(--gv-lime)' : 'var(--gv-muted)' }}>
                {Math.round(weightNoise * 100)}%
              </span>
            </div>
            <Slider min={0} max={1} step={0.01} value={[weightNoise]}
              onValueChange={(vals) => setNoise(typeof vals === 'number' ? vals : (vals as number[])[0])} />
          </div>

          <div>
            <p className="mb-1 text-xs font-code">Zero layer weights</p>
            <div className="flex gap-2">
              {[
                { idx: 1, label: 'W1', hint: 'Pixels to first hidden features' },
                { idx: 2, label: 'W2', hint: 'Features to shapes' },
                { idx: 3, label: 'W3', hint: 'Shapes to digit scores' },
              ].map(({ idx, label, hint }) => {
                const selected = zeroedLayers.includes(idx)
                return (
                  <button key={idx} onClick={() => toggleLayer(idx)} title={hint}
                    className="flex-1 rounded-lg border py-1.5 text-xs font-code transition-all"
                    style={{
                      background: selected ? 'var(--gv-coral-soft)' : 'var(--gv-panel-strong)',
                      borderColor: selected ? 'color-mix(in srgb, var(--gv-coral) 42%, transparent)' : 'var(--gv-line)',
                      color: selected ? 'var(--gv-coral)' : 'var(--gv-muted)',
                    }}>
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={resetAll} className="w-full font-code text-xs">
            <RotateCcw size={12} className="mr-1.5" />
            Reset experiment
          </Button>
        </div>
      )}
    </div>
  )
}
