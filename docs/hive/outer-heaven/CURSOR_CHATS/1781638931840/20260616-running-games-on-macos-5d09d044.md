---
chatId: 5d09d044-9603-417c-9401-504b6e5476be
workspace: 1781638931840
source: cursor
title: "Running games on macOS"
updated: 1781639014086
messageCount: 14
archived: false
projects: []
themes: ["[[THEMES/creative-personal]]", "[[THEMES/hive-mind]]", "[[THEMES/client-engine-money]]", "[[THEMES/gaming-mac]]"]
tags: [theme/creative]
---

# Running games on macOS

**Workspace:** `1781638931840`  
**Chat ID:** `5d09d044-9603-417c-9401-504b6e5476be`  
**Messages:** 14  
**Path:** `/Users/evenslouis/.cursor/projects/1781638931840/agent-transcripts/5d09d044-9603-417c-9401-504b6e5476be/5d09d044-9603-417c-9401-504b6e5476be.jsonl`

## What you asked

- **How to run the game / The application can't be opened
In the terminal, write "sudo chmod -R a+x " without the quotation marks, (don't press enter yet, and notice the space at the end after 'a+x', make sure it's there) then drag Game.app into the terminal and press enter. It will likely ask for your password for security reasons. When you type it in, it may not show anything. Just type it like normal and press enter. You should now be able to launch it via Game.app.
If the above doesn't work, you can try doing the same as before, but drag nwjs (not Game.app) into the terminal from Contents/Ma

---

- Briefly inform the user about the task result and perform any follow-up actions (if needed). If there's no follow-ups needed, don't explicitly say that.

## Assistant (excerpts)

- The executable lacks execute permission and has a quarantine flag from download. Fixing both.

[REDACTED]

---

- [REDACTED]

---

- I found the game and fixed the two issues that usually block it on macOS.

**Location:**  
`/Users/evenslouis/Downloads/DD_V07_25_MAC/DD_V07_25_MAC/Game.app`

**What was wrong:**
1. The `nwjs` executable had no execute permission (`-rw-rw-r--` instead of `-rwxrwxr-x`)
2. macOS had quarantined the app because it was downloaded via DuckDuckGo

**What I fixed:**
- Ran `chmod -R a+x` on `Game.app`
- Removed the quarantine flag with `xattr -dr com.apple.quarantine`

**Result:** The game launched successfully — the `nwjs` process is running.

---

### If you need to do this again later

**Option A —

---

- Checking whether the game is still running after the earlier fix.

[REDACTED]

---

- The game is set up and running.

I found it at `/Users/evenslouis/Downloads/DD_V07_25_MAC/DD_V07_25_MAC/Game.app`, fixed execute permissions on `nwjs`, and removed the macOS quarantine flag. **Demon Deals** should be open now — check your Dock or behind other windows if you don’t see it.

To launch it again later, double-click `Game.app` in Finder, or run:

```bash
open "/Users/evenslouis/Downloads/DD_V07_25_MAC/DD_V07_25_MAC/Game.app"
```

[REDACTED]

<!-- link-cursor-chats:managed -->
## Related themes

- [[THEMES/creative-personal]]
- [[THEMES/hive-mind]]
- [[THEMES/client-engine-money]]
- [[THEMES/gaming-mac]]

## Related chats

- [[20260704-higgsfield-activation-in-after-effects-7897fefb|Higgsfield activation in After Effects]]
- [[20260616-github-repository-access-0f6fff96|GitHub repository access]]
- [[20260704-adobe-after-effects-skills-development-3b471e0e|Adobe After Effects skills development]]
- [[20260525-clipengine-app-automation-capabilities-8faad87e|Clipengine app automation capabilities]]
- [[20260812-for-all-the-repos-and-based-off-the-last-chat-bc-973a02a9|for all the repos and based off the last chat bc-6]]

## Canon

- [[OUTER_HEAVEN_LIBRARY]]
<!-- /link-cursor-chats:managed -->
