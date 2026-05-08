/**
 * Maps activation value [0,1] to HSL color string
 * 0 → dark blue-gray (inactive)
 * 0.5 → bright cyan (partial)
 * 1 → bright yellow (fully active)
 */
export function activationToColor(value: number): string {
  const clamped = Math.max(0, Math.min(1, value))
  // Interpolate hue: 240 (blue) → 180 (cyan) → 60 (yellow)
  const hue = 240 - clamped * 180
  const saturation = 20 + clamped * 80
  const lightness = 15 + clamped * 55
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

export function activationToOpacity(value: number): number {
  return 0.1 + Math.abs(value) * 0.9
}

/**
 * Weight value → edge color (blue=positive, red=negative)
 */
export function weightToColor(weight: number): string {
  if (weight >= 0) return `rgba(59, 130, 246, ${Math.min(1, weight * 3)})`   // blue
  return `rgba(239, 68, 68, ${Math.min(1, Math.abs(weight) * 3)})`            // red
}

/**
 * Weight magnitude → edge stroke width (0.5 – 3px)
 */
export function weightToThickness(weight: number, maxWeight: number): number {
  return 0.5 + (Math.abs(weight) / (maxWeight || 1)) * 2.5
}

/**
 * Confidence [0,1] → color class
 */
export function confidenceClass(conf: number): string {
  if (conf >= 0.9) return 'text-green-400'
  if (conf >= 0.6) return 'text-yellow-400'
  return 'text-red-400'
}

export function confidenceLabel(conf: number): string {
  if (conf >= 0.9) return 'High confidence'
  if (conf >= 0.6) return 'Medium confidence'
  return 'Low confidence'
}
