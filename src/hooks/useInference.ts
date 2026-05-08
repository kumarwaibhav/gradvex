'use client'

import { useCallback, useRef } from 'react'
import { useNetworkStore } from '@/store/networkStore'
import { useUIStore } from '@/store/uiStore'
import { useBreakItStore } from '@/store/breakItStore'
import { runInference } from '@/lib/model/inference'
import { canvasToInputTensor } from '@/lib/model/preprocessing'
import { isCanvasBlank } from '@/lib/utils/canvas'
import { findDigitRegions, regionToTensor } from '@/lib/utils/multiDigit'

export function useInference() {
  const { modelLoaded, weights, setResult, clearResult, setMultiResults, clearMultiResults } = useNetworkStore()
  const { setAnimating } = useUIStore()
  const { active: breakItActive, biasDisabled, weightNoise, zeroedLayers } = useBreakItStore()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const infer = useCallback(
    (canvas: HTMLCanvasElement) => {
      if (!modelLoaded || !weights) return
      if (debounceRef.current) clearTimeout(debounceRef.current)

      debounceRef.current = setTimeout(async () => {
        if (isCanvasBlank(canvas)) {
          clearResult()
          clearMultiResults()
          return
        }

        const breakIt = breakItActive
          ? { biasDisabled, weightNoise, zeroedLayers }
          : undefined

        // Detect separate digit regions
        const regions = findDigitRegions(canvas)

        if (regions.length > 1) {
          // Multi-digit mode: run inference on each region separately
          const results = await Promise.all(
            regions.map(async (region) => {
              const pixels = regionToTensor(canvas, region)
              return runInference(weights, pixels, breakIt)
            })
          )
          setMultiResults(results, regions)
          clearResult()
        } else {
          // Single digit mode
          clearMultiResults()
          const pixels = canvasToInputTensor(canvas)
          const result = await runInference(weights, pixels, breakIt)
          setResult(result)
        }

        setAnimating(true)
        setTimeout(() => setAnimating(false), 1200)
      }, 80)
    },
    [modelLoaded, weights, setResult, clearResult, setMultiResults, clearMultiResults, setAnimating,
     breakItActive, biasDisabled, weightNoise, zeroedLayers]
  )

  return { infer }
}
