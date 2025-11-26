import { useBTC } from '@/hooks/useBTCContext'

const btcExamples = [
  { btc: 1, context: "Full node operator level - serious business capital" },
  { btc: 0.1, context: "10,000 microtransactions or monthly SaaS revenue" },
  { btc: 0.01, context: "1,000 client payments or weekly earnings target" },
  { btc: 0.001, context: "100 small invoices or daily revenue goal" },
  { btc: 0.0001, context: "10 micro-payments or single service fee" }
]

export function BTCThinkingTrainer() {
  const { breakdown } = useBTC()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Train Your BTC Thinking</h2>
        <span className="text-sm text-gray-500">Live prices • Updates every 10s</span>
      </div>
      
      <div className="grid gap-3">
        {btcExamples.map(({ btc, context }) => {
          const value = breakdown(btc)
          return (
            <div key={btc} className="p-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-lg font-bold text-orange-600">₿ {btc}</span>
                <span className="font-mono text-lg font-semibold text-green-600">${value.usd}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm text-gray-600">{value.sats.toLocaleString()} sats</span>
              </div>
              <p className="text-sm text-gray-500 italic">{context}</p>
            </div>
          )
        })}
      </div>
      
      <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-200">
        <h3 className="font-semibold text-orange-900 mb-2">Node Operator Mindset</h3>
        <p className="text-sm text-orange-800">
          Think in terms of payment flows, not purchases. Each amount represents potential 
          revenue streams, client payments, or business scaling opportunities through your Lightning node.
        </p>
      </div>
    </div>
  )
} 