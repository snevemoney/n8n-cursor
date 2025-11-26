/**
 * Lightning AI Platform - Abuse Detection Engine
 * Senior-level abuse prevention system with modular detection strategies
 */

export interface AbuseDetectionResult {
  isAbusive: boolean
  confidence: number // 0-100
  reasons: string[]
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  suggestedAction: 'allow' | 'throttle' | 'review' | 'block'
  metadata?: Record<string, any>
}

export interface NodeActivity {
  nodeId: string
  walletId: string
  userId: string
  ipAddress: string
  deviceFingerprint?: string
  transactions: Transaction[]
  createdAt: Date
  lastActivity: Date
  region: string
  metadata?: Record<string, any>
}

export interface Transaction {
  id: string
  sourceNodeId: string
  targetNodeId: string
  amount: number
  fee: number
  timestamp: Date
  type: 'payment' | 'routing' | 'reward' | 'withdrawal'
  metadata?: Record<string, any>
}

export interface WalletCluster {
  wallets: string[]
  sharedAttributes: string[]
  suspicionScore: number
  firstSeen: Date
  lastActivity: Date
}

/**
 * 1. Sybil/Wallet Graph Detection
 * Detects fake wallet networks and circular payment patterns
 */
export class SybilDetector {
  private readonly MAX_SHARED_ATTRIBUTES = 3
  private readonly SUSPICIOUS_CLUSTER_SIZE = 5
  private readonly RAPID_CREATION_THRESHOLD = 10 // wallets per hour

  async detectSybilBehavior(activities: NodeActivity[]): Promise<AbuseDetectionResult> {
    const clusters = this.buildWalletClusters(activities)
    const suspiciousClusters = clusters.filter(c => c.suspicionScore > 70)
    
    if (suspiciousClusters.length === 0) {
      return {
        isAbusive: false,
        confidence: 0,
        reasons: [],
        riskLevel: 'low',
        suggestedAction: 'allow'
      }
    }

    const reasons: string[] = []
    let maxConfidence = 0

    for (const cluster of suspiciousClusters) {
      if (cluster.wallets.length >= this.SUSPICIOUS_CLUSTER_SIZE) {
        reasons.push(`Large wallet cluster detected: ${cluster.wallets.length} wallets`)
        maxConfidence = Math.max(maxConfidence, 85)
      }

      if (cluster.sharedAttributes.includes('ip_address') && cluster.sharedAttributes.includes('device_fingerprint')) {
        reasons.push('Multiple wallets from same device/IP')
        maxConfidence = Math.max(maxConfidence, 90)
      }

      const rapidCreation = this.detectRapidWalletCreation(cluster)
      if (rapidCreation) {
        reasons.push('Rapid wallet creation pattern detected')
        maxConfidence = Math.max(maxConfidence, 95)
      }
    }

    return {
      isAbusive: maxConfidence > 70,
      confidence: maxConfidence,
      reasons,
      riskLevel: maxConfidence > 90 ? 'critical' : maxConfidence > 80 ? 'high' : 'medium',
      suggestedAction: maxConfidence > 90 ? 'block' : maxConfidence > 80 ? 'review' : 'throttle',
      metadata: { clusters: suspiciousClusters.length }
    }
  }

  private buildWalletClusters(activities: NodeActivity[]): WalletCluster[] {
    const clusters: WalletCluster[] = []
    const processed = new Set<string>()

    for (const activity of activities) {
      if (processed.has(activity.walletId)) continue

      const cluster = this.findRelatedWallets(activity, activities)
      if (cluster.wallets.length > 1) {
        clusters.push(cluster)
        cluster.wallets.forEach(w => processed.add(w))
      }
    }

    return clusters
  }

