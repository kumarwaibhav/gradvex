import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  // Static export — works on Cloudflare Pages, GitHub Pages, any CDN
  // Safe because GradVex has zero API routes / server functions
  output: 'export',

  // Required for static export — Next.js image optimisation needs a server
  images: {
    unoptimized: true,
  },

  turbopack: {
    root: path.resolve(__dirname),
  },
}

export default nextConfig
