/**
 * Lightning AI Platform - Fiat Price Service
 * Real-time price feeds with caching and fallback for fiat-first UX
 */

import { Currency } from '../currency';
import { logger } from '../logger';

export interface PriceData {
  [key: string]: number; // Currency code -> price in that currency per BTC
}

export interface PriceServiceConfig {
  updateInterval: number; // milliseconds
  cacheTimeout: number;   // milliseconds
  enableFallback: boolean;
  fallbackPrices: PriceData;
}

export interface PriceSource {
  name: string;
  url: string;
  parser: (data: any) => PriceData | null;
  priority: number; // Lower = higher priority
}

export class FiatPriceService {
  private prices: PriceData = {};
  private lastUpdate: Date | null = null;
  private updateInterval: NodeJS.Timeout | null = null;
  private isUpdating = false;
  
  private readonly config: PriceServiceConfig = {
    updateInterval: 30000, // 30 seconds
    cacheTimeout: 60000,   // 1 minute
    enableFallback: true,
    fallbackPrices: {
      USD: 45000,
      CAD: 61000,
      EUR: 41000,
      GBP: 36000,
      JPY: 6800000
    }
  };

  // Price sources ordered by priority (most reliable first)
  private readonly priceSources: PriceSource[] = [
    {
      name: 'CoinGecko',
      url: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,cad,eur,gbp,jpy',
      priority: 1,
      parser: (data) => {
        try {
          const bitcoin = data.bitcoin;
          if (!bitcoin) return null;
          
          return {
            USD: bitcoin.usd || 0,
            CAD: bitcoin.cad || 0,
            EUR: bitcoin.eur || 0,
            GBP: bitcoin.gbp || 0,
            JPY: bitcoin.jpy || 0
          };
        } catch (error) {
          return null;
        }
      }
    },
    {
      name: 'Coinbase',
      url: 'https://api.coinbase.com/v2/exchange-rates?currency=BTC',
      priority: 2,
      parser: (data) => {
        try {
          const rates = data.data?.rates;
          if (!rates) return null;
          
          return {
            USD: parseFloat(rates.USD) || 0,
            CAD: parseFloat(rates.CAD) || 0,
            EUR: parseFloat(rates.EUR) || 0,
            GBP: parseFloat(rates.GBP) || 0,
            JPY: parseFloat(rates.JPY) || 0
          };
        } catch (error) {
          return null;
        }
      }
    },
    {
      name: 'Mempool.space',
      url: 'https://mempool.space/api/v1/prices',
      priority: 3,
      parser: (data) => {
        try {
          return {
            USD: data.USD || 0,
            CAD: data.CAD || 0,
            EUR: data.EUR || 0,
            GBP: data.GBP || 0,
            JPY: data.JPY || 0
          };
        } catch (error) {
          return null;
        }
      }
    },
    {
      name: 'Kraken',
      url: 'https://api.kraken.com/0/public/Ticker?pair=XBTUSD,XBTCAD,XBTEUR,XBTGBP,XBTJPY',
      priority: 4,
      parser: (data) => {
        try {
          const result = data.result;
          if (!result) return null;
          
          return {
            USD: parseFloat(result.XXBTZUSD?.c?.[0]) || 0,
            CAD: parseFloat(result.XXBTZCAD?.c?.[0]) || 0,
            EUR: parseFloat(result.XXBTZEUR?.c?.[0]) || 0,
            GBP: parseFloat(result.XXBTZGBP?.c?.[0]) || 0,
            JPY: parseFloat(result.XXBTZJPY?.c?.[0]) || 0
          };
        } catch (error) {
          return null;
        }
      }
    }
  ];

  constructor(config?: Partial<PriceServiceConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * Start the price service with automatic updates
   */
  async start(): Promise<void> {
    logger.logSystem('info', 'Starting fiat price service', {
      updateInterval: this.config.updateInterval,
      category: 'price_service'
    });

    // Initial price fetch
    await this.updatePrices();

    // Set up recurring updates
    this.updateInterval = setInterval(async () => {
      await this.updatePrices();
    }, this.config.updateInterval);
  }

  /**
   * Stop the price service
   */
  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    logger.logSystem('info', 'Fiat price service stopped', {
      category: 'price_service'
    });
  }

  /**
   * Get current price for a specific currency
   */
  getPrice(currency: Currency): number {
    const price = this.prices[currency];
    
    if (!price || price <= 0) {
      if (this.config.enableFallback) {
        logger.logSystem('warn', `Using fallback price for ${currency}`, {
          fallback_price: this.config.fallbackPrices[currency],
          category: 'price_service'
        });
        return this.config.fallbackPrices[currency] || 0;
      }
      return 0;
    }
    
    return price;
  }

  /**
   * Get all current prices
   */
  getAllPrices(): PriceData {
    const result: PriceData = {};
    
    // Get all supported currencies
    const currencies: Currency[] = ['USD', 'CAD', 'EUR', 'GBP', 'JPY'];
    
    currencies.forEach(currency => {
      result[currency] = this.getPrice(currency);
    });
    
    return result;
  }

