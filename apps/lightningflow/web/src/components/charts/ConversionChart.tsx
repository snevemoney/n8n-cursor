'use client';

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ConversionData {
  date: string;
  sent: number;
  opened: number;
  clicked: number;
  converted: number;
}

export default function ConversionChart() {
  const [chartData, setChartData] = useState<any>({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConversionData() {
      try {
        const res = await fetch('/api/admin/conversion-timeline');
        const data = await res.json();

        const labels = data.timeline.map((item: ConversionData) => 
          new Date(item.date).toLocaleDateString()
        );

        setChartData({
          labels,
          datasets: [
            {
              label: 'Emails Sent',
              data: data.timeline.map((item: ConversionData) => item.sent),
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4,
            },
            {
              label: 'Opened',
              data: data.timeline.map((item: ConversionData) => item.opened),
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              tension: 0.4,
            },
            {
              label: 'Clicked',
              data: data.timeline.map((item: ConversionData) => item.clicked),
              borderColor: '#f59e0b',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              tension: 0.4,
            },
            {
              label: 'Converted',
              data: data.timeline.map((item: ConversionData) => item.converted),
              borderColor: '#8b5cf6',
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              tension: 0.4,
            },
          ],
        });
      } catch (error) {
        console.error('Failed to fetch conversion data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchConversionData();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Email Campaign Conversion Funnel (Last 30 Days)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading) {
    return (
      <div className="h-64 bg-gray-100 rounded animate-pulse flex items-center justify-center">
        <span className="text-gray-500">Loading conversion chart...</span>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <Line data={chartData} options={options} />
    </div>
  );
} 