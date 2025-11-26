import React from 'react';
import LightningRealityCheck from '@/components/dashboard/LightningRealityCheck';
import EarningsCalculator from '@/components/dashboard/EarningsCalculator';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lightning Node Reality Check',
  description: 'Why traditional Lightning nodes lose money and how business nodes actually earn',
};

export default function RealityCheckPage() {
  return (
    <div className="min-h-screen bg-gray-950 py-12">
      <div className="max-w-6xl mx-auto px-6 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            The Lightning Node Reality Check
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Discover why traditional Lightning nodes lose money and how our AI-powered business nodes 
            actually generate profitable revenue streams.
          </p>
        </div>

        {/* Reality Check Component */}
        <LightningRealityCheck />

        {/* Divider */}
        <div className="border-t border-gray-800" />

        {/* Calculator Component */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white">
              Calculate Your Potential
            </h2>
            <p className="text-gray-400">
              See exactly how much you could earn with a business node vs. a hobby node
            </p>
          </div>
          
          <EarningsCalculator />
        </div>

        {/* Bottom CTA */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8 text-center space-y-6">
          <h3 className="text-2xl font-semibold text-white">
            Ready to Turn Your Node Into a Business?
          </h3>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Join thousands of users who've stopped losing money on hobby routing and started 
            building profitable Lightning-native businesses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium">
              Start Free Trial
            </button>
            <button className="border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white px-8 py-3 rounded-lg font-medium">
              Book a Demo
            </button>
          </div>
          
          <div className="text-sm text-gray-500">
            🔒 Non-custodial • ⚡ Lightning-native • 🤖 AI-powered
          </div>
        </div>
      </div>
    </div>
  );
} 