  private findRelatedWallets(seed: NodeActivity, allActivities: NodeActivity[]): WalletCluster {
    const related = allActivities.filter(a => 
      a.walletId !== seed.walletId && (
        a.ipAddress === seed.ipAddress ||
        a.deviceFingerprint === seed.deviceFingerprint ||
        a.userId === seed.userId
      )
    )

    const sharedAttributes: string[] = []
    if (related.some(a => a.ipAddress === seed.ipAddress)) sharedAttributes.push('ip_address')
    if (related.some(a => a.deviceFingerprint === seed.deviceFingerprint)) sharedAttributes.push('device_fingerprint')
    if (related.some(a => a.userId === seed.userId)) sharedAttributes.push('user_id')

    const suspicionScore = this.calculateSuspicionScore(sharedAttributes, related.length + 1)

    return {
      wallets: [seed.walletId, ...related.map(a => a.walletId)],
      sharedAttributes,
      suspicionScore,
      firstSeen: new Date(Math.min(seed.createdAt.getTime(), ...related.map(a => a.createdAt.getTime()))),
      lastActivity: new Date(Math.max(seed.lastActivity.getTime(), ...related.map(a => a.lastActivity.getTime())))
    }
  }

  private calculateSuspicionScore(sharedAttributes: string[], clusterSize: number): number {
    let score = 0
    
    // Base score for cluster size
    score += Math.min(clusterSize * 10, 50)
    
    // Bonus for shared attributes
    score += sharedAttributes.length * 15
    
    // Extra penalty for device fingerprint sharing
    if (sharedAttributes.includes('device_fingerprint')) score += 20
    
    return Math.min(score, 100)
  }

  private detectRapidWalletCreation(cluster: WalletCluster): boolean {
    const timeWindow = 60 * 60 * 1000 // 1 hour
    const now = Date.now()
    
    return cluster.wallets.length >= this.RAPID_CREATION_THRESHOLD &&
           (now - cluster.firstSeen.getTime()) < timeWindow
  }
}

/**
 * 2. Reward Farming Detection
 * Detects abuse of referral bonuses, activity rewards, and platform incentives
 */
export class RewardFarmingDetector {
  private readonly MAX_REFERRALS_PER_HOUR = 5
  private readonly SUSPICIOUS_ACTIVITY_RATIO = 0.1 // 10% of transactions are rewards

  async detectRewardFarming(activities: NodeActivity[]): Promise<AbuseDetectionResult> {
    const reasons: string[] = []
    let confidence = 0

    // Check referral bonus abuse
    const referralAbuse = this.detectReferralAbuse(activities)
    if (referralAbuse.isAbusive) {
      reasons.push(...referralAbuse.reasons)
      confidence = Math.max(confidence, referralAbuse.confidence)
    }

    // Check activity reward manipulation
    const activityAbuse = this.detectActivityRewardAbuse(activities)
    if (activityAbuse.isAbusive) {
      reasons.push(...activityAbuse.reasons)
      confidence = Math.max(confidence, activityAbuse.confidence)
    }

    // Check for fake business verification attempts
    const verificationAbuse = this.detectVerificationAbuse(activities)
    if (verificationAbuse.isAbusive) {
      reasons.push(...verificationAbuse.reasons)
      confidence = Math.max(confidence, verificationAbuse.confidence)
    }

    return {
      isAbusive: confidence > 60,
      confidence,
      reasons,
      riskLevel: confidence > 85 ? 'critical' : confidence > 70 ? 'high' : confidence > 60 ? 'medium' : 'low',
      suggestedAction: confidence > 85 ? 'block' : confidence > 70 ? 'review' : 'throttle'
    }
  }

  private detectReferralAbuse(activities: NodeActivity[]): AbuseDetectionResult {
    const rewardTransactions = activities.flatMap(a => 
      a.transactions.filter(t => t.type === 'reward')
    )

    const hourlyReferrals = this.groupTransactionsByHour(rewardTransactions)
    const maxHourlyReferrals = Math.max(...Object.values(hourlyReferrals))

    if (maxHourlyReferrals > this.MAX_REFERRALS_PER_HOUR) {
      return {
        isAbusive: true,
        confidence: Math.min(90, 60 + (maxHourlyReferrals - this.MAX_REFERRALS_PER_HOUR) * 5),
        reasons: [`Excessive referral activity: ${maxHourlyReferrals} referrals in one hour`],
        riskLevel: 'high',
        suggestedAction: 'review'
      }
    }

    return { isAbusive: false, confidence: 0, reasons: [], riskLevel: 'low', suggestedAction: 'allow' }
  }

