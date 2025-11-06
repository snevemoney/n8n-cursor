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
  const [priceUSD, setPriceUSD] = useState<number>(45000); // Start with a reasonable fallback price
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchBTCPrice = async () => {
    try {
      setError(null);
      
      // Check if we have a recent cached price (less than 5 minutes old)
      const cachedPrice = localStorage.getItem('btc-price-cache');
      if (cachedPrice) {
        try {
          const { price: cachedPriceValue, timestamp } = JSON.parse(cachedPrice);
          const cacheAge = Date.now() - timestamp;
          if (cacheAge < 5 * 60 * 1000) { // 5 minutes
            console.log('Using cached BTC price:', cachedPriceValue);
            setPriceUSD(cachedPriceValue);
            setLastUpdated(new Date(timestamp));
            setLoading(false);
            setError(null);
            return;
          }
        } catch (cacheError) {
          console.warn('Failed to parse cached price:', cacheError);
          localStorage.removeItem('btc-price-cache');
        }
      }
      
      // Try multiple sources for reliability with better error handling
      const sources = [
        {
          url: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
          parser: (data: any) => data.bitcoin?.usd,
          name: 'CoinGecko'
        },
        {
          url: 'https://api.coinbase.com/v2/exchange-rates?currency=BTC',
          parser: (data: any) => parseFloat(data.data?.rates?.USD),
          name: 'Coinbase'
        },
        {
          url: 'https://mempool.space/api/v1/prices',
          parser: (data: any) => data.USD,
          name: 'Mempool.space'
        },
        {
          url: 'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT',
          parser: (data: any) => parseFloat(data.price),
          name: 'Binance'
        },
        {
          url: 'https://api.kraken.com/0/public/Ticker?pair=XBTUSD',
          parser: (data: any) => parseFloat(data.result?.XXBTZUSD?.c?.[0]),
          name: 'Kraken'
        }
      ];

      let price = 0;
      let successfulSource = '';
      
      for (const source of sources) {
        try {
          console.log(`Trying ${source.name}...`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
          
          const response = await fetch(source.url, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'LightningFlow/1.0'
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            console.warn(`${source.name} returned ${response.status}: ${response.statusText}`);
            continue;
          }
          
          const data = await response.json();
          price = source.parser(data);
          
          if (price && price > 0 && price < 1000000) { // Sanity check: price should be reasonable
            console.log(`✅ Successfully fetched BTC price from ${source.name}: $${price.toLocaleString()}`);
            
            // Cache the successful price
            try {
              localStorage.setItem('btc-price-cache', JSON.stringify({
                price,
                timestamp: Date.now()
              }));
            } catch (cacheError) {
              console.warn('Failed to cache price:', cacheError);
            }
            
            setPriceUSD(price);
            setLastUpdated(new Date());
            setLoading(false);
            setError(null);
            return;
          } else {
            console.warn(`${source.name} returned invalid price: ${price}`);
          }
        } catch (sourceError) {
          if (sourceError.name === 'AbortError') {
            console.warn(`${source.name} request timed out`);
          } else {
            console.warn(`Failed to fetch from ${source.name}:`, sourceError);
          }
          continue;
        }
      }
      
      // If all external sources fail, use a fallback price
      console.warn('All external price sources failed, using fallback price');
      const fallbackPrice = 45000; // Conservative fallback price
      setPriceUSD(fallbackPrice);
      setLastUpdated(new Date());
      setLoading(false);
      setError('Using fallback price - external sources unavailable');
      
    } catch (fetchError) {
      console.error('BTC price fetch failed:', fetchError);
      // Even if everything fails, set a reasonable fallback
      const fallbackPrice = 45000;
      setPriceUSD(fallbackPrice);
      setLastUpdated(new Date());
      setLoading(false);
      setError('Using fallback price due to network issues');
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
  const btcContext = useBTC();
  
  // Safety check to prevent errors during initial render
  if (!btcContext || !btcContext.breakdown) {
    return { 
      examples: [], 
      priceUSD: 0 
    };
  }
  
  const { breakdown, priceUSD } = btcContext;
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