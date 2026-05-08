'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/store/uiStore'
import { useNetworkStore } from '@/store/networkStore'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ChevronsDown, Maximize2, Minimize2, PanelBottom, X } from 'lucide-react'
import { ForwardPassTab } from './ForwardPassTab'
import { WeightsTab } from './WeightsTab'
import { BackpropTab } from './BackpropTab'

const HEIGHTS = {
  compact: '42vh',
  standard: '60vh',
  focus: '78vh',
} as const

type PanelSize = keyof typeof HEIGHTS

export function MathPanel() {
  const { mathPanelOpen, mathPanelTab, toggleMathPanel, setMathTab } = useUIStore()
  const { result, multiResults } = useNetworkStore()
  const [size, setSize] = useState<PanelSize>('standard')
  const activeDigit = multiResults && multiResults.length > 1 ? multiResults.length : null

  return (
    <AnimatePresence>
      {mathPanelOpen && (
        <motion.div
          initial={{ opacity: 0, y: 44 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 44 }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          className="fixed bottom-0 left-0 right-0 z-50 overflow-hidden border-t gv-math-shell"
          style={{ height: HEIGHTS[size] }}
        >
          <div className="mx-auto flex h-full max-w-7xl flex-col px-4">
            <div className="flex items-center justify-center py-2">
              <button
                className="h-1.5 w-16 rounded-full"
                style={{ background: 'color-mix(in srgb, var(--gv-muted) 35%, transparent)' }}
                onClick={() => setSize(size === 'compact' ? 'standard' : 'compact')}
                aria-label="Resize math panel"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3" style={{ borderColor: 'var(--gv-line)' }}>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border" style={{ borderColor: 'var(--gv-line)', background: 'var(--gv-cyan-soft)' }}>
                  <PanelBottom size={18} style={{ color: 'var(--gv-cyan)' }} />
                </span>
                <div>
                  <p className="font-code text-[10px] uppercase gv-faint">Live computation workspace</p>
                  <h2 className="font-heading text-lg font-semibold">Math Panel</h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeDigit && (
                  <span className="gv-pill">
                    Multi-digit mode: showing digit {activeDigit} computation
                  </span>
                )}
                <button onClick={() => setSize('compact')} className="gv-button gv-button-secondary min-h-9 px-3 py-2" aria-label="Compact math panel">
                  <Minimize2 size={14} />
                </button>
                <button onClick={() => setSize('standard')} className="gv-button gv-button-secondary min-h-9 px-3 py-2" aria-label="Standard math panel">
                  <ChevronsDown size={14} />
                </button>
                <button onClick={() => setSize('focus')} className="gv-button gv-button-secondary min-h-9 px-3 py-2" aria-label="Expand math panel">
                  <Maximize2 size={14} />
                </button>
                <Button variant="ghost" size="sm" onClick={toggleMathPanel} aria-label="Close math panel">
                  <X size={16} />
                </Button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto py-4 gv-scrollbar">
              {!result ? (
                <div className="grid h-full place-items-center text-center">
                  <div>
                    <p className="font-heading text-xl font-semibold">Draw a digit to activate the computation trace.</p>
                    <p className="gv-copy mt-2 max-w-xl text-sm">
                      The panel will show each matrix multiply, ReLU activation, softmax probability, weight distribution, and training-gradient explanation for the active prediction.
                    </p>
                  </div>
                </div>
              ) : (
                <Tabs value={mathPanelTab} onValueChange={(v) => setMathTab(v as typeof mathPanelTab)}>
                  <TabsList className="mb-4 border" style={{ borderColor: 'var(--gv-line)', background: 'var(--gv-panel-strong)' }}>
                    <TabsTrigger value="forward" className="font-code text-xs">Forward Pass</TabsTrigger>
                    <TabsTrigger value="weights" className="font-code text-xs">Weight Inspector</TabsTrigger>
                    <TabsTrigger value="backprop" className="font-code text-xs">Backpropagation</TabsTrigger>
                  </TabsList>
                  <TabsContent value="forward"><ForwardPassTab /></TabsContent>
                  <TabsContent value="weights"><WeightsTab /></TabsContent>
                  <TabsContent value="backprop"><BackpropTab /></TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
