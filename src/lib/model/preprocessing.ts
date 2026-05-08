/**
 * Converts a 280×280 canvas into a normalized [784] float array
 * matching MNIST input format (28×28 grayscale, values 0-1)
 */
export function canvasToInputTensor(canvas: HTMLCanvasElement): number[] {
  const offscreen = document.createElement('canvas')
  offscreen.width = 28
  offscreen.height = 28
  const ctx = offscreen.getContext('2d')!

  // Downscale 280×280 → 28×28
  ctx.drawImage(canvas, 0, 0, 28, 28)
  const imageData = ctx.getImageData(0, 0, 28, 28)

  const pixels: number[] = []
  for (let i = 0; i < 784; i++) {
    // RGBA: use red channel (grayscale) normalized to [0, 1]
    // MNIST uses white digit on black — invert if drawing black on white
    const r = imageData.data[i * 4]
    pixels.push(r / 255)
  }
  return pixels
}

export function getPixelGrid(canvas: HTMLCanvasElement): number[] {
  return canvasToInputTensor(canvas)
}
