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
  description: 'Draw a digit. Watch a neural network think. Understand deep learning through real-time, interactive visualization.',
  keywords: ['neural network', 'deep learning', 'MNIST', 'visualization', 'machine learning', 'education'],
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
