# Lightning AI Platform UI

A modern dashboard for managing Bitcoin Lightning Network nodes with AI integration.

## Features

- Real-time Node Dashboard with stats and metrics
- Payment Links generation system
- Team Wallets management
- Analytics and insights
- AI Assistant integration

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS for styling
- shadcn/ui components
- Sonner for toast notifications

## Getting Started

1. Install dependencies:
```bash
npm install
# or
yarn
# or
pnpm install
```

2. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Structure

- `/app` - Next.js App Router pages
- `/components` - Reusable UI components
  - `/components/ui` - Base UI components from shadcn/ui
  - `/components/dashboard` - Dashboard-specific components
  - `/components/layout` - Layout components like Sidebar
- `/lib` - Utility functions and mock data 