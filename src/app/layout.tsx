import type { Metadata } from 'next'
import { Geist, Geist_Mono, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { ThemeManager } from '@/components/layout/ThemeManager'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })
const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'GradVex — Neural Network Visualizer',
  description: 'Draw a digit. Watch 109,386 parameters fire in real time. Understand deep learning through live, interactive visualization — no installation, runs entirely in your browser.',
  keywords: ['neural network', 'deep learning', 'MNIST', 'visualization', 'machine learning', 'education'],
  metadataBase: new URL('https://gradvex.pages.dev'),
  openGraph: {
    title: 'GradVex — Neural Network Studio',
    description: 'Draw a digit. Watch 109,386 parameters fire in real time. Free, browser-native neural network visualizer — no installation required.',
    url: 'https://gradvex.pages.dev',
    siteName: 'GradVex',
    images: [
      {
        url: '/logo.png',
        width: 1024,
        height: 1024,
        alt: 'GradVex — Neural Network Studio',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GradVex — Neural Network Studio',
    description: 'Draw a digit. Watch 109,386 parameters fire in real time.',
    images: ['/logo.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} dark`}>
      <body suppressHydrationWarning className="min-h-screen antialiased">
        <ThemeManager />
        <Navbar />
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}
