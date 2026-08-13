import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { runToolMatrix } from '../../../../scripts/run-tool-matrix';
import { createSSEMessage } from '@/lib/chat/events';

export const dynamic = 'force-dynamic';

/**
 * GET /api/diagnostics/run-tool-matrix
 * Returns the latest report without running tests
 */
export async function GET(req: NextRequest) {
  try {
    const reportsDir = resolve(process.cwd(), 'docs/diagnostics');
    const jsonPath = resolve(reportsDir, 'tool-matrix.json');
    const mdPath = resolve(reportsDir, 'tool-matrix.md');

    let reportJson: any = null;
    let reportMd: string = '';

    if (existsSync(jsonPath)) {
      reportJson = JSON.parse(readFileSync(jsonPath, 'utf-8'));
    }

    if (existsSync(mdPath)) {
      reportMd = readFileSync(mdPath, 'utf-8');
    }

    return NextResponse.json({
      ok: true,
      reportPathJson: jsonPath,
      reportPathMd: mdPath,
      coverage: reportJson?.coverage || null,
      report: reportJson,
      markdown: reportMd,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message || 'Failed to load report',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/diagnostics/run-tool-matrix
 * Runs the tool matrix test harness and returns the report
 * Supports SSE streaming if conversationId is provided
 */
export async function POST(req: NextRequest) {
  try {
    const encoder = new TextEncoder();
    const requestData = await req.json().catch(() => ({}));
    const conversationId = requestData.conversationId || `diagnostics-${Date.now()}`;
    const streamEnabled = requestData.stream === true;

    console.log('[Diagnostics] Running tool matrix...', { conversationId, streamEnabled });

    // If streaming requested, return SSE stream
    if (streamEnabled) {
      const stream = new ReadableStream({
        async start(controller) {
          let closed = false;

          const send = (event: any) => {
            if (closed) return;
            try {
              controller.enqueue(encoder.encode(createSSEMessage(event)));
            } catch (error) {
              console.error('[Diagnostics Stream] Error sending:', error);
              closed = true;
            }
          };

          try {
            send({ type: 'connected', data: { message: 'Tool Matrix stream connected', conversationId } });

            // Run tool matrix with event broadcasting
            await runToolMatrix({
              conversationId,
              onEvent: (event: any) => {
                send(event);
              },
            });

            // Read the generated reports
            const reportsDir = resolve(process.cwd(), 'docs/diagnostics');
            const jsonPath = resolve(reportsDir, 'tool-matrix.json');

            let reportJson: any = null;
            if (existsSync(jsonPath)) {
              reportJson = JSON.parse(readFileSync(jsonPath, 'utf-8'));
            }

            // Send final report
            send({
              type: 'status',
              data: {
                message: 'Tool Matrix complete',
                phase: 'completed',
              },
            });

            send({
              type: 'done',
              data: {
                messageId: conversationId,
                report: reportJson,
                coverage: reportJson?.coverage || null,
              },
            });
          } catch (error: any) {
            console.error('[Diagnostics] Error running tool matrix:', error);
            send({
              type: 'error',
              data: {
                message: error.message || 'Failed to run tool matrix',
              },
            });
          } finally {
            closed = true;
            try {
              controller.close();
            } catch {}
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    // Non-streaming mode: run and return JSON
    await runToolMatrix();

    // Read the generated reports
    const reportsDir = resolve(process.cwd(), 'docs/diagnostics');
    const jsonPath = resolve(reportsDir, 'tool-matrix.json');
    const mdPath = resolve(reportsDir, 'tool-matrix.md');

    let reportJson: any = null;
    let reportMd: string = '';

    if (existsSync(jsonPath)) {
      reportJson = JSON.parse(readFileSync(jsonPath, 'utf-8'));
    }

    if (existsSync(mdPath)) {
      reportMd = readFileSync(mdPath, 'utf-8');
    }

    return NextResponse.json({
      ok: true,
      reportPathJson: jsonPath,
      reportPathMd: mdPath,
      coverage: reportJson?.coverage || null,
      report: reportJson,
      markdown: reportMd,
      conversationId,
    });
  } catch (error: any) {
    console.error('[Diagnostics] Error running tool matrix:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error.message || 'Failed to run tool matrix',
      },
      { status: 500 }
    );
  }
}

