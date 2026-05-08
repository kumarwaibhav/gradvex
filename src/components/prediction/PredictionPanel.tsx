'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useNetworkStore } from '@/store/networkStore'
import { ConfidenceBar } from './ConfidenceBar'
import { AlertCircle } from 'lucide-react'

const DIGIT_LABELS = ['0','1','2','3','4','5','6','7','8','9']

function confidenceColor(c: number) {
  if (c >= 0.9) return 'var(--gv-lime)'
  if (c >= 0.6) return 'var(--gv-cyan)'
  return 'var(--gv-coral)'
}

function confidenceLabel(c: number) {
  if (c >= 0.9) return 'High confidence'
  if (c >= 0.6) return 'Medium confidence'
  return 'Low confidence'
}

export function PredictionPanel() {
  const { result, multiResults } = useNetworkStore()

  // Multi-digit mode
  if (multiResults && multiResults.length > 1) {
    const digits = multiResults.map((r) => r.prediction).join('')
    return (
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-[10px] font-code mb-1" style={{ color: 'var(--gv-muted)' }}>Multi-digit detected</p>
          <motion.div
            key={digits}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2"
          >
            {multiResults.map((r, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'color-mix(in srgb, var(--gv-cyan) 10%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--gv-cyan) 25%, transparent)',
                  }}>
                  <span className="text-3xl font-bold font-heading" style={{ color: 'var(--gv-cyan)' }}>
                    {r.prediction}
                  </span>
                </div>
                <span className="text-[10px] font-code" style={{ color: confidenceColor(r.confidence) }}>
                  {(r.confidence * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </motion.div>
          <p className="text-lg font-heading font-bold mt-2" style={{ color: 'var(--gv-lime)' }}>
            = &quot;{digits}&quot;
          </p>
        </div>

        <div className="pt-3 border-t" style={{ borderColor: 'var(--gv-line)' }}>
          <p className="text-[10px] font-code mb-2" style={{ color: 'var(--gv-faint)' }}>
            Last digit probabilities
          </p>
          {DIGIT_LABELS.map((label, i) => (
            <ConfidenceBar key={i} label={label}
              value={multiResults[multiResults.length - 1].outputProbs[i]}
              isTop={i === multiResults[multiResults.length - 1].prediction}
            />
          ))}
        </div>
      </div>
    )
  }

  // Empty state
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-52 gap-3">
        <div className="w-16 h-16 rounded-2xl border-2 border-dashed flex items-center justify-center"
          style={{ borderColor: 'color-mix(in srgb, var(--gv-cyan) 20%, transparent)' }}>
          <span className="text-3xl font-heading font-bold" style={{ color: 'var(--gv-faint)' }}>?</span>
        </div>
        <p className="text-sm font-code" style={{ color: 'var(--gv-faint)' }}>Draw to predict</p>
      </div>
    )
  }

  const { prediction, confidence, outputProbs } = result
  const isLow = confidence < 0.5

  return (
    <div className="flex flex-col gap-4">
      {/* Main prediction */}
      <AnimatePresence mode="wait">
        <motion.div key={prediction}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.1, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 360, damping: 22 }}
          className="flex items-center gap-4"
        >
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center relative"
            style={{
              background: isLow
                ? 'color-mix(in srgb, var(--gv-coral) 8%, transparent)'
                : 'color-mix(in srgb, var(--gv-cyan) 8%, transparent)',
              border: `1px solid ${isLow
                ? 'color-mix(in srgb, var(--gv-coral) 30%, transparent)'
                : 'color-mix(in srgb, var(--gv-cyan) 30%, transparent)'}`,
              boxShadow: isLow ? 'none' : '0 0 20px color-mix(in srgb, var(--gv-cyan) 15%, transparent)',
            }}>
            <span className="text-5xl font-bold font-heading"
              style={{ color: isLow ? 'var(--gv-coral)' : 'var(--gv-cyan)' }}>
              {prediction}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-code" style={{ color: 'var(--gv-muted)' }}>Predicted digit</p>
            <p className="text-xl font-bold font-heading" style={{ color: confidenceColor(confidence) }}>
              {(confidence * 100).toFixed(1)}%
            </p>
            <span className="text-[10px] font-code px-2 py-0.5 rounded-full"
              style={{
                border: '1px solid color-mix(in srgb, var(--gv-cyan) 20%, transparent)',
                color: 'var(--gv-muted)',
              }}>
              {confidenceLabel(confidence)}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Low confidence hint */}
      {isLow && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-start gap-2 px-3 py-2 rounded-lg text-[10px] font-code"
          style={{
            background: 'color-mix(in srgb, var(--gv-coral) 6%, transparent)',
            border: '1px solid color-mix(in srgb, var(--gv-coral) 20%, transparent)',
            color: 'var(--gv-coral)',
          }}>
          <AlertCircle size={11} className="mt-0.5 flex-none" />
          <span>Draw larger, centered, and cleaner for better confidence.</span>
        </motion.div>
      )}

      {/* Probability bars */}
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-code mb-1" style={{ color: 'var(--gv-faint)' }}>
          Softmax — all 10 classes
        </p>
        {DIGIT_LABELS.map((label, i) => (
          <ConfidenceBar key={i} label={label} value={outputProbs[i]} isTop={i === prediction} />
        ))}
      </div>
    </div>
  )
}
