'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function useDashboardActions() {
  const router = useRouter();

  // Navigation actions
  const navigation = {
    // Main navigation
    goToDashboard: () => router.push('/dashboard'),
    goToSend: () => router.push('/send'),
    goToReceive: () => router.push('/receive'),
    goToChannels: () => router.push('/channels'),
    goToSettings: () => router.push('/settings'),
    goToTransactions: () => router.push('/transactions'),
    goToPaymentLinks: () => router.push('/payment-links'),
    goToTeamWallets: () => router.push('/team-wallets'),
    goToAIAssistant: () => router.push('/ai-assistant'),
    goToAnalytics: () => router.push('/analytics'),
    
    // Secondary navigation
    goToBackups: () => router.push('/backups'),
    goToRoutePlanner: () => router.push('/routes'),
    goToSync: () => router.push('/sync'),
    
    // Settings sub-navigation
    goToFeeSettings: () => router.push('/settings?tab=fees'),
    goToBackupSettings: () => router.push('/settings?tab=backup'),
    goToSecuritySettings: () => router.push('/settings?tab=security'),
    goToNetworkSettings: () => router.push('/settings?tab=network'),
    
    // Analytics sub-navigation
    goToRoutingAnalytics: () => router.push('/analytics/routing'),
    
    // Guides and documentation
    goToEarningsGuide: () => router.push('/guides/earnings'),
  };
  
  // Node operation actions
  const nodeOperations = {
    syncNode: () => {
      toast.info("Syncing with network...", {
        description: "Connecting to peers and updating channel status"
      });
      
      // Simulate a network operation
      setTimeout(() => {
        toast.success("Sync complete", {
          description: "Your node is fully in sync with the Lightning Network"
        });
      }, 2000);
    },
    
    createBackup: () => {
      toast.info("Creating backup...", {
        description: "Generating static channel backup (SCB)"
      });
      
      setTimeout(() => {
        toast.success("Backup created", {
          description: "Your static channel backup has been created successfully"
        });
        
        router.push('/backups');
      }, 2000);
    },
    
    optimizeRoutes: () => {
      toast.info("Optimizing routes...", {
        description: "Analyzing channel liquidity and peer connections"
      });
      
      setTimeout(() => {
        toast.success("Routes optimized", {
          description: "Your routes have been optimized for better payment success rates"
        });
      }, 2000);
    }
  };
  
  // Payment actions
  const paymentActions = {
    openInvoiceModal: () => {
      toast.info("Opening invoice modal", {
        description: "This would open an invoice creation modal in the real app"
      });
      
      setTimeout(() => {
        router.push('/receive');
      }, 1000);
    },
    
    openSendModal: () => {
      toast.info("Opening payment modal", {
        description: "This would open a payment modal in the real app"
      });
      
      setTimeout(() => {
        router.push('/send');
      }, 1000);
    },
    
    adjustFeeRate: () => {
      toast.info("Opening fee configuration", {
        description: "This would open the fee rate configuration panel"
      });
      
      router.push('/settings?tab=fees');
    },
    
    openChannelModal: () => {
      toast.info("Opening channel management", {
        description: "This would open the channel creation modal"
      });
      
      setTimeout(() => {
        router.push('/channels');
      }, 1000);
    }
  };
  
  // Combine all actions
  return {
    ...navigation,
    ...nodeOperations,
    ...paymentActions,
  };
} 