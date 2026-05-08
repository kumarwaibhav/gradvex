import Link from 'next/link'
import { ArrowRight, BrainCircuit, FlaskConical, FunctionSquare, Layers3, Sparkles } from 'lucide-react'
import { NeuralHeroCanvas } from '@/components/hero/NeuralHeroCanvas'

const metrics = [
  ['Model', '784 → 128 → 64 → 10'],
  ['Parameters', '109,386'],
  ['Runtime', 'Browser inference'],
  ['Dataset', 'MNIST digits'],
]

const flow = [
  {
    step: '01',
    title: 'Input',
    body: '28×28 pixel image flattened into a 784-dimensional vector. Each pixel is a feature — brightness normalized to [0, 1]. No spatial structure — the network sees pure numbers.',
    color: 'var(--gv-muted)',
    math: 'x ∈ ℝ⁷⁸⁴',
  },
  {
    step: '02',
    title: 'Hidden 1',
    body: '128 neurons each compute a weighted sum of all 784 inputs, then ReLU zeroes negatives. These neurons learn to detect strokes, edges, and pen directions.',
    color: 'var(--gv-cyan)',
    math: 'a₁ = ReLU(W₁x + b₁)',
  },
  {
    step: '03',
    title: 'Hidden 2',
    body: '64 neurons combine H1 stroke detectors into higher abstractions — curves, loops, corners. This is where "digit parts" emerge as recognizable patterns.',
    color: 'var(--gv-cyan)',
    math: 'a₂ = ReLU(W₂a₁ + b₂)',
  },
  {
    step: '04',
    title: 'Output',
    body: '10 neurons — one per digit. Softmax converts raw scores to probabilities. The highest probability is the prediction. All 10 values always sum to 1.',
    color: 'var(--gv-lime)',
    math: 'ŷ = Softmax(W₃a₂ + b₃)',
  },
]

const features = [
  {
    icon: BrainCircuit,
    title: 'Live neural playground',
    body: 'Draw a digit and watch every layer respond — pixel activations, weighted sums, ReLU gates, and final probabilities, all updating in real time.',
  },
  {
    icon: FunctionSquare,
    title: 'Math without hand-waving',
    body: 'Forward pass, weights, biases, ReLU, Softmax, and gradient explanation are shown as the model runs — no vague metaphors.',
  },
  {
    icon: FlaskConical,
    title: 'Break It Mode',
    body: 'Disable biases, inject weight noise, or zero entire layers. See exactly why each component matters by watching the model fail without it.',
  },
  {
    icon: Layers3,
    title: '2D and 3D visualization',
    body: 'Switch between focused 2D inspection and an immersive 3D network where you can orbit the full 784→128→64→10 architecture.',
  },
]

export default function HomePage() {
  return (
    <div className="gv-page gv-page-band">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="gv-container grid items-center gap-10 pb-16 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:pt-24">
        <div>
          <div className="gv-kicker mb-5">
            <span className="gv-dot" />
            Real-time neural network visualizer
          </div>
          <h1 className="gv-title max-w-3xl text-5xl sm:text-6xl lg:text-7xl">
            Learn neural networks by watching one think.
          </h1>
          <p className="gv-copy mt-6 max-w-2xl text-base sm:text-lg">
            GradVex is a self-explanatory AI lab: draw a digit, see every layer fire, inspect the live math, and experiment with the parts that make neural networks work.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/playground" className="gv-button">
              Open Playground <ArrowRight size={16} />
            </Link>
            <Link href="/learn" className="gv-button gv-button-secondary">
              Start Learning
            </Link>
          </div>

          <div className="mt-8 grid max-w-2xl grid-cols-2 gap-2 sm:grid-cols-4">
            {metrics.map(([label, value]) => (
              <div key={label} className="gv-panel rounded-xl p-3">
                <p className="font-code text-[10px] uppercase gv-faint">{label}</p>
                <p className="mt-1 text-sm font-semibold gv-cyan">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive canvas hero */}
        <div className="gv-panel relative overflow-hidden rounded-2xl" style={{ minHeight: '420px' }}>
          {/* Canvas fills the card */}
          <NeuralHeroCanvas />

          {/* Overlay labels */}
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-5">
            <div className="flex items-center justify-between">
              <span className="gv-kicker text-[10px]">
                <span className="gv-dot" style={{ background: 'var(--gv-lime)', boxShadow: '0 0 10px var(--gv-lime)' }} />
                Live neural activity
              </span>
              <span className="font-code text-[10px] gv-faint">Move cursor to excite neurons</span>
            </div>

            {/* Layer labels along bottom */}
            <div className="flex items-end justify-around pb-2">
              {[
                { label: 'Input', sub: '784', color: 'var(--gv-muted)' },
                { label: 'H1', sub: '128·ReLU', color: 'var(--gv-cyan)' },
                { label: 'H2', sub: '64·ReLU', color: 'var(--gv-cyan)' },
                { label: 'H3', sub: '32·ReLU', color: 'var(--gv-violet)' },
                { label: 'Out', sub: '4·Softmax', color: 'var(--gv-lime)' },
              ].map(({ label, sub, color }) => (
                <div key={label} className="text-center">
                  <p className="font-heading text-xs font-semibold" style={{ color }}>{label}</p>
                  <p className="font-code text-[9px]" style={{ color: 'var(--gv-faint)' }}>{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Forward pass explainer ────────────────────────────────────────── */}
      <section className="gv-container pb-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <div className="gv-kicker mb-3">From pixels to prediction</div>
            <h2 className="gv-title text-3xl sm:text-4xl">What happens inside the black box.</h2>
          </div>
          <Sparkles className="hidden sm:block shrink-0" style={{ color: 'var(--gv-violet)' }} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {flow.map(({ step, title, body, color, math }) => (
            <div key={step} className="gv-panel rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-heading text-3xl font-bold" style={{ color: 'color-mix(in srgb, var(--gv-cyan-soft) 80%, transparent)' }}>
                  {step}
                </span>
                <span className="font-code text-[10px] px-2 py-1 rounded-lg" style={{ background: 'var(--gv-bg-2)', color: color }}>
                  {math}
                </span>
              </div>
              <h3 className="font-heading text-xl font-semibold" style={{ color }}>{title}</h3>
              <p className="gv-copy text-sm flex-1">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="gv-container grid gap-4 pb-20 sm:grid-cols-2">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <div key={feature.title} className="gv-panel rounded-2xl p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border"
                style={{ borderColor: 'var(--gv-line)', background: 'var(--gv-violet-soft)' }}>
                <Icon size={20} style={{ color: 'var(--gv-violet)' }} />
              </div>
              <h3 className="font-heading text-xl font-semibold">{feature.title}</h3>
              <p className="gv-copy mt-2 text-sm">{feature.body}</p>
            </div>
          )
        })}
      </section>

    </div>
  )
}
