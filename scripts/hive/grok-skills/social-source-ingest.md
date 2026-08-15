---
name: social-source-ingest
description: >-
  Ingest one public social surface (IG / X / Reddit / Facebook / TikTok)
  into a packet-shaped note. YouTube already has channel-walk +
  PACKET+full.txt. Use after a channel-walk sibling names a non-YouTube
  URL, or when the operator drops a public social post. Not six network
  clones. Cursor plus Grok Bot. No send.
---

# Social-source ingest

**Owner:** Researcher. Librarian persists. **Stack:** Cursor + Grok Bot.  
**YouTube:** use `channel-walk` (PACKET+full.txt). This skill is the other public surfaces.  
**Cursor copy:** `.cursor/skills/social-source-ingest/SKILL.md`  
**Grok `/` copy:** `~/.grokbot/skills/social-source-ingest/SKILL.md`

## When

Operator or a channel-walk sibling names a **public** Instagram / X / Reddit / Facebook / TikTok URL (profile, post, or thread). Not a YouTube tape. Not a new desk personality.

## Funnel

**In:** one public URL + surface (`ig` · `x` · `rd` · `fb` · `tt`).

**Stages:**

1. **Filter** — public text only. No login wall, no DM, no members-only. `filter-then-llm` before the model. Ladder: `api-macro-vision` (API/macro before headed).
2. **Write packet** — `docs/hive/outer-heaven/CONTENT/watch-later/packets/social/{surface}-{slug}/PACKET.md` + `visible.txt`. Visible text / on-page copy only. Caption-only / no-transcript = do not invent clicks, replies, or hidden UI. Tag `ig:` `x:` `rd:` `fb:` `tt:`.
3. **Hand off** — `steal-usecases` / `steal-sheet` (append if a machine exists) → `catalog-demand-match` if Evens asked “can we do this?”. No new `icp_id`.
4. **STOP** — packet on disk. Do not spawn 17. Do not walk the other five networks in this skill.

**Out / hard step:** send / pay / book / publish / follow / DM stay Evens.

## Related (do not replace)

| Skill | Job |
|-------|-----|
| `channel-walk` | YouTube catalog → one PACKET+full.txt |
| `steal-usecases` + `steal-sheet` | After visible text exists |
| `catalog-demand-match` | Demand-signal / “can we do X?” |
| `one-channel-deep` + `clip-factory` | Our owned surface; publish HITL |
| `verify-after-browser` | Only if someone clicked |

## Never

- One skill per network / instagram-agent clones
- Invent captions, clicks, or DMs
- Unpark Normand / start a Path A client
- Mass-DM / IG farm / OTP
- Grok Bot HTTP / `/api/sendPrompt`
- Claude Cowork, Claude Code, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus
