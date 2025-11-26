# Lightning AI Node Platform - Mode Transition Guide

## Overview

The Lightning AI Node Platform supports two operating modes to ensure safe development and testing while providing full production capabilities:

- **🧪 Emergency Mock Mode**: Safe testing environment with simulated data
- **⚡ Live Mode**: Production Lightning Network node with real Bitcoin

## Quick Setup

### 1. Configure Environment Variables

Create a `.env.local` file in the `/web` directory:

```bash
# Node Operating Mode
NEXT_PUBLIC_NODE_MODE=live  # or 'mock' for testing
NEXT_PUBLIC_NODE_NAME=Lightning AI Dev Node

# LNbits Configuration (for live mode)
LNBITS_URL=http://localhost:5000
LNBITS_ADMIN_KEY=your_admin_key_here
LNBITS_INVOICE_KEY=your_invoice_key_here
LNBITS_READ_KEY=your_read_key_here
LNBITS_WALLET_ID=your_wallet_id_here
LNBITS_WEBHOOK_SECRET=your_webhook_secret_here
MAX_PAYMENT_SATS=1000000

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### 2. Start Development Server

```bash
cd web
./scripts/start-dev.sh
```

## Mode Comparison

| Feature | Mock Mode | Live Mode |
|---------|-----------|-----------|
| **Bitcoin Transactions** | ❌ Simulated | ✅ Real |
| **Lightning Network** | ❌ Mock data | ✅ Connected |
| **Cryptographic Enforcement** | ❌ Disabled | ✅ Active |
| **Vault Routing** | ❌ Simulated | ✅ Functional |
| **Webhooks** | ❌ Disabled | ✅ Enabled |
| **Data Persistence** | 🔄 localStorage | 💾 Supabase |
| **Reset Capability** | ✅ Available | ❌ Protected |
| **Safety Level** | 🛡️ Completely Safe | ⚠️ Real Money |

## Emergency Mock Mode

### When to Use
- Initial development and testing
- Demonstrating features without risk
- Debugging payment flows
- Training new users
- Emergency fallback when live node fails

### Features
- Simulated Lightning Network data
- No real Bitcoin transactions
- Safe to experiment with all features
- Instant reset capability
- Isolated storage (prefixed with `mock_`)

### Accessing Mock Mode
1. Set `NEXT_PUBLIC_NODE_MODE=mock` in `.env.local`
2. Restart the development server
3. The interface will show "🧪 Emergency Mock Node"

### Resetting Mock Mode
1. Go to Settings page
2. Scroll to "Danger Zone"
3. Click "Reset Emergency Mock Node"
4. Confirm the action
5. All mock data will be cleared

## Live Mode

### When to Use
- Production deployment
- Real Lightning Network operations
- Actual Bitcoin payments
- Business operations

### Prerequisites
- Configured LNbits instance
- Lightning Network node (LND/Core Lightning)
- Proper environment variables
- Supabase database setup

### Features
- Real Bitcoin Lightning transactions
- Cryptographic proof enforcement
- Vault routing with real security
- Webhook notifications
- Persistent data storage
- No reset capability (safety feature)

### Zero Balance Display
When your live node has no funds:
```
Balance: ₿ 0.00 / 0 sats
Status: Node ready, unfunded
```

## Node Identity Management

### Setting Node Name
1. Go to Settings → Node Identity
2. Enter your desired node name
3. Click Save
4. The name will be displayed throughout the interface

### Current Identity Display
- **Mock Mode**: `🧪 [Your Name] (Mock)`
- **Live Mode**: `[Your Name]`

## Storage Isolation

### Mock Mode Storage
- Prefix: `mock_`
- Location: localStorage
- Scope: Browser session
- Reset: Available via settings

### Live Mode Storage
- Prefix: `live_`
- Location: Supabase + localStorage
- Scope: User account
- Reset: Not available (safety)

## API Endpoints

### Mock Mode
- Base URL: `/api/mock`
- No real network calls
- Simulated responses
- No webhook processing

### Live Mode
- Base URL: `/api/lightning`
- Real LNbits integration
- Actual Lightning Network
- Active webhook processing

## Security Features

### Mock Mode Security
- No real money at risk
- Cryptographic enforcement disabled
- Vault routing simulated
- Safe for experimentation

### Live Mode Security
- RSA-SHA256 signing required
- All high-risk actions enforced
- Real vault routing
- Comprehensive audit logging

## Troubleshooting

### Switching Modes
1. Update `NEXT_PUBLIC_NODE_MODE` in `.env.local`
2. Restart development server
3. Clear browser cache if needed
4. Verify mode indicator in top navigation

### Mode Not Changing
- Check `.env.local` file exists
- Verify environment variable syntax
- Restart development server completely
- Check browser console for errors

### Data Confusion
- Mock and live data are completely isolated
- Different storage prefixes prevent conflicts
- Reset mock mode if needed
- Live mode data persists across sessions

## Development Workflow

### Recommended Flow
1. **Start with Mock Mode**
   - Develop and test features safely
   - Verify all functionality works
   - Test edge cases and error handling

2. **Configure Live Environment**
   - Set up LNbits instance
   - Configure environment variables
   - Test with small amounts first

3. **Switch to Live Mode**
   - Update environment variables
   - Restart server
   - Verify live mode indicators
   - Test with minimal funds

4. **Production Deployment**
   - Use live mode only
   - Monitor all transactions
   - Keep emergency mock mode available

## Environment Variables Reference

### Required for All Modes
```bash
NEXT_PUBLIC_NODE_MODE=live|mock
NEXT_PUBLIC_NODE_NAME=Your Node Name
```

### Required for Live Mode Only
```bash
LNBITS_URL=http://localhost:5000
LNBITS_ADMIN_KEY=...
LNBITS_INVOICE_KEY=...
LNBITS_READ_KEY=...
LNBITS_WALLET_ID=...
LNBITS_WEBHOOK_SECRET=...
MAX_PAYMENT_SATS=1000000
OPENAI_API_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Optional Configuration
```bash
NODE_ENV=development|production
NEXT_PUBLIC_APP_URL=http://localhost:3000
MOCK_BALANCE_SATS=125000
MOCK_TRANSACTION_COUNT=47
```

## Best Practices

### Development
- Always start with mock mode
- Test all features before going live
- Keep mock mode available for demos
- Use descriptive node names

### Production
- Use live mode only
- Monitor all transactions
- Regular backups of node data
- Keep emergency procedures ready

### Security
- Never share live mode credentials
- Use strong webhook secrets
- Monitor for unusual activity
- Regular security audits

## Support

If you encounter issues with mode switching:

1. Check this documentation
2. Verify environment variables
3. Check browser console for errors
4. Review server logs
5. Test with emergency mock mode

The mode transition system is designed to be safe and reliable, ensuring you can always fall back to a working state while providing full production capabilities when needed. 