  /**
   * Convert satoshis to fiat currency
   */
  convertSatsToFiat(sats: number, currency: Currency): number {
    const btcAmount = sats / 100_000_000;
    const price = this.getPrice(currency);
    return btcAmount * price;
  }

  /**
   * Convert fiat currency to satoshis
   */
  convertFiatToSats(amount: number, currency: Currency): number {
    const price = this.getPrice(currency);
    if (price <= 0) return 0;
    
    const btcAmount = amount / price;
    return Math.round(btcAmount * 100_000_000);
  }

  /**
   * Format amount with proper currency symbol and decimals
   */
  formatFiatAmount(amount: number, currency: Currency): string {
    const symbols: Record<Currency, string> = {
      USD: '$',
      CAD: 'C$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      BTC: '₿'
    };

    const decimals: Record<Currency, number> = {
      USD: 2,
      CAD: 2,
      EUR: 2,
      GBP: 2,
      JPY: 0,
      BTC: 8
    };

    const symbol = symbols[currency] || currency;
    const decimal = decimals[currency] || 2;
    
    return `${symbol}${amount.toLocaleString('en-US', {
      minimumFractionDigits: decimal,
      maximumFractionDigits: decimal
    })}`;
  }

  /**
   * Get price status and health information
   */
  getPriceStatus(): {
    isHealthy: boolean;
    lastUpdate: Date | null;
    staleness: number; // milliseconds since last update
    availableCurrencies: Currency[];
    failedSources: string[];
  } {
    const now = new Date();
    const staleness = this.lastUpdate ? now.getTime() - this.lastUpdate.getTime() : Infinity;
    const isHealthy = staleness < this.config.cacheTimeout && Object.keys(this.prices).length > 0;
    
    const availableCurrencies = Object.keys(this.prices)
      .filter(currency => this.prices[currency] > 0) as Currency[];

    return {
      isHealthy,
      lastUpdate: this.lastUpdate,
      staleness,
      availableCurrencies,
      failedSources: [] // Would track failed sources in production
    };
  }

  /**
   * Force an immediate price update
   */
  async forceUpdate(): Promise<boolean> {
    return await this.updatePrices();
  }

  /**
   * Create a fiat-first display object for UI components
   */
  createFiatDisplay(sats: number, primaryCurrency: Currency, showBtc: boolean = false): {
    primary: string;
    secondary?: string;
    raw: {
      sats: number;
      fiat: number;
      btc: number;
    };
  } {
    const fiatAmount = this.convertSatsToFiat(sats, primaryCurrency);
    const btcAmount = sats / 100_000_000;
    
    const primary = this.formatFiatAmount(fiatAmount, primaryCurrency);
    const secondary = showBtc ? `${sats.toLocaleString()} sats` : undefined;
    
    return {
      primary,
      secondary,
      raw: {
        sats,
        fiat: fiatAmount,
        btc: btcAmount
      }
    };
  }

  // Private methods

  private async updatePrices(): Promise<boolean> {
    if (this.isUpdating) {
      return false; // Prevent concurrent updates
    }

    this.isUpdating = true;
    let success = false;

    try {
      // Try each price source in order of priority
      for (const source of this.priceSources) {
        try {
          const newPrices = await this.fetchFromSource(source);
          
          if (newPrices && this.validatePrices(newPrices)) {
            this.prices = newPrices;
            this.lastUpdate = new Date();
            success = true;
            
            logger.logSystem('info', `Price update successful from ${source.name}`, {
              prices: newPrices,
              category: 'price_service'
            });
            
            break; // Stop trying other sources
          }
        } catch (error) {
          logger.logSystem('warn', `Failed to fetch prices from ${source.name}`, {
            error: error instanceof Error ? error.message : 'Unknown error',
            category: 'price_service'
          });
          continue; // Try next source
        }
      }

      if (!success) {
        logger.logSystem('error', 'All price sources failed', {
          category: 'price_service'
        });
      }

    } catch (error) {
      logger.logSystem('error', 'Price update failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        category: 'price_service'
      });
    } finally {
      this.isUpdating = false;
    }

    return success;
  }

  private async fetchFromSource(source: PriceSource): Promise<PriceData | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(source.url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Lightning-AI-Platform/1.0',
          'Accept': 'application/json'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return source.parser(data);

    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private validatePrices(prices: PriceData): boolean {
    // Basic validation - ensure prices are reasonable
    const minPrice = 1000;   // $1,000 per BTC (very conservative lower bound)
    const maxPrice = 1000000; // $1,000,000 per BTC (very conservative upper bound)

    for (const [currency, price] of Object.entries(prices)) {
      if (typeof price !== 'number' || price < minPrice || price > maxPrice) {
        logger.logSystem('warn', `Invalid price for ${currency}: ${price}`, {
          category: 'price_service'
        });
        return false;
      }
    }

    return true;
  }
} 