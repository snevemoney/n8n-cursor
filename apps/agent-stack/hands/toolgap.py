"""Z84 (dCK 10:49): an ask that names an app Jarvis has no tool for -> say so plainly ("<App> isn't in your
arsenal yet") instead of improvising. App list is deliberately small; inventory = configured MCP servers."""
from __future__ import annotations

import re

APPS = {"figma": "Figma", "notion": "Notion", "canva": "Canva", "airtable": "Airtable", "trello": "Trello", "asana": "Asana",
        "hubspot": "HubSpot", "salesforce": "Salesforce", "shopify": "Shopify", "quickbooks": "QuickBooks", "stripe": "Stripe",
        "zapier": "Zapier", "mailchimp": "Mailchimp", "clickup": "ClickUp", "monday": "Monday.com", "linkedin": "LinkedIn",
        "instagram": "Instagram", "tiktok": "TikTok", "dropbox": "Dropbox", "zoom": "Zoom", "spotify": "Spotify"}
ACT_RE = re.compile(r"\b(?:check|open|get|pull|post|update|create|add|send|read|look|find|show|list|change|edit|publish|upload)\b", re.I)


def gap(utterance: str, inventory_names: list[str]) -> str | None:
    low = (utterance or "").lower()
    if not ACT_RE.search(low):
        return None
    have = " ".join(n.lower() for n in inventory_names or [])
    for key, name in APPS.items():
        if re.search(rf"\b{key}\b", low) and key not in have:
            return (f"{name} isn't in your arsenal yet, sir, so I can't reach it from here and I won't guess. "
                    f"Connect {name} as a tool (an MCP server or a Zapier action) and I'll use it.")
    return None
