/**
 * Lightning AI Node Platform - QR Code Component
 * 
 * Browser-safe QR code generation for Lightning invoices
 */

"use client"

import { useEffect, useRef } from 'react'
import QRCodeLibrary from 'qrcode'

interface QRCodeProps {
  value: string
  size?: number
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
  className?: string
}

export function QRCode({ 
  value, 
  size = 200, 
  errorCorrectionLevel = 'M',
  className 
}: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCodeLibrary.toCanvas(canvasRef.current, value, {
        width: size,
        errorCorrectionLevel,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        margin: 2
      }).catch(console.error)
    }
  }, [value, size, errorCorrectionLevel])

  if (!value) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-gray-500 text-sm">No data</span>
      </div>
    )
  }

  return (
    <canvas 
      ref={canvasRef}
      className={className}
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  )
}

export default QRCode 