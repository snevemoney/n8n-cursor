"use client"

import { ThemeProvider } from "./theme-provider"
import { Toaster } from "./ui/toast"
import { UserSettingsProvider } from "./providers/user-settings-provider"
import { ModeProvider } from "../contexts/ModeContext"
import { BTCProvider } from "../hooks/useBTCContext"

/**
 * @interface ProvidersProps
 * @description Props for the Providers component
 * @property {React.ReactNode} children - The child components to be wrapped by the providers
 */
interface ProvidersProps {
  children: React.ReactNode
}

/**
 * @component
 * @description A client component that wraps the application with all necessary providers.
 * Currently includes ThemeProvider for dark/light mode, UserSettingsProvider for app settings,
 * BTCProvider for live Bitcoin price context, and Toaster for notifications.
 * 
 * @example
 * // In your layout file
 * import { Providers } from "../components/providers"
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <Providers>
 *           {children}
 *         </Providers>
 *       </body>
 *     </html>
 *   )
 * }
 * 
 * @param {ProvidersProps} props - Component props
 * @param {React.ReactNode} props.children - Child components to be wrapped
 * @returns {JSX.Element} The application wrapped with all necessary providers
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <ModeProvider>
        <UserSettingsProvider>
          <BTCProvider>
            {children}
            <Toaster />
          </BTCProvider>
        </UserSettingsProvider>
      </ModeProvider>
    </ThemeProvider>
  )
} 