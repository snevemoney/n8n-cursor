import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Safe Supabase client creation with fallbacks
const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
    console.warn('Supabase not configured - using mock mode');
    return null;
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

// Lightning Node Configuration
const LIGHTNING_NODE_URL = process.env.LIGHTNING_NODE_URL || '';
const LIGHTNING_API_KEY = process.env.LIGHTNING_API_KEY || '';
const LIGHTNING_ADMIN_KEY = process.env.LIGHTNING_ADMIN_KEY || '';
const SYSTEM_CHECK_KEY = process.env.SYSTEM_CHECK_KEY || 'system-check-secret';

/**
 * POST /api/system-check
 * Internal API to check system health and validate payment flows
 * This should be protected by a secret key
 */
export async function POST(req: NextRequest) {
  try {
    // Return mock response if Supabase not configured
    const supabaseAdmin = createSupabaseClient();
    if (!supabaseAdmin) {
      return NextResponse.json({
        success: true,
        results: {
          node: { status: 'ok', message: 'Mock mode - Lightning node check skipped' },
          database: { status: 'ok', message: 'Mock mode - Database not configured' },
          invoice: { status: 'ok', message: 'Mock mode - Invoice creation skipped' },
          lnurl: { status: 'ok', message: 'Mock mode - LNURL flow skipped' },
          webhook: { status: 'ok', message: 'Mock mode - Webhook test skipped' }
        },
        overall_status: 'ok',
        mode: 'mock',
        message: 'System check completed in mock mode - configure Supabase for full testing'
      });
    }

    // Validate security key - this endpoint should not be publicly accessible
    const providedKey = req.headers.get('x-system-check-key');
    if (!providedKey || providedKey !== SYSTEM_CHECK_KEY) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized access' 
      }, { status: 401 });
    }
    
    // Parse the request body to get which tests to run
    const body = await req.json();
    const { tests = ['node', 'database', 'invoice', 'lnurl', 'webhook'] } = body;
    
    const results: Record<string, any> = {};
    
    // 1. Check Node connectivity
    if (tests.includes('node')) {
      try {
        if (!LIGHTNING_NODE_URL || !LIGHTNING_ADMIN_KEY) {
          results.node = {
            status: 'warning',
            message: 'Lightning node configuration not provided'
          };
        } else {
          const nodeResponse = await fetch(`${LIGHTNING_NODE_URL}/api/v1/wallet`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-Api-Key': LIGHTNING_ADMIN_KEY
            }
          });
          
          if (!nodeResponse.ok) {
            results.node = {
              status: 'error',
              message: `Failed to connect to Lightning node: ${nodeResponse.statusText}`
            };
          } else {
            const nodeInfo = await nodeResponse.json();
            results.node = {
              status: 'ok',
              info: {
                id: nodeInfo.id,
                name: nodeInfo.name,
                balance: nodeInfo.balance
              }
            };
          }
        }
      } catch (error: any) {
        results.node = {
          status: 'error',
          message: `Error connecting to Lightning node: ${error.message}`
        };
      }
    }
    
    // 2. Check Database connectivity and tables
    if (tests.includes('database')) {
      try {
        // Check if we can query the database
        const { data: tenants, error: tenantError } = await supabaseAdmin
          .from('tenants')
          .select('id, name')
          .limit(1);
          
        if (tenantError) {
          results.database = {
            status: 'error',
            message: `Failed to query tenants table: ${tenantError.message}`
          };
        } else if (!tenants || tenants.length === 0) {
          results.database = {
            status: 'warning',
            message: 'Database is accessible but no tenants found'
          };
        } else {
          // Check other essential tables
          const { data: invoices, error: invoiceError } = await supabaseAdmin
            .from('invoices')
            .select('count', { count: 'exact', head: true });
            
          const { data: payments, error: paymentError } = await supabaseAdmin
            .from('invoice_payments')
            .select('count', { count: 'exact', head: true });
            
          const { data: paymentMethods, error: methodError } = await supabaseAdmin
            .from('payment_methods')
            .select('count', { count: 'exact', head: true });
            
          if (invoiceError || paymentError || methodError) {
            results.database = {
              status: 'warning',
              message: 'Some payment tables are not accessible',
              details: {
                invoiceError: invoiceError?.message,
                paymentError: paymentError?.message,
                methodError: methodError?.message
              }
            };
          } else {
            results.database = {
              status: 'ok',
              tables: {
                tenants: tenants.length,
                invoices: invoices,
                payments: payments,
                paymentMethods: paymentMethods
              }
            };
          }
        }
      } catch (error: any) {
        results.database = {
          status: 'error',
          message: `Database error: ${error.message}`
        };
      }
    }
    
    // 3. Test invoice creation flow
    if (tests.includes('invoice')) {
      try {
        // Find a test tenant to use
        const { data: tenant, error: tenantError } = await supabaseAdmin
          .from('tenants')
          .select('id, name')
          .eq('active', true)
          .limit(1)
          .single();
          
        if (tenantError || !tenant) {
          results.invoice = {
            status: 'error',
            message: 'No active tenant found for testing invoice creation'
          };
        } else {
          // Create a test invoice
          const testDescription = `System Health Check Invoice ${new Date().toISOString()}`;
          const testAmount = 100; // 100 sats
          
          if (!LIGHTNING_NODE_URL || !LIGHTNING_API_KEY) {
            results.invoice = {
              status: 'warning',
              message: 'Lightning node API not configured - cannot test invoice creation'
            };
          } else {
            const invoiceResponse = await fetch(`${LIGHTNING_NODE_URL}/api/v1/payments`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': LIGHTNING_API_KEY
              },
              body: JSON.stringify({
                out: false,
                amount: testAmount,
                memo: testDescription,
                expiry: 60, // 1 minute
                webhook: `${req.nextUrl.origin}/api/webhooks/lightning`,
                extra: {
                  tenant_id: tenant.id,
                  system_check: true
                }
              })
            });
            
            if (!invoiceResponse.ok) {
              results.invoice = {
                status: 'error',
                message: `Failed to create test invoice: ${await invoiceResponse.text()}`
              };
            } else {
              const lnInvoice = await invoiceResponse.json();
              
              // Store the invoice in the database
              const { data: invoice, error: invoiceError } = await supabaseAdmin
                .from('invoices')
                .insert({
                  user_id: '00000000-0000-0000-0000-000000000000', // System user
                  tenant_id: tenant.id,
                  description: testDescription,
                  amount_sats: testAmount,
                  status: 'pending',
                  payment_method: 'lightning',
                  reference_id: `system-check-${uuidv4().slice(0, 8)}`,
                  expiry_seconds: 60,
                  lnurl_data: { payment_hash: lnInvoice.payment_hash },
                  metadata: { 
                    payment_request: lnInvoice.payment_request,
                    created_via: 'system-check',
                    test: true
                  }
                })
                .select()
                .single();
                
              if (invoiceError) {
                results.invoice = {
                  status: 'error',
                  message: `Failed to store test invoice in database: ${invoiceError.message}`,
                  invoice_data: lnInvoice
                };
              } else {
                // Create an invoice_payment record
                const { error: paymentError } = await supabaseAdmin
                  .from('invoice_payments')
                  .insert({
                    invoice_id: invoice.id,
                    amount_sats: testAmount,
                    payment_method: 'lightning',
                    payment_request: lnInvoice.payment_request,
                    payment_hash: lnInvoice.payment_hash,
                    status: 'pending'
                  });
                  
                if (paymentError) {
                  results.invoice = {
                    status: 'warning',
                    message: `Created invoice but failed to create payment record: ${paymentError.message}`,
                    invoice_id: invoice.id,
                    payment_hash: lnInvoice.payment_hash
                  };
                } else {
                  results.invoice = {
                    status: 'ok',
                    invoice_id: invoice.id,
                    payment_hash: lnInvoice.payment_hash,
                    payment_request: lnInvoice.payment_request
                  };
                }
              }
            }
          }
        }
      } catch (error: any) {
        results.invoice = {
          status: 'error',
          message: `Error testing invoice creation: ${error.message}`
        };
      }
    }
    
    // 4. Test LNURL-pay flow
    if (tests.includes('lnurl') && results.invoice?.status === 'ok') {
      try {
        const invoiceId = results.invoice.invoice_id;
        
        // Generate LNURL for the test invoice
        const callbackUrl = `${req.nextUrl.origin}/api/lnurl-pay/callback?invoice_id=${invoiceId}`;
        
        // First test: check if the callback URL returns proper LNURL-pay parameters
        const callbackResponse = await fetch(callbackUrl);
        
        if (!callbackResponse.ok) {
          results.lnurl = {
            status: 'error',
            message: `Failed to get LNURL-pay parameters: ${await callbackResponse.text()}`
          };
        } else {
          const lnurlParams = await callbackResponse.json();
          
          if (!lnurlParams.callback || !lnurlParams.metadata || 
              !lnurlParams.minSendable || !lnurlParams.maxSendable) {
            results.lnurl = {
              status: 'error',
              message: 'LNURL-pay parameters are incomplete',
              params: lnurlParams
            };
          } else {
            // Second test: try to request an invoice with the amount
            const amountMsats = lnurlParams.minSendable;
            const invoiceCallbackUrl = `${lnurlParams.callback}&amount=${amountMsats}`;
            
            const invoiceResponse = await fetch(invoiceCallbackUrl);
            
            if (!invoiceResponse.ok) {
              results.lnurl = {
                status: 'error',
                message: `Failed to get invoice from LNURL-pay: ${await invoiceResponse.text()}`
              };
            } else {
              const invoiceData = await invoiceResponse.json();
              
              if (!invoiceData.pr) {
                results.lnurl = {
                  status: 'error',
                  message: 'LNURL-pay did not return a payment request',
                  data: invoiceData
                };
              } else {
                results.lnurl = {
                  status: 'ok',
                  payment_request: invoiceData.pr
                };
              }
            }
          }
        }
      } catch (error: any) {
        results.lnurl = {
          status: 'error',
          message: `Error testing LNURL-pay flow: ${error.message}`
        };
      }
    }
    
    // 5. Test webhook processing
    if (tests.includes('webhook') && results.invoice?.status === 'ok') {
      try {
        // Create a simulated webhook payload
        const webhookPayload = {
          payment_hash: results.invoice.payment_hash,
          preimage: 'test-preimage-' + uuidv4(),
          amount: 100,
          fee: 0,
          memo: 'System Check Invoice',
          time: Date.now() / 1000,
          bolt11: results.invoice.payment_request,
          checking_id: results.invoice.payment_hash,
          // This flags the payment as a test so we don't actually try to pay it
          extra: {
            tenant_id: results.invoice.tenant_id,
            invoice_id: results.invoice.invoice_id,
            system_check: true,
            test: true
          }
        };
        
        // Send the webhook to our handler
        const webhookResponse = await fetch(`${req.nextUrl.origin}/api/webhooks/lightning`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(webhookPayload)
        });
        
        if (!webhookResponse.ok) {
          results.webhook = {
            status: 'error',
            message: `Webhook handler returned error: ${await webhookResponse.text()}`
          };
        } else {
          const webhookResult = await webhookResponse.json();
          
          if (!webhookResult.success) {
            results.webhook = {
              status: 'error',
              message: 'Webhook handler did not indicate success',
              result: webhookResult
            };
          } else {
            // Verify that the invoice and payment were updated correctly
            const { data: payment, error: paymentError } = await supabaseAdmin
              .from('invoice_payments')
              .select('id, status, preimage, payment_hash')
              .eq('payment_hash', results.invoice.payment_hash)
              .single();
              
            if (paymentError || !payment) {
              results.webhook = {
                status: 'error',
                message: 'Webhook processed but payment record not updated',
                webhook_result: webhookResult
              };
            } else if (payment.status !== 'completed') {
              results.webhook = {
                status: 'error',
                message: 'Webhook processed but payment status not completed',
                payment: payment,
                webhook_result: webhookResult
              };
            } else {
              // Check that the invoice status was updated
              const { data: invoice, error: invoiceError } = await supabaseAdmin
                .from('invoices')
                .select('id, status, completed_at')
                .eq('id', results.invoice.invoice_id)
                .single();
                
              if (invoiceError || !invoice) {
                results.webhook = {
                  status: 'warning',
                  message: 'Payment updated but invoice record not found',
                  payment: payment,
                  webhook_result: webhookResult
                };
              } else if (invoice.status !== 'completed') {
                results.webhook = {
                  status: 'warning',
                  message: 'Payment updated but invoice status not completed',
                  invoice: invoice,
                  payment: payment,
                  webhook_result: webhookResult
                };
              } else {
                results.webhook = {
                  status: 'ok',
                  invoice_id: invoice.id,
                  payment_id: payment.id,
                  payment_hash: payment.payment_hash
                };
              }
            }
          }
        }
      } catch (error: any) {
        results.webhook = {
          status: 'error',
          message: `Error testing webhook processing: ${error.message}`
        };
      }
    } else if (tests.includes('webhook')) {
      results.webhook = {
        status: 'skipped',
        message: 'Webhook test skipped because invoice creation failed'
      };
    }
    
    // Determine overall status
    const statuses = Object.values(results).map((r: any) => r.status);
    const overallStatus = statuses.includes('error') ? 'error' : 
                         statuses.includes('warning') ? 'warning' : 'ok';
    
    return NextResponse.json({
      success: true,
      results,
      overall_status: overallStatus,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('System check error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'System check failed',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * GET /api/system-check
 * Basic health check endpoint
 */
export async function GET() {
  try {
    const supabaseAdmin = createSupabaseClient();
    
    if (!supabaseAdmin) {
      return NextResponse.json({
        success: true,
        status: 'healthy',
        database: 'not_configured',
        lightning: 'not_configured',
        mode: 'mock',
        timestamp: new Date().toISOString()
      });
    }

    // Quick database connectivity check
    const { data, error } = await supabaseAdmin
      .from('tenants')
      .select('count', { count: 'exact', head: true });
    
    const databaseStatus = error ? 'error' : 'connected';
    const lightningStatus = LIGHTNING_NODE_URL ? 'configured' : 'not_configured';
    
    return NextResponse.json({
      success: true,
      status: 'healthy',
      database: databaseStatus,
      lightning: lightningStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 