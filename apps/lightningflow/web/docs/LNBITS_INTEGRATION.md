# LNbits Integration for Lightning AI Business Node Platform

## Overview

The Lightning AI Business Node Platform integrates with LNbits to provide secure, cryptographically-enforced Lightning Network payment processing. This integration includes:

- **Cryptographic Enforcement**: All high-risk operations use `signAndExecute()` with RSA-SHA256 signing
- **Vault Routing**: Automatic routing to secure vaults based on user-defined rules
- **Comprehensive Logging**: All operations logged to `/logs/proofLog.json` with audit trails
- **Full Payment Metadata**: Complete payment information for dashboard integration
- **Error Handling**: Robust error handling with retry mechanisms and user-friendly messages

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend UI   │───▶│   API Endpoint   │───▶│  LNbits Client  │
│                 │    │  /api/sendPayment │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │ signAndExecute() │    │   LNbits API    │
                       │ Crypto Signing   │    │  (Lightning)    │
                       └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │  Proof Logging   │    │ Lightning Node  │
                       │ /logs/proofLog   │    │   (LND/CLN)     │
                       └──────────────────┘    └─────────────────┘
```

## Setup

### 1. Environment Variables

Add the following to your `.env.local` file:

```bash
# LNbits Configuration
LNBITS_URL=http://localhost:5000
LNBITS_ADMIN_KEY=your_lnbits_admin_key
LNBITS_INVOICE_KEY=your_lnbits_invoice_key
LNBITS_READ_KEY=your_lnbits_read_key
LNBITS_WALLET_ID=your_lnbits_wallet_id
LNBITS_WEBHOOK_SECRET=your_webhook_secret

# Payment Limits
MAX_PAYMENT_SATS=1000000
MIN_PAYMENT_SATS=1
DEFAULT_INVOICE_EXPIRY=3600
```

### 2. LNbits Setup

1. Install and run LNbits:
   ```bash
   git clone https://github.com/lnbits/lnbits.git
   cd lnbits
   pip install -r requirements.txt
   python -m lnbits
   ```

2. Create a wallet in LNbits web interface
3. Generate API keys (Admin, Invoice, Read)
4. Configure webhook URL: `https://your-domain.com/api/webhooks/lightning`

### 3. Lightning Node Setup

LNbits supports multiple Lightning implementations:
- **LND**: Most common, good documentation
- **Core Lightning (CLN)**: Lightweight, spec-compliant
- **Eclair**: Scala-based implementation

## Usage

### Direct Client Usage

```typescript
import { lnbitsClient } from '@/lib/lnbits';

// Create an invoice
const invoice = await lnbitsClient.createInvoice(
  10000,           // amount in sats
  'AI services',   // memo
  'user_123',      // user ID
  3600            // expiry in seconds
);

// Send a payment
const payment = await lnbitsClient.sendPayment(
  'lnbc100u1p3...', // Lightning invoice
  'user_123',        // user ID
  'Payment memo'     // optional memo
);

// Check payment status
const status = await lnbitsClient.checkPaymentStatus(
  payment.payment.checking_id
);
```

### API Endpoint Usage

```typescript
// Send payment via API
const response = await fetch('/api/sendPayment', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your_jwt_token'
  },
  body: JSON.stringify({
    payment_request: 'lnbc100u1p3...',
    memo: 'API payment',
    user_id: 'user_123',
    max_fee_sats: 100,
    timeout_seconds: 60
  })
});

const result = await response.json();
```

## Cryptographic Enforcement

All Lightning operations are cryptographically signed using the `signAndExecute()` pattern:

### High-Risk Actions

The following actions require cryptographic signing:
- `send_payment`: Sending Lightning payments
- `receive_payment`: Creating Lightning invoices
- `vault_transfer`: Routing payments through vaults

### Signing Process

1. **Action Validation**: Verify the action is authorized
2. **Payload Hashing**: Create SHA-256 hash of operation data
3. **RSA Signing**: Sign hash with private key
4. **Proof Logging**: Store cryptographic proof in audit log
5. **Execution**: Perform the actual Lightning operation

### Example Signed Operation

```typescript
const result = await signAndExecute({
  action: 'send_payment',
  payload: { paymentRequest, userId, memo },
  userId: 'user_123',
  explanation: 'Sending Lightning payment for AI services',
  executeFunction: async () => {
    // Actual payment logic here
    return await lnbitsClient.sendPayment(paymentRequest, userId, memo);
  }
});
```

## Vault Routing

The system supports automatic routing of payments through secure vaults:

### Vault Rules

```typescript
interface VaultRule {
  id: string;
  user_id: string;
  min_amount: number;    // Minimum amount to trigger vault routing
  max_amount: number;    // Maximum amount for vault routing
  vault_address: string; // Lightning address or node pubkey
  auto_route: boolean;   // Enable automatic routing
  created_at: string;
}
```

### Routing Logic

1. **Amount Check**: Verify payment amount is within vault rule limits
2. **Rule Lookup**: Find active vault rules for user
3. **Vault Invoice**: Create invoice to vault address
4. **Route Payment**: Send payment through vault instead of direct
5. **Audit Trail**: Log vault routing decision and execution

## Logging and Audit Trails

