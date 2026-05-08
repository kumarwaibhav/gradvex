import type { InferenceResult, ModelWeights } from './types'

export interface BreakItConfig {
  biasDisabled: boolean
  weightNoise: number
  zeroedLayers: number[]
}

function relu(arr: number[]): number[] {
  return arr.map((v) => Math.max(0, v))
}

function softmax(arr: number[]): number[] {
  const max = Math.max(...arr)
  const exps = arr.map((v) => Math.exp(v - max))
  const sum = exps.reduce((a, b) => a + b, 0)
  return exps.map((v) => v / sum)
}

function matVecMul(W: number[][], x: number[], b: number[]): number[] {
  // W: [in, out], x: [in], b: [out] → output: [out]
  const out = b.slice()
  for (let j = 0; j < W[0].length; j++) {
    for (let i = 0; i < x.length; i++) {
      out[j] += W[i][j] * x[i]
    }
  }
  return out
}

function addNoise(W: number[][], noise: number): number[][] {
  if (noise === 0) return W
  return W.map(row => row.map(v => v + (Math.random() * 2 - 1) * noise * Math.abs(v)))
}

function zeros2d(rows: number, cols: number): number[][] {
  return Array.from({ length: rows }, () => new Array(cols).fill(0))
}

function zeros1d(n: number): number[] {
  return new Array(n).fill(0)
}

export function runInferenceSync(
  weights: ModelWeights,
  pixels: number[],
  breakIt?: Partial<BreakItConfig>
): InferenceResult {
  const biasDisabled = breakIt?.biasDisabled ?? false
  const noise = breakIt?.weightNoise ?? 0
  const zeroedLayers = breakIt?.zeroedLayers ?? []

  const W1 = zeroedLayers.includes(1)
    ? zeros2d(weights.W1.length, weights.W1[0].length)
    : addNoise(weights.W1, noise)
  const b1 = biasDisabled ? zeros1d(weights.b1.length) : weights.b1
  const W2 = zeroedLayers.includes(2)
    ? zeros2d(weights.W2.length, weights.W2[0].length)
    : addNoise(weights.W2, noise)
  const b2 = biasDisabled ? zeros1d(weights.b2.length) : weights.b2
  const W3 = zeroedLayers.includes(3)
    ? zeros2d(weights.W3.length, weights.W3[0].length)
    : addNoise(weights.W3, noise)
  const b3 = biasDisabled ? zeros1d(weights.b3.length) : weights.b3

  const layer1Pre = matVecMul(W1, pixels, b1)
  const layer1Post = relu(layer1Pre)
  const layer2Pre = matVecMul(W2, layer1Post, b2)
  const layer2Post = relu(layer2Pre)
  const outputLogits = matVecMul(W3, layer2Post, b3)
  const outputProbs = softmax(outputLogits)

  const prediction = outputProbs.indexOf(Math.max(...outputProbs))
  const confidence = outputProbs[prediction]

  return {
    inputTensor: pixels,
    layer1Pre,
    layer1Post,
    layer2Pre,
    layer2Post,
    outputLogits,
    outputProbs,
    prediction,
    confidence,
  }
}

export async function runInference(
  weights: ModelWeights,
  pixels: number[],
  breakIt?: Partial<BreakItConfig>
): Promise<InferenceResult> {
  return runInferenceSync(weights, pixels, breakIt)
}
