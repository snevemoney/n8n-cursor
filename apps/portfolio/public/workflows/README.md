# Workflow Screenshots

Add your n8n workflow screenshots here. The portfolio will automatically display them in the "Featured Automation Work" section.

## Required Screenshots

Save your screenshots with these exact filenames:

1. **elevenlabs-post-call.png** - ElevenLabs POST Call Workflow
2. **inbound-assistant.png** - Inbound Assistant
3. **social-media-finder.png** - Social Profile Finder
4. **text-to-image-video.png** - AI Nana - Text to Image & Video
5. **email-notifications.png** - Email Notification System
6. **lead-capture.png** - Website Lead Capture with Apollo.io
7. **rag-chatbot.png** - RAG Agent / PI Attorney Lead Qualifier
8. **voice-assistant.png** - Voice Assistant Agent (Telegram)

## How to Add Screenshots

1. Take screenshots of your n8n workflows
2. Save them to this directory (`apps/portfolio/public/workflows/`)
3. Use the exact filenames listed above
4. Recommended format: PNG, 1200-1600px width
5. After adding screenshots, rebuild and restart:
   ```bash
   cd apps/portfolio
   npm run build
   pm2 restart portfolio
   ```

## Screenshot Tips

- Capture the full workflow view (all nodes visible)
- Use n8n's "read-only visualization" mode for clean screenshots
- Ensure good contrast and readability
- Crop to show the most important parts of the workflow

The portfolio will automatically display these screenshots in the workflow cards. If a screenshot is missing, the image area will be hidden gracefully.

