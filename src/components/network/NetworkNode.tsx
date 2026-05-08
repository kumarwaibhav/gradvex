'use client'

import { motion } from 'framer-motion'
import { activationToColor } from '@/lib/visualization/colorScale'
import { useUIStore } from '@/store/uiStore'

interface NetworkNodeProps {
  cx: number
  cy: number
  activation: number
  layerIdx: number
  nodeIdx: number
  animationDelay?: number
  hasResult: boolean
  isOutput?: boolean
}

export function NetworkNode({
  cx, cy, activation, layerIdx, nodeIdx, animationDelay = 0, hasResult, isOutput = false,
}: NetworkNodeProps) {
  const { setHoveredNode } = useUIStore()
  const color = hasResult ? activationToColor(activation) : 'hsl(240, 20%, 15%)'
  const r = isOutput ? 10 : 7

  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r={r}
      fill={color}
      stroke={hasResult ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)'}
      strokeWidth={1}
      initial={{ opacity: 0.3, scale: 0.8 }}
      animate={hasResult
        ? { opacity: 1, scale: 1, fill: color }
        : { opacity: 0.3, scale: 0.8 }
      }
      transition={{
        delay: animationDelay,
        duration: 0.4,
        ease: 'easeOut',
      }}
      onMouseEnter={() => setHoveredNode({ layer: layerIdx, index: nodeIdx })}
      onMouseLeave={() => setHoveredNode(null)}
      style={{ cursor: 'pointer' }}
    />
  )
}
