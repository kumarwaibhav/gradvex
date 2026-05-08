import Link from 'next/link'
import { ExternalLink, GitBranch, Layers3, ShieldCheck } from 'lucide-react'

const stack = [
  ['Next.js 16', 'App Router and production build'],
  ['React 19', 'Interactive client components'],
  ['TensorFlow.js 4', 'In-browser neural network inference'],
  ['Three.js', '3D network visualization'],
  ['Zustand', 'Shared UI and model state'],
  ['Tailwind CSS 4', 'Responsive design system'],
]

const modelFacts = [
  ['Architecture', 'MLP 784 -> 128 -> 64 -> 10'],
  ['Parameters', '109,386'],
  ['Training data', 'MNIST, 60k train / 10k test'],
  ['Loss', 'Categorical cross-entropy'],
  ['Inference', 'Runs locally in the browser'],
  ['Purpose', 'Explain neural networks through interaction'],
]

export default function AboutPage() {
  return (
    <div className="gv-page gv-page-band">
      <section className="gv-container pb-10 pt-14">
        <p className="gv-kicker"><span className="gv-dot" /> About the platform</p>
        <h1 className="gv-title mt-4 max-w-3xl text-4xl sm:text-5xl">GradVex turns a neural network into a visible, playable system.</h1>
        <p className="gv-copy mt-5 max-w-3xl">
          The project is built as an educational full-stack-style web app for the AI era: a live playground, visual architecture explorer, math panel, 3D scene, and guided explanations that make weights, biases, activations, loss, and predictions concrete.
        </p>
      </section>

      <section className="gv-container grid gap-4 pb-10 md:grid-cols-3">
        {[
          ['Learn by doing', 'Every concept connects back to a real action in the playground.'],
          ['Local and fast', 'The trained model runs in-browser after the weight files load.'],
          ['Inspectable math', 'Users can move from intuition to formulas without leaving the app.'],
        ].map(([title, body], index) => (
          <div key={title} className="gv-panel rounded-2xl p-5">
            {index === 0 && <Layers3 size={20} style={{ color: 'var(--gv-cyan)' }} />}
            {index === 1 && <ShieldCheck size={20} style={{ color: 'var(--gv-lime)' }} />}
            {index === 2 && <GitBranch size={20} style={{ color: 'var(--gv-violet)' }} />}
            <h2 className="mt-4 font-heading text-lg font-semibold">{title}</h2>
            <p className="gv-copy mt-2 text-sm">{body}</p>
          </div>
        ))}
      </section>

      <section className="gv-container grid gap-5 pb-20 lg:grid-cols-2">
        <div className="gv-panel rounded-2xl p-6">
          <h2 className="font-heading text-xl font-semibold">Model details</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {modelFacts.map(([label, value]) => (
              <div key={label} className="rounded-xl border p-4" style={{ borderColor: 'var(--gv-line)', background: 'var(--gv-panel-strong)' }}>
                <p className="font-code text-[10px] uppercase gv-faint">{label}</p>
                <p className="mt-1 text-sm font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="gv-panel rounded-2xl p-6">
          <h2 className="font-heading text-xl font-semibold">Technology stack</h2>
          <div className="mt-5 overflow-hidden rounded-xl border" style={{ borderColor: 'var(--gv-line)' }}>
            {stack.map(([name, purpose]) => (
              <div key={name} className="grid grid-cols-[130px_1fr] gap-3 border-b p-3 text-sm last:border-b-0" style={{ borderColor: 'var(--gv-line)' }}>
                <span className="font-code gv-cyan">{name}</span>
                <span className="gv-muted">{purpose}</span>
              </div>
            ))}
          </div>
          <Link href="https://github.com/kumarwaibhav" target="_blank" rel="noopener noreferrer" className="gv-button gv-button-secondary mt-6">
            GitHub profile <ExternalLink size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}
