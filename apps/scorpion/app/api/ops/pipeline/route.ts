import { NextRequest } from "next/server";
// Initialize orchestrator tools on module load
import "@/lib/orchestrator";
import { runPipeline, PipelineContext } from "@/lib/orchestrator/run-pipeline";
import { planner, council, router, rag, userToolsAdapter, executor } from "./_adapters";

/**
 * Create a safe ReadableStream with error handling for controller state
 */
function createPipelineStream(objective: string, context: PipelineContext) {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      let isClosed = false;
      
      const safeEnqueue = (data: string) => {
        if (!isClosed) {
          try {
            controller.enqueue(encoder.encode(data));
          } catch (error) {
            // Controller may be closed, ignore
            isClosed = true;
          }
        }
      };
      
      const safeClose = () => {
        if (!isClosed) {
          try {
            controller.close();
            isClosed = true;
          } catch (error) {
            // Already closed, ignore
          }
        }
      };
      
        const emit = (e: any) => {
        safeEnqueue(`data: ${JSON.stringify(e)}\n\n`);
        };

        runPipeline({
          objective,
          context,
          emit,
          modelPlan: planner,
          modelCouncil: council,
          kbSearch: async (query: string, options?: { topK?: number }) => {
            const result = await rag(query);
            if (result.skip_reason || !result.data?.hits) return [];
            return result.data.hits;
          },
          userToolsRegistry: {
            listNames: async () => {
              const list = await userToolsAdapter.list();
              return list.map((t: any) => t.name);
            }
          }
        })
          .then(() => {
          safeEnqueue(`event: end\ndata: {}\n\n`);
          safeClose();
          })
          .catch((error) => {
            emit({
              type: "phase.end",
              phase: "execute",
              result: {
                status: "error",
                error: { code: "PIPELINE_ERROR", message: String(error?.message || error) }
              }
            });
          safeEnqueue(`event: end\ndata: {}\n\n`);
          safeClose();
          });
      }
    });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const payloadStr = searchParams.get("payload");
    
    if (!payloadStr) {
      return new Response(
        JSON.stringify({ error: "payload parameter required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { objective, context = {} } = JSON.parse(payloadStr);

    if (!objective) {
      return new Response(
        JSON.stringify({ error: "objective is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const stream = createPipelineStream(objective, context);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { objective, context = {} } = await req.json();

    if (!objective) {
      return new Response(
        JSON.stringify({ error: "objective is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const stream = createPipelineStream(objective, context);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

