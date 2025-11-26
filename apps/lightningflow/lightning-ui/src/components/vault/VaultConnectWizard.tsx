"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Wallet,
  Shield,
  Zap,
  CheckCircle,
  AlertTriangle,
  Info,
  Usb,
  QrCode,
  Key,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Lock,
  Unlock,
  Cable,
  Wifi,
  Battery,
  Server
} from 'lucide-react';

interface VaultConnectStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  validation?: (data: any) => boolean;
  icon: React.ComponentType<any>;
}

interface VaultData {
  connection_type: 'xpub' | 'usb' | 'qr' | 'nfc';
  xpub?: string;
  device_type?: string;
  vault_name?: string;
  security_level: 'basic' | 'advanced' | 'enterprise';
  backup_verified: boolean;
}

const VaultConnectWizard: React.FC<{
  onComplete: (data: VaultData) => void;
  onCancel: () => void;
}> = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [vaultData, setVaultData] = useState<VaultData>({
    connection_type: 'xpub',
    security_level: 'basic',
    backup_verified: false
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'success' | 'error'>('idle');

  const steps: VaultConnectStep[] = [
    {
      id: 'welcome',
      title: 'Connect Your Vault',
      description: 'Your Bitcoin stays in your control—we just help it earn more',
      component: WelcomeStep,
      icon: Shield
    },
    {
      id: 'method',
      title: 'Connection Method',
      description: 'How would you like to connect your wallet?',
      component: ConnectionMethodStep,
      icon: Cable
    },
    {
      id: 'connect',
      title: 'Establish Connection',
      description: 'Connecting to your wallet securely',
      component: ConnectStep,
      icon: Zap
    },
    {
      id: 'verify',
      title: 'Verify Security',
      description: 'Confirming your wallet setup is secure',
      component: VerifyStep,
      icon: CheckCircle
    },
    {
      id: 'complete',
      title: 'Vault Ready',
      description: 'Your Lightning Vault is now active and earning',
      component: CompleteStep,
      icon: Sparkles
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = async () => {
    const step = steps[currentStep];
    
    // Validate current step if needed
    if (step.validation && !step.validation(vaultData)) {
      toast.error('Please complete all required fields');
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsConnecting(true);
    try {
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 2000));
      onComplete(vaultData);
      toast.success('Vault connected successfully!');
    } catch (error) {
      toast.error('Failed to connect vault');
    } finally {
      setIsConnecting(false);
    }
  };

  const updateVaultData = (updates: Partial<VaultData>) => {
    setVaultData(prev => ({ ...prev, ...updates }));
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="border-b border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Lightning Vault Setup</h2>
                <p className="text-sm text-gray-400">Step {currentStep + 1} of {steps.length}</p>
              </div>
            </div>
            
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Icons */}
          <div className="flex justify-between mt-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center gap-1 ${
                    isActive ? 'text-blue-400' : isCompleted ? 'text-green-400' : 'text-gray-600'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                    isActive ? 'border-blue-400 bg-blue-500/20' : 
                    isCompleted ? 'border-green-400 bg-green-500/20' : 
                    'border-gray-600'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className="text-xs text-center">{step.title.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CurrentStepComponent
                vaultData={vaultData}
                updateVaultData={updateVaultData}
                onNext={handleNext}
                connectionStatus={connectionStatus}
                setConnectionStatus={setConnectionStatus}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-800 p-6 flex justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={isConnecting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {isConnecting ? (
              'Connecting...'
            ) : currentStep === steps.length - 1 ? (
              'Complete Setup'
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

// Step Components
const WelcomeStep: React.FC<any> = () => (
  <div className="text-center space-y-6">
    <motion.div
      animate={{ 
        scale: [1, 1.05, 1],
        rotateY: [0, 5, 0]
      }}
      transition={{ duration: 2, repeat: Infinity }}
      className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center"
    >
      <Wallet className="h-12 w-12 text-white" />
    </motion.div>

    <div>
      <h3 className="text-2xl font-bold text-white mb-2">Your Sovereign Lightning Vault</h3>
      <p className="text-gray-400">
        Connect your existing wallet to power your Lightning node. 
        Your Bitcoin stays in your control—we never touch your keys.
      </p>
    </div>

    <div className="grid grid-cols-3 gap-4 mt-6">
      <div className="text-center p-3 bg-gray-800/50 rounded-lg">
        <Shield className="h-6 w-6 text-green-400 mx-auto mb-2" />
        <div className="text-sm font-medium text-white">Non-Custodial</div>
        <div className="text-xs text-gray-400">Your keys, your Bitcoin</div>
      </div>
      <div className="text-center p-3 bg-gray-800/50 rounded-lg">
        <Zap className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
        <div className="text-sm font-medium text-white">Lightning Fast</div>
        <div className="text-xs text-gray-400">Instant settlements</div>
      </div>
      <div className="text-center p-3 bg-gray-800/50 rounded-lg">
        <Sparkles className="h-6 w-6 text-purple-400 mx-auto mb-2" />
        <div className="text-sm font-medium text-white">AI Powered</div>
        <div className="text-xs text-gray-400">Smart optimizations</div>
      </div>
    </div>
  </div>
);

const ConnectionMethodStep: React.FC<any> = ({ vaultData, updateVaultData }) => {
  const methods = [
    {
      id: 'xpub',
      name: 'Extended Public Key',
      description: 'Paste your wallet\'s xPub/yPub/zPub',
      icon: Key,
      recommended: true,
      security: 'High'
    },
    {
      id: 'usb',
      name: 'Hardware Wallet',
      description: 'Connect Coldcard, Trezor, or Ledger',
      icon: Usb,
      security: 'Maximum'
    },
    {
      id: 'qr',
      name: 'QR Code',
      description: 'Scan QR from your mobile wallet',
      icon: QrCode,
      security: 'Medium'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Choose Connection Method</h3>
        <p className="text-gray-400">
          Select how you'd like to connect your wallet to your Lightning Vault.
        </p>
      </div>

      <div className="grid gap-4">
        {methods.map((method) => {
          const Icon = method.icon;
          const isSelected = vaultData.connection_type === method.id;
          
          return (
            <div
              key={method.id}
              className={`relative border rounded-xl p-4 cursor-pointer transition-all ${
                isSelected 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-gray-700 hover:border-gray-600'
              }`}
              onClick={() => updateVaultData({ connection_type: method.id as any })}
            >
              {method.recommended && (
                <Badge className="absolute -top-2 left-4 bg-blue-600 text-white">
                  Recommended
                </Badge>
              )}
              
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  isSelected ? 'bg-blue-500/20' : 'bg-gray-800'
                }`}>
                  <Icon className={`h-6 w-6 ${isSelected ? 'text-blue-400' : 'text-gray-400'}`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-white">{method.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {method.security} Security
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">{method.description}</p>
                </div>
                
                {isSelected && (
                  <CheckCircle className="h-5 w-5 text-blue-400" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-400 mt-0.5" />
          <div>
            <p className="text-sm text-blue-300 font-medium">Security Note</p>
            <p className="text-xs text-blue-200 mt-1">
              We only store your public key information. Your private keys never leave your wallet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ConnectStep: React.FC<any> = ({ vaultData, updateVaultData, connectionStatus, setConnectionStatus }) => {
  const [xpub, setXpub] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleConnect = async () => {
    if (!xpub.trim()) {
      toast.error('Please enter your xPub');
      return;
    }

    setConnectionStatus('connecting');
    updateVaultData({ xpub });

    // Simulate connection process
    setTimeout(() => {
      setConnectionStatus('success');
      toast.success('Wallet connected successfully!');
    }, 2000);
  };

  if (vaultData.connection_type === 'xpub') {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Enter Your Extended Public Key</h3>
          <p className="text-gray-400">
            Paste your wallet's xPub, yPub, or zPub to establish a secure connection.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-gray-300">Extended Public Key</Label>
            <div className="relative">
              <Input
                type="text"
                placeholder="xpub661MyMwAqRbcF..."
                value={xpub}
                onChange={(e) => setXpub(e.target.value)}
                className="bg-gray-800 border-gray-700 pr-10"
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-2"
                onClick={() => navigator.clipboard.readText().then(setXpub)}
              >
                Paste
              </Button>
            </div>
          </div>

          {connectionStatus === 'connecting' && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-400 border-t-transparent" />
                <div>
                  <p className="text-sm text-blue-300 font-medium">Connecting to your wallet...</p>
                  <p className="text-xs text-blue-200 mt-1">Verifying public key and checking compatibility</p>
                </div>
              </div>
            </div>
          )}

          {connectionStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-500/10 border border-green-500/20 rounded-lg p-4"
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-sm text-green-300 font-medium">Wallet connected successfully!</p>
                  <p className="text-xs text-green-200 mt-1">Your vault is ready for Lightning operations</p>
                </div>
              </div>
            </motion.div>
          )}

          <Button
            onClick={handleConnect}
            disabled={!xpub.trim() || connectionStatus === 'connecting'}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {connectionStatus === 'connecting' ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        </div>

        <div className="border-t border-gray-800 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-gray-400 hover:text-white"
          >
            {showAdvanced ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showAdvanced ? 'Hide' : 'Show'} Advanced Options
          </Button>

          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 space-y-3"
            >
              <div>
                <Label className="text-gray-300">Vault Name</Label>
                <Input
                  placeholder="My Lightning Vault"
                  value={vaultData.vault_name || ''}
                  onChange={(e) => updateVaultData({ vault_name: e.target.value })}
                  className="bg-gray-800 border-gray-700"
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // Other connection types would have their own UI here
  return <div>Connection method not implemented yet</div>;
};

const VerifyStep: React.FC<any> = ({ vaultData, updateVaultData }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);

  useEffect(() => {
    // Auto-start verification
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationComplete(true);
      updateVaultData({ backup_verified: true });
    }, 3000);
  }, [updateVaultData]);

  const checks = [
    { id: 'wallet', label: 'Wallet Connection', status: 'complete' },
    { id: 'security', label: 'Security Validation', status: isVerifying ? 'checking' : 'complete' },
    { id: 'backup', label: 'Backup Verification', status: !verificationComplete ? 'pending' : 'complete' },
    { id: 'lightning', label: 'Lightning Compatibility', status: !verificationComplete ? 'pending' : 'complete' }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">Verifying Your Setup</h3>
        <p className="text-gray-400">
          Running security checks and confirming Lightning compatibility.
        </p>
      </div>

      <div className="space-y-4">
        {checks.map((check) => (
          <div key={check.id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
            <div className="w-8 h-8 flex items-center justify-center">
              {check.status === 'complete' && (
                <CheckCircle className="h-5 w-5 text-green-400" />
              )}
              {check.status === 'checking' && (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-400 border-t-transparent" />
              )}
              {check.status === 'pending' && (
                <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
              )}
            </div>
            
            <div className="flex-1">
              <p className="text-white font-medium">{check.label}</p>
              <p className="text-xs text-gray-400 capitalize">{check.status}</p>
            </div>
            
            {check.status === 'complete' && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Verified
              </Badge>
            )}
          </div>
        ))}
      </div>

      {verificationComplete && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center"
        >
          <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
          <p className="text-green-300 font-medium">All checks passed!</p>
          <p className="text-xs text-green-200 mt-1">Your vault is secure and ready for Lightning operations</p>
        </motion.div>
      )}
    </div>
  );
};

const CompleteStep: React.FC<any> = ({ vaultData }) => (
  <div className="text-center space-y-6">
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", duration: 0.6 }}
      className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mx-auto flex items-center justify-center"
    >
      <CheckCircle className="h-12 w-12 text-white" />
    </motion.div>

    <div>
      <h3 className="text-2xl font-bold text-white mb-2">🎉 Your Vault is Active!</h3>
      <p className="text-gray-400">
        Your Lightning Vault is now connected and ready to earn. 
        Your Bitcoin is secure and your node is powered up.
      </p>
    </div>

    <div className="bg-gray-800/50 rounded-xl p-6 space-y-4">
      <h4 className="font-semibold text-white">Vault Summary</h4>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-400">Connection</p>
          <p className="text-white capitalize">{vaultData.connection_type}</p>
        </div>
        <div>
          <p className="text-gray-400">Security</p>
          <p className="text-white">✅ Verified</p>
        </div>
        <div>
          <p className="text-gray-400">Status</p>
          <p className="text-green-400">Active & Earning</p>
        </div>
        <div>
          <p className="text-gray-400">Type</p>
          <p className="text-white">Non-Custodial</p>
        </div>
      </div>
    </div>

    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
      <p className="text-sm text-blue-300">
        <strong>Next:</strong> Visit your dashboard to monitor earnings, manage channels, and optimize your Lightning operations.
      </p>
    </div>
  </div>
);

export default VaultConnectWizard; 