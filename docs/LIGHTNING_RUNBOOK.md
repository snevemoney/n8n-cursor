# ⚡ Lightning Network Runbook

**Project**: n8n-cursor  
**Last Updated**: $(date +%Y-%m-%d)  
**Status**: 🟡 IN_PROGRESS - Lightning integration being implemented

## 🚨 Critical Lightning Operations

### 1. Static Channel Backup (SCB)

#### Backup Location
- **Primary**: `/home/evens/.lnd/data/chain/bitcoin/mainnet/channel.backup`
- **Backup**: `/home/evens/n8n-cursor/backups/lightning/`
- **Cloud**: [Specify cloud backup location]

#### Backup Process
```bash
# Create SCB backup
cp ~/.lnd/data/chain/bitcoin/mainnet/channel.backup \
   ~/n8n-cursor/backups/lightning/channel.backup.$(date +%Y%m%d_%H%M%S)

# Verify backup integrity
sha256sum ~/n8n-cursor/backups/lightning/channel.backup.*
```

#### Restore Process
```bash
# Stop LND
sudo systemctl stop lnd

# Restore SCB
cp ~/n8n-cursor/backups/lightning/channel.backup.$(date) \
   ~/.lnd/data/chain/bitcoin/mainnet/channel.backup

# Start LND
sudo systemctl start lnd

# Verify channels
lncli listchannels
```

### 2. Watchtower Setup

#### Installation
```bash
# Install watchtower
git clone https://github.com/lightningnetwork/lnd.git
cd lnd/watchtower
go install ./cmd/watchtower
```

#### Configuration
```bash
# Create watchtower config
cat > ~/.watchtower/watchtower.conf << EOF
[Application Options]
watchtower.externalip=YOUR_PUBLIC_IP
watchtower.listen=0.0.0.0:9911

[Watchtower]
watchtower.tower-dir=~/.watchtower
EOF
```

#### Operation
```bash
# Start watchtower
watchtower --configfile=~/.watchtower/watchtower.conf

# Monitor watchtower
lncli watchtower stats
```

## 🔐 LNURL Security

### 1. LNURL-Auth Security
```bash
# Verify k1 parameter
echo "k1_value" | base64 -d | xxd

# Check callback domain binding
curl -s "https://yourdomain.com/.well-known/lnurlp/username" | jq
```

### 2. Webhook Security
```bash
# Generate HMAC signature
echo -n "payload" | openssl dgst -sha256 -hmac "your_secret"

# Verify webhook signature
# [Implementation in your webhook handler]
```

### 3. Invoice Security
```bash
# Set short expiration (5 minutes)
lncli addinvoice --expiry=300 --amt=1000

# Monitor for expired invoices
lncli listinvoices --pending_only
```

## 💰 Liquidity Management

### 1. Capacity Monitoring
```bash
# Check inbound/outbound capacity
lncli listchannels | jq -r '.channels[] | "\(.remote_pubkey) \(.capacity) \(.local_balance) \(.remote_balance)"'

# Monitor channel balance changes
watch -n 30 'lncli listchannels | jq ".channels[] | {remote_pubkey, local_balance, remote_balance}"'
```

### 2. Auto-Rebalance Policy
```bash
# Set rebalance thresholds
MIN_INBOUND=1000000  # 1M sats
MAX_OUTBOUND=5000000 # 5M sats

# Check if rebalance needed
lncli listchannels | jq -r '.channels[] | select(.local_balance < '$MIN_INBOUND' or .remote_balance < '$MIN_INBOUND')'
```

## 🚨 Emergency Procedures

### 1. Node Recovery
```bash
# Emergency stop
sudo systemctl stop lnd

# Check logs
sudo journalctl -u lnd -f

# Restore from backup
make lightning-restore

# Verify recovery
lncli getinfo
```

### 2. Channel Force Close
```bash
# List problematic channels
lncli listchannels | jq -r '.channels[] | select(.active == false)'

# Force close channel (use carefully!)
lncli closechannel --force --chan_point=CHANNEL_POINT
```

## 📊 Monitoring & Alerts

### 1. Health Checks
```bash
# Node health
lncli getinfo

# Channel status
lncli listchannels --active_only

# Payment status
lncli listpayments --include_incomplete
```

### 2. Alert Setup
```bash
# Monitor for offline channels
watch -n 60 'lncli listchannels | jq -r ".channels[] | select(.active == false) | .remote_pubkey"'

# Monitor for stuck payments
watch -n 30 'lncli listpayments --include_incomplete | jq -r ".payments[] | select(.status == \"IN_FLIGHT\") | .payment_hash"'
```

## 🔧 Integration with n8n

### 1. Webhook Endpoints
```bash
# Create webhook for payments
curl -X POST "https://yourdomain.com/webhook/lightning/payment" \
  -H "Content-Type: application/json" \
  -d '{"payment_hash": "hash", "amount": 1000}'
```

### 2. n8n Workflow Triggers
- **Payment Received**: Webhook trigger
- **Channel Opened**: Webhook trigger  
- **Channel Closed**: Webhook trigger
- **Payment Failed**: Webhook trigger

## 📚 Quick Commands

```bash
# Check node status
lncli getinfo

# List channels
lncli listchannels

# Create invoice
lncli addinvoice --amt=1000 --memo="Test invoice"

# Send payment
lncli sendpayment --pay_req=INVOICE_STRING

# Check payments
lncli listpayments

# Monitor logs
sudo journalctl -u lnd -f
```

## 🚨 Emergency Contacts

- **Lightning Issues**: [Contact info]
- **Node Recovery**: [Contact info]
- **Security Breach**: [Contact info]

---

**Remember**: Lightning is live money - test everything on testnet first!
