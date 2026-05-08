import { create } from 'zustand'
import type { MathTab, ArchMode, MathLevel, HoveredNode, HoveredEdge } from '@/lib/model/types'

interface UIState {
  mathPanelOpen: boolean
  mathPanelTab: MathTab
  mathStepIndex: number
  hoveredNode: HoveredNode | null
  hoveredEdge: HoveredEdge | null
  theme: 'dark' | 'light'
  archMode: ArchMode
  mathLevel: MathLevel
  animating: boolean

  toggleMathPanel: () => void
  setMathTab: (tab: MathTab) => void
  nextMathStep: () => void
  prevMathStep: () => void
  resetMathStep: () => void
  setHoveredNode: (node: HoveredNode | null) => void
  setHoveredEdge: (edge: HoveredEdge | null) => void
  toggleTheme: () => void
  setArchMode: (mode: ArchMode) => void
  setAnimating: (v: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  mathPanelOpen: false,
  mathPanelTab: 'forward',
  mathStepIndex: 0,
  hoveredNode: null,
  hoveredEdge: null,
  theme: 'dark',
  archMode: 'standard',
  mathLevel: 2,
  animating: false,

  toggleMathPanel: () => set((s) => ({ mathPanelOpen: !s.mathPanelOpen })),
  setMathTab: (tab) => set({ mathPanelTab: tab }),
  nextMathStep: () => set((s) => ({ mathStepIndex: s.mathStepIndex + 1 })),
  prevMathStep: () => set((s) => ({ mathStepIndex: Math.max(0, s.mathStepIndex - 1) })),
  resetMathStep: () => set({ mathStepIndex: 0 }),
  setHoveredNode: (node) => set({ hoveredNode: node }),
  setHoveredEdge: (edge) => set({ hoveredEdge: edge }),
  toggleTheme: () => set((s) => {
    const theme = s.theme === 'dark' ? 'light' : 'dark'
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('gradvex-theme', theme)
    }
    return { theme }
  }),
  setArchMode: (mode) => set({ archMode: mode }),
  setAnimating: (v) => set({ animating: v }),
}))
