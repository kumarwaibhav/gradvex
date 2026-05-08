'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { X, AlertTriangle, Brain, Calculator } from 'lucide-react'

const STEPS = [
  {
    icon: AlertTriangle,
    iconColor: 'var(--gv-lime)',
    bg: 'var(--gv-lime-soft)',
    borderColor: 'color-mix(in srgb, var(--gv-lime) 20%, transparent)',
    title: 'Drawing tips (important)',
    desc: 'Draw ONE digit only. Make it large, centered, and upright on the black canvas. Messy, tiny, or off-center digits will confuse the model — it was trained on clean 28×28 images.',
  },
  {
    icon: Brain,
    iconColor: 'var(--gv-cyan)',
    bg: 'var(--gv-cyan-soft)',
    borderColor: 'color-mix(in srgb, var(--gv-cyan) 20%, transparent)',
    title: 'Watch neurons fire',
    desc: 'Every circle is a real neuron. Hover any node to see its activation value and pre-activation z. Blue edges = positive weights, red = negative. Brighter means stronger signal.',
  },
  {
    icon: Calculator,
    iconColor: 'var(--gv-violet)',
    bg: 'var(--gv-violet-soft)',
    borderColor: 'color-mix(in srgb, var(--gv-violet) 20%, transparent)',
    title: 'Toggle Math Mode',
    desc: 'Hit "Math Panel" to see the actual matrix math — W·x + b, ReLU(z), Softmax(z) — updating live as you draw. Try "Break It Mode" to kill biases or add noise and watch accuracy collapse.',
  },
]

export function WelcomeOverlay() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const id = window.requestAnimationFrame(() => {
      if (!localStorage.getItem('gradvex-onboarded')) setOpen(true)
    })
    return () => window.cancelAnimationFrame(id)
  }, [])

  const dismiss = () => {
    localStorage.setItem('gradvex-onboarded', '1')
    setOpen(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={dismiss} />

          <motion.div
            className="relative z-10 w-full max-w-md glass-card rounded-2xl p-6 shadow-2xl"
            initial={{ scale: 0.92, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 24, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            <button
              onClick={dismiss}
              className="absolute top-4 right-4 transition-colors"
              style={{ color: 'var(--gv-faint)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--gv-muted)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--gv-faint)')}
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <p className="text-[10px] font-mono mb-0.5" style={{ color: 'var(--gv-faint)' }}>GradVex · Neural Network Playground</p>
            <h2 className="text-lg font-bold font-mono mb-4" style={{ color: 'var(--gv-text)' }}>Quick start guide</h2>

            {/* Progress dots */}
            <div className="flex gap-1.5 mb-5">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className="flex-1 h-1 rounded-full transition-all duration-300"
                  style={{
                    background: i === step
                      ? 'var(--gv-cyan)'
                      : i < step
                        ? 'color-mix(in srgb, var(--gv-cyan) 40%, transparent)'
                        : 'var(--gv-line)',
                  }}
                />
              ))}
            </div>

            {/* Step content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.18 }}
                className="min-h-[110px]"
              >
                {(() => {
                  const s = STEPS[step]
                  const Icon = s.icon
                  return (
                    <div className="flex gap-4">
                      <div
                        className="flex-none w-11 h-11 rounded-xl border flex items-center justify-center"
                        style={{ background: s.bg, borderColor: s.borderColor }}
                      >
                        <Icon size={20} style={{ color: s.iconColor }} />
                      </div>
                      <div>
                        <h3 className="font-mono font-bold mb-1.5 text-sm" style={{ color: 'var(--gv-text)' }}>{s.title}</h3>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--gv-muted)' }}>{s.desc}</p>
                      </div>
                    </div>
                  )
                })()}
              </motion.div>
            </AnimatePresence>

            <div
              className="flex items-center justify-between mt-5 pt-4 border-t"
              style={{ borderColor: 'var(--gv-line)' }}
            >
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="text-xs font-mono disabled:opacity-30 transition-colors"
                style={{ color: 'var(--gv-faint)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--gv-muted)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--gv-faint)')}
              >
                ← Back
              </button>
              {step < STEPS.length - 1 ? (
                <Button size="sm" onClick={() => setStep((s) => s + 1)}
                  className="font-mono text-xs px-4"
                  style={{ background: 'var(--gv-cyan)', color: 'var(--gv-bg-2)' }}>
                  Next →
                </Button>
              ) : (
                <Button size="sm" onClick={dismiss}
                  className="font-mono text-xs px-4"
                  style={{ background: 'var(--gv-cyan)', color: 'var(--gv-bg-2)' }}>
                  Start Drawing →
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
