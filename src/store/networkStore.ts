import { create } from 'zustand'
import type { InferenceResult, ModelWeights } from '@/lib/model/types'
import type { DigitRegion } from '@/lib/utils/multiDigit'

interface NetworkState {
  modelLoaded: boolean
  modelLoading: boolean
  loadingProgress: number
  result: InferenceResult | null
  weights: ModelWeights | null
  // Multi-digit support
  multiResults: InferenceResult[] | null
  multiBoxes: DigitRegion[] | null

  setModelLoading: (v: boolean) => void
  setModelLoaded: (v: boolean) => void
  setLoadingProgress: (v: number) => void
  setResult: (r: InferenceResult) => void
  setWeights: (w: ModelWeights) => void
  clearResult: () => void
  setMultiResults: (results: InferenceResult[], boxes: DigitRegion[]) => void
  clearMultiResults: () => void
}

export const useNetworkStore = create<NetworkState>((set) => ({
  modelLoaded: false,
  modelLoading: false,
  loadingProgress: 0,
  result: null,
  weights: null,
  multiResults: null,
  multiBoxes: null,

  setModelLoading: (v) => set({ modelLoading: v }),
  setModelLoaded: (v) => set({ modelLoaded: v, modelLoading: false }),
  setLoadingProgress: (v) => set({ loadingProgress: v }),
  setResult: (r) => set({ result: r, multiResults: null, multiBoxes: null }),
  setWeights: (w) => set({ weights: w }),
  clearResult: () => set({ result: null }),
  setMultiResults: (results, boxes) => set({ multiResults: results, multiBoxes: boxes, result: results.at(-1) ?? null }),
  clearMultiResults: () => set({ multiResults: null, multiBoxes: null }),
}))
