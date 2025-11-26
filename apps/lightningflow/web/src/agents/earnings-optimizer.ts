/**
 * Earnings Optimizer Agent
 * 
 * Automatically manages Lightning payments based on earnings thresholds
 * - Monitors weekly earnings
 * - Triggers auto-payouts when thresholds are met
 * - Routes through vault if configured
 * - Logs all actions with cryptographic proofs
 */

import { lnbitsClient } from '../lib/lnbits'
import { logProof } from '../core/crypto/proofLog'
import { signAndExecute } from '../core/crypto/signAndExecute'
import { logger } from '../lib/logger'

export interface EarningsThreshold {
  id: string
  user_id: string
  threshold_sats: number
  payout_address?: string // Lightning address or invoice
  auto_payout_enabled: boolean
  vault_routing_enabled: boolean
  created_at: string
  last_triggered?: string
}

export interface EarningsData {
  user_id: string
  week_earnings: number
  month_earnings: number
  total_earnings: number
  pending_payouts: number
  last_payout?: string
}

export interface AgentAction {
  type: 'payout' | 'vault_transfer' | 'threshold_check'
  user_id: string
  amount: number
  reason: string
  timestamp: string
  cryptographic_proof: string
}

class EarningsOptimizerAgent {
  private isRunning = false
  private checkInterval = 60000 // Check every minute
  private intervalId?: NodeJS.Timeout