  private detectActivityRewardAbuse(activities: NodeActivity[]): AbuseDetectionResult {
    for (const activity of activities) {
      const rewardTxs = activity.transactions.filter(t => t.type === 'reward')
      const totalTxs = activity.transactions.length

      if (totalTxs > 10 && rewardTxs.length / totalTxs > this.SUSPICIOUS_ACTIVITY_RATIO) {
        return {
          isAbusive: true,
          confidence: 75,
          reasons: [`High reward-to-activity ratio: ${(rewardTxs.length / totalTxs * 100).toFixed(1)}%`],
          riskLevel: 'medium',
          suggestedAction: 'throttle'
        }
      }
    }

    return { isAbusive: false, confidence: 0, reasons: [], riskLevel: 'low', suggestedAction: 'allow' }
  }

  private detectVerificationAbuse(activities: NodeActivity[]): AbuseDetectionResult {
    // This would integrate with your business verification system
    // For now, we'll simulate detection of fake business descriptions
    const suspiciousPatterns = [
      'make money fast',
      'get rich quick',
      'guaranteed profit',
      'no risk investment',
      'crypto mining pool'
    ]

    for (const activity of activities) {
      const businessDescription = activity.metadata?.businessDescription?.toLowerCase() || ''
      const matchedPatterns = suspiciousPatterns.filter(pattern => 
        businessDescription.includes(pattern)
      )

      if (matchedPatterns.length > 0) {
        return {
          isAbusive: true,
          confidence: 80,
          reasons: [`Suspicious business description patterns: ${matchedPatterns.join(', ')}`],
          riskLevel: 'high',
          suggestedAction: 'review'
        }
      }
    }

    return { isAbusive: false, confidence: 0, reasons: [], riskLevel: 'low', suggestedAction: 'allow' }
  }

  private groupTransactionsByHour(transactions: Transaction[]): Record<string, number> {
    const groups: Record<string, number> = {}
    
    for (const tx of transactions) {
      const hour = new Date(tx.timestamp).toISOString().slice(0, 13) // YYYY-MM-DDTHH
      groups[hour] = (groups[hour] || 0) + 1
    }
    
    return groups
  }
}

/**
 * 3. Fee Loop Attack Detection
 * Detects circular payment patterns designed to exploit fee structures
 */
export class FeeLoopDetector {
  private readonly MAX_LOOP_HOPS = 3
  private readonly SUSPICIOUS_LOOP_COUNT = 5
  private readonly MIN_PROFIT_THRESHOLD = 100 // sats

  async detectFeeLoops(activities: NodeActivity[]): Promise<AbuseDetectionResult> {
    const allTransactions = activities.flatMap(a => a.transactions)
    const loops = this.findCircularPaths(allTransactions)
    const profitableLoops = loops.filter(loop => this.calculateLoopProfit(loop) > this.MIN_PROFIT_THRESHOLD)

    if (profitableLoops.length === 0) {
      return {
        isAbusive: false,
        confidence: 0,
        reasons: [],
        riskLevel: 'low',
        suggestedAction: 'allow'
      }
    }

    const confidence = Math.min(95, 50 + profitableLoops.length * 10)
    const totalProfit = profitableLoops.reduce((sum, loop) => sum + this.calculateLoopProfit(loop), 0)

    return {
      isAbusive: true,
      confidence,
      reasons: [
        `${profitableLoops.length} profitable fee loops detected`,
        `Total extracted profit: ${totalProfit} sats`
      ],
      riskLevel: confidence > 80 ? 'critical' : 'high',
      suggestedAction: confidence > 80 ? 'block' : 'review',
      metadata: { loops: profitableLoops.length, profit: totalProfit }
    }
  }

  private findCircularPaths(transactions: Transaction[]): Transaction[][] {
    const loops: Transaction[][] = []
    const visited = new Set<string>()

    for (const startTx of transactions) {
      if (visited.has(startTx.id)) continue

      const path = this.findPathBack(startTx, transactions, [startTx], new Set([startTx.id]))
      if (path.length > 1) {
        loops.push(path)
        path.forEach(tx => visited.add(tx.id))
      }
    }

    return loops
  }

  private findPathBack(
    startTx: Transaction, 
    allTxs: Transaction[], 
    currentPath: Transaction[], 
    visitedInPath: Set<string>
  ): Transaction[] {
    if (currentPath.length > this.MAX_LOOP_HOPS) return []

    const lastTx = currentPath[currentPath.length - 1]
    
    // Look for transactions that complete the loop
    const nextTxs = allTxs.filter(tx => 
      tx.sourceNodeId === lastTx.targetNodeId &&
      !visitedInPath.has(tx.id) &&
      tx.timestamp > lastTx.timestamp
    )

    for (const nextTx of nextTxs) {
      // Check if this completes a loop back to start
      if (nextTx.targetNodeId === startTx.sourceNodeId) {
        return [...currentPath, nextTx]
      }

      // Continue searching
      const newVisitedSet = new Set(visitedInPath);
      newVisitedSet.add(nextTx.id);
      
      const extendedPath = this.findPathBack(
        startTx, 
        allTxs, 
        [...currentPath, nextTx], 
        newVisitedSet
      )
      
      if (extendedPath.length > 0) return extendedPath
    }

    return []
  }

  private calculateLoopProfit(loop: Transaction[]): number {
    const totalFees = loop.reduce((sum, tx) => sum + tx.fee, 0)
    const totalAmount = loop.reduce((sum, tx) => sum + tx.amount, 0)
    
    // Simplified profit calculation - in reality this would be more complex
    return totalFees - (totalAmount * 0.001) // Assume 0.1% base cost
  }
}

/**
 * Main Abuse Detection Engine
 * Orchestrates all detection modules and provides unified results
 */
export class AbuseDetectionEngine {
  private sybilDetector = new SybilDetector()
  private rewardDetector = new RewardFarmingDetector()
  private feeLoopDetector = new FeeLoopDetector()

  async runFullScan(activities: NodeActivity[]): Promise<AbuseDetectionResult> {
    const results = await Promise.all([
      this.sybilDetector.detectSybilBehavior(activities),
      this.rewardDetector.detectRewardFarming(activities),
      this.feeLoopDetector.detectFeeLoops(activities)
    ])

    // Combine results
    const allReasons = results.flatMap(r => r.reasons)
    const maxConfidence = Math.max(...results.map(r => r.confidence))
    const isAbusive = results.some(r => r.isAbusive)

    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
    if (maxConfidence > 90) riskLevel = 'critical'
    else if (maxConfidence > 75) riskLevel = 'high'
    else if (maxConfidence > 60) riskLevel = 'medium'

    let suggestedAction: 'allow' | 'throttle' | 'review' | 'block' = 'allow'
    if (riskLevel === 'critical') suggestedAction = 'block'
    else if (riskLevel === 'high') suggestedAction = 'review'
    else if (riskLevel === 'medium') suggestedAction = 'throttle'

    return {
      isAbusive,
      confidence: maxConfidence,
      reasons: allReasons,
      riskLevel,
      suggestedAction,
      metadata: {
        detectionModules: results.length,
        individualResults: results
      }
    }
  }

  async quickCheck(nodeId: string, recentActivity: Transaction[]): Promise<boolean> {
    // Fast check for immediate blocking decisions
    const suspiciousPatterns = [
      recentActivity.length > 100, // Too many transactions in short time
      recentActivity.filter(t => t.type === 'reward').length > 10, // Too many rewards
      recentActivity.some(t => t.amount < 1) // Dust transactions
    ]

    return suspiciousPatterns.some(Boolean)
  }
}

// Export singleton instance
export const abuseDetectionEngine = new AbuseDetectionEngine() 