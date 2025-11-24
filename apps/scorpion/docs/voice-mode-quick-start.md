# Voice Mode - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Option 1: Cloud Profile (Easiest - No Local Services)

If you have an OpenAI API key, you can use voice mode immediately:

1. **Set environment variable**:
   ```bash
   # In .env.local
   OPENAI_API_KEY=sk-your-key-here
   ```

2. **Update VoiceButton profile** (in `components/chat/Composer.tsx`):
   ```typescript
   <VoiceButton
     profile="cloud"  // Change from "local" to "cloud"
     // ...
   />
   ```

3. **Done!** Click the microphone button in chat and grant permissions.

### Option 2: Local Profile (Full Privacy)

Requires local services but keeps everything on your machine:

1. **Start Ollama** (if not running):
   ```bash
   ollama serve
   ```

2. **Start Whisper STT** (choose one):
   ```bash
   # Docker (recommended)
   docker run -d -p 8000:8000 \
     --name whisper-api \
     onerahmet/openai-whisper-asr-webservice:latest-gpu
   
   # Or Python
   pip install openai-whisper
   # Run your own HTTP wrapper
   ```

3. **Start TTS Service** (choose one):
   ```bash
   # Kokoro TTS
   git clone https://github.com/hexgrad/kokoro
   cd kokoro && pip install -r requirements.txt
   python server.py --port 5000
   
   # Or use OpenAI TTS (hybrid mode)
   # Just set OPENAI_API_KEY and TTS_PROVIDER=openai
   ```

4. **Verify services**:
   ```bash
   ./scripts/setup-voice-mode.sh
   ```

5. **Done!** Click the microphone button in chat.

## 📋 Testing Checklist

- [ ] Voice button is visible in chat interface
- [ ] Clicking button requests microphone permission
- [ ] Microphone permission granted
- [ ] Speaking triggers recording (button shows active state)
- [ ] After 5 seconds of silence, audio is processed
- [ ] Text appears in input field
- [ ] Message is sent automatically
- [ ] Assistant response is generated
- [ ] Audio response is played (if TTS is configured)

## 🔧 Troubleshooting

### "Microphone permission denied"
- Check browser settings: `chrome://settings/content/microphone`
- Ensure site has permission
- Try refreshing the page

### "STT failed" or "Whisper API error"
- Check Whisper service is running: `curl http://localhost:8000/health`
- Verify `WHISPER_URL` in environment
- Check service logs for errors

### "TTS failed" or "TTS API error"
- Check TTS service is running: `curl http://localhost:5000/health`
- Verify `TTS_URL` in environment
- For OpenAI TTS, verify `OPENAI_API_KEY` is set

### "Chat API error"
- Ensure Ollama is running: `ollama serve`
- Check chat endpoint: `curl http://localhost:3003/api/chat/stream`
- Verify model is available: `ollama list`

### No audio playback
- Check browser audio settings
- Verify TTS service is working
- Check browser console for errors

## 🎯 Current Status

✅ **Implemented:**
- Voice button UI
- STT processor (Whisper/OpenAI)
- Chat processor (Scorpion orchestrator)
- TTS processor (Kokoro/OpenAI/ElevenLabs)
- Error handling
- Interruption handling
- Power of 10 compliance

⏳ **Next Steps:**
1. Set up services (Whisper, TTS) - see above
2. Configure environment variables
3. Test with microphone
4. Optimize performance (streaming, caching)

## 📚 Documentation

- **Full Documentation**: `docs/voice-mode.md`
- **Next Steps**: `docs/voice-mode-next-steps.md`
- **Implementation Summary**: `docs/voice-mode-summary.md`

## 💡 Tips

1. **Start with cloud profile** to test quickly, then switch to local for privacy
2. **Use hybrid profile** for best of both worlds (local STT/LLM, cloud TTS)
3. **Check browser console** for detailed error messages
4. **Use the setup script** to verify your configuration: `./scripts/setup-voice-mode.sh`

