import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Evens Louis',
  description: 'AI automation engineer — selected work and contact.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

