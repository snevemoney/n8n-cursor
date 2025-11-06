"use client"

import React from "react"
import { cn } from "../../lib/utils"

// Define button variants as simple strings
const variants = {
  default: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
  outline: "border border-gray-200 bg-white hover:bg-gray-50 text-gray-700",
  ghost: "hover:bg-gray-100 text-gray-700",
  danger: "bg-red-600 text-white hover:bg-red-700",
  lightning: "bg-yellow-400 text-gray-900 hover:bg-yellow-500 shadow-md",
}

// Define button sizes as simple strings
const sizes = {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-md px-3",
  lg: "h-11 rounded-md px-8",
  icon: "h-10 w-10",
}

// Base button styles
const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"

// Simple button props
type ButtonProps = {
  children?: any
  className?: string
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  type?: "button" | "submit" | "reset"
  disabled?: boolean
  onClick?: any
}

// Simple button component
function Button({
  children,
  className = "",
  variant = "default",
  size = "default",
  type = "button",
  disabled = false,
  onClick,
  ...props
}: ButtonProps) {
  // Combine all classes
  const buttonClasses = cn(
    baseStyles,
    variants[variant],
    sizes[size],
    className
  )

  return (
    <button
      type={type}
      disabled={disabled}
      className={buttonClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

export { Button }
export type { ButtonProps } 