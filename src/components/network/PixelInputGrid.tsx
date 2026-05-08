'use client'

interface PixelInputGridProps {
  pixels: number[] | null
  size?: number  // display size in px
}

export function PixelInputGrid({ pixels, size = 56 }: PixelInputGridProps) {
  return (
    <div
      className="rounded border border-zinc-800"
      style={{ width: size, height: size, position: 'relative', overflow: 'hidden' }}
    >
      {pixels ? (
        <canvas
          width={28}
          height={28}
          style={{ width: size, height: size, imageRendering: 'pixelated' }}
          ref={(canvas) => {
            if (!canvas) return
            const ctx = canvas.getContext('2d')!
            const imageData = ctx.createImageData(28, 28)
            for (let i = 0; i < 784; i++) {
              const v = Math.round(pixels[i] * 255)
              imageData.data[i * 4] = v
              imageData.data[i * 4 + 1] = v
              imageData.data[i * 4 + 2] = v
              imageData.data[i * 4 + 3] = 255
            }
            ctx.putImageData(imageData, 0, 0)
          }}
        />
      ) : (
        <div
          className="w-full h-full bg-zinc-900 flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          <span className="text-[8px] text-zinc-700 font-mono">28×28</span>
        </div>
      )}
    </div>
  )
}