All Lightning operations are comprehensively logged:

### Proof Log Structure

```json
{
  "id": "proof_123",
  "action": "lightning_payment_sent",
  "userId": "user_123",
  "timestamp": "2024-01-15T10:30:00Z",
  "hash": "sha256_hash_of_operation",
  "signature": "rsa_signature",
  "data": {
    "payment_id": "payment_456",
    "amount": 10000,
    "fee": 100,
    "payment_hash": "lightning_payment_hash",
    "vault_routed": false
  }
}
```

### Log Categories

- **Lightning**: Payment operations, invoice creation
- **Security**: Authentication, authorization events
- **System**: Health checks, configuration changes
- **Audit**: Compliance and regulatory events

## Error Handling

The integration provides comprehensive error handling:

### Error Types

```typescript
interface PaymentError {
  error_code: string;
  error: string;
  suggested_action?: string;
}
```

### Common Error Codes

- `INSUFFICIENT_BALANCE`: Not enough funds for payment
- `NO_ROUTE`: No Lightning route to destination
- `PAYMENT_TIMEOUT`: Payment took too long
- `INVALID_INVOICE`: Malformed Lightning invoice
- `FEE_TOO_HIGH`: Payment fee exceeds limits
- `AMOUNT_TOO_LARGE`: Payment exceeds maximum limits

### Error Recovery

```typescript
try {
  const payment = await lnbitsClient.sendPayment(invoice, userId);
} catch (error) {
  if (error.message.includes('insufficient')) {
    // Handle insufficient balance
    await notifyUserToAddFunds(userId);
  } else if (error.message.includes('route')) {
    // Handle routing failure
    await retryWithDifferentRoute(invoice, userId);
  }
}
```

## Dashboard Integration

Payment metadata is designed for dashboard consumption:

### Payment Metadata

```typescript
interface PaymentMetadata {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  fee: number;
  status: 'pending' | 'completed' | 'failed';
  payment_hash: string;
  payment_request?: string;
  preimage?: string;
  memo: string;
  timestamp: number;
  vault_routed: boolean;
  vault_address?: string;
  cryptographic_proof: string;
  user_id: string;
}
```

### Dashboard Queries

```typescript
// Get recent payments for dashboard
const payments = await lnbitsClient.getPaymentHistory(50);

// Get wallet balance
const balance = await lnbitsClient.getBalance();

// Filter by type
const sentPayments = payments.filter(p => p.bolt11 && p.amount < 0);
const receivedPayments = payments.filter(p => p.amount > 0);
```

## Security Considerations

### API Key Management

- Store LNbits API keys in environment variables
- Use different keys for different operations (admin, invoice, read)
- Rotate keys regularly
- Monitor key usage in logs

### Webhook Security

- Use webhook secrets to verify authenticity
- Validate webhook payloads
- Rate limit webhook endpoints
- Log all webhook activity

### Payment Validation

- Validate Lightning invoice format
- Check payment amounts against limits
- Verify user authorization
- Implement timeout mechanisms

## Testing

### Unit Tests

```typescript
import { lnbitsClient } from '@/lib/lnbits';

describe('LNbits Integration', () => {
  test('should create invoice', async () => {
    const result = await lnbitsClient.createInvoice(
      1000, 'test', 'user_123'
    );
    expect(result.invoice.payment_request).toMatch(/^lnbc/);
  });
});
```

### Integration Tests

```typescript
// Test complete payment flow
const invoice = await lnbitsClient.createInvoice(1000, 'test', 'user_123');
const payment = await lnbitsClient.sendPayment(
  invoice.invoice.payment_request, 'user_456'
);
const status = await lnbitsClient.checkPaymentStatus(
  payment.payment.checking_id
);
```

## Monitoring

### Health Checks

```typescript
// Check LNbits connectivity
const balance = await lnbitsClient.getBalance();
console.log('LNbits is healthy, balance:', balance.balance);

// Check Lightning node connectivity
const nodeInfo = await lnbitsClient.getNodeInfo();
console.log('Lightning node is healthy:', nodeInfo);
```

### Metrics

Monitor these key metrics:
- Payment success rate
- Average payment time
- Fee percentages
- Vault routing frequency
- Error rates by type

## Troubleshooting

### Common Issues

1. **Connection Errors**
   - Check LNbits URL and API keys
   - Verify network connectivity
   - Check firewall settings

2. **Payment Failures**
   - Verify sufficient balance
   - Check Lightning network connectivity
   - Validate invoice format

3. **Webhook Issues**
   - Verify webhook URL is accessible
   - Check webhook secret configuration
   - Monitor webhook logs

### Debug Mode

Enable debug logging:

```typescript
// Set log level to debug
process.env.LOG_LEVEL = 'debug';

// Enable LNbits debug mode
process.env.LNBITS_DEBUG = 'true';
```

## Support

For issues with the LNbits integration:

1. Check the logs in `/logs/proofLog.json`
2. Verify environment configuration
3. Test with small amounts first
4. Monitor Lightning network status
5. Contact support with error codes and timestamps

## Contributing

To contribute to the LNbits integration:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Update documentation
5. Submit a pull request

## License

This integration is part of the Lightning AI Business Node Platform and follows the same license terms. 