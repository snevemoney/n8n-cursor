import { useBTC } from '@/hooks/useBTCContext'

type ForecastItem = {
  label: string
  sats: number
  type: 'income' | 'expense'
  dueDate?: string
}

// Example forecast items - in production, these would come from Supabase/LNbits
const forecastItems: ForecastItem[] = [
  { label: 'AI Agent Invoice Processing', sats: -4000, type: 'expense', dueDate: 'Tomorrow' },
  { label: 'Node Hosting & Channel Fees', sats: -2500, type: 'expense', dueDate: 'In 3 days' },
  { label: 'Expected Client Payments', sats: 15000, type: 'income', dueDate: 'This week' },
  { label: 'Routing Fee Earnings', sats: 800, type: 'income', dueDate: 'Ongoing' },
  { label: 'LNURL Withdraw Requests', sats: -1200, type: 'expense', dueDate: 'Pending' },
]

export function BTCForecastPlanner() {
  const { breakdown } = useBTC()

  const totalIncome = forecastItems
    .filter(item => item.sats > 0)
    .reduce((sum, item) => sum + item.sats, 0)
  
  const totalExpenses = forecastItems
    .filter(item => item.sats < 0)
    .reduce((sum, item) => sum + Math.abs(item.sats), 0)
  
  const netFlow = totalIncome - totalExpenses
  const netFlowBTC = netFlow / 100_000_000

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Upcoming BTC Flow</h2>
        <span className="text-sm text-gray-500">Next 7 days</span>
      </div>
      
      <div className="space-y-3">
        {forecastItems.map((item, index) => {
          const value = breakdown(Math.abs(item.sats) / 100_000_000)
          const isIncome = item.sats > 0
          
          return (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{item.label}</span>
                  {item.dueDate && (
                    <span className="text-xs px-2 py-1 bg-gray-200 rounded-full text-gray-600">
                      {item.dueDate}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className={`font-mono font-semibold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                  {isIncome ? '+' : '-'} {Math.abs(item.sats).toLocaleString()} sats
                </div>
                <div className="text-sm text-gray-500">
                  ${value.usd}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="border-t pt-4">
        <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg">
          <span className="font-bold text-gray-900">Net Flow Projection</span>
          <div className="text-right">
            <div className={`font-mono text-lg font-bold ${netFlow > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {netFlow > 0 ? '+' : ''} {netFlow.toLocaleString()} sats
            </div>
            <div className="text-sm text-gray-600">
              ₿ {netFlowBTC.toFixed(8)} (${breakdown(netFlowBTC).usd})
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          💡 <strong>CFO Tip:</strong> Positive flow means your node is profitable. 
          Negative flow? Time to optimize fees or increase client revenue.
        </p>
      </div>
    </div>
  )
} 