'use client'

import { useState } from 'react'
import { useNetworkStore } from '@/store/networkStore'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const STEPS = [
  {
    title: 'Input to Hidden 1',
    equation: 'z1 = W1 x + b1',
    shape: 'W1: 128 x 784, x: 784, b1: 128',
    description: 'Every hidden neuron receives all 784 pixel values. A weight matrix scores which pixels matter, then bias shifts each neuron threshold.',
    layer: 'layer1Pre',
  },
  {
    title: 'ReLU on Hidden 1',
    equation: 'a1 = ReLU(z1) = max(0, z1)',
    shape: 'a1: 128 activated features',
    description: 'Negative evidence is shut off and positive evidence passes through. This is the first non-linear step that lets the model build stroke detectors.',
    layer: 'layer1Post',
  },
  {
    title: 'Hidden 1 to Hidden 2',
    equation: 'z2 = W2 a1 + b2',
    shape: 'W2: 64 x 128, a1: 128, b2: 64',
    description: 'The second layer combines stroke evidence into higher-level shapes such as loops, diagonal segments, and curved openings.',
    layer: 'layer2Pre',
  },
  {
    title: 'ReLU on Hidden 2',
    equation: 'a2 = ReLU(z2)',
    shape: 'a2: 64 activated shape features',
    description: 'Only the useful shape evidence survives. Sparse activations are easier to interpret because inactive features become exact zeros.',
    layer: 'layer2Post',
  },
  {
    title: 'Hidden 2 to Output',
    equation: 'z3 = W3 a2 + b3',
    shape: 'W3: 10 x 64, z3: 10 logits',
    description: 'The output layer converts learned shape evidence into one raw score per digit. These logits are not probabilities yet.',
    layer: 'outputLogits',
  },
  {
    title: 'Softmax Output',
    equation: 'p(class=k) = exp(z3_k) / sum(exp(z3_j))',
    shape: '10 probabilities, sum = 1',
    description: 'Softmax normalizes the logits into probabilities. The largest probability becomes the predicted digit and confidence score.',
    layer: 'outputProbs',
  },
]

export function ForwardPassTab() {
  const [step, setStep] = useState(0)
  const { result } = useNetworkStore()
  const current = STEPS[step]

  const values = (() => {
    if (!result) return []
    const map: Record<string, number[]> = {
      layer1Pre: result.layer1Pre,
      layer1Post: result.layer1Post,
      layer2Pre: result.layer2Pre,
      layer2Post: result.layer2Post,
      outputLogits: result.outputLogits,
      outputProbs: result.outputProbs,
    }
    return map[current.layer] ?? []
  })()

  return (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="gv-panel-readable rounded-2xl p-5">
        <div className="mb-4 flex items-center gap-2">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className="h-2.5 rounded-full transition-all"
              style={{
                width: i === step ? 34 : 10,
                background: i === step ? 'var(--gv-cyan)' : 'color-mix(in srgb, var(--gv-muted) 28%, transparent)',
              }}
              aria-label={`Show forward-pass step ${i + 1}`}
            />
          ))}
          <span className="ml-2 text-xs font-code gv-muted">Step {step + 1} / {STEPS.length}</span>
        </div>

        <p className="font-code text-[10px] uppercase gv-faint">Current operation</p>
        <h3 className="mt-1 font-heading text-2xl font-semibold">{current.title}</h3>
        <div className="my-4 rounded-xl border p-4" style={{ borderColor: 'var(--gv-line)', background: 'var(--gv-bg-2)' }}>
          <code className="block break-words text-base font-code gv-cyan">{current.equation}</code>
          <p className="mt-2 text-xs font-code gv-muted">{current.shape}</p>
        </div>
        <p className="gv-copy text-sm">{current.description}</p>

        <div className="mt-5 flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
            <ChevronLeft size={14} />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))} disabled={step === STEPS.length - 1}>
            <ChevronRight size={14} />
          </Button>
        </div>
      </section>

      <section className="gv-panel-readable rounded-2xl p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="font-code text-[10px] uppercase gv-faint">Live vector sample</p>
            <h3 className="font-heading text-lg font-semibold">{values.length} values</h3>
          </div>
          <span className="gv-pill">Showing first 72</span>
        </div>
        <div className="max-h-72 overflow-y-auto rounded-xl border p-3 gv-scrollbar" style={{ borderColor: 'var(--gv-line)', background: 'var(--gv-bg-2)' }}>
          <div className="flex flex-wrap gap-1.5">
            {values.slice(0, 72).map((v, i) => (
              <span
                key={i}
                className="rounded-md px-1.5 py-1 text-[11px] font-code"
                style={{
                  background: v >= 0 ? 'var(--gv-cyan-soft)' : 'var(--gv-coral-soft)',
                  color: v >= 0 ? 'var(--gv-cyan)' : 'var(--gv-coral)',
                  opacity: 0.58 + Math.min(0.42, Math.abs(v)),
                }}
              >
                {v.toFixed(2)}
              </span>
            ))}
            {values.length > 72 && <span className="self-center text-xs font-code gv-muted">+{values.length - 72} more</span>}
          </div>
        </div>
        <p className="mt-3 text-xs gv-muted">
          Positive values carry evidence forward. Negative pre-activations can become zero after ReLU, which is why the activation step is so important.
        </p>
      </section>
    </div>
  )
}
