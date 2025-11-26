import { useEffect, useState, createContext, useContext, ReactNode } from 'react';

export interface BTCBreakdown {
  btc: number;
  usd: string;
  sats: number;
  formatted_sats: string;
}

export interface BTCContextType {
  priceUSD: number;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  breakdown: (btc: number) => BTCBreakdown;
  formatSats: (sats: number) => string;
  convertUSDToBTC: (usd: number) => number;
  convertBTCToUSD: (btc: number) => number;
  convertSatsToUSD: (sats: number) => string;
  convertUSDToSats: (usd: number) => number;
}

const BTCContext = createContext<BTCContextType | null>(null);

interface BTCProviderProps {
  children: ReactNode;
  refreshInterval?: number; // in milliseconds, default 30 seconds
}

export function BTCProvider({ children, refreshInterval = 30000 }: BTCProviderProps) {
  const [priceUSD, setPriceUSD] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchBTCPrice = async () => {
    try {
      setError(null);
      
      // Try multiple sources for reliability
      const sources = [
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
        'https://api.coinbase.com/v2/exchange-rates?currency=BTC',
        'https://mempool.space/api/v1/prices'
      ];

      let price = 0;
      
      for (const source of sources) {
        try {
          const response = await fetch(source);
          if (!response.ok) continue;
          
          const data = await response.json();
          
          // Parse different API formats
          if (source.includes('coingecko')) {
            price = data.bitcoin?.usd;
          } else if (source.includes('coinbase')) {
            price = parseFloat(data.data?.rates?.USD);
          } else if (source.includes('mempool')) {
            price = data.USD;
          }
          
          if (price && price > 0) {
            setPriceUSD(price);
            setLastUpdated(new Date());
            setLoading(false);
            return;
          }
        } catch (sourceError) {
          console.warn(`Failed to fetch from ${source}:`, sourceError);
          continue;
        }
      }
      
      throw new Error('All price sources failed');
    } catch (fetchError) {
      console.error('BTC price fetch failed:', fetchError);
      setError('Failed to fetch BTC price');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBTCPrice();
    const interval = setInterval(fetchBTCPrice, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Utility functions
  const breakdown = (btc: number): BTCBreakdown => {
    const sats = Math.round(btc * 100_000_000);
    const usd = (btc * priceUSD).toFixed(2);
    
    return {
      btc,
      usd,
      sats,
      formatted_sats: sats.toLocaleString()
    };
  };

  const formatSats = (sats: number): string => {
    return sats.toLocaleString();
  };

  const convertUSDToBTC = (usd: number): number => {
    if (priceUSD === 0) return 0;
    return usd / priceUSD;
  };

  const convertBTCToUSD = (btc: number): number => {
    return btc * priceUSD;
  };

  const convertSatsToUSD = (sats: number): string => {
    const btc = sats / 100_000_000;
    return (btc * priceUSD).toFixed(2);
  };

  const convertUSDToSats = (usd: number): number => {
    const btc = convertUSDToBTC(usd);
    return Math.round(btc * 100_000_000);
  };

  const contextValue: BTCContextType = {
    priceUSD,
    loading,
    error,
    lastUpdated,
    breakdown,
    formatSats,
    convertUSDToBTC,
    convertBTCToUSD,
    convertSatsToUSD,
    convertUSDToSats
  };

  return (
    <BTCContext.Provider value={contextValue}>
      {children}
    </BTCContext.Provider>
  );
}

export function useBTC(): BTCContextType {
  const context = useContext(BTCContext);
  if (!context) {
    throw new Error('useBTC must be used within a BTCProvider');
  }
  return context;
}

// Utility hook for BTC thinking trainer
export function useBTCThinking() {
  const { breakdown, priceUSD } = useBTC();
  
  const btcExamples = [1, 0.1, 0.01, 0.001, 0.0001];
  
  const examples = btcExamples.map(btc => ({
    ...breakdown(btc),
    context: getBTCContext(btc, priceUSD)
  }));

  return { examples, priceUSD };
}

// Get contextual meaning for BTC amounts
function getBTCContext(btc: number, priceUSD: number): string {
  const usd = btc * priceUSD;
  
  if (usd >= 100000) return "House down payment or luxury car";
  if (usd >= 50000) return "New car or year of expenses";
  if (usd >= 10000) return "Emergency fund or vacation";
  if (usd >= 1000) return "Monthly rent or laptop";
  if (usd >= 100) return "Dinner for two or tank of gas";
  if (usd >= 10) return "Coffee or lunch";
  return "Small tip or micro-payment";
}