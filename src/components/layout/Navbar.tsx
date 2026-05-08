'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUIStore } from '@/store/uiStore'
import { motion } from 'framer-motion'
import { Box, GitBranch, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const NAV_LINKS = [
  { href: '/playground', label: 'Playground' },
  { href: '/viz3d', label: '3D Lab' },
  { href: '/learn', label: 'Learn' },
  { href: '/architecture', label: 'Architecture' },
  { href: '/about', label: 'About' },
]

export function Navbar() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useUIStore()
  const [visible, setVisible] = useState(true)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return
      ticking.current = true
      requestAnimationFrame(() => {
        const y = window.scrollY
        const delta = y - lastScrollY.current
        if (y < 60) setVisible(true)
        else if (delta > 6) setVisible(false)
        else if (delta < -6) setVisible(true)
        lastScrollY.current = y
        ticking.current = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.nav
      className="fixed inset-x-0 top-0 z-50 glass"
      animate={{ y: visible ? 0 : -80, opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-3 sm:px-5">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border" style={{ borderColor: 'var(--gv-line)', background: 'var(--gv-cyan-soft)' }}>
            <Box size={16} style={{ color: 'var(--gv-cyan)' }} />
          </span>
          <span className="font-heading text-lg font-bold tracking-normal" style={{ color: 'var(--gv-text)' }}>
            GradVex
          </span>
          <span className="hidden rounded-full border px-2 py-0.5 text-[10px] font-code md:inline-flex" style={{ borderColor: 'var(--gv-line)', color: 'var(--gv-muted)' }}>
            Neural Network Studio
          </span>
        </Link>

        <div className="hidden items-center gap-1 overflow-x-auto rounded-full border p-1 md:flex" style={{ borderColor: 'var(--gv-line)', background: 'var(--gv-panel)' }}>
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn('rounded-full px-3 py-1.5 text-xs font-code transition-colors', active && 'font-bold')}
                style={{
                  background: active ? 'var(--gv-cyan-soft)' : 'transparent',
                  color: active ? 'var(--gv-cyan)' : 'var(--gv-muted)',
                }}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/10"
            style={{ color: 'var(--gv-muted)' }}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <a
            href="https://github.com/kumarwaibhav"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/10 sm:flex"
            style={{ color: 'var(--gv-muted)' }}
            aria-label="Open GitHub profile"
          >
            <GitBranch size={16} />
          </a>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto px-3 pb-2 md:hidden">
        {NAV_LINKS.map((link) => {
          const active = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className="shrink-0 rounded-full border px-3 py-1.5 text-xs font-code"
              style={{
                borderColor: active ? 'color-mix(in srgb, var(--gv-cyan) 40%, transparent)' : 'var(--gv-line)',
                background: active ? 'var(--gv-cyan-soft)' : 'var(--gv-panel)',
                color: active ? 'var(--gv-cyan)' : 'var(--gv-muted)',
              }}
            >
              {link.label}
            </Link>
          )
        })}
      </div>
    </motion.nav>
  )
}
