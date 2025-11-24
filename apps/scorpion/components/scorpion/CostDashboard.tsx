/**
 * Cost Dashboard Component
 * Displays cost tracking, budgets, and quotas
 * Part of Observatory / Operations Console
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, Metric, LoadingState, ErrorState } from '@/components/scorpion';
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface CostSummary {
  organization: string;
  product: string;
  environment: string;
  totalCost: number;
  resourceCount: number;
}

interface BudgetStatus {
  organization: string;
  product?: string;
  environment?: string;
  budgetName: string;
  monthlyBudget: number;
  actualSpend: number;
  percentageUsed: number;
  status: 'ok' | 'warning' | 'exceeded';
}

export function CostDashboard() {
  const [summary, setSummary] = useState<CostSummary[]>([]);
  const [budgets, setBudgets] = useState<BudgetStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCostData();
  }, []);

  const loadCostData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryRes, budgetsRes] = await Promise.all([
        fetch('/api/cost/summary'),
        fetch('/api/cost/budgets'),
      ]);

      if (!summaryRes.ok || !budgetsRes.ok) {
        throw new Error('Failed to load cost data');
      }

      const summaryData = await summaryRes.json();
      const budgetsData = await budgetsRes.json();

      setSummary(summaryData.data?.summary || []);
      setBudgets(budgetsData.data?.budgets || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading cost data..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadCostData} />;
  }

  const totalCost = summary.reduce((sum, s) => sum + s.totalCost, 0);
  const totalResources = summary.reduce((sum, s) => sum + s.resourceCount, 0);
  const budgetsWithIssues = budgets.filter(b => b.status !== 'ok');

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Monthly Cost</p>
              <Metric value={`$${totalCost.toFixed(2)}`} />
            </div>
            <DollarSign className="h-8 w-8 text-gray-400" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tracked Resources</p>
              <Metric value={totalResources.toString()} />
            </div>
            <TrendingUp className="h-8 w-8 text-gray-400" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Budget Alerts</p>
              <Metric value={budgetsWithIssues.length.toString()} />
            </div>
            {budgetsWithIssues.length > 0 ? (
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            ) : (
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            )}
          </div>
        </Card>
      </div>

      {/* Cost by Product */}
      {summary.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Cost by Product</h3>
          <div className="space-y-3">
            {summary.map((item) => (
              <div
                key={`${item.product}-${item.environment}`}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div>
                  <p className="font-medium">
                    {item.product} ({item.environment})
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.resourceCount} resources
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${item.totalCost.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">/month</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Budget Status */}
      {budgets.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Budget Status</h3>
          <div className="space-y-3">
            {budgets.map((budget) => (
              <div
                key={budget.budgetName}
                className={`p-4 rounded-lg border ${
                  budget.status === 'exceeded'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : budget.status === 'warning'
                    ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium">{budget.budgetName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {budget.product || 'All Products'} / {budget.environment || 'All Environments'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ${budget.actualSpend.toFixed(2)} / ${budget.monthlyBudget.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {budget.percentageUsed.toFixed(1)}% used
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      budget.status === 'exceeded'
                        ? 'bg-red-500'
                        : budget.status === 'warning'
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(budget.percentageUsed, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {summary.length === 0 && budgets.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              No cost data available. Start tracking resources to see costs here.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

