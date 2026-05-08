'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, CircleDot, Database, FunctionSquare, GitBranch, Route, Sigma, Target, Wand2 } from 'lucide-react'

const modules = [
  {
    id: 'mental-model',
    icon: Brain,
    title: '1. Mental model',
    level: 'Beginner',
    summary: 'A neural network is a stack of small decision units that transform raw input into useful evidence.',
    formula: 'prediction = model(input)',
    details: [
      'In GradVex, the input is a handwritten digit represented by 784 pixel values.',
      'Each layer turns the previous representation into a more useful one: pixels become strokes, strokes become shapes, shapes become digit evidence.',
      'The network is not memorizing one drawing. It learns reusable patterns from many examples.',
    ],
    useCase: 'Fraud systems transform raw transaction fields into risk evidence; medical imaging models transform pixels into signs of disease.',
    pros: ['Easy mental model for beginners', 'Works across images, tabular data, audio features, and text embeddings'],
    cons: ['Can still be hard to interpret at scale', 'Needs representative training data to generalize well'],
    playground: 'Draw a 7, then draw it with a crossbar. Watch which output probabilities compete.',
  },
  {
    id: 'weights',
    icon: GitBranch,
    title: '2. Weights',
    level: 'Core math',
    summary: 'Weights decide how strongly one value influences the next neuron.',
    formula: 'z = w1*x1 + w2*x2 + ... + wn*xn',
    details: [
      'A positive weight increases a neuron when its input is active. A negative weight suppresses it.',
      'Large absolute weights mean the connection matters more. Near-zero weights are almost ignored.',
      'Training changes weights until useful patterns produce high scores for the correct class.',
    ],
    useCase: 'Credit scoring weights can learn which signals increase or decrease default risk. In image systems, weights learn edge and texture detectors.',
    pros: ['Encodes learned importance', 'Can be inspected statistically with heatmaps and magnitude charts'],
    cons: ['Individual weights are rarely meaningful alone', 'Large models can contain millions or billions of them'],
    playground: 'Open Break It Mode and zero W3. The model loses the final mapping from features to digits.',
  },
  {
    id: 'bias',
    icon: CircleDot,
    title: '3. Bias',
    level: 'Core math',
    summary: 'Bias gives each neuron its own starting threshold, independent of the input.',
    formula: 'z = W*x + b',
    details: [
      'Without bias, every neuron is forced to make decisions through the origin of its feature space.',
      'Bias can make a neuron easier or harder to activate before any input signal arrives.',
      'This is a small parameter with a large effect on flexibility and fit.',
    ],
    useCase: 'In demand forecasting, a bias term can represent baseline demand before promotions, seasonality, or price signals are considered.',
    pros: ['Improves flexibility with very few parameters', 'Helps neurons activate at useful thresholds'],
    cons: ['Can encode dataset imbalance if training data is biased', 'Invisible in many simple visualizations unless explicitly shown'],
    playground: 'Disable biases and draw off-center digits. The decision boundaries become less adaptable.',
  },
  {
    id: 'activation',
    icon: FunctionSquare,
    title: '4. Activation',
    level: 'Non-linearity',
    summary: 'Activation functions let stacked layers solve curved, complex decision problems.',
    formula: 'ReLU(z) = max(0, z)',
    details: [
      'Without non-linearity, many layers collapse into one big linear transformation.',
      'ReLU keeps positive evidence and shuts off negative evidence, creating sparse activity.',
      'Sparse activity makes it easier to see which neurons are actually responding to a drawing.',
    ],
    useCase: 'Recommendation models use non-linear layers to capture interactions like user preference plus time of day plus price sensitivity.',
    pros: ['Enables complex curved decision boundaries', 'ReLU is fast and stable for many networks'],
    cons: ['Dead ReLU units can stop learning', 'Different activations have different stability and calibration tradeoffs'],
    playground: 'Draw slowly and watch hidden neurons light up only when relevant strokes appear.',
  },
  {
    id: 'softmax',
    icon: Target,
    title: '5. Softmax and confidence',
    level: 'Output',
    summary: 'Softmax converts raw output scores into probabilities across the ten digit classes.',
    formula: 'p_i = exp(z_i) / sum(exp(z_j))',
    details: [
      'The output layer produces logits first. Logits are raw scores, not probabilities.',
      'Softmax normalizes those scores so all class probabilities add up to one.',
      'A high confidence prediction means one digit has much stronger evidence than the rest.',
    ],
    useCase: 'Customer support routing can use softmax to choose the most likely category: billing, technical issue, cancellation, or escalation.',
    pros: ['Turns scores into comparable probabilities', 'Useful for ranked class decisions and confidence thresholds'],
    cons: ['Can be overconfident on unfamiliar inputs', 'Probabilities need calibration for high-stakes decisions'],
    playground: 'Draw an ambiguous 4/9 shape and compare the two highest bars.',
  },
  {
    id: 'training',
    icon: Wand2,
    title: '6. Training and loss',
    level: 'Advanced',
    summary: 'Training adjusts weights and biases to reduce prediction error on examples.',
    formula: 'W = W - learning_rate * gradient',
    details: [
      'Loss measures how wrong the model is. Cross-entropy punishes confident wrong answers heavily.',
      'Backpropagation computes how each parameter contributed to the error.',
      'Gradient descent nudges every parameter in the direction that should reduce future loss.',
    ],
    useCase: 'Autonomous inspection systems train on labeled defect images, then backpropagate error until cracks, dents, or missing parts are detected reliably.',
    pros: ['Scales to large datasets', 'Automatically learns useful features instead of hand-coding rules'],
    cons: ['Can overfit noisy data', 'Requires monitoring for data drift after deployment'],
    playground: 'Use noise in Break It Mode to simulate a worse trained model and watch confidence degrade.',
  },
  {
    id: 'dataset',
    icon: Database,
    title: '7. Dataset & Training',
    level: 'Behind the scenes',
    summary: 'MNIST is 70,000 handwritten digit images. The GradVex model was trained on 60,000 of them.',
    formula: 'L = -log(p_correct) → minimize via Adam',
    details: [
      'MNIST (Modified National Institute of Standards and Technology) was collected from US Census Bureau employees and high school students. Each image is 28×28 pixels, grayscale, centered, and normalized.',
      'Training: 60,000 images split into mini-batches of 64. Each batch updates weights via backpropagation. The GradVex model ran for 10 epochs — meaning it saw each training image 10 times.',
      'Test set: 10,000 held-out images never seen during training. Final accuracy on these: >97%. This is how we know the model generalizes, not just memorizes.',
    ],
    useCase: 'MNIST is the "Hello World" of deep learning — used in every major framework tutorial. Real postal services use similar networks trained on millions of handwritten addresses. USPS processes ~430 million mail pieces daily using digit recognition.',
    pros: ['Clean, normalized dataset — great for learning', 'Fast to train even on CPU', 'Well-studied — easy to compare results to published benchmarks'],
    cons: ['Too clean for production — real handwriting is messier', 'Only digits — not letters or symbols', 'Grayscale only — no color information'],
    playground: 'Draw a digit that looks like a font (very clean, upright) vs one written quickly and messily. Watch confidence drop for messier inputs — this is distribution shift.',
  },
]

