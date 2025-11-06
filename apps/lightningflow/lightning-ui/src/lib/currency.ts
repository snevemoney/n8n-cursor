// Supported currencies
export type Currency = 'USD' | 'CAD' | 'EUR' | 'GBP' | 'JPY' | 'BTC';

// Currency metadata
export interface CurrencyMeta {
  code: Currency;
  symbol: string;
  name: string;
  satoshiRate: number; // How many sats per 1 unit of this currency
  fractionDigits: number;
}

// Define all supported currencies with their metadata
export const CURRENCIES: Record<Currency, CurrencyMeta> = {
  // Crypto
  BTC: {
    code: 'BTC',
    symbol: '₿',
    name: 'Bitcoin',
    satoshiRate: 100000000, // 1 BTC = 100,000,000 sats
    fractionDigits: 8
  },
  
  // Fiat
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    satoshiRate: 2400, // 1 USD = 2,400 sats (at roughly $40k per BTC)
    fractionDigits: 2
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    satoshiRate: 1800, // 1 CAD = 1,800 sats
    fractionDigits: 2
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    satoshiRate: 2600, // 1 EUR = 2,600 sats
    fractionDigits: 2
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    satoshiRate: 3000, // 1 GBP = 3,000 sats
    fractionDigits: 2
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    satoshiRate: 16, // 1 JPY = 16 sats
    fractionDigits: 0
  }
};

/**
 * Convert an amount from one currency to another
 */
export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): number {
  if (fromCurrency === toCurrency) return amount;

  const fromMeta = CURRENCIES[fromCurrency];
  const toMeta = CURRENCIES[toCurrency];
  
  // Convert from the source currency to sats
  const amountInSats = amount * fromMeta.satoshiRate;
  
  // Convert from sats to the target currency
  return amountInSats / toMeta.satoshiRate;
}

/**
 * Format a currency amount with the proper symbol and decimal places
 */
export function formatCurrency(amount: number, currency: Currency): string {
  const meta = CURRENCIES[currency];
  
  // Format the number with the correct decimal places
  const formattedNumber = amount.toLocaleString(undefined, {
    minimumFractionDigits: meta.fractionDigits,
    maximumFractionDigits: meta.fractionDigits,
  });
  
  // Add the appropriate symbol
  return `${meta.symbol}${formattedNumber}`;
}

/**
 * Format a currency amount as raw number (no symbol)
 */
export function formatCurrencyValue(amount: number, currency: Currency): string {
  const meta = CURRENCIES[currency];
  
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: meta.fractionDigits,
    maximumFractionDigits: meta.fractionDigits,
  });
}

/**
 * Get all available currencies
 */
export function getAvailableCurrencies(): CurrencyMeta[] {
  return Object.values(CURRENCIES);
}

/**
 * Convert any amount to satoshis for internal processing
 */
export function toSatoshis(amount: number, currency: Currency): number {
  return Math.round(amount * CURRENCIES[currency].satoshiRate);
}

/**
 * Convert satoshis to any currency
 */
export function fromSatoshis(sats: number, currency: Currency): number {
  return sats / CURRENCIES[currency].satoshiRate;
} 