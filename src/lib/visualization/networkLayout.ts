export interface NodePosition {
  x: number
  y: number
  layer: number
  index: number      // visual index (0-19 for hidden layers)
  realIndex: number  // actual neuron index
  isEllipsis?: boolean
}

export interface LayerConfig {
  realSize: number
  displaySize: number
  label: string
  activationFn: string
}

export const LAYER_CONFIGS: LayerConfig[] = [
  { realSize: 784, displaySize: 0, label: 'Input', activationFn: 'none' },       // shown as pixel grid
  { realSize: 128, displaySize: 16, label: 'Hidden 1', activationFn: 'ReLU' },
  { realSize: 64,  displaySize: 12, label: 'Hidden 2', activationFn: 'ReLU' },
  { realSize: 10,  displaySize: 10, label: 'Output', activationFn: 'Softmax' },
]

export const MAX_DISPLAY_NODES = 16

/**
 * Calculate SVG positions for all visible nodes
 * Returns array of NodePosition objects
 */
export function calculateNodePositions(
  svgWidth: number,
  svgHeight: number
): NodePosition[][] {
  const layerCount = LAYER_CONFIGS.length
  const paddingX = 80
  const availableWidth = svgWidth - paddingX * 2
  const layerSpacing = availableWidth / (layerCount - 1)

  const layers: NodePosition[][] = []

  LAYER_CONFIGS.forEach((config, layerIdx) => {
    const x = paddingX + layerIdx * layerSpacing
    const display = config.displaySize
    if (display === 0) {
      layers.push([])
      return
    }

    const nodeSpacing = Math.min(32, (svgHeight - 80) / display)
    const totalHeight = nodeSpacing * (display - 1)
    const startY = (svgHeight - totalHeight) / 2

    const nodes: NodePosition[] = []
    for (let i = 0; i < display; i++) {
      // Map display index to evenly spread real indices
      const realIndex = Math.floor((i / display) * config.realSize)
      nodes.push({
        x,
        y: startY + i * nodeSpacing,
        layer: layerIdx,
        index: i,
        realIndex,
      })
    }
    layers.push(nodes)
  })

  return layers
}
