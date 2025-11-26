export enum Phase {
  PLAN = "plan",
  COUNCIL = "council",
  TOOL_SELECT = "tools",
  KNOWLEDGE = "knowledge",
  USER_TOOLS = "user_tools",
  EXECUTE = "execute",
}

export type PhaseStatus =
  | { status: "done"; payload?: any }
  | { status: "skipped"; reason: string }
  | { status: "error"; error: { code: string; message: string; cause?: any } };

export type PanelEvent =
  | { type: "phase.start"; phase: Phase; objective: string }
  | { type: "phase.end"; phase: Phase; result: PhaseStatus }
  | { type: "tool.selected"; tools: string[]; rationale: string; matchedCount: number; installedCount: number }
  | { type: "kb.query"; query: string; hitCount: number }
  | { type: "userTools.list"; count: number }
  | { type: "exec.result"; ok: boolean; summary: string };

export type Emit = (e: PanelEvent) => void;

