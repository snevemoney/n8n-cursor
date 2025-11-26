'use client'

import React, { useState } from 'react'
import { Button } from '../../../components/ui/button'
import { Card, CardContent } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Badge } from '../../../components/ui/badge'
import { Sparkles, Zap, RefreshCw } from 'lucide-react'
import { OnboardingData } from '../OnboardingFlow'

interface NameNodeProps {
  data: OnboardingData
  onNext: (data?: Partial<OnboardingData>) => void
  onBack: () => void
  isFirst: boolean
  isLast: boolean
}

export function NameNode({ data, onNext, onBack }: NameNodeProps) {
  const [nodeName, setNodeName] = useState(data.nodeName || '')
  const [isGenerating, setIsGenerating] = useState(false)

  const suggestions = [
    'My Lightning Node',
    'Creator Vault',
    'Bitcoin Ops',
    'Pluto Hub',
    'Lightning Studio',
    'Sovereign Node',
    'Digital Mint',
    'Thunder Bay',
    'Satoshi Station',
    'Lightning Labs'
  ]

  const generateRandomName = async () => {
    setIsGenerating(true)
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)]
    setNodeName(randomSuggestion)
    setIsGenerating(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext({ nodeName: nodeName || 'Untitled Workspace' })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          What should we call your Lightning workspace?
        </h2>
        <p className="text-gray-600">
          Choose a name that represents your business or creative work
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Input */}
        <div className="space-y-2">
          <Label htmlFor="nodeName" className="text-lg font-medium">
            Workspace Name
          </Label>
          <div className="relative">
            <Input
              id="nodeName"
              value={nodeName}
              onChange={(e) => setNodeName(e.target.value)}
              placeholder="Enter your workspace name..."
              className="text-lg py-3 pr-12"
              maxLength={50}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={generateRandomName}
              disabled={isGenerating}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            {nodeName.length}/50 characters
          </p>
        </div>

        {/* Live Preview */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {nodeName || 'Untitled Workspace'}
                </h3>
                <p className="text-sm text-gray-600">Lightning AI Node</p>
              </div>
              {data.testMode && (
                <Badge variant="outline" className="ml-auto">
                  Preview Mode
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600">
              This is how your workspace will appear in the navigation and to your clients
            </p>
          </CardContent>
        </Card>

        {/* Suggestions */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Quick Suggestions</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {suggestions.slice(0, 6).map((suggestion, index) => (
              <Button
                key={index}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setNodeName(suggestion)}
                className="justify-start text-left h-auto py-2 px-3"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>

        {/* Tips */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <h4 className="font-medium text-yellow-900 mb-2">💡 Naming Tips</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Keep it professional and memorable</li>
              <li>• Avoid special characters or numbers</li>
              <li>• Consider your brand or business name</li>
              <li>• You can change this later in settings</li>
            </ul>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
          <Button 
            type="submit"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  )
} 