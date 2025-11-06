"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Switch } from '../../../components/ui/switch'
import { Badge } from '../../../components/ui/badge'
import { 
  ArrowLeft, 
  Zap, 
  Building2, 
  CreditCard, 
  Mail, 
  Phone, 
  Banknote,
  Apple,
  Smartphone,
  Save,
  TestTube
} from 'lucide-react'

interface PaymentMethodConfig {
  id: string
  name: string
  icon: string
  description: string
  enabled: boolean
  configured: boolean
  config: Record<string, any>
}

export default function PaymentMethodsPage() {
  const router = useRouter()
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([
    {
      id: 'lightning',
      name: 'Lightning Network',
      icon: 'zap',
      description: 'Pay instantly with Bitcoin Lightning Network',
      enabled: true,
      configured: true,
      config: {}
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: 'building2',
      description: 'Pay via bank transfer',
      enabled: false,
      configured: false,
      config: {
        accountNumber: '',
        routingNumber: '',
        bankName: '',
        accountHolder: ''
      }
    },
    {
      id: 'credit',
      name: 'Credit Card',
      icon: 'credit-card',
      description: 'Pay with credit or debit card',
      enabled: false,
      configured: false,
      config: {
        processor: 'stripe',
        apiKey: '',
        webhookUrl: ''
      }
    },
    {
      id: 'e-transfer',
      name: 'E-Transfer',
      icon: 'mail',
      description: 'Send e-transfer to email',
      enabled: false,
      configured: false,
      config: {
        email: '',
        bankName: '',
        accountHolder: ''
      }
    },
    {
      id: 'phone',
      name: 'Phone Payment',
      icon: 'phone',
      description: 'Pay via phone',
      enabled: false,
      configured: false,
      config: {
        phoneNumber: '',
        provider: '',
        instructions: ''
      }
    },
    {
      id: 'apple-pay',
      name: 'Apple Pay',
      icon: 'apple',
      description: 'Pay with Apple Pay',
      enabled: false,
      configured: false,
      config: {
        merchantId: '',
        certificatePath: '',
        privateKeyPath: ''
      }
    },
    {
      id: 'google-pay',
      name: 'Google Pay',
      icon: 'smartphone',
      description: 'Pay with Google Pay',
      enabled: false,
      configured: false,
      config: {
        merchantId: '',
        apiKey: '',
        environment: 'test'
      }
    },
    {
      id: 'cash',
      name: 'Cash',
      icon: 'banknote',
      description: 'Pay with cash',
      enabled: false,
      configured: false,
      config: {
        locations: '',
        instructions: '',
        contactPerson: ''
      }
    }
  ])

  const [editingMethod, setEditingMethod] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleToggleMethod = (methodId: string) => {
    setPaymentMethods(prev => prev.map(method => 
      method.id === methodId 
        ? { ...method, enabled: !method.enabled }
        : method
    ))
  }

  const handleEditMethod = (methodId: string) => {
    setEditingMethod(methodId)
  }

  const handleSaveMethod = async (methodId: string) => {
    setSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setPaymentMethods(prev => prev.map(method => 
      method.id === methodId 
        ? { ...method, configured: true }
        : method
    ))
    
    setEditingMethod(null)
    setSaving(false)
  }

  const handleCancelEdit = () => {
    setEditingMethod(null)
  }

  const handleConfigChange = (methodId: string, key: string, value: any) => {
    setPaymentMethods(prev => prev.map(method => 
      method.id === methodId 
        ? { 
            ...method, 
            config: { ...method.config, [key]: value }
          }
        : method
    ))
  }

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, any> = {
      zap: Zap,
      building2: Building2,
      'credit-card': CreditCard,
      mail: Mail,
      phone: Phone,
      banknote: Banknote,
      apple: Apple,
      smartphone: Smartphone
    }
    const IconComponent = iconMap[iconName] || Zap
    return <IconComponent className="h-5 w-5" />
  }

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-white">Payment Methods</h1>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" className="border-gray-700">
            <TestTube className="h-4 w-4 mr-2" />
            Test Mode
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="text-center py-4">
          <p className="text-gray-400">
            Configure which payment methods your customers can use to pay you
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paymentMethods.map((method) => (
            <Card key={method.id} className="border-gray-800 bg-gray-900/70">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      method.enabled ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700/20 text-gray-400'
                    }`}>
                      {getIconComponent(method.icon)}
                    </div>
                    <div>
                      <CardTitle className="text-lg text-white">{method.name}</CardTitle>
                      <CardDescription className="text-gray-400">
                        {method.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {method.configured && (
                      <Badge variant="secondary" className="bg-green-600/20 text-green-300">
                        Configured
                      </Badge>
                    )}
                    <Switch
                      checked={method.enabled}
                      onCheckedChange={() => handleToggleMethod(method.id)}
                    />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {method.enabled && (
                  <div className="space-y-4">
                    {!method.configured && method.id !== 'lightning' && (
                      <div className="space-y-3">
                        {method.id === 'bank' && (
                          <>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label htmlFor={`${method.id}-account`} className="text-gray-300">Account Number</Label>
                                <Input
                                  id={`${method.id}-account`}
                                  value={method.config.accountNumber || ''}
                                  onChange={(e) => handleConfigChange(method.id, 'accountNumber', e.target.value)}
                                  placeholder="123456789"
                                  className="bg-gray-800 border-gray-600 text-white"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`${method.id}-routing`} className="text-gray-300">Routing Number</Label>
                                <Input
                                  id={`${method.id}-routing`}
                                  value={method.config.routingNumber || ''}
                                  onChange={(e) => handleConfigChange(method.id, 'routingNumber', e.target.value)}
                                  placeholder="021000021"
                                  className="bg-gray-800 border-gray-600 text-white"
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor={`${method.id}-bankName`} className="text-gray-300">Bank Name</Label>
                              <Input
                                id={`${method.id}-bankName`}
                                value={method.config.bankName || ''}
                                onChange={(e) => handleConfigChange(method.id, 'bankName', e.target.value)}
                                placeholder="Chase Bank"
                                className="bg-gray-800 border-gray-600 text-white"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`${method.id}-holder`} className="text-gray-300">Account Holder</Label>
                              <Input
                                id={`${method.id}-holder`}
                                value={method.config.accountHolder || ''}
                                onChange={(e) => handleConfigChange(method.id, 'accountHolder', e.target.value)}
                                placeholder="Your Business Name"
                                className="bg-gray-800 border-gray-600 text-white"
                              />
                            </div>
                          </>
                        )}

                        {method.id === 'credit' && (
                          <>
                            <div>
                              <Label htmlFor={`${method.id}-processor`} className="text-gray-300">Payment Processor</Label>
                              <select
                                id={`${method.id}-processor`}
                                value={method.config.processor || 'stripe'}
                                onChange={(e) => handleConfigChange(method.id, 'processor', e.target.value)}
                                className="w-full bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2"
                              >
                                <option value="stripe">Stripe</option>
                                <option value="square">Square</option>
                                <option value="paypal">PayPal</option>
                              </select>
                            </div>
                            <div>
                              <Label htmlFor={`${method.id}-apiKey`} className="text-gray-300">API Key</Label>
                              <Input
                                id={`${method.id}-apiKey`}
                                type="password"
                                value={method.config.apiKey || ''}
                                onChange={(e) => handleConfigChange(method.id, 'apiKey', e.target.value)}
                                placeholder="pk_live_..."
                                className="bg-gray-800 border-gray-600 text-white"
                              />
                            </div>
                          </>
                        )}

                        {method.id === 'e-transfer' && (
                          <>
                            <div>
                              <Label htmlFor={`${method.id}-email`} className="text-gray-300">Email Address</Label>
                              <Input
                                id={`${method.id}-email`}
                                type="email"
                                value={method.config.email || ''}
                                onChange={(e) => handleConfigChange(method.id, 'email', e.target.value)}
                                placeholder="payments@yourbusiness.com"
                                className="bg-gray-800 border-gray-600 text-white"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`${method.id}-bankName`} className="text-gray-300">Bank Name</Label>
                              <Input
                                id={`${method.id}-bankName`}
                                value={method.config.bankName || ''}
                                onChange={(e) => handleConfigChange(method.id, 'bankName', e.target.value)}
                                placeholder="Your Bank Name"
                                className="bg-gray-800 border-gray-600 text-white"
                              />
                            </div>
                          </>
                        )}

                        {method.id === 'phone' && (
                          <>
                            <div>
                              <Label htmlFor={`${method.id}-phone`} className="text-gray-300">Phone Number</Label>
                              <Input
                                id={`${method.id}-phone`}
                                value={method.config.phoneNumber || ''}
                                onChange={(e) => handleConfigChange(method.id, 'phoneNumber', e.target.value)}
                                placeholder="(555) 123-4567"
                                className="bg-gray-800 border-gray-600 text-white"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`${method.id}-provider`} className="text-gray-300">Payment Provider</Label>
                              <Input
                                id={`${method.id}-provider`}
                                value={method.config.provider || ''}
                                onChange={(e) => handleConfigChange(method.id, 'provider', e.target.value)}
                                placeholder="e.g., PayPal, Venmo"
                                className="bg-gray-800 border-gray-600 text-white"
                              />
                            </div>
                          </>
                        )}

                        {method.id === 'cash' && (
                          <>
                            <div>
                              <Label htmlFor={`${method.id}-locations`} className="text-gray-300">Cash Payment Locations</Label>
                              <Input
                                id={`${method.id}-locations`}
                                value={method.config.locations || ''}
                                onChange={(e) => handleConfigChange(method.id, 'locations', e.target.value)}
                                placeholder="123 Main St, City, State"
                                className="bg-gray-800 border-gray-600 text-white"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`${method.id}-contact`} className="text-gray-300">Contact Person</Label>
                              <Input
                                id={`${method.id}-contact`}
                                value={method.config.contactPerson || ''}
                                onChange={(e) => handleConfigChange(method.id, 'contactPerson', e.target.value)}
                                placeholder="John Doe"
                                className="bg-gray-800 border-gray-600 text-white"
                              />
                            </div>
                          </>
                        )}

                        <div className="flex space-x-2 pt-2">
                          <Button
                            onClick={() => handleSaveMethod(method.id)}
                            disabled={saving}
                            className="flex-1"
                          >
                            {saving ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Save Configuration
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {method.configured && (
                      <div className="text-center py-4">
                        <Badge variant="secondary" className="bg-green-600/20 text-green-300 mb-2">
                          ✓ Configured
                        </Badge>
                        <p className="text-sm text-gray-400">
                          This payment method is ready to accept payments
                        </p>
                      </div>
                    )}

                    {method.id === 'lightning' && (
                      <div className="text-center py-4">
                        <Badge variant="secondary" className="bg-blue-600/20 text-blue-300 mb-2">
                          ⚡ Always Available
                        </Badge>
                        <p className="text-sm text-gray-400">
                          Lightning Network is automatically configured and always available
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {!method.enabled && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">
                      Enable this payment method to start accepting payments
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center py-8">
          <p className="text-gray-400 text-sm">
            Need help configuring a payment method? Contact our support team.
          </p>
        </div>
      </div>
    </div>
  )
}
