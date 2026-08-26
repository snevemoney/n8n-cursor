# Product primitives

**Not** `CONTENT/knowledge/primitives/` (those are knowledge atoms). This folder is the **product foundation** so the next SKU is cheaper.

**Registry:** [primitives.json](primitives.json) · [schema](primitives.schema.json)  
**Contracts:** `scripts/hive/os/product-factory/contracts.ts`  
**Name collision:** SIP “dark headless factory” = these rows. Our desks = `dark-factory` process. Both. Not a sold SKU.

```
NEXT-SKU: reuse primitives.json. Do not rebuild login / payments / social-share.
STATUS: stub | wired_untested | connected
CONNECTED: Watchdog GRADE only (`GRADE.template.md`). Forge does not fill GRADE.
HARD: pay / deploy / publish = Evens
```

| id | status | HITL | What it is |
|----|--------|------|------------|
| `login` | wired_untested | no | Email/session interface. Adapter wraps ProofCheck `AuthContext` supabase client. CE `/pro` is operator login, not this attach. |
| `payments` | stub | **yes** | `proposeCharge` only. No live Stripe. Stays stub until Evens names pay. |
| `social-share` | stub | **yes** | Share-card / OG / copy. Not auto-post. |
| `promotion` | wired_untested | **yes** | Path C ProofCheck owned offer. After a bite, update the surface. Do not publish. |

ProofCheck remains `building`. Speed stays MISS until a cash SKU.

## login gap (do not fake)

AuthContext is real email/password + session (existing Supabase client). Not UI-only.

- Adapter: `/Users/evenslouis/proof-qc-assist/src/lib/loginPrimitive.ts` — same `LoginPrimitive` methods. Thin export from `AuthContext.tsx`. AuthContext is not replaced.
- `getSession` is not a method on AuthContext (session is React state). The adapter reads `supabase.auth.getSession()`.
- UI still uses `useAuth()`. Next SKU calls `proofCheckLogin`. No new vendor.
- Status is `wired_untested`, not `connected`. Watchdog GRADE empty. Forge does not fill GRADE.
- CE `/pro` is operator login (client-engine-1), not this attach. Headed sign-in is not part of the click-live flows.

ProofCheck ReportTab **Export PDF / Copy Markdown** have no `onClick` and no existing export handlers — do not invent a PDF engine this sitting.
