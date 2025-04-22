import type { Metadata } from 'next'
import '../styles/globals.css'
import { PrefetchProvider } from '@/lib/prefetching'

export const metadata: Metadata = {
  title: 'Project Management System',
  description: 'A modern project management system built with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <PrefetchProvider>
          {children}
        </PrefetchProvider>
      </body>
    </html>
  )
} 