'use client'

import { useNetworkStore } from '@/store/networkStore'

export function BackpropTab() {
  const { result } = useNetworkStore()
  if (!result) return null

  const { outputProbs, prediction } = result
  const loss = -Math.log(outputProbs[prediction] + 1e-8)
  const outputGrads = outputProbs.map((p, i) => p - (i === prediction ? 1 : 0))
  const maxGrad = Math.max(...outputGrads.map(Math.abs))

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
      <section className="gv-panel-readable rounded-2xl p-5">
        <p className="font-code text-[10px] uppercase gv-faint">Training concept</p>
        <h3 className="mt-1 font-heading text-2xl font-semibold">Backpropagation</h3>
        <p className="gv-copy mt-3 text-sm">
          GradVex is doing inference live, but these same values are what training uses to learn. Backpropagation asks: how much did each parameter contribute to the error?
        </p>
        <div className="my-4 rounded-xl border p-4" style={{ borderColor: 'var(--gv-line)', background: 'var(--gv-bg-2)' }}>
          <code className="block whitespace-pre-wrap text-sm font-code gv-cyan">
{`dL/dz3 = softmax(z3) - y
dL/dW3 = dL/dz3 * a2
dL/dW2 = chain(dL/dz3, W3, ReLU'(z2))
W = W - learning_rate * gradient`}
          </code>
        </div>
        <p className="text-xs gv-muted">
          In production training systems, this runs over many batches and examples. The browser demo shows the output-layer gradient as an intuition aid.
        </p>
      </section>

      <section className="gv-panel-readable rounded-2xl p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border p-4" style={{ borderColor: 'var(--gv-line)', background: 'var(--gv-bg-2)' }}>
            <p className="font-code text-[10px] uppercase gv-faint">Cross-entropy loss</p>
            <p className="mt-2 text-3xl font-heading font-bold gv-lime">{loss.toFixed(4)}</p>
            <p className="mt-2 text-xs gv-muted">
              L = -log(p[{prediction}]) = -log({outputProbs[prediction].toFixed(3)})
            </p>
          </div>
          <div className="rounded-xl border p-4" style={{ borderColor: 'var(--gv-line)', background: 'var(--gv-bg-2)' }}>
            <p className="font-code text-[10px] uppercase gv-faint">Interpretation</p>
            <p className="mt-2 text-sm gv-muted">
              {loss < 0.2 ? 'Low loss: the network is highly confident.' :
                loss < 1.0 ? 'Medium loss: the network sees competing evidence.' :
                  'High loss: the model is uncertain or wrong.'}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-xl border p-4" style={{ borderColor: 'var(--gv-line)', background: 'var(--gv-bg-2)' }}>
          <p className="mb-3 font-code text-[10px] uppercase gv-faint">Output gradient sample</p>
          <div className="flex h-28 items-end gap-2">
            {outputGrads.map((g, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md"
                  style={{
                    height: Math.abs(g) / (maxGrad || 1) * 82 + 5,
                    background: g > 0 ? 'var(--gv-coral)' : 'var(--gv-cyan)',
                    opacity: 0.62 + Math.abs(g) / (maxGrad || 1) * 0.38,
                  }}
                />
                <span className="text-[10px] font-code gv-muted">{i}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs gv-muted">
            Coral means the predicted probability is too high for that class; cyan means the training target would push that class upward.
          </p>
        </div>
      </section>
    </div>
  )
}
