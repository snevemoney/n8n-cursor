# Lightning Transaction Intelligence (LTI) Feature Pack

The Lightning Transaction Intelligence feature pack provides real-time Lightning Network transaction monitoring, analysis, and visualization capabilities. This is a comprehensive suite of components designed to give users unprecedented insight into Lightning Network performance and routing.

## 🚀 Features

### 1. 3D Globe Visualization
- **Interactive 3D Earth**: Real-time Lightning nodes positioned globally
- **Animated Transaction Arcs**: Live transaction paths with speed-based coloring
- **Node Details**: Hover tooltips with capacity, channels, and status
- **Auto-rotation**: Smooth globe rotation with user controls

### 2. Speed Monitor
- **Real-time Metrics**: Fastest, average, and 95th percentile speeds
- **Speed Distribution**: Visual breakdown of transaction speed categories
- **Live Transaction Feed**: Recent transactions with filtering
- **Success Rate Tracking**: Network reliability monitoring

### 3. Timeline Visualization
- **Time-based Bars**: 5-minute buckets showing transaction volume and speed
- **Interactive Timeline**: Click bars for detailed transaction info
- **Play/Pause Controls**: Control timeline animation
- **Speed Color Coding**: Visual speed indicators

### 4. Transaction Simulation
- **Realistic Routing**: Geographic distance and node capacity-based routing
- **Multiple Route Options**: Compare different paths between nodes
- **Success Probability**: Realistic failure rates based on route complexity
- **Database Integration**: Optional Supabase logging for persistence

## 📁 File Structure

```
/features/transactions/
├── lightning-transaction-intelligence.tsx  # Main dashboard component
├── speed-monitor.tsx                      # Speed monitoring component
├── timeline.tsx                          # Timeline visualization
├── simulate-transaction.ts               # Transaction simulation engine
├── components/
│   └── Globe3DCanvas.tsx                # 3D globe component
├── hooks/
│   └── useTransactionGraph.ts           # Transaction graph state management
├── index.ts                             # Export definitions
└── README.md                            # This file
```

## 🛠 Installation & Setup

### Dependencies
```bash
npm install react-globe.gl three @types/three d3-geo @radix-ui/react-tabs @supabase/supabase-js
```

### Basic Usage
```tsx
import { LightningTransactionIntelligence } from '@/features/transactions'

export default function Dashboard() {
  return (
    <LightningTransactionIntelligence 
      defaultView="globe"
      autoSimulate={true}
    />
  )
}
```

### Individual Components
```tsx
import { 
  Globe3DCanvas, 
  SpeedMonitor, 
  Timeline,
  useTransactionGraph 
} from '@/features/transactions'

function CustomDashboard() {
  const { nodes, transactions, metrics } = useTransactionGraph()
  
  return (
    <div>
      <Globe3DCanvas nodes={nodes} transactions={transactions} />
      <SpeedMonitor autoRefresh={true} />
      <Timeline autoPlay={true} />
    </div>
  )
}
```

## 🎯 Component APIs

### LightningTransactionIntelligence
Main dashboard component with tabbed interface.

```tsx
interface LightningTransactionIntelligenceProps {
  className?: string
  defaultView?: 'globe' | 'map' | 'speed' | 'timeline'
  autoSimulate?: boolean
}
```

### Globe3DCanvas
3D globe visualization with Lightning nodes and transaction arcs.

```tsx
interface Globe3DCanvasProps {
  nodes?: LightningNode[]
  transactions?: TransactionArc[]
  autoRotate?: boolean
  showTransactionPaths?: boolean
  onNodeClick?: (node: LightningNode) => void
  onTransactionClick?: (transaction: TransactionArc) => void
}
```

### SpeedMonitor
Real-time transaction speed monitoring and analysis.

```tsx
interface SpeedMonitorProps {
  className?: string
  autoRefresh?: boolean
  refreshInterval?: number
  maxDataPoints?: number
}
```

