'use client'

import { useRef, useCallback } from 'react'
import { clearCanvas, beginStroke, continueStroke } from '@/lib/utils/canvas'

interface UseCanvasDrawingOptions {
  brushSize?: number
  onDraw?: (canvas: HTMLCanvasElement) => void
}

export function useCanvasDrawing({ brushSize = 16, onDraw }: UseCanvasDrawingOptions = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)

  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    // Account for CSS scaling (canvas may be displayed smaller than its pixel size)
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ('touches' in e) {
      const touch = e.touches[0]
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      }
    }
    return {
      x: ((e as React.MouseEvent).clientX - rect.left) * scaleX,
      y: ((e as React.MouseEvent).clientY - rect.top) * scaleY,
    }
  }, [])

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    isDrawing.current = true
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const { x, y } = getPos(e)
    beginStroke(ctx, x, y, brushSize)
    // Trigger inference on start (dot drawn)
    onDraw?.(canvas)
  }, [brushSize, getPos, onDraw])

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const { x, y } = getPos(e)
    continueStroke(ctx, x, y)
    onDraw?.(canvas)
  }, [getPos, onDraw])

  const stopDraw = useCallback(() => {
    if (isDrawing.current && canvasRef.current) {
      onDraw?.(canvasRef.current)
    }
    isDrawing.current = false
  }, [onDraw])

  const clear = useCallback(() => {
    if (!canvasRef.current) return
    clearCanvas(canvasRef.current)
  }, [])

  return {
    canvasRef,
    handlers: {
      onMouseDown: startDraw,
      onMouseMove: draw,
      onMouseUp: stopDraw,
      onMouseLeave: stopDraw,
      onTouchStart: startDraw,
      onTouchMove: draw,
      onTouchEnd: stopDraw,
    },
    clear,
  }
}