const journey = [
  ['Input', '784 normalized pixels'],
  ['Hidden 1', 'Stroke detectors'],
  ['Hidden 2', 'Shape combinations'],
  ['Output', '10 digit probabilities'],
]

export default function LearnPage() {
  const [open, setOpen] = useState('mental-model')
  const active = modules.find((module) => module.id === open) ?? modules[0]
  const ActiveIcon = active.icon

  return (
    <div className="gv-page gv-page-band">
      <section className="gv-container pb-10 pt-14">
        <div className="max-w-3xl">
          <p className="gv-kicker"><span className="gv-dot" /> Guided curriculum</p>
          <h1 className="gv-title mt-4 text-4xl sm:text-5xl">Understand every moving part of a neural network.</h1>
          <p className="gv-copy mt-5 text-base">
            This learning path connects the concepts directly to the live GradVex playground, so every formula has an experiment attached to it.
          </p>
        </div>
      </section>

      <section className="gv-container pb-10">
        <div className="gv-panel-readable rounded-2xl p-6">
          <p className="font-code text-[10px] uppercase gv-faint mb-4">Signal flow — what each layer does</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: '01',
                name: 'Input Layer',
                neurons: '784 neurons',
                color: 'var(--gv-muted)',
                bgColor: 'var(--gv-bg-2)',
                what: 'Raw pixel values',
                why: 'Converts your 28×28 drawing into 784 numbers (0=black, 1=white). No spatial understanding — just a flat list of brightness values. Every pixel gets its own neuron.',
                analogy: 'Like reading a spreadsheet — the network sees columns of numbers, not a picture.',
                math: 'x ∈ ℝ⁷⁸⁴',
              },
              {
                step: '02',
                name: 'Hidden Layer 1',
                neurons: '128 neurons · ReLU',
                color: 'var(--gv-cyan)',
                bgColor: 'var(--gv-cyan-soft)',
                what: 'Stroke & edge detection',
                why: 'Each of the 128 neurons looks at all 784 pixels with a different weighted lens. Some neurons learn to fire on horizontal strokes, others on curves or diagonals. ReLU zeros out negatives — only positive evidence passes through.',
                analogy: 'Like 128 inspectors, each trained to spot one type of pen stroke.',
                math: 'a₁ = ReLU(W₁x + b₁)',
              },
              {
                step: '03',
                name: 'Hidden Layer 2',
                neurons: '64 neurons · ReLU',
                color: 'var(--gv-cyan)',
                bgColor: 'var(--gv-cyan-soft)',
                what: 'Shape & part composition',
                why: '64 neurons combine H1 stroke evidence into higher-level shapes — loops, curves, corners, crossings. A "closed loop" detector might combine multiple curve detectors. This is where digit parts emerge.',
                analogy: 'Like assembling Lego bricks — strokes combine into recognizable digit parts.',
                math: 'a₂ = ReLU(W₂a₁ + b₂)',
              },
              {
                step: '04',
                name: 'Output Layer',
                neurons: '10 neurons · Softmax',
                color: 'var(--gv-lime)',
                bgColor: 'var(--gv-lime-soft)',
                what: 'Digit classification',
                why: 'One neuron per digit (0–9). Each reads H2 features and produces a raw score. Softmax converts all 10 scores into probabilities summing to 1. The highest probability wins.',
                analogy: 'Like 10 judges each voting on how likely the drawing is their digit.',
                math: 'ŷ = Softmax(W₃a₂ + b₃)',
              },
            ].map((layer) => (
              <div key={layer.step} className="rounded-2xl p-5 flex flex-col gap-3"
                style={{ background: layer.bgColor, border: '1px solid var(--gv-line)' }}>
                <div className="flex items-center justify-between">
                  <span className="font-code text-[10px] gv-faint">{layer.step}</span>
                  <span className="font-code text-[10px]" style={{ color: layer.color }}>{layer.neurons}</span>
                </div>
                <h3 className="font-heading font-semibold text-base" style={{ color: layer.color }}>{layer.name}</h3>
                <p className="font-code text-[10px] uppercase" style={{ color: layer.color }}>{layer.what}</p>
                <p className="text-sm leading-5 gv-muted">{layer.why}</p>
                <div className="rounded-lg px-3 py-2 mt-auto" style={{ background: 'var(--gv-panel-strong)', border: '1px solid var(--gv-line)' }}>
                  <p className="font-code text-[10px] gv-faint mb-1">Analogy</p>
                  <p className="text-xs gv-muted italic">{layer.analogy}</p>
                </div>
                <code className="font-code text-[10px] gv-cyan">{layer.math}</code>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="gv-container grid gap-4 pb-10 md:grid-cols-4">
        {journey.map(([title, body], index) => (
          <div key={title} className="gv-panel rounded-xl p-4">
            <p className="font-code text-[10px] gv-faint">STEP {String(index + 1).padStart(2, '0')}</p>
            <h2 className="mt-2 font-heading text-lg font-semibold">{title}</h2>
            <p className="mt-1 text-sm gv-muted">{body}</p>
          </div>
        ))}
      </section>

      <section className="gv-container grid gap-5 pb-20 lg:grid-cols-[360px_1fr]">
        <aside className="flex flex-col gap-2">
          {modules.map((module) => {
            const Icon = module.icon
            const selected = module.id === open
            return (
              <button
                key={module.id}
                onClick={() => setOpen(module.id)}
                className="rounded-xl border p-4 text-left transition-all"
                style={{
                  background: selected ? 'var(--gv-cyan-soft)' : 'var(--gv-panel)',
                  borderColor: selected ? 'color-mix(in srgb, var(--gv-cyan) 35%, transparent)' : 'var(--gv-line)',
                  boxShadow: selected ? 'var(--gv-shadow)' : 'none',
                }}
              >
                <div className="flex items-start gap-3">
                  <Icon size={18} style={{ color: selected ? 'var(--gv-cyan)' : 'var(--gv-muted)' }} />
                  <div>
                    <p className="font-heading text-sm font-semibold">{module.title}</p>
                    <p className="mt-1 text-xs gv-muted">{module.summary}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </aside>

        <div className="gv-panel rounded-2xl p-5 sm:p-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
            >
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border" style={{ borderColor: 'var(--gv-line)', background: 'var(--gv-violet-soft)' }}>
                  <ActiveIcon size={22} style={{ color: 'var(--gv-violet)' }} />
                </div>
                <div>
                  <p className="gv-pill">{active.level}</p>
                  <h2 className="mt-2 font-heading text-2xl font-semibold">{active.title}</h2>
                </div>
              </div>

              <p className="gv-copy mt-5 text-base">{active.summary}</p>

              <div className="my-6 rounded-xl border p-4" style={{ borderColor: 'var(--gv-line)', background: 'color-mix(in srgb, var(--gv-bg-2) 55%, transparent)' }}>
                <div className="flex items-center gap-2">
                  <Sigma size={16} style={{ color: 'var(--gv-cyan)' }} />
                  <p className="font-code text-xs uppercase gv-faint">Formula</p>
                </div>
                <code className="mt-3 block break-words text-sm font-code gv-cyan">{active.formula}</code>
              </div>

              <div className="grid gap-3">
                {active.details.map((detail, index) => (
                  <div key={detail} className="flex gap-3 rounded-xl border p-4" style={{ borderColor: 'var(--gv-line)', background: 'var(--gv-panel-strong)' }}>
                    <span className="font-code text-xs gv-cyan">{String(index + 1).padStart(2, '0')}</span>
                    <p className="text-sm leading-6 gv-muted">{detail}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-3 lg:grid-cols-3">
                <div className="rounded-xl border p-4" style={{ borderColor: 'var(--gv-line)', background: 'var(--gv-panel-strong)' }}>
                  <p className="font-code text-[10px] uppercase gv-faint">Real-world example</p>
                  <p className="mt-2 text-sm leading-6 gv-muted">{active.useCase}</p>
                </div>
                <div className="rounded-xl border p-4" style={{ borderColor: 'var(--gv-line)', background: 'var(--gv-lime-soft)' }}>
                  <p className="font-code text-[10px] uppercase gv-lime">Advantages</p>
                  <ul className="mt-2 space-y-2 text-sm gv-muted">
                    {active.pros.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
                <div className="rounded-xl border p-4" style={{ borderColor: 'var(--gv-line)', background: 'var(--gv-coral-soft)' }}>
                  <p className="font-code text-[10px] uppercase gv-coral">Limitations</p>
                  <ul className="mt-2 space-y-2 text-sm gv-muted">
                    {active.cons.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              </div>

              <div className="mt-6 rounded-xl border p-4" style={{ borderColor: 'color-mix(in srgb, var(--gv-lime) 32%, transparent)', background: 'var(--gv-lime-soft)' }}>
                <div className="mb-2 flex items-center gap-2">
                  <Route size={16} style={{ color: 'var(--gv-lime)' }} />
                  <p className="font-code text-xs font-semibold gv-lime">Try it in the playground</p>
                </div>
                <p className="text-sm gv-muted">{active.playground}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </div>
  )
}
