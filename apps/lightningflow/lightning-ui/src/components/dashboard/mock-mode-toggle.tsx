"use client"

import { useState } from "react"
import { Switch } from "../ui/switch"
import { toast } from "sonner"

interface MockModeToggleProps {
  initialState?: boolean
  onChange?: (enabled: boolean) => void
}

export function MockModeToggle({ initialState = true, onChange }: MockModeToggleProps) {
  const [enabled, setEnabled] = useState(initialState)

  const handleChange = (checked: boolean) => {
    setEnabled(checked)
    
    if (checked) {
      toast.success("Mock mode enabled", {
        description: "Using simulated Lightning node data."
      })
    } else {
      toast.info("Mock mode disabled", {
        description: "Connecting to real Lightning node..."
      })
    }
    
    if (onChange) {
      onChange(checked)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Switch
        checked={enabled}
        onCheckedChange={handleChange}
        className="data-[state=checked]:bg-blue-600"
      />
      <label className="text-sm font-medium leading-none">
        {enabled ? "Mock Mode Active" : "Live Mode"}
      </label>
    </div>
  )
} 