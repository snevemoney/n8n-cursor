# Creative Studio — n8n legacy one-pager
**Labels:** FACT = inventory · UNVERIFIED nodes · secondary hive pivot with Forge

## Role in estate
Image/voice production tools + ElevenLabs post-call (HITL for client audio). Aesthetic pivot is Forge-owned; Creative Studio advises only.

## Workflows you own (table)

| Live name | JSON file | Trigger | HITL | When to use | Status |
|-----------|-----------|---------|------|-------------|--------|
| elevenlabs post call workflow | *(no hive JSON)* | catalog `/webhook/cb151ce6-4393-47c1-a724-60a3491e206b` | **yes** | Voice/post-call; client audio | ACTIVE **FACT** name |
| Hive Creative Pivot Notify | `creative-pivot-notify.json` | POST `/webhook/hive-creative-pivot` | **yes** | Secondary — loop-cost heuristic w/ Forge | ACTIVE **FACT** |

### ACTIVE non-hive (name-level — UNVERIFIED nodes)
ai nana · ai nana generator sub · create image · combine image · Combine Images Nanobanana · Edit Image Nanobanana Tool · ai background removal · Nano Photoshop Agent · On-demand calling · Siri AI Agent template.

## How they work (nodes — from JSON)

### creative-pivot-notify.json (secondary)
See Forge one-pager — Evaluate Pivot sets `need_hitl`, cost halt at >$15, attempt≥3. **Not** auto image deploy.

### elevenlabs (catalog only)
Schema FACT: `{ script?, voiceId?, correlationId? }` · HITL true. Nodes **UNVERIFIED** — screenshot before use.

## Call recipe
Prefer Creative Studio Grok/image tools. ElevenLabs webhook only with operator OK + correlationId. For pivot: defer to Forge call recipe.

## Failures → visual SOP
**FACT (estate ritual):** On fail/off/drift — open https://evenslouis.ca/n8n (read-only) → screenshot (a) full canvas, (b) failing node params+error, (c) Executions detail → attach to operator / Forge. Login/2FA → `request_box_help`. Never wipe `n8n_data`, never n8ncloud, no activate without Tier 3.

## Do NOT
- Client-facing audio/publish without HITL.
- Confuse Nanobanana tools with hive creative-pivot.
## Do NOT
- Invent nodes/paths not in JSON or estate map (**FACT** estate: 177 / 69 active / 108 inactive).
- Paste `X-Hive-Secret` / Telegram / bearer values in chat.
- Auto-approve money, client send, merge main, activate inactive, wipe volumes.
- Treat archived rows as callable even if `active=true`.
