"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Shield,
  Zap,
  Lock,
  Eye,
  ExternalLink,
  Download,
  CheckCircle,
  AlertTriangle,
  Info
} from "lucide-react"

export default function TrustCenterPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <Shield className="h-6 w-6 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Trust Center</h1>
            <Badge variant="outline" className="text-green-400 border-green-400">
              Non-custodial
            </Badge>
          </div>
          <p className="text-muted-foreground text-lg">
            Learn how Lightning Network enables sovereign Bitcoin payments and why we never hold your funds.
          </p>
        </div>

        {/* Lightning Network Overview */}
        <Card className="mb-8 border-blue-500/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-yellow-400" />
              <CardTitle className="text-xl">How Lightning Network Works</CardTitle>
            </div>
            <CardDescription>
              Understanding the technology that makes instant, low-fee Bitcoin payments possible
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="bg-blue-500/10 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-400 mb-2">1. Open Channel</h3>
                  <p className="text-sm text-muted-foreground">
                    Alice and Bob lock funds into a multisig address on-chain. This creates a payment channel.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-green-500/10 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-400 mb-2">2. Update Balances</h3>
                  <p className="text-sm text-muted-foreground">
                    They exchange signed balance updates off-chain. Instant and nearly free.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-purple-500/10 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-400 mb-2">3. Close Channel</h3>
                  <p className="text-sm text-muted-foreground">
                    Final state is submitted to Bitcoin blockchain. Funds distributed accordingly.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-amber-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-400 mb-1">Real Example</h4>
                  <p className="text-sm text-muted-foreground">
                    Bob buys coffee every morning. Instead of creating a blockchain transaction each time 
                    (expensive!), he opens a Lightning channel with the coffee shop. Now he can buy 
                    hundreds of coffees with instant, cheap payments.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scalability Comparison */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span>⚡</span>
              Why We're Not a Bank
            </CardTitle>
            <CardDescription>
              Compare Lightning Network to traditional payment systems
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-4 font-medium text-muted-foreground">System</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">TPS</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Control</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Fees</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Custody</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-700">
                    <td className="p-4 text-white font-medium">Visa</td>
                    <td className="p-4 text-white">65,000</td>
                    <td className="p-4 text-red-400">Banks</td>
                    <td className="p-4 text-amber-400">Medium</td>
                    <td className="p-4 text-red-400">Yes</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="p-4 text-white font-medium">Bitcoin</td>
                    <td className="p-4 text-white">7</td>
                    <td className="p-4 text-green-400">You</td>
                    <td className="p-4 text-amber-400">Low</td>
                    <td className="p-4 text-green-400">No</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-white font-medium">Lightning Network</td>
                    <td className="p-4 text-green-400">⚡ Millions</td>
                    <td className="p-4 text-green-400">You</td>
                    <td className="p-4 text-green-400">Minimal</td>
                    <td className="p-4 text-green-400">No</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <p>Source: <a href="https://usa.visa.com/dam/VCOM/global/about-visa/documents/visa-facts-figures-jan-2017.pdf" 
                 className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
                Visa Factsheet (2017) <ExternalLink className="inline h-3 w-3" />
              </a></p>
            </div>
          </CardContent>
        </Card>

        {/* Multisig Security */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-blue-400" />
              Why Multisignature Wallets Matter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Lightning channels rely on multisig: funds are locked in a 2-of-2 address. 
              Neither party can unilaterally spend funds without the other's signature.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-green-400 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Security Guarantees
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Funds can't be stolen without collusion</li>
                  <li>• Only latest state can be broadcast</li>
                  <li>• Revocation keys prevent fraud</li>
                  <li>• Time-locked transactions ensure safety</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-400 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Transparency
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Channel opening is on-chain</li>
                  <li>• Channel closing is on-chain</li>
                  <li>• Balance updates are cryptographically signed</li>
                  <li>• No trusted third parties required</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real Limitations */}
        <Card className="mb-8 border-amber-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              Real Limitations of Lightning
            </CardTitle>
            <CardDescription>
              We believe in transparency. Here's what you should know.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg">
              <h4 className="font-semibold text-amber-400 mb-2">Mathematical Critiques</h4>
              <blockquote className="text-sm text-muted-foreground italic border-l-2 border-amber-500/30 pl-4">
                "Routing is not free — large players will dominate the hubs"
              </blockquote>
              <p className="text-xs text-muted-foreground mt-2">
                — <a href="https://medium.com/@jonaldfyookball/mathematical-proof-that-the-lightning-network-cannot-be-a-decentralized-bitcoin-scaling-solution-1b8147650800" 
                     className="text-amber-400 hover:underline" target="_blank" rel="noopener noreferrer">
                  Fyookball, 2018 <ExternalLink className="inline h-3 w-3" />
                </a>
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-amber-400 mb-2">Routing Challenges</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Requires balanced liquidity</li>
                  <li>• Payments may fail if routes are unavailable</li>
                  <li>• Network effects favor large hubs</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-400 mb-2">How We Help</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Real-time relay insights</li>
                  <li>• AI-powered route suggestions</li>
                  <li>• Liquidity management tools</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Educational Resources */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Learn More</CardTitle>
            <CardDescription>
              Recommended reading to deepen your Lightning Network knowledge
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  title: "A Simple Explanation – CoinJournal",
                  url: "https://coinjournal.net/a-simple-explanation-of-the-lightning-network/",
                  description: "High-level overview perfect for beginners"
                },
                {
                  title: "Technical Primer – Litecoin School",
                  url: "https://medium.com/the-litecoin-school-of-crypto/a-primer-to-the-lightning-network-part-1-be909c403bde",
                  description: "Deep dive into HTLCs and time-locks"
                },
                {
                  title: "Multisig Wallets – Bitcoin Wiki",
                  url: "https://en.bitcoin.it/wiki/Multisignature#Multisignature_Wallets",
                  description: "Technical reference for wallet security"
                },
                {
                  title: "Scalability – Bitcoin Wiki",
                  url: "https://en.bitcoin.it/wiki/Scalability",
                  description: "Comprehensive scaling challenges and solutions"
                }
              ].map((resource, index) => (
                <a
                  key={index}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 border border-gray-700 rounded-lg hover:border-blue-500/50 transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-white group-hover:text-blue-400 transition-colors">
                        {resource.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {resource.description}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-blue-400 transition-colors flex-shrink-0 ml-2" />
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Our Commitment */}
        <Card className="border-green-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-green-400">
              <Shield className="h-5 w-5" />
              Our Commitment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-green-500/10 p-4 rounded-lg mb-3">
                  <Lock className="h-8 w-8 text-green-400 mx-auto" />
                </div>
                <h3 className="font-semibold text-green-400 mb-2">Your Bitcoin. Your Keys.</h3>
                <p className="text-sm text-muted-foreground">
                  We never hold custody of your funds. You maintain full control.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-500/10 p-4 rounded-lg mb-3">
                  <Eye className="h-8 w-8 text-blue-400 mx-auto" />
                </div>
                <h3 className="font-semibold text-blue-400 mb-2">Full Transparency</h3>
                <p className="text-sm text-muted-foreground">
                  Open source. Auditable. No hidden fees or dark patterns.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-500/10 p-4 rounded-lg mb-3">
                  <Zap className="h-8 w-8 text-purple-400 mx-auto" />
                </div>
                <h3 className="font-semibold text-purple-400 mb-2">Lightning Native</h3>
                <p className="text-sm text-muted-foreground">
                  Built for the Lightning Network from day one.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            This document is automatically updated and referenced by our AI Assistant. 
            Have questions? Ask our AI about Lightning Network security or decentralization.
          </p>
        </div>
      </div>
    </div>
  )
} 