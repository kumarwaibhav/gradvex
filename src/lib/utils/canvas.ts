export function clearCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

/**
 * Begin a new smooth stroke at (x, y).
 * Draws an initial dot and sets up the path for continueStroke().
 */
export function beginStroke(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  brushSize: number
) {
  ctx.strokeStyle = '#ffffff'
  ctx.fillStyle = '#ffffff'
  ctx.lineWidth = brushSize * 2
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // Draw initial dot
  ctx.beginPath()
  ctx.arc(x, y, brushSize, 0, Math.PI * 2)
  ctx.fill()

  // Start path for continuation
  ctx.beginPath()
  ctx.moveTo(x, y)
}

/**
 * Extend stroke from last moveTo position to (x, y).
 * Call repeatedly on mousemove for smooth connected lines.
 */
export function continueStroke(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number
) {
  ctx.lineTo(x, y)
  ctx.stroke()
  // Reset path to current point to avoid re-stroking entire history
  ctx.beginPath()
  ctx.moveTo(x, y)
}

/**
 * Legacy: draw a single dot (kept for API compat)
 */
export function drawPixel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  brushSize: number
) {
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(x, y, brushSize, 0, Math.PI * 2)
  ctx.fill()
}

export function isCanvasBlank(canvas: HTMLCanvasElement): boolean {
  const ctx = canvas.getContext('2d')!
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] > 10) return false
  }
  return true
}
