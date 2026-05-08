import { create } from 'zustand'

interface BreakItState {
  active: boolean
  biasDisabled: boolean
  weightNoise: number       // 0-1
  zeroedLayers: number[]   // layer indices with zeroed weights
  score: number
  total: number

  setActive: (v: boolean) => void
  toggleBias: () => void
  setNoise: (v: number) => void
  toggleLayer: (idx: number) => void
  incrementScore: () => void
  incrementTotal: () => void
  resetAll: () => void
}

export const useBreakItStore = create<BreakItState>((set) => ({
  active: false,
  biasDisabled: false,
  weightNoise: 0,
  zeroedLayers: [],
  score: 0,
  total: 0,

  setActive: (v) => set({ active: v }),
  toggleBias: () => set((s) => ({ biasDisabled: !s.biasDisabled })),
  setNoise: (v) => set({ weightNoise: v }),
  toggleLayer: (idx) =>
    set((s) => ({
      zeroedLayers: s.zeroedLayers.includes(idx)
        ? s.zeroedLayers.filter((l) => l !== idx)
        : [...s.zeroedLayers, idx],
    })),
  incrementScore: () => set((s) => ({ score: s.score + 1 })),
  incrementTotal: () => set((s) => ({ total: s.total + 1 })),
  resetAll: () => set({ biasDisabled: false, weightNoise: 0, zeroedLayers: [], score: 0, total: 0, active: false }),
}))
