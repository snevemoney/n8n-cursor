import { useBTC } from '@/hooks/useBTCContext'

interface BTCValueCardProps {
  amountBTC: number
  title?: string
  className?: string
}

export function BTCValueCard({ amountBTC, title = "BTC Value", className = "" }: BTCValueCardProps) {
  const { breakdown } = useBTC()
  const data = breakdown(amountBTC)

  return (
    <div className={`rounded-xl border p-4 bg-white shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Bitcoin</span>
          <span className="font-mono text-lg font-bold text-orange-600">₿ {data.btc}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">USD Value</span>
          <span className="font-mono text-lg font-semibold text-green-600">${data.usd}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Satoshis</span>
          <span className="font-mono text-sm text-gray-800">{data.sats.toLocaleString()} sats</span>
        </div>
      </div>
    </div>
  )
} 