'use client'

import { useEffect } from 'react'
import { useCanvasDrawing } from '@/hooks/useCanvasDrawing'
import { useInference } from '@/hooks/useInference'
import { useNetworkStore } from '@/store/networkStore'
import { clearCanvas } from '@/lib/utils/canvas'
import { Eraser, RefreshCw } from 'lucide-react'

export function DrawingCanvas() {
  const { modelLoaded, modelLoading, loadingProgress, clearResult, clearMultiResults } = useNetworkStore()
  const { infer } = useInference()

  const { canvasRef, handlers, clear } = useCanvasDrawing({
    brushSize: 16,
    onDraw: (canvas) => infer(canvas),
  })

  useEffect(() => {
    if (!canvasRef.current) return
    clearCanvas(canvasRef.current)
  }, [canvasRef])

  const handleClear = () => {
    clear()
    clearResult()
    clearMultiResults()
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full items-center justify-between">
        <span className="text-xs font-code gv-muted">Draw a digit (0-9)</span>
        {modelLoaded && <span className="text-[10px] font-code gv-lime">Live inference</span>}
      </div>

      <div className="relative w-full">
        <canvas
          ref={canvasRef}
          width={280}
          height={280}
          className="mx-auto block aspect-square w-full max-w-[280px] touch-none rounded-xl"
          style={{
            background: '#050505',
            border: '1px solid color-mix(in srgb, var(--gv-cyan) 28%, transparent)',
            imageRendering: 'pixelated',
            cursor: 'crosshair',
            boxShadow: 'inset 0 0 24px rgba(0,0,0,0.7), 0 18px 42px rgba(0,0,0,0.18)',
          }}
          {...handlers}
        />

        {modelLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl" style={{ background: 'rgba(4, 15, 15, 0.86)' }}>
            <RefreshCw className="animate-spin" size={22} style={{ color: 'var(--gv-cyan)' }} />
            <div className="flex w-48 flex-col gap-1.5">
              <div className="flex justify-between text-[10px] font-code" style={{ color: 'var(--gv-muted)' }}>
                <span>Loading weights</span>
                <span style={{ color: 'var(--gv-cyan)' }}>{loadingProgress}%</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${loadingProgress}%`, background: 'linear-gradient(90deg, var(--gv-cyan), var(--gv-lime))' }} />
              </div>
            </div>
          </div>
        )}

        {!modelLoaded && !modelLoading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl" style={{ background: 'rgba(4, 15, 15, 0.72)' }}>
            <span className="text-xs font-code" style={{ color: 'var(--gv-muted)' }}>Model unavailable</span>
          </div>
        )}
      </div>

      <button onClick={handleClear} className="gv-button gv-button-secondary min-h-9 px-4 py-2 text-xs">
        <Eraser size={13} />
        Clear
      </button>

      <p className="text-center text-[10px] font-code gv-faint">
        White ink on black, centered and large.
      </p>
    </div>
  )
}
