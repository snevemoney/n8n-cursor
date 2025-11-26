# Lightning AI Business Node Platform - Setup Guide

This guide will help you set up and run the Lightning AI Business Node Platform, which combines Bitcoin Lightning Network payments with AI capabilities.

## Requirements

- Node.js (v18+)
- npm (v8+)
- Supabase account (or self-hosted Supabase)
- Redis instance (for background jobs)
- OpenAI API key
- LNbits/LND for Lightning Network integration

## Initial Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/lightning-platform.git
   cd lightning-platform
   ```

2. Install dependencies:
   ```
   npm install
   cd web && npm install
   cd ../lightning-ui && npm install --legacy-peer-deps
   ```

3. Create environment variables:
   Create a file at `web/.env.local` with the following content:
   ```
   # Lightning Node Configuration
   LIGHTNING_NODE_URL=http://localhost:3001
   LIGHTNING_ADMIN_KEY=your_admin_key_here
   LNBITS_ADMIN_KEY=your_lnbits_admin_key_here

   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_key_here

   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Next Auth Configuration
   NEXTAUTH_URL=http://localhost:3001
   NEXTAUTH_SECRET=your_nextauth_secret_here  # generate with `openssl rand -base64 32`

   # Redis Configuration (for BullMQ)
   REDIS_URL=redis://localhost:6379
   ```

4. Set up your Supabase database:
   - Create a new project in Supabase
   - Run the SQL in `web/src/sql/supabase-schema.sql` to set up tables and RLS policies
   - Copy your Supabase URL and keys to the `.env.local` file

## Running the Application

1. Start the development server:
   ```
   cd web
   npx next dev
   ```

2. Start the BullMQ worker (in a separate terminal):
   ```
   cd web
   npx tsx src/workers/ai-worker.ts
   ```

3. Access the application at http://localhost:3000

## Setting up Lightning Network Integration

1. Set up a Lightning Node:
   - Option 1: Use LNbits (easiest for development)
   - Option 2: Run a Core Lightning or LND node
   
2. Configure the Lightning Network API key in the `.env.local` file

3. Test the Lightning integration by generating an LNURL or Lightning invoice

## Multi-tenant Row Level Security

The Supabase database is configured with Row Level Security to ensure:

- Each user can only access their own data
- LNURL withdrawals are validated against the user's wallet
- API usage is tracked per user
- Profiles are automatically created on signup

## Background Workers

The platform uses BullMQ with Redis for background processing:

- AI jobs are processed in the background
- Notifications are queued and processed asynchronously
- Reports are generated without blocking the main thread

## Going to Production

For production deployment:

1. Set up proper infrastructure:
   - Vercel for the Next.js frontend
   - Supabase for the database
   - Redis instance (e.g., Upstash, Redis Cloud)
   - Lightning Node (LND recommended for production)

2. Configure secure environment variables

3. Set up proper monitoring and logging

4. Consider implementing rate limiting for the OpenAI proxy

## Troubleshooting

If you encounter issues:

1. Check that all environment variables are set correctly
2. Ensure Redis is running for the BullMQ workers
3. Verify that your Supabase tables have the correct structure
4. Check that your Lightning Node is accessible

## Contributing

Contributions are welcome! Please follow our coding standards and submit pull requests for review. 