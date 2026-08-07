# Workflow Screenshots

Portfolio “Featured Automation Work” loads images from this directory.

## Current placeholders

SVG previews ship by default (no console 404s). Replace any file with a real n8n screenshot using the **same basename** and either `.svg` or update `AutomationShowcase.tsx` to `.png`.

| File | Workflow |
|------|----------|
| `elevenlabs-post-call.svg` | ElevenLabs POST Call |
| `inbound-assistant.svg` | Inbound Assistant |
| `social-media-finder.svg` | Social Profile Finder |
| `text-to-image-video.svg` | AI Nana - Text to Image & Video |
| `email-notifications.svg` | Email Notification System |
| `lead-capture.svg` | Website Lead Capture with Apollo.io |
| `rag-chatbot.svg` | RAG Agent / PI Attorney Lead Qualifier |
| `voice-assistant.svg` | Voice Assistant Agent (Telegram) |

## Replacing with real screenshots

1. Capture the n8n canvas (1200–1600px wide PNG recommended)
2. Save as the matching basename (update `AutomationShowcase.tsx` if switching to `.png`)
3. Rebuild/redeploy portfolio

Missing files used to 404 in the browser console even when `onError` hid the `<img>`; keep a file present for each referenced path.
