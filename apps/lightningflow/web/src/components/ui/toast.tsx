"use client"

import { Toaster as SonnerToaster } from "sonner"

/**
 * @component
 * @description A custom toast notification component that wraps Sonner's Toaster with Lightning AI Platform styling.
 * Provides toast notifications with various states (success, error, warning, info) and consistent styling.
 * 
 * @example
 * // In your layout or app component
 * import { Toaster } from "../components/ui/toast"
 * 
 * export default function Layout({ children }) {
 *   return (
 *     <>
 *       {children}
 *       <Toaster />
 *     </>
 *   )
 * }
 * 
 * @returns {JSX.Element} A styled toast notification container
 */
export function Toaster() {
  return (
    <SonnerToaster 
      position="top-right"
      toastOptions={{
        style: {
          background: "rgba(32, 32, 36, 0.95)",
          color: "hsl(210, 20%, 98%)",
          border: "1px solid rgba(64, 64, 70, 0.5)",
          backdropFilter: "blur(8px)",
        },
        duration: 4000,
      }}
      closeButton
    />
  )
} 