  /**
   * Start the earnings optimizer agent
   */
  async start() {
    if (this.isRunning) {
      logger.logAgent('warn', 'Earnings optimizer agent is already running', {
        agentId: 'earnings-optimizer',
        actionType: 'start'
      })
      return
    }

    this.isRunning = true
    logger.logAgent('info', 'Starting earnings optimizer agent', {
      agentId: 'earnings-optimizer',
      actionType: 'start'
    })

    // Run initial check
    await this.checkAllUsers()

    // Set up periodic checks
    this.intervalId = setInterval(async () => {
      try {
        await this.checkAllUsers()
      } catch (error) {
        logger.logAgent('error', 'Error in earnings optimizer agent cycle', {
          agentId: 'earnings-optimizer',
          actionType: 'cycle'
        }, {
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }, this.checkInterval)

    logger.logAgent('info', 'Earnings optimizer agent started successfully', {
      agentId: 'earnings-optimizer',
      actionType: 'start'
    })
  }

  /**
   * Stop the earnings optimizer agent
   */
  stop() {
    if (!this.isRunning) {
      return
    }

    this.isRunning = false
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = undefined
    }

    logger.logAgent('info', 'Earnings optimizer agent stopped', {
      agentId: 'earnings-optimizer',
      actionType: 'stop'
    })
  }

  /**
   * Check earnings for all users with active thresholds
   */
  private async checkAllUsers() {
    try {
      // In a real implementation, this would query Supabase for users with active thresholds
      const activeThresholds = await this.getActiveThresholds()
      
      logger.logAgent('info', `Checking earnings for ${activeThresholds.length} users`, {
        agentId: 'earnings-optimizer',
        actionType: 'check_all'
      }, {
        userCount: activeThresholds.length
      })

      for (const threshold of activeThresholds) {
        await this.checkUserEarnings(threshold)
      }
    } catch (error) {
      logger.logAgent('error', 'Failed to check all users', {
        agentId: 'earnings-optimizer',
        actionType: 'check_all'
      }, {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  /**
   * Check earnings for a specific user
   */
  private async checkUserEarnings(threshold: EarningsThreshold) {
    try {
      const earnings = await this.getUserEarnings(threshold.user_id)
      
      logger.logAgent('debug', 'Checking user earnings', {
        agentId: 'earnings-optimizer',
        actionType: 'check_user',
        userId: threshold.user_id
      }, {
        weekEarnings: earnings.week_earnings,
        threshold: threshold.threshold_sats
      })

      // Check if threshold is met
      if (earnings.week_earnings >= threshold.threshold_sats) {
        await this.triggerAutoPayout(threshold, earnings)
      }
    } catch (error) {
      logger.logAgent('error', 'Failed to check user earnings', {
        agentId: 'earnings-optimizer',
        actionType: 'check_user',
        userId: threshold.user_id
      }, {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  /**
   * Trigger automatic payout when threshold is met
   */
  private async triggerAutoPayout(threshold: EarningsThreshold, earnings: EarningsData) {
    if (!threshold.auto_payout_enabled) {
      logger.logAgent('info', 'Auto-payout disabled for user', {
        agentId: 'earnings-optimizer',
        actionType: 'payout_check',
        userId: threshold.user_id
      })
      return
    }

    // Check if we've already triggered recently (prevent spam)
    if (threshold.last_triggered) {
      const lastTriggered = new Date(threshold.last_triggered)
      const hoursSinceLastTrigger = (Date.now() - lastTriggered.getTime()) / (1000 * 60 * 60)
      
      if (hoursSinceLastTrigger < 24) {
        logger.logAgent('info', 'Payout already triggered recently, skipping', {
          agentId: 'earnings-optimizer',
          actionType: 'payout_check',
          userId: threshold.user_id
        }, {
          hoursSince: hoursSinceLastTrigger
        })
        return
      }
    }

    return await signAndExecute(
      'agent_auto_payout',
      { 
        threshold, 
        earnings, 
        amount: earnings.week_earnings 
      },
      async () => {
        try {
          logger.logAgent('info', 'Triggering auto-payout', {
            agentId: 'earnings-optimizer',
            actionType: 'payout',
            userId: threshold.user_id
          }, {
            amount: earnings.week_earnings,
            threshold: threshold.threshold_sats
          })

          let paymentResult
          let vaultRouted = false

          if (threshold.vault_routing_enabled) {
            // Route through vault
            paymentResult = await this.routeToVault(threshold.user_id, earnings.week_earnings)
            vaultRouted = true
            
            logger.logAgent('info', 'Payment routed through vault', {
              agentId: 'earnings-optimizer',
              actionType: 'vault_route',
              userId: threshold.user_id
            }, {
              amount: earnings.week_earnings
            })
          } else if (threshold.payout_address) {
            // Direct Lightning payment
            paymentResult = await lnbitsClient.sendPayment(
              threshold.payout_address,
              threshold.user_id,
              `Auto-payout: Weekly earnings threshold reached (${earnings.week_earnings} sats)`
            )
            
            logger.logAgent('info', 'Direct Lightning payment sent', {
              agentId: 'earnings-optimizer',
              actionType: 'payment',
              userId: threshold.user_id
            }, {
              amount: earnings.week_earnings,
              paymentHash: paymentResult.payment.payment_hash
            })
          } else {
            throw new Error('No payout address configured')
          }

          // Log the agent action
          const agentAction: AgentAction = {
            type: vaultRouted ? 'vault_transfer' : 'payout',
            user_id: threshold.user_id,
            amount: earnings.week_earnings,
            reason: `Earnings threshold reached: ${earnings.week_earnings} >= ${threshold.threshold_sats} sats`,
            timestamp: new Date().toISOString(),
            cryptographic_proof: '' // Will be filled by signAndExecute
          }

          // Log to proof system
          await logProof({
            action: 'agent_auto_payout_executed',
            user_id: threshold.user_id,
            payload_json: JSON.stringify({
              agent_action: agentAction,
              threshold_id: threshold.id,
              earnings_data: earnings,
              vault_routed: vaultRouted,
              payment_hash: paymentResult?.payment?.payment_hash
            }),
            timestamp: Date.now(),
            human_summary: `Auto-payout executed: ${earnings.week_earnings} sats for user ${threshold.user_id}`,
            verified: true
          })

          // Update threshold last triggered time
          await this.updateThresholdLastTriggered(threshold.id)

          logger.logAgent('info', 'Auto-payout completed successfully', {
            agentId: 'earnings-optimizer',
            actionType: 'payout_completed',
            userId: threshold.user_id
          }, {
            amount: earnings.week_earnings,
            paymentHash: paymentResult?.payment?.payment_hash
          })

          return {
            success: true,
            agentAction,
            paymentResult,
            vaultRouted
          }
        } catch (error) {
          logger.logAgent('error', 'Auto-payout failed', {
            agentId: 'earnings-optimizer',
            actionType: 'payout_failed',
            userId: threshold.user_id
          }, {
            amount: earnings.week_earnings,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
          throw error
        }
      },
      {
        requireSignature: true,
        logProof: true,
        userId: threshold.user_id
      }
    )
  }

  /**
   * Route payment through vault
   */
  private async routeToVault(userId: string, amount: number) {
    // In a real implementation, this would interact with the vault system
    // For now, we'll create a vault invoice and return mock data
    
    const vaultInvoice = await lnbitsClient.createInvoice(
      amount,
      `Vault routing for user ${userId} - Auto-payout`,
      'vault-system'
    )

    return {
      payment: {
        checking_id: `vault-${Date.now()}`,
        payment_hash: vaultInvoice.invoice.payment_hash,
        amount: amount,
        memo: `Vault routing for user ${userId}`,
        fee: 0
      },
      metadata: vaultInvoice.metadata
    }
  }

  /**
   * Get active earnings thresholds from database
   */
  private async getActiveThresholds(): Promise<EarningsThreshold[]> {
    // Mock data for testing - in production this would query Supabase
    return [
      {
        id: 'threshold-1',
        user_id: 'test-user-123',
        threshold_sats: 10000,
        auto_payout_enabled: true,
        vault_routing_enabled: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'threshold-2',
        user_id: 'test-user-456',
        threshold_sats: 50000,
        payout_address: 'lnbc50000n1p...',
        auto_payout_enabled: true,
        vault_routing_enabled: false,
        created_at: new Date().toISOString()
      }
    ]
  }

  /**
   * Get user earnings data
   */
  private async getUserEarnings(userId: string): Promise<EarningsData> {
    // Mock data for testing - in production this would query Supabase
    const mockEarnings = Math.floor(Math.random() * 100000) // Random earnings for demo
    
    return {
      user_id: userId,
      week_earnings: mockEarnings,
      month_earnings: mockEarnings * 4,
      total_earnings: mockEarnings * 12,
      pending_payouts: 0
    }
  }

  /**
   * Update threshold last triggered timestamp
   */
  private async updateThresholdLastTriggered(thresholdId: string) {
    // In production, this would update Supabase
    logger.logAgent('info', 'Updated threshold last triggered', {
      agentId: 'earnings-optimizer',
      actionType: 'threshold_update'
    }, {
      thresholdId,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Get agent status
   */
  getStatus() {
    return {
      running: this.isRunning,
      check_interval: this.checkInterval,
      last_check: new Date().toISOString()
    }
  }
}

// Export singleton instance
export const earningsOptimizerAgent = new EarningsOptimizerAgent()

// Auto-start in production
if (process.env.NODE_ENV === 'production') {
  earningsOptimizerAgent.start()
}

export default earningsOptimizerAgent 