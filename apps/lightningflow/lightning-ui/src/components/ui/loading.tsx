"use client"

import React from 'react'
import { Loader2 } from 'lucide-react'

type LoadingProps = {
  size?: 'small' | 'medium' | 'large'
  text?: string
  fullPage?: boolean
  className?: string
}

export function Loading({ 
  size = 'medium', 
  text = 'Loading...', 
  fullPage = false,
  className = ''
}: LoadingProps) {
  const sizeClass = {
    small: 'h-4 w-4',
    medium: 'h-6 w-6',
    large: 'h-10 w-10'
  }

  const content = (
    <div className={`flex items-center justify-center flex-col gap-2 ${className}`}>
      <Loader2 className={`animate-spin text-primary ${sizeClass[size]}`} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  )

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        {content}
      </div>
    )
  }

  return content
} 