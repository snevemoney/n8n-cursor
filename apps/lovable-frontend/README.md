# Lovable Frontend - n8n Workflows Dashboard

A Next.js 15 frontend application for testing and managing all 20 n8n workflows, recreated from the Lovable project structure.

## Features

- ✅ **20 n8n Workflow Integrations** - All workflows connected and ready to test
- ✅ **Cursor 2.0 Preview Support** - Health check endpoint at `/healthz`
- ✅ **Modern UI** - Clean, responsive dashboard with Tailwind CSS
- ✅ **TypeScript** - Fully typed webhook client and components
- ✅ **Error Handling** - Comprehensive error handling and display

## Quick Start

```bash
# Install dependencies
cd apps/lovable-frontend
pnpm install

# Run development server (port 3000)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Project Structure

```
apps/lovable-frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Dashboard page
│   │   ├── globals.css         # Global styles
│   │   └── healthz/
│   │       └── route.ts        # Health check (Cursor 2.0 preview)
│   ├── lib/
│   │   ├── webhook-config.ts   # Webhook client with all 20 endpoints
│   │   └── types.ts             # TypeScript types
│   └── components/             # React components (future)
├── public/                      # Static assets
└── package.json
```

## Webhook Configuration

All webhooks are configured to connect to:
- **Base URL**: `https://n8ncloud.tech/webhook`
- **Default Tenant ID**: `test-tenant-webhook-validation`
- **Headers**: `x-tenant-id` automatically included

## Available Workflows

1. **Chat AI Agent** - `/chat-assets`
2. **Asset Management** - `/assets`
3. **Work Order Management** - `/work-orders`
4. **Sustainability Dashboard** - `/sustainability-metrics`
5. **Tenant Onboarding** - `/tenant-onboard`
6. **Email Notifications** - `/notifications/email`
7. **Security Monitoring** - `/security`
8. **Compliance Audit** - `/compliance`
9. **Knowledge Base** - `/knowledge`
10. **Payment Processing** - `/payment`
11. **Analytics & Reporting** - `/analytics`
12. **Testing & QA** - `/testing`
13. **Advanced Features** - `/features`
14. **API Key Management** - `/api-keys`
15. **Backup & Restore** - `/backup`
16. **Refund Management** - `/refunds`
17. **Emergency Response** - `/emergency`
18. **Error Recovery** - `/recovery`
19. **Health Check** - `/health`
20. **File Upload Sync** - `/file-upload-sync` (Google Drive trigger)

## Cursor 2.0 Preview

The app includes a health check endpoint at `/healthz` for Cursor 2.0 preview support:

```bash
curl http://localhost:3000/healthz
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-28T...",
  "service": "lovable-frontend",
  "version": "0.1.0"
}
```

## Development

### Testing Webhooks

The dashboard includes a test button for each workflow. Click to test the webhook integration and see the response.

### Adding New Workflows

1. Add the type definition to `src/lib/types.ts`
2. Add the webhook function to `src/lib/webhook-config.ts`
3. Add the workflow card to `src/app/page.tsx`

## Environment Variables

Create a `.env.local` file if needed:

```env
NEXT_PUBLIC_N8N_BASE_URL=https://n8ncloud.tech/webhook
NEXT_PUBLIC_DEFAULT_TENANT_ID=test-tenant-webhook-validation
```

## License

MIT

