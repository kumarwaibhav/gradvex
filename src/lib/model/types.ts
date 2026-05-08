export interface InferenceResult {
  inputTensor: number[]        // [784]
  layer1Pre: number[]          // [128] pre-ReLU z values
  layer1Post: number[]         // [128] post-ReLU activations
  layer2Pre: number[]          // [64]
  layer2Post: number[]         // [64]
  outputLogits: number[]       // [10] pre-softmax
  outputProbs: number[]        // [10] softmax probabilities
  prediction: number           // 0-9 argmax
  confidence: number           // max probability 0-1
}

export interface ModelWeights {
  W1: number[][]  // [128][784]
  b1: number[]    // [128]
  W2: number[][]  // [64][128]
  b2: number[]    // [64]
  W3: number[][]  // [10][64]
  b3: number[]    // [10]
}

export interface HoveredNode {
  layer: number
  index: number
}

export interface HoveredEdge {
  fromLayer: number
  fromIdx: number
  toIdx: number
}

export type MathTab = 'forward' | 'backprop' | 'weights'
export type ArchMode = 'shallow' | 'standard' | 'deep'
export type MathLevel = 2 | 3
