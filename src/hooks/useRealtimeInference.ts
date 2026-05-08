'use client'

import { useCallback, useRef } from 'react'
import { useNetworkStore } from '@/store/networkStore'
import { runInferenceSync } from '@/lib/model/inference'
import { canvasToInputTensor } from '@/lib/model/preprocessing'
import { isCanvasBlank } from '@/lib/utils/canvas'

/**
 * Ultra-low-latency inference for real-time drawing feedback.
 * Calls runInferenceSync directly (no async overhead) and throttles
 * via requestAnimationFrame so we run at most once per rendered frame.
 *
 * Use this in the 3D lab where connections must update while drawing.
 * For the main playground, use useInference (has debounce + multi-digit).
 */
export function useRealtimeInference() {
  const { modelLoaded, weights, setResult, clearResult } = useNetworkStore()
  const rafRef = useRef<number | null>(null)

  const infer = useCallback((canvas: HTMLCanvasElement) => {
    if (!modelLoaded || !weights) return

    // Cancel previously scheduled frame — only run on the latest canvas state
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
    }

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null

      if (isCanvasBlank(canvas)) {
        clearResult()
        return
      }

      const pixels = canvasToInputTensor(canvas)
      const result = runInferenceSync(weights, pixels)
      setResult(result)
    })
  }, [modelLoaded, weights, setResult, clearResult])

  return { infer }
}