### Timeline
Time-based transaction visualization with interactive controls.

```tsx
interface TimelineProps {
  className?: string
  maxDataPoints?: number
  timeWindow?: number // minutes
  autoPlay?: boolean
}
```

### useTransactionGraph Hook
Comprehensive state management for transaction data.

```tsx
interface UseTransactionGraphOptions {
  autoUpdate?: boolean
  updateInterval?: number
  maxTransactions?: number
  enableSimulation?: boolean
  simulationInterval?: number
}

const {
  nodes,
  edges,
  transactions,
  metrics,
  isLoading,
  error,
  refresh,
  simulateTransaction,
  fastestTransaction,
  slowestTransaction,
  topNodes
} = useTransactionGraph(options)
```

## 🔧 Simulation Engine

### Transaction Simulation
```tsx
import { 
  simulateTransaction, 
  generateRandomSimulation,
  logTransactionSpeed 
} from '@/features/transactions'

// Simulate specific route
const simulation = simulateTransaction('lightning_labs', 'acinq', 100000)

// Generate random simulation
const randomSim = generateRandomSimulation()

// Log to database (requires Supabase setup)
await logTransactionSpeed(simulation)
```

### Route Finding
```tsx
import { findRoutes } from '@/features/transactions'

const routes = findRoutes('lightning_labs', 'blockstream', 6) // max 6 hops
routes.forEach(route => {
  console.log(`Route: ${route.hops} hops, ${route.totalDelay}ms, ${route.probability * 100}% success`)
})
```

## 🗄 Database Integration

### Supabase Setup (Optional)
```tsx
import { initializeSupabase } from '@/features/transactions'

// Initialize Supabase connection
initializeSupabase(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### Transaction Speeds Table Schema
```sql
CREATE TABLE transaction_speeds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  node_id TEXT NOT NULL,
  node_alias TEXT NOT NULL,
  milliseconds INTEGER NOT NULL,
  hops INTEGER NOT NULL,
  amount BIGINT NOT NULL,
  inbound BOOLEAN NOT NULL,
  outbound BOOLEAN NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  route_nodes TEXT[] NOT NULL,
  fees_paid INTEGER NOT NULL,
  success BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE transaction_speeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transaction speeds" ON transaction_speeds
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own transaction speeds" ON transaction_speeds
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);
```

## 🎨 Styling & Theming

The components use Tailwind CSS and support both light and dark themes. Key design elements:

- **Speed Colors**: Green (fast), Yellow (medium), Orange (slow), Red (very slow)
- **Node Sizes**: Proportional to Lightning capacity
- **Animations**: Smooth transitions and real-time updates
- **Responsive**: Mobile-friendly layouts

## 🔍 Performance Considerations

- **Data Limits**: Components limit data points to prevent performance issues
- **Efficient Updates**: Uses React hooks for optimal re-rendering
- **Memory Management**: Automatic cleanup of old transactions
- **3D Optimization**: Globe component uses dynamic imports for SSR compatibility

## 🚀 Production Deployment

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Build Optimization
The 3D globe component is dynamically imported to avoid SSR issues:
```tsx
const Globe = dynamic(() => import('react-globe.gl'), { ssr: false })
```

## 🔮 Future Enhancements

1. **Real Lightning Integration**: Connect to actual Lightning nodes
2. **Advanced Analytics**: ML-based routing predictions
3. **Custom Node Networks**: User-defined node topologies
4. **Export Capabilities**: Data export and reporting features
5. **WebSocket Integration**: Real-time data streaming
6. **Mobile App**: React Native version

## 🤝 Contributing

This feature pack is designed to be modular and extensible. Key areas for contribution:

- Additional visualization types
- Enhanced simulation algorithms
- Real Lightning Network integration
- Performance optimizations
- Mobile responsiveness improvements

## 📄 License

Part of the Lightning AI Business Node Platform - see main project license. 