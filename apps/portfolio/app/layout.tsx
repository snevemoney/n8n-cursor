import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Evens - AI Automation Developer',
  description: 'AI Automation Developer & Workflow Builder',
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

