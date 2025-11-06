'use client'

import React, { useState } from 'react'
import { Button } from '../../../components/ui/button'
import { Card, CardContent } from '../../../components/ui/card'
import { Label } from '../../../components/ui/label'
import { Switch } from '../../../components/ui/switch'
import { RadioGroup, RadioGroupItem } from '../../../components/ui/radio-group'
import { 
  Briefcase, 
  Users, 
  Palette, 
  GraduationCap, 
  Code, 
  Search,
  Bot,
  TestTube,
  Mail
} from 'lucide-react'
import { OnboardingData } from '../OnboardingFlow'

interface PreferencesProps {
  data: OnboardingData
  onNext: (data?: Partial<OnboardingData>) => void
  onBack: () => void
  isFirst: boolean
  isLast: boolean
}

export function Preferences({ data, onNext, onBack }: PreferencesProps) {
  const [useCase, setUseCase] = useState(data.useCase || '')
  const [aiAutomation, setAiAutomation] = useState(data.aiAutomation)
  const [emailAlerts, setEmailAlerts] = useState(data.emailAlerts)

  const useCases = [
    {
      id: 'freelance',
      title: 'Freelance',
      description: 'Individual contractor or consultant',
      icon: Briefcase
    },
    {
      id: 'small-business',
      title: 'Small Business',
      description: 'Local business or startup',
      icon: Users
    },
    {
      id: 'agency',
      title: 'Agency',
      description: 'Creative or marketing agency',
      icon: Palette
    },
    {
      id: 'coach',
      title: 'Coach / Content Creator',
      description: 'Educator, coach, or content creator',
      icon: GraduationCap
    },
    {
      id: 'developer',
      title: 'Developer',
      description: 'Software developer or tech professional',
      icon: Code
    },
    {
      id: 'exploring',
      title: 'Just Exploring',
      description: 'Learning about Lightning Network',
      icon: Search
    }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext({
      useCase: useCase || 'exploring',
      aiAutomation,
      emailAlerts
    })
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Help us tailor your experience
        </h2>
        <p className="text-gray-600">
          Tell us about your use case so we can customize your workspace
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Use Case Selection */}
        <div className="space-y-4">
          <Label className="text-lg font-medium">What's your use case?</Label>
          <RadioGroup value={useCase} onValueChange={setUseCase}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {useCases.map((option) => (
                <div key={option.id} className="relative">
                  <RadioGroupItem
                    value={option.id}
                    id={option.id}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={option.id}
                    className="flex items-start gap-4 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 peer-checked:border-blue-500 peer-checked:bg-blue-50 transition-all"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center peer-checked:bg-blue-100">
                      <option.icon className="h-5 w-5 text-gray-600 peer-checked:text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{option.title}</h3>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Preferences */}
        <div className="space-y-6">
          <Label className="text-lg font-medium">Preferences</Label>
          
          <div className="space-y-4">
            {/* AI Automation */}
            <Card className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Bot className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">AI Automation</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Enable AI agents to help with content creation, scheduling, and business operations
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={aiAutomation}
                    onCheckedChange={setAiAutomation}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Email Alerts */}
            <Card className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Mail className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Email Alerts</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Get notified about payments, system updates, and important events
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={emailAlerts}
                    onCheckedChange={setEmailAlerts}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Test Mode Info */}
            {data.testMode && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <TestTube className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-blue-900">Preview Mode Active</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        You're starting in preview mode with mock data. Perfect for exploring features safely.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Customization Preview */}
        <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200">
          <CardContent className="p-6">
            <h3 className="font-medium text-gray-900 mb-4">Your Customized Experience</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span className="text-gray-700">
                  Workspace optimized for {useCases.find(u => u.id === useCase)?.title.toLowerCase() || 'general use'}
                </span>
              </div>
              {aiAutomation && (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span className="text-gray-700">AI automation and smart suggestions enabled</span>
                </div>
              )}
              {emailAlerts && (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-gray-700">Email notifications for important events</span>
                </div>
              )}
              {data.testMode && (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-gray-700">Safe preview mode with mock data</span>
                </div>
              )}
            </div>
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