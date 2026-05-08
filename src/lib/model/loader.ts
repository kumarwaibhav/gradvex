import type { ModelWeights } from './types'

interface WeightsJSON {
  W1: number[][]  // [784][128]
  b1: number[]    // [128]
  W2: number[][]  // [128][64]
  b2: number[]    // [64]
  W3: number[][]  // [64][10]
  b3: number[]    // [10]
}

let cachedWeights: ModelWeights | null = null
let loadingPromise: Promise<ModelWeights> | null = null

export async function loadWeights(onProgress?: (pct: number) => void): Promise<ModelWeights> {
  if (cachedWeights) return cachedWeights
  if (loadingPromise) return loadingPromise

  loadingPromise = (async () => {
    const res = await fetch('/model/weights.json')
    if (!res.ok) throw new Error(`Model weights not found (${res.status}). Run: python scripts/train_mnist.py`)

    let json: WeightsJSON
    const contentLength = res.headers.get('Content-Length')
    const total = contentLength ? parseInt(contentLength, 10) : 0

    if (onProgress && total > 0 && res.body) {
      const reader = res.body.getReader()
      let received = 0
      const chunks: Uint8Array[] = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
        received += value.length
        onProgress(Math.min(99, Math.round((received / total) * 100)))
      }

      const full = new Uint8Array(received)
      let pos = 0
      for (const chunk of chunks) {
        full.set(chunk, pos)
        pos += chunk.length
      }

      json = JSON.parse(new TextDecoder().decode(full)) as WeightsJSON
      onProgress(100)
    } else {
      json = await res.json() as WeightsJSON
    }

    const weights: ModelWeights = {
      W1: json.W1,
      b1: json.b1,
      W2: json.W2,
      b2: json.b2,
      W3: json.W3,
      b3: json.b3,
    }
    cachedWeights = weights
    return weights
  })()

  return loadingPromise
}

export function extractWeights(weights: ModelWeights): ModelWeights {
  return weights
}
