"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Switch } from "../../../components/ui/switch"
import { Key, Plug, Eye, EyeOff, Copy, Plus } from "lucide-react"

export default function IntegrationsPage() {
  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-purple-900/30 p-2 rounded-full">
          <Key className="h-6 w-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Integrations</h1>
          <p className="text-gray-400">API keys and external connections</p>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plug className="h-5 w-5 text-blue-500" />
              API Keys
            </CardTitle>
            <CardDescription>
              Manage API keys for external integrations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">OpenAI API</div>
                  <div className="text-sm text-gray-400">For AI assistant features</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-900/30 text-green-400">Connected</Badge>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Mempool.space API</div>
                  <div className="text-sm text-gray-400">For fee estimation</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Not Connected</Badge>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>External Services</CardTitle>
            <CardDescription>
              Configure external service integrations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Telegram notifications</Label>
                <p className="text-sm text-gray-400">Get alerts via Telegram bot</p>
              </div>
              <Switch />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Webhook notifications</Label>
                <p className="text-sm text-gray-400">Send events to external webhook</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 