// Define payment method types
export type PaymentMethodType = 
  | 'lightning'
  | 'bank'
  | 'credit'
  | 'e-transfer'
  | 'phone'
  | 'apple-pay'
  | 'google-pay'
  | 'cash';

export interface PaymentMethod {
  id: PaymentMethodType;
  name: string;
  icon: string;
  description: string;
  generateQR?: (amount: number, description: string) => string;
  generateLink?: (amount: number, description: string) => string;
  referenceInfo?: string;
}

// Define available payment methods
export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'lightning',
    name: 'Lightning Network',
    icon: 'zap',
    description: 'Pay instantly with Bitcoin Lightning Network',
  },
  {
    id: 'bank',
    name: 'Bank Transfer',
    icon: 'building2',
    description: 'Pay via bank transfer',
    generateQR: (amount) => `bank-transfer:amount=${amount}`,
    generateLink: (amount) => `https://example.com/bank-transfer?amount=${amount}`,
    referenceInfo: 'Account: 123456789 • Reference: INV-{id}'
  },
  {
    id: 'credit',
    name: 'Credit Card',
    icon: 'credit-card',
    description: 'Pay with credit or debit card',
    generateQR: (amount) => `https://example.com/pay-card?amount=${amount}`,
    generateLink: (amount) => `https://example.com/pay-card?amount=${amount}`,
  },
  {
    id: 'e-transfer',
    name: 'E-Transfer',
    icon: 'mail',
    description: 'Send e-transfer to email',
    referenceInfo: 'Send to: payments@example.com • Reference: INV-{id}'
  },
  {
    id: 'phone',
    name: 'Phone Payment',
    icon: 'phone',
    description: 'Pay via phone',
    referenceInfo: 'Call (555) 123-4567 • Quote reference: INV-{id}'
  },
  {
    id: 'apple-pay',
    name: 'Apple Pay',
    icon: 'zap',
    description: 'Pay with Apple Pay',
    generateQR: (amount) => `https://example.com/apple-pay?amount=${amount}`,
    generateLink: (amount) => `https://example.com/apple-pay?amount=${amount}`,
  },
  {
    id: 'google-pay',
    name: 'Google Pay',
    icon: 'zap',
    description: 'Pay with Google Pay',
    generateQR: (amount) => `https://example.com/google-pay?amount=${amount}`,
    generateLink: (amount) => `https://example.com/google-pay?amount=${amount}`,
  },
  {
    id: 'cash',
    name: 'Cash',
    icon: 'banknote',
    description: 'Pay with cash',
    referenceInfo: 'Please pay in person and request a receipt'
  }
];

// Helper function to get a payment method by ID
export function getPaymentMethod(id: PaymentMethodType): PaymentMethod | undefined {
  return PAYMENT_METHODS.find(method => method.id === id);
}

/**
 * Calculates the discounted amount based on the original amount and discount percentage
 * 
 * @param originalAmount The original amount in satoshis
 * @param discountPercent The discount percentage (0-100)
 * @returns The final amount after applying the discount
 */
export function calculateDiscountedAmount(originalAmount: number, discountPercent: number = 0): number {
  if (discountPercent <= 0 || discountPercent > 100) {
    return originalAmount;
  }
  
  const discountMultiplier = (100 - discountPercent) / 100;
  return Math.round(originalAmount * discountMultiplier);
}

/**
 * Returns the saved amount from a discount
 * 
 * @param originalAmount The original amount in satoshis 
 * @param discountedAmount The discounted amount in satoshis
 * @returns The amount saved due to the discount
 */
export function calculateSavedAmount(originalAmount: number, discountedAmount: number): number {
  return originalAmount - discountedAmount;
}

/**
 * Interface for payment links/invoices
 */
export interface Invoice {
  id: string;
  description: string;
  amount: number;
  originalAmount?: number;
  discountPercent?: number;
  date: string;
  time?: string;
  expiry?: string;
  status: 'pending' | 'completed' | 'expired';
  method?: PaymentMethodType;
}