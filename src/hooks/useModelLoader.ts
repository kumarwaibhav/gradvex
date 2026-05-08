'use client'

import { useEffect } from 'react'
import { useNetworkStore } from '@/store/networkStore'
import { loadWeights } from '@/lib/model/loader'

export function useModelLoader() {
  const { modelLoaded, setModelLoading, setModelLoaded, setWeights, setLoadingProgress } = useNetworkStore()

  useEffect(() => {
    if (modelLoaded) return

    setModelLoading(true)
    loadWeights((pct) => setLoadingProgress(pct))
      .then((weights) => {
        setWeights(weights)
        setModelLoaded(true)
        setLoadingProgress(100)
      })
      .catch((err) => {
        console.error('Weights load failed:', err)
        setModelLoading(false)
      })
  }, [modelLoaded, setModelLoading, setModelLoaded, setWeights, setLoadingProgress])
}
