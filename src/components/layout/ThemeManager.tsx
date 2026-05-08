'use client'

import { useEffect } from 'react'
import { useUIStore } from '@/store/uiStore'

export function ThemeManager() {
  const theme = useUIStore((s) => s.theme)

  useEffect(() => {
    const saved = window.localStorage.getItem('gradvex-theme')
    if (saved === 'dark' || saved === 'light') {
      useUIStore.setState({ theme: saved })
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
    }
  }, [theme])

  return null
}
