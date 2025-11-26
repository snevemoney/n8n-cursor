'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CampaignMetrics {
  totalSent: number;
  totalOpens: number;
  totalClicks: number;
  totalConversions: number;
  openRate: string;
  clickRate: string;
  conversionRate: string;
  recentTrend: string;
}

interface AISummaryData {
  metrics: CampaignMetrics;
  analysis: string;
  lastUpdated: string;
}

export default function AICampaignSummary() {
  const [summary, setSummary] = useState<AISummaryData | null>(null);
  const [loading, setLoading] = useState(false);

  const generateSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/ai-campaign-summary', {
        method: 'POST',
      });
      
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      } else {
        console.error('Failed to generate AI summary');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          🧠 AI Campaign Performance Analysis
        </CardTitle>
        <Button 
          onClick={generateSummary} 
          disabled={loading}
          variant="outline"
        >
          {loading ? 'Analyzing...' : 'Generate AI Insights'}
        </Button>
      </CardHeader>
      <CardContent>
        {!summary && !loading && (
          <div className="text-center py-8 text-gray-500">
            <p>Click "Generate AI Insights" to get intelligent analysis of your email campaigns</p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">AI is analyzing your campaign data...</span>
          </div>
        )}

        {summary && (
          <div className="space-y-6">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{summary.metrics.openRate}%</div>
                <div className="text-sm text-gray-600">Open Rate</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{summary.metrics.clickRate}%</div>
                <div className="text-sm text-gray-600">Click Rate</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{summary.metrics.conversionRate}%</div>
                <div className="text-sm text-gray-600">Conversion Rate</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{summary.metrics.totalConversions}</div>
                <div className="text-sm text-gray-600">Conversions</div>
              </div>
            </div>

            {/* AI Analysis */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">AI Analysis & Recommendations</h3>
                <Badge variant="secondary">
                  Updated: {new Date(summary.lastUpdated).toLocaleString()}
                </Badge>
              </div>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed bg-gray-50 p-4 rounded-lg">
                  {summary.analysis}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 