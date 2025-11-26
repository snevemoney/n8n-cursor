import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
        },
      }
    );

    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Parse request body
    const config = await request.json();
    const { botCount, testDuration, concurrency, mode } = config;

    // Validate configuration
    if (!botCount || !testDuration || !concurrency || !mode) {
      return NextResponse.json({ error: 'Invalid configuration' }, { status: 400 });
    }

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // Function to send JSON data
        const sendData = (data: any) => {
          controller.enqueue(encoder.encode(JSON.stringify(data) + '\n'));
        };

        sendData({ type: 'log', message: '🚀 Initializing bot test environment...' });

        // Set environment variables for the bot test
        const env = {
          ...process.env,
          BOT_COUNT: botCount.toString(),
          TEST_DURATION: testDuration.toString(),
          CONCURRENCY: concurrency.toString(),
          TEST_MODE: mode,
          BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
        };

        sendData({ type: 'log', message: `📋 Configuration: ${botCount} bots, ${testDuration}s, ${mode} mode` });

        // Determine the script path
        const scriptPath = path.join(process.cwd(), 'scripts', 'simulate-bots.ts');
        
        sendData({ type: 'log', message: '🤖 Starting bot simulation...' });

        // Spawn the bot test process
        const botProcess = spawn('npx', ['tsx', scriptPath], {
          env,
          cwd: process.cwd(),
        });

        let totalRequests = 0;
        let successfulRequests = 0;
        let failedRequests = 0;

        // Handle stdout
        botProcess.stdout.on('data', (data) => {
          const output = data.toString();
          const lines = output.split('\n').filter(Boolean);
          
          lines.forEach((line: string) => {
            sendData({ type: 'log', message: line });
            
            // Parse metrics from output
            if (line.includes('Total Requests:')) {
              const match = line.match(/Total Requests: (\d+)/);
              if (match) totalRequests = parseInt(match[1]);
            }
            if (line.includes('Success Rate:')) {
              const match = line.match(/Success Rate: ([\d.]+)%/);
              if (match) {
                const successRate = parseFloat(match[1]);
                successfulRequests = Math.round((totalRequests * successRate) / 100);
                failedRequests = totalRequests - successfulRequests;
              }
            }
            
            // Send progress update
            if (totalRequests > 0) {
              sendData({
                type: 'progress',
                summary: {
                  totalBots: botCount,
                  totalRequests,
                  successfulRequests,
                  failedRequests,
                  successRate: totalRequests > 0 ? ((successfulRequests / totalRequests) * 100).toFixed(2) + '%' : '0%',
                  avgResponseTime: '0ms', // We could parse this too
                  requestsPerSecond: (totalRequests / (Date.now() / 1000)).toFixed(2),
                }
              });
            }
          });
        });

        // Handle stderr
        botProcess.stderr.on('data', (data) => {
          const output = data.toString();
          sendData({ type: 'log', message: `⚠️ ${output}` });
        });

        // Handle process completion
        botProcess.on('close', (code) => {
          if (code === 0) {
            sendData({ type: 'log', message: '✅ Bot test completed successfully!' });
            sendData({
              type: 'complete',
              summary: {
                totalBots: botCount,
                totalRequests,
                successfulRequests,
                failedRequests,
                successRate: totalRequests > 0 ? ((successfulRequests / totalRequests) * 100).toFixed(2) + '%' : '0%',
                avgResponseTime: '0ms',
                requestsPerSecond: '0',
              }
            });
          } else {
            sendData({ type: 'log', message: `❌ Bot test failed with exit code ${code}` });
            sendData({ type: 'error', message: `Process exited with code ${code}` });
          }
          
          controller.close();
        });

        // Handle process errors
        botProcess.on('error', (error) => {
          sendData({ type: 'log', message: `❌ Process error: ${error.message}` });
          sendData({ type: 'error', message: error.message });
          controller.close();
        });

        // Set a timeout to prevent hanging
        setTimeout(() => {
          if (!botProcess.killed) {
            sendData({ type: 'log', message: '⏰ Test timeout reached, stopping...' });
            botProcess.kill();
          }
        }, (testDuration + 60) * 1000); // Add 60 seconds buffer
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });

  } catch (error) {
    console.error('Bot test API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 