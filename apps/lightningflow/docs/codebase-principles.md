# Lightning AI Codebase Principles

(Founder/Architect Edition — built for scale, speed, and modular control)

⸻

## 1. File Paths Mirror Flows
- Every UI page maps to a features/ folder
- Every user action maps to an app/api/ route
- Every async job lives in background/ and is traceable from the flow that triggered it

**Why**: Easy to trace, debug, refactor. This makes Codex, Cursor, and teammates fast.

⸻

## 2. System is Feature-First, Not Tech-First
- Organize by domain (features/payment-links/, features/clients/) not by type (components/, utils/)
- Every feature folder is self-contained: UI + API + hooks + logic

**Why**: Features can evolve, be toggled, or delegated without breaking global code.

⸻

## 3. Everything Must Be Testable
- All logic must be:
  - Callable from a test (hooks, utils, API routes)
  - Separated from UI where needed (pure functions, adapters)
  - Use test-driven endpoints (/api/system-check/) to verify flows without UI clicking

**Why**: Confidence during refactor. Protects time and reputation.

⸻

## 4. Flows > Functions
- Think in flows: "Send Payment" means → UI input → API call → Supabase write → Background job → Toast + History log
- Document the flow once and reuse across features
- Every flow should be testable with a "System Check" probe

**Why**: Users care about outcomes, not functions. Flows drive value.

⸻

## 5. Advanced Mode is an Access Layer, Not a Fork
- Features are not duplicated — they are conditionally visible
- Use if (advancedMode) in UI and RLS in DB
- The core remains the same

**Why**: Keeps maintainability high and prevents splitting the app logic

⸻

## 6. Agents Must Be Replaceable and Schema-Defined
- All agents follow the MCP format
- Stored, validated, and triggered the same way regardless of purpose (invoice, summary, insight)
- Use versioning and schema registry

**Why**: Agents are your SaaS "apps." Treat them like plugins, not scripts.

⸻

## 7. Every User Interaction Is Logged or Visible
- Invoice generated? Show it in recent history.
- AI prompt failed? Show it in console or chat log.
- Background job crashed? Log it with timestamp and show health badge

**Why**: Visibility = Trust. Logs build confidence for users and you.

⸻

## 8. No Dead Ends
- Every button, toggle, card should either:
  - Do something
  - Show feedback
  - Or give a clear next step (e.g. "connect your node")

**Why**: Dead ends feel broken. This principle powers great UX.

⸻

## 9. Zero External Lock-In
- Everything works offline or locally on your KVM2 VPS
- No hard dependencies on hosted APIs (OpenAI must be proxied, Supabase self-hosted)

**Why**: Ensures long-term control, cost-efficiency, and sovereignty.

⸻

## 10. Always Build as If You're Handing This to a Stranger
- Every feature should be understandable by:
  - A teammate
  - An AI pair (Codex, ChatGPT, cursor etc)
  - Future-you at 3AM or future kid or buyer

**Why**: Clean structure, naming, and flow = instant onboarding + faster iteration. 