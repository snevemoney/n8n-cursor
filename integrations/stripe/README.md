# Stripe Integration (safe defaults)

## Security Principles
- Use test keys locally. Keys live in env, not files.
- Webhook endpoint: POST /stripe/webhook (behind nginx)
- Verify signature using STRIPE_WEBHOOK_SECRET
- Do minimal work in the webhook; enqueue a job and ack fast.
- Use idempotency keys on API writes.

## Environment Variables
```bash
export STRIPE_SECRET_KEY="sk_test_..."
export STRIPE_WEBHOOK_SECRET="whsec_..."
```

## Local Development
```bash
# Install Stripe CLI
stripe listen --forward-to localhost:5678/stripe/webhook

# Test webhook delivery
stripe trigger payment_intent.succeeded
```

## Checklist
- [ ] Set env: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
- [ ] Stripe CLI for local: stripe listen --forward-to localhost:5678/stripe/webhook
- [ ] Test webhook signature verification
- [ ] Implement idempotency for payment operations
