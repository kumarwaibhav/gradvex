import { canvasToInputTensor } from '@/lib/model/preprocessing'

export interface DigitRegion {
  x: number
  y: number
  w: number
  h: number
}

/**
 * Find bounding boxes of separate digit strokes using column-projection segmentation.
 * Returns regions sorted left → right.
 */
export function findDigitRegions(
  canvas: HTMLCanvasElement,
  minWidth = 18,
  minGap = 12
): DigitRegion[] {
  const W = canvas.width
  const H = canvas.height
  const ctx = canvas.getContext('2d')!
  const { data } = ctx.getImageData(0, 0, W, H)

  // Column projection: sum of brightness per column
  const colBright = new Float32Array(W)
  for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) {
      colBright[x] += data[(y * W + x) * 4] // red channel
    }
  }

  // Row projection: find y bounds of all content
  const rowBright = new Float32Array(H)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      rowBright[y] += data[(y * W + x) * 4]
    }
  }

  const colThresh = 30 * 255   // column must have ≥30 bright pixels
  const rowThresh = 20 * 255   // row must have ≥20 bright pixels

  // Find global y-extent
  let minY = H, maxY = 0
  for (let y = 0; y < H; y++) {
    if (rowBright[y] > rowThresh) {
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
  }
  if (minY > maxY) return []

  // Find x-segments: contiguous runs of bright columns
  const segments: Array<{ start: number; end: number }> = []
  let segStart = -1

  for (let x = 0; x <= W; x++) {
    const bright = x < W && colBright[x] > colThresh
    if (bright) {
      if (segStart === -1) segStart = x
    } else {
      if (segStart !== -1) {
        segments.push({ start: segStart, end: x - 1 })
        segStart = -1
      }
    }
  }

  // Merge segments that are close together (connecting strokes of one digit)
  const merged: Array<{ start: number; end: number }> = []
  for (const seg of segments) {
    if (merged.length === 0) {
      merged.push({ ...seg })
      continue
    }
    const last = merged[merged.length - 1]
    if (seg.start - last.end <= minGap) {
      last.end = Math.max(last.end, seg.end)
    } else {
      merged.push({ ...seg })
    }
  }

  // Convert to DigitRegion, filter by minimum width
  const regions: DigitRegion[] = merged
    .filter((s) => s.end - s.start + 1 >= minWidth)
    .map((s) => ({
      x: s.start,
      y: minY,
      w: s.end - s.start + 1,
      h: maxY - minY + 1,
    }))

  return regions
}

/**
 * Extract a single digit region from the source canvas and return a 28×28 canvas
 * ready for preprocessing (centered, padded, black background).
 */
export function extractDigitCanvas(
  sourceCanvas: HTMLCanvasElement,
  region: DigitRegion,
  pad = 20
): HTMLCanvasElement {
  const out = document.createElement('canvas')
  out.width = 28
  out.height = 28
  const ctx = out.getContext('2d')!

  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, 28, 28)

  // Make the crop square and centered around the digit
  const squareSize = Math.max(region.w, region.h) + pad * 2
  const srcX = region.x - (squareSize - region.w) / 2
  const srcY = region.y - (squareSize - region.h) / 2

  ctx.drawImage(sourceCanvas, srcX, srcY, squareSize, squareSize, 0, 0, 28, 28)
  return out
}

/**
 * Extract the input tensor for a single region.
 */
export function regionToTensor(sourceCanvas: HTMLCanvasElement, region: DigitRegion): number[] {
  const digitCanvas = extractDigitCanvas(sourceCanvas, region)
  return canvasToInputTensor(digitCanvas)
}
