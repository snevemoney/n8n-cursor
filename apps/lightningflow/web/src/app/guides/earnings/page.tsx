"use client"
import { appPath } from '@/lib/base-path';

import { Button } from "../../../components/ui/button"
import { ArrowLeft, Zap, TrendingUp, Globe, Link, BarChart3, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"

export default function EarningsGuidePage() {
  const router = useRouter()
  
  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-green-500" />
        Earnings Optimization Guide
      </h1>
      
      <div className="bg-gray-800/60 rounded-xl border border-gray-700 mb-8 p-6">
        <h2 className="text-xl font-semibold mb-3">Lightning Node Revenue Streams</h2>
        <p className="text-gray-300 mb-4">
          There are several ways to generate income with your Lightning Node. This guide will help you
          optimize your node for maximum revenue generation.
        </p>
        
        <div className="space-y-4 mb-6">
          <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-700">
            <h3 className="font-semibold text-lg mb-1 flex items-center">
              <div className="w-6 h-6 bg-green-500/20 text-green-500 rounded-full mr-2 flex items-center justify-center">1</div>
              Routing Fee Optimization
            </h3>
            <p className="text-gray-300 mb-2">
              Your node can earn fees by routing payments between other Lightning Network participants.
            </p>
            <div className="bg-gray-800/80 rounded-lg p-3 border border-gray-700 text-sm">
              <p className="text-yellow-500 font-semibold mb-1">Pro Tip</p>
              <p className="text-gray-300">
                Lower your base fee to 200-500 sats and fee rate to 100-300 ppm to increase routing volume.
              </p>
            </div>
          </div>
          
          <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-700">
            <h3 className="font-semibold text-lg mb-1 flex items-center">
              <div className="w-6 h-6 bg-green-500/20 text-green-500 rounded-full mr-2 flex items-center justify-center">2</div>
              Strategic Channel Placement
            </h3>
            <p className="text-gray-300 mb-2">
              Connect to popular nodes to increase the likelihood of routing payments.
            </p>
            <div className="bg-gray-800/80 rounded-lg p-3 border border-gray-700 text-sm">
              <p className="text-yellow-500 font-semibold mb-1">Pro Tip</p>
              <p className="text-gray-300">
                Open channels with high-traffic nodes like exchanges, wallet services, and payment processors.
              </p>
            </div>
          </div>
          
          <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-700">
            <h3 className="font-semibold text-lg mb-1 flex items-center">
              <div className="w-6 h-6 bg-green-500/20 text-green-500 rounded-full mr-2 flex items-center justify-center">3</div>
              Channel Liquidity Balance
            </h3>
            <p className="text-gray-300 mb-2">
              Maintain balanced channels to facilitate payments in both directions.
            </p>
            <div className="bg-gray-800/80 rounded-lg p-3 border border-gray-700 text-sm">
              <p className="text-yellow-500 font-semibold mb-1">Pro Tip</p>
              <p className="text-gray-300">
                Aim for a 40-60% local balance in channels. Consider using circular rebalancing.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Button 
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => window.open('https://lightningnetwork.plus', '_blank')}
          >
            Get help on Lightning Network+
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="bg-amber-900/30 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
        <div className="bg-amber-500/20 p-1 rounded-full mt-0.5">
          <div className="text-amber-500 text-lg">💡</div>
        </div>
        <div>
          <h3 className="font-semibold text-amber-400 mb-1">Need personalized advice?</h3>
          <p className="text-gray-300 text-sm">
            Our AI assistant can analyze your specific node data and provide tailored recommendations
            to maximize your earnings based on your unique channel structure and network position.
          </p>
          <Button 
            variant="ghost"
            className="mt-2 text-amber-400 hover:text-amber-500 hover:bg-amber-950/30 px-3 py-1 h-auto text-sm"
            onClick={() => window.location.href = appPath('/ai-assistant?source=earnings-guide')}
          >
            Talk to the AI Assistant
          </Button>
        </div>
      </div>
    </div>
  )
} 