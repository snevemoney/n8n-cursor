/**
 * Proactive Intelligence System
 * Learns patterns, makes predictions, and takes proactive actions
 */

import { getRAGStore, getOntologyStore } from './shared-stores';
import { getMistakeLearner } from './fine-tuning/mistake-learner';

interface Pattern {
  id: string;
  type: 'user-behavior' | 'error-pattern' | 'workflow-pattern' | 'system-pattern';
  description: string;
  frequency: number;
  confidence: number; // 0-1
  examples: string[];
  detectedAt: string;
  lastSeen: string;
}

interface Prediction {
  id: string;
  type: 'error' | 'opportunity' | 'optimization' | 'risk';
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  suggestedAction?: string;
  detectedAt: string;
}

interface ProactiveAction {
  id: string;
  type: 'prevent-error' | 'optimize' | 'notify' | 'auto-fix';
  description: string;
  priority: number;
  status: 'pending' | 'approved' | 'executed' | 'rejected';
  requiresApproval: boolean;
  createdAt: string;
  executedAt?: string;
}

class ProactiveIntelligence {
  private patterns: Map<string, Pattern> = new Map();
  private predictions: Prediction[] = [];
  private actions: ProactiveAction[] = [];
  private analysisInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize proactive intelligence
   */
  async initialize() {
    console.log('🧠 Initializing proactive intelligence...');

    // Load patterns from ontology
    await this.loadPatterns();

    // Start pattern analysis (every 10 minutes)
    this.analysisInterval = setInterval(() => {
      this.analyzePatterns();
      this.generatePredictions();
      this.suggestActions();
    }, 10 * 60 * 1000); // 10 minutes

    // Initial analysis
    await Promise.all([
      this.analyzePatterns(),
      this.generatePredictions(),
      this.suggestActions()
    ]);

    console.log('✅ Proactive intelligence initialized');
  }

  /**
   * Analyze patterns from collected data
   */
  async analyzePatterns(): Promise<void> {
    try {
      const ontologyStore = await getOntologyStore();
      const mistakeLearner = getMistakeLearner();

      // Analyze mistake patterns
      const mistakePatterns = mistakeLearner.getMistakePatterns();
      for (const pattern of mistakePatterns) {
        const patternId = `mistake-${pattern.pattern}`;
        const existing = this.patterns.get(patternId);

        if (existing) {
          existing.frequency += pattern.count;
          existing.lastSeen = new Date().toISOString();
          existing.examples = [
            ...existing.examples,
            ...pattern.examples.map(e => e.originalInput)
          ].slice(0, 10); // Keep top 10 examples
        } else {
          this.patterns.set(patternId, {
            id: patternId,
            type: 'error-pattern',
            description: `Mistake pattern: ${pattern.pattern}`,
            frequency: pattern.count,
            confidence: Math.min(1, pattern.count / 10), // Higher confidence with more examples
            examples: pattern.examples.map(e => e.originalInput),
            detectedAt: new Date().toISOString(),
            lastSeen: new Date().toISOString()
          });
        }
      }

      // Analyze workflow patterns
      await this.analyzeWorkflowPatterns();

      // Analyze system patterns
      await this.analyzeSystemPatterns();

      // Store patterns in ontology
      await this.storePatterns();
    } catch (error) {
      console.error('❌ Pattern analysis failed:', error);
    }
  }

  /**
   * Generate predictions based on patterns
   */
  async generatePredictions(): Promise<void> {
    try {
      this.predictions = [];

      // Predict errors based on mistake patterns
      for (const pattern of this.patterns.values()) {
        if (pattern.type === 'error-pattern' && pattern.confidence > 0.7) {
          this.predictions.push({
            id: `pred-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'error',
            description: `High likelihood of error: ${pattern.description}`,
            confidence: pattern.confidence,
            impact: pattern.frequency > 5 ? 'high' : 'medium',
            suggestedAction: `Prevent this pattern: ${pattern.description}`,
            detectedAt: new Date().toISOString()
          });
        }
      }

      // Predict optimization opportunities
      await this.predictOptimizations();

      // Predict risks
      await this.predictRisks();

      // Store predictions in ontology
      await this.storePredictions();
    } catch (error) {
      console.error('❌ Prediction generation failed:', error);
    }
  }

  /**
   * Suggest proactive actions
   */
  async suggestActions(): Promise<void> {
    try {
      // Generate actions from high-confidence predictions
      for (const prediction of this.predictions) {
        if (prediction.confidence > 0.8 && prediction.impact !== 'low') {
          const action: ProactiveAction = {
            id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: this.determineActionType(prediction),
            description: prediction.suggestedAction || `Address: ${prediction.description}`,
            priority: this.calculatePriority(prediction),
            status: 'pending',
            requiresApproval: this.requiresApproval(prediction),
            createdAt: new Date().toISOString()
          };

          this.actions.push(action);
        }
      }

      // Store actions in ontology
      await this.storeActions();
    } catch (error) {
      console.error('❌ Action suggestion failed:', error);
    }
  }

  /**
   * Execute a proactive action (if approved or auto-approved)
   */
  async executeAction(actionId: string, approved: boolean = false): Promise<boolean> {
    const action = this.actions.find(a => a.id === actionId);
    if (!action) {
      return false;
    }

    if (action.requiresApproval && !approved) {
      return false;
    }

    try {
      // Execute based on action type
      switch (action.type) {
        case 'prevent-error':
          await this.executePreventError(action);
          break;
        case 'optimize':
          await this.executeOptimize(action);
          break;
        case 'notify':
          await this.executeNotify(action);
          break;
        case 'auto-fix':
          await this.executeAutoFix(action);
          break;
      }

      action.status = 'executed';
      action.executedAt = new Date().toISOString();

      return true;
    } catch (error) {
      console.error(`❌ Failed to execute action ${actionId}:`, error);
      return false;
    }
  }

  /**
   * Get pending actions requiring approval
   */
  getPendingActions(): ProactiveAction[] {
    return this.actions.filter(a => a.status === 'pending' && a.requiresApproval);
  }

  /**
   * Get all predictions
   */
  getPredictions(): Prediction[] {
    return this.predictions;
  }

  /**
   * Get all patterns
   */
  getPatterns(): Pattern[] {
    return Array.from(this.patterns.values());
  }

  // Helper methods
  private async analyzeWorkflowPatterns(): Promise<void> {
    // Analyze workflow execution patterns
    // This would analyze n8n execution logs
  }

  private async analyzeSystemPatterns(): Promise<void> {
    // Analyze system health patterns
    // This would analyze service health trends
  }

  private async predictOptimizations(): Promise<void> {
    // Predict optimization opportunities
    // E.g., workflows that could be optimized, unused resources, etc.
  }

  private async predictRisks(): Promise<void> {
    // Predict potential risks
    // E.g., service degradation, capacity issues, etc.
  }

  private determineActionType(prediction: Prediction): ProactiveAction['type'] {
    if (prediction.type === 'error') return 'prevent-error';
    if (prediction.type === 'optimization') return 'optimize';
    if (prediction.type === 'risk') return 'notify';
    return 'auto-fix';
  }

  private calculatePriority(prediction: Prediction): number {
    const impactMap = { low: 1, medium: 3, high: 5, critical: 10 };
    return impactMap[prediction.impact] * prediction.confidence;
  }

  private requiresApproval(prediction: Prediction): boolean {
    // Require approval for high-impact actions
    return prediction.impact === 'critical' || prediction.impact === 'high';
  }

  private async executePreventError(action: ProactiveAction): Promise<void> {
    // Implement error prevention logic
    console.log(`🛡️ Preventing error: ${action.description}`);
  }

  private async executeOptimize(action: ProactiveAction): Promise<void> {
    // Implement optimization logic
    console.log(`⚡ Optimizing: ${action.description}`);
  }

  private async executeNotify(action: ProactiveAction): Promise<void> {
    // Send notification
    console.log(`📢 Notifying: ${action.description}`);
  }

  private async executeAutoFix(action: ProactiveAction): Promise<void> {
    // Auto-fix issue
    console.log(`🔧 Auto-fixing: ${action.description}`);
  }

  private async loadPatterns(): Promise<void> {
    try {
      const ontologyStore = await getOntologyStore();
      const patterns = ontologyStore.query({
        type: 'Pattern',
        limit: 1000
      });

      for (const pattern of patterns) {
        this.patterns.set(pattern.id, pattern.data as Pattern);
      }
    } catch (error) {
      console.warn('⚠️ Could not load patterns:', error);
    }
  }

  private async storePatterns(): Promise<void> {
    const ontologyStore = await getOntologyStore();
    for (const pattern of this.patterns.values()) {
      await ontologyStore.store({
        id: pattern.id,
        type: 'Pattern',
        createdAt: new Date(pattern.detectedAt),
        updatedAt: new Date(pattern.lastSeen),
        data: pattern
      });
    }
  }

  private async storePredictions(): Promise<void> {
    const ontologyStore = await getOntologyStore();
    for (const prediction of this.predictions) {
      await ontologyStore.store({
        id: prediction.id,
        type: 'Prediction',
        createdAt: new Date(prediction.detectedAt),
        updatedAt: new Date(prediction.detectedAt),
        data: prediction
      });
    }
  }

  private async storeActions(): Promise<void> {
    const ontologyStore = await getOntologyStore();
    for (const action of this.actions) {
      await ontologyStore.store({
        id: action.id,
        type: 'ProactiveAction',
        createdAt: new Date(action.createdAt),
        updatedAt: new Date(action.createdAt),
        data: action
      });
    }
  }
}

// Singleton instance
let proactiveIntelligence: ProactiveIntelligence | null = null;

export function getProactiveIntelligence(): ProactiveIntelligence {
  if (!proactiveIntelligence) {
    proactiveIntelligence = new ProactiveIntelligence();
  }
  return proactiveIntelligence;
}

export async function initializeProactiveIntelligence() {
  const intelligence = getProactiveIntelligence();
  await intelligence.initialize();
  return intelligence;
}

