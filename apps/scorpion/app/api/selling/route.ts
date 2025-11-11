import { NextResponse } from 'next/server';
import { withErrorHandling, createSuccessResponse, validateRequest } from '@/lib/api-error-handler';
import { z } from 'zod';

/**
 * GET /api/selling - Get real product and sales data
 */
export const GET = withErrorHandling(async () => {
  // TODO: Connect to real database or payment provider (Stripe/PayPal)
  // For now, return empty data structure that the frontend can handle
  
  const products: any[] = [];
  const metrics = {
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalSales: 0,
    activeCustomers: 0,
    conversionRate: 0,
    avgOrderValue: 0
  };
  
  return createSuccessResponse({
    products,
    metrics,
    message: 'No products configured. Set up payment integration.'
  });
});

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  currency: z.string().optional(),
}).passthrough();

/**
 * POST /api/selling - Create or update product
 */
export const POST = withErrorHandling(async (request: Request) => {
  const validation = await validateRequest(request, productSchema);
  if (!validation.success) {
    return validation.error;
  }
  
  const body = validation.data;
  
  // TODO: Save to database
  console.log('Create product:', body);
  
  return createSuccessResponse({
    message: 'Product creation not yet implemented. Configure payment integration.'
  });
});

