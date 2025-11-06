"use client";

import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, TrendingUp, BarChart3, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dashboard | LightningAI Flow',
  description: 'Monitor your Lightning Network performance and platform metrics',
};

export default function DashboardPage() {
  return (
    <div className="bg-gray-800 min-h-screen text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-400">Monitor your Lightning network performance and platform metrics</p>
          </div>
          <Link 
            href="/create" 
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded-md flex items-center transition-colors"
          >
            <span className="mr-2">💸</span>
            Create Payment
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="TOTAL BALANCE"
            value="1,245,500 sats"
            change="+12.8%"
            icon={<BarChart3 className="h-6 w-6 text-green-400" />}
          />
          
          <StatCard 
            title="MONTHLY REVENUE"
            value="82 invoices"
            change="+6.3%"
            icon={<TrendingUp className="h-6 w-6 text-green-400" />}
          />
          
          <StatCard 
            title="ACTIVE NODES"
            value="16 nodes"
            change="+4.2%"
            icon={<ArrowUpRight className="h-6 w-6 text-green-400" />}
          />
          
          <StatCard 
            title="TOTAL CLIENTS"
            value="34 clients"
            change="+2.1%"
            icon={<Users className="h-6 w-6 text-green-400" />}
          />
        </div>
        
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Recent Transactions</h2>
          
          <div className="space-y-4">
            <TransactionItem 
              title="Payment from Client A"
              timestamp="Today at 9:02 AM"
              amount="+120,000 sats"
              value="$52.80"
              positive
            />
            
            <TransactionItem 
              title="Tip received from Sarah"
              timestamp="Today at 8:14 AM"
              amount="+34,500 sats"
              value="$15.18"
              positive
            />
            
            <TransactionItem 
                          title="Channel open with Client B"
                          timestamp="Yesterday at 10:56 PM"
                          amount="Channel capacity: 500,000 sats"
                          value=""
                          neutral positive={undefined}            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon }) {
  const isPositive = change.startsWith('+');
  
  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        {icon}
      </div>
      <p className="text-2xl font-bold mb-2">{value}</p>
      <p className={`text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {change}
      </p>
    </div>
  );
}

function TransactionItem({ title, timestamp, amount, value, positive, neutral = false }) {
  return (
    <div className="border-b border-gray-800 pb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-gray-400">{timestamp}</p>
        </div>
        <div className="text-right">
          <p className={`font-medium ${neutral ? 'text-gray-300' : positive ? 'text-green-400' : 'text-red-400'}`}>
            {amount}
          </p>
          {value && <p className="text-sm text-gray-400">{value}</p>}
        </div>
      </div>
    </div>
  );
} 