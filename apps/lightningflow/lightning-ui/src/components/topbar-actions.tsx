"use client"

import { useTheme } from "next-themes"
import { useSmartRedirect } from "@/hooks/useSmartRedirect"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Button } from "./ui/button"
import {
  Bell,
  LogOut,
  Moon,
  Settings,
  Sun,
  User,
  MessageSquareCode,
} from "lucide-react"

export function TopbarActions() {
  const { theme, setTheme } = useTheme()
  const { goTo, redirect } = useSmartRedirect({ context: 'topbar-actions' })

  return (
    <div className="flex items-center space-x-2">
      {/* Notifications Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost">
            <Bell className="w-5 h-5" />
            <span className="sr-only">Notifications</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="h-4 w-4 mr-2" />
            New user joined your node
          </DropdownMenuItem>
          <DropdownMenuItem>
            <MessageSquareCode className="h-4 w-4 mr-2" />
            AI Agent finished processing
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => alert("Marked all as read")}>
            Mark all as read
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Settings Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost">
            <Settings className="w-5 h-5" />
            <span className="sr-only">Settings</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Settings</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => goTo('SETTINGS')}>
            <Settings className="h-4 w-4 mr-2" />
            Preferences
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => goTo('AUTOMATIONS')}>
            <MessageSquareCode className="h-4 w-4 mr-2" />
            AI Assistant
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? (
              <>
                <Moon className="h-4 w-4 mr-2" />
                Dark Mode
              </>
            ) : (
              <>
                <Sun className="h-4 w-4 mr-2" />
                Light Mode
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => goTo('DASHBOARD')}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
} 