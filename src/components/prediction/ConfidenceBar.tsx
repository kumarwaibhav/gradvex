'use client'

import { motion } from 'framer-motion'

interface ConfidenceBarProps {
  label: string
  value: number
  isTop: boolean
}

export function ConfidenceBar({ label, value, isTop }: ConfidenceBarProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-4 text-right text-xs font-code" style={{ color: isTop ? 'var(--gv-lime)' : 'var(--gv-muted)', fontWeight: isTop ? 800 : 500 }}>
        {label}
      </span>
      <div className="h-3 flex-1 overflow-hidden rounded-full" style={{ background: 'color-mix(in srgb, var(--gv-muted) 16%, transparent)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: isTop ? 'linear-gradient(90deg, var(--gv-lime), var(--gv-cyan))' : 'var(--gv-cyan)' }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      <span className="w-11 text-right text-[11px] font-code" style={{ color: isTop ? 'var(--gv-lime)' : 'var(--gv-faint)' }}>
        {(value * 100).toFixed(1)}%
      </span>
    </div>
  )
}
