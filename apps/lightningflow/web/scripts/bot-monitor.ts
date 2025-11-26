#!/usr/bin/env tsx

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

interface BotTestReport {
  timestamp: string;
  configuration: {
    botCount: number;
    testDuration: number;
    concurrency: number;
    mode: string;
    baseUrl: string;
  };
  duration: string;
  summary: {
    totalBots: number;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    successRate: string;
    avgResponseTime: string;
    requestsPerSecond: string;
  };
  botMetrics: Array<{
    botId: string;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    avgResponseTime: number;
    errors: string[];
    actions: Array<{
      action: string;
      timestamp: number;
      responseTime: number;
      success: boolean;
      error?: string;
    }>;
  }>;
}

class BotTestMonitor {
  private reportsDir: string;

  constructor(reportsDir: string = 'bot-test-results') {
    this.reportsDir = reportsDir;
  }

  async loadReports(): Promise<BotTestReport[]> {
    try {
      const files = await readdir(this.reportsDir);
      const reportFiles = files.filter(f => f.startsWith('bot-test-report-') && f.endsWith('.json'));
      
      const reports: BotTestReport[] = [];
      
      for (const file of reportFiles) {
        try {
          const content = await readFile(join(this.reportsDir, file), 'utf-8');
          const report = JSON.parse(content) as BotTestReport;
          reports.push(report);
        } catch (error) {
          console.warn(`Failed to parse report ${file}:`, error);
        }
      }
      
      return reports.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    } catch (error) {
      console.warn('No reports directory found or error reading reports');
      return [];
    }
  }

  analyzePerformanceTrends(reports: BotTestReport[]): any {
    if (reports.length === 0) return null;

    const trends = {
      avgResponseTimes: [],
      successRates: [],
      requestsPerSecond: [],
      errorRates: [],
      timestamps: [],
    };

    for (const report of reports) {
      trends.avgResponseTimes.push(parseFloat(report.summary.avgResponseTime));
      trends.successRates.push(parseFloat(report.summary.successRate));
      trends.requestsPerSecond.push(parseFloat(report.summary.requestsPerSecond));
      trends.errorRates.push((report.summary.failedRequests / report.summary.totalRequests) * 100);
      trends.timestamps.push(report.timestamp);
    }

    return {
      trends,
      summary: {
        avgResponseTime: {
          current: trends.avgResponseTimes[trends.avgResponseTimes.length - 1],
          average: trends.avgResponseTimes.reduce((a, b) => a + b, 0) / trends.avgResponseTimes.length,
          best: Math.min(...trends.avgResponseTimes),
          worst: Math.max(...trends.avgResponseTimes),
        },
        successRate: {
          current: trends.successRates[trends.successRates.length - 1],
          average: trends.successRates.reduce((a, b) => a + b, 0) / trends.successRates.length,
          best: Math.max(...trends.successRates),
          worst: Math.min(...trends.successRates),
        },
        throughput: {
          current: trends.requestsPerSecond[trends.requestsPerSecond.length - 1],
          average: trends.requestsPerSecond.reduce((a, b) => a + b, 0) / trends.requestsPerSecond.length,
          best: Math.max(...trends.requestsPerSecond),
          worst: Math.min(...trends.requestsPerSecond),
        }
      }
    };
  }

  analyzeErrorPatterns(reports: BotTestReport[]): any {
    const errorCounts: { [key: string]: number } = {};
    const errorsByEndpoint: { [key: string]: number } = {};
    const errorsByTime: { [key: string]: number } = {};

    for (const report of reports) {
      for (const botMetric of report.botMetrics) {
        for (const error of botMetric.errors) {
          errorCounts[error] = (errorCounts[error] || 0) + 1;

          // Extract endpoint from error
          const endpointMatch = error.match(/^([^:]+):/);
          if (endpointMatch) {
            const endpoint = endpointMatch[1];
            errorsByEndpoint[endpoint] = (errorsByEndpoint[endpoint] || 0) + 1;
          }

          // Group by hour
          const hour = new Date(report.timestamp).toISOString().slice(0, 13);
          errorsByTime[hour] = (errorsByTime[hour] || 0) + 1;
        }
      }
    }

    return {
      topErrors: Object.entries(errorCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([error, count]) => ({ error, count })),
      errorsByEndpoint: Object.entries(errorsByEndpoint)
        .sort(([,a], [,b]) => b - a)
        .map(([endpoint, count]) => ({ endpoint, count })),
      errorsByTime,
      totalErrors: Object.values(errorCounts).reduce((a, b) => a + b, 0),
    };
  }

  generateHealthScore(reports: BotTestReport[]): number {
    if (reports.length === 0) return 0;

    const latestReport = reports[reports.length - 1];
    const successRate = parseFloat(latestReport.summary.successRate);
    const avgResponseTime = parseFloat(latestReport.summary.avgResponseTime);
    
    // Health score components:
    // 1. Success rate (0-40 points)
    const successScore = (successRate / 100) * 40;
    
    // 2. Response time (0-30 points) - lower is better
    const responseScore = Math.max(0, 30 - (avgResponseTime / 100));
    
    // 3. Consistency (0-30 points) - based on recent performance
    const recentReports = reports.slice(-5);
    const successRateVariance = this.calculateVariance(
      recentReports.map(r => parseFloat(r.summary.successRate))
    );
    const consistencyScore = Math.max(0, 30 - (successRateVariance * 3));
    
    return Math.min(100, successScore + responseScore + consistencyScore);
  }

  private calculateVariance(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const variance = numbers.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / numbers.length;
    return Math.sqrt(variance);
  }

  async generateHTMLReport(reports: BotTestReport[]): Promise<string> {
    const trends = this.analyzePerformanceTrends(reports);
    const errorAnalysis = this.analyzeErrorPatterns(reports);
    const healthScore = this.generateHealthScore(reports);

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lightning Platform Bot Test Monitor</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; text-align: center; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .metric-value { font-size: 2em; font-weight: bold; color: #333; }
        .metric-label { color: #666; margin-bottom: 10px; }
        .health-score { font-size: 3em; font-weight: bold; }
        .health-excellent { color: #22c55e; }
        .health-good { color: #84cc16; }
        .health-warning { color: #f59e0b; }
        .health-poor { color: #ef4444; }
        .chart-container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 20px; height: 400px; }
        .error-list { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .error-item { padding: 10px; border-bottom: 1px solid #eee; }
        .error-count { background: #ef4444; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8em; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
        th { background: #f8f9fa; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 Lightning Platform Bot Test Monitor</h1>
            <p>Real-time performance monitoring and analysis</p>
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-label">Health Score</div>
                <div class="metric-value health-${healthScore >= 90 ? 'excellent' : healthScore >= 75 ? 'good' : healthScore >= 50 ? 'warning' : 'poor'} health-score">
                    ${healthScore.toFixed(0)}
                </div>
            </div>
            
            ${trends ? `
            <div class="metric-card">
                <div class="metric-label">Avg Response Time</div>
                <div class="metric-value">${trends.summary.avgResponseTime.current.toFixed(1)}ms</div>
                <div style="color: #666; font-size: 0.9em;">Best: ${trends.summary.avgResponseTime.best.toFixed(1)}ms</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-label">Success Rate</div>
                <div class="metric-value">${trends.summary.successRate.current.toFixed(1)}%</div>
                <div style="color: #666; font-size: 0.9em;">Avg: ${trends.summary.successRate.average.toFixed(1)}%</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-label">Throughput</div>
                <div class="metric-value">${trends.summary.throughput.current.toFixed(1)}</div>
                <div style="color: #666; font-size: 0.9em;">req/sec</div>
            </div>
            ` : ''}
        </div>

        ${trends ? `
        <div class="chart-container">
            <h3>Performance Trends</h3>
            <canvas id="performanceChart"></canvas>
        </div>
        ` : ''}

        <div class="error-list">
            <h3>Error Analysis</h3>
            ${errorAnalysis.totalErrors > 0 ? `
            <table>
                <thead>
                    <tr>
                        <th>Error</th>
                        <th>Count</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    ${errorAnalysis.topErrors.map(({ error, count }) => `
                    <tr>
                        <td>${error}</td>
                        <td><span class="error-count">${count}</span></td>
                        <td>${((count / errorAnalysis.totalErrors) * 100).toFixed(1)}%</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
            ` : '<p style="color: #22c55e; font-weight: bold;">🎉 No errors detected in recent tests!</p>'}
        </div>

        <div style="margin-top: 40px; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h3>Recent Test Reports</h3>
            <table>
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>Bots</th>
                        <th>Requests</th>
                        <th>Success Rate</th>
                        <th>Avg Response</th>
                        <th>Throughput</th>
                    </tr>
                </thead>
                <tbody>
                    ${reports.slice(-10).reverse().map(report => `
                    <tr>
                        <td>${new Date(report.timestamp).toLocaleString()}</td>
                        <td>${report.summary.totalBots}</td>
                        <td>${report.summary.totalRequests}</td>
                        <td>${report.summary.successRate}</td>
                        <td>${report.summary.avgResponseTime}</td>
                        <td>${report.summary.requestsPerSecond} req/s</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>

    ${trends ? `
    <script>
        const ctx = document.getElementById('performanceChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ${JSON.stringify(trends.trends.timestamps.map((t: string) => new Date(t).toLocaleTimeString()))},
                datasets: [
                    {
                        label: 'Response Time (ms)',
                        data: ${JSON.stringify(trends.trends.avgResponseTimes)},
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        yAxisID: 'y'
                    },
                    {
                        label: 'Success Rate (%)',
                        data: ${JSON.stringify(trends.trends.successRates)},
                        borderColor: '#22c55e',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: { display: true, text: 'Response Time (ms)' }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: { display: true, text: 'Success Rate (%)' },
                        grid: { drawOnChartArea: false }
                    }
                }
            }
        });
    </script>
    ` : ''}
</body>
</html>`;

    return html;
  }

  async generateReport(): Promise<void> {
    console.log('📊 Analyzing bot test reports...');
    
    const reports = await this.loadReports();
    
    if (reports.length === 0) {
      console.log('❌ No test reports found. Run some bot tests first!');
      return;
    }

    console.log(`📈 Found ${reports.length} test reports`);
    
    const trends = this.analyzePerformanceTrends(reports);
    const errorAnalysis = this.analyzeErrorPatterns(reports);
    const healthScore = this.generateHealthScore(reports);

    // Console summary
    console.log('\n🎯 Performance Summary:');
    console.log('='.repeat(50));
    console.log(`🏥 Health Score: ${healthScore.toFixed(0)}/100`);
    
    if (trends) {
      console.log(`⚡ Current Response Time: ${trends.summary.avgResponseTime.current.toFixed(1)}ms`);
      console.log(`✅ Current Success Rate: ${trends.summary.successRate.current.toFixed(1)}%`);
      console.log(`🚀 Current Throughput: ${trends.summary.throughput.current.toFixed(1)} req/s`);
    }

    if (errorAnalysis.totalErrors > 0) {
      console.log(`\n❌ Total Errors: ${errorAnalysis.totalErrors}`);
      console.log('Top 3 Errors:');
      errorAnalysis.topErrors.slice(0, 3).forEach(({ error, count }, i) => {
        console.log(`   ${i + 1}. ${error} (${count}x)`);
      });
    } else {
      console.log('✅ No errors detected!');
    }

    // Generate HTML report
    const html = await this.generateHTMLReport(reports);
    const reportPath = 'bot-test-monitor.html';
    await writeFile(reportPath, html);
    
    console.log(`\n📋 Detailed HTML report generated: ${reportPath}`);
    console.log('🌐 Open it in your browser to view interactive charts and analysis');
  }
}

// CLI interface
async function main() {
  const monitor = new BotTestMonitor();
  await monitor.generateReport();
}

if (require.main === module) {
  main().catch(console.error);
}

export { BotTestMonitor }; 