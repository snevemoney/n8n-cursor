import { z } from 'zod';
import { getOpenAIService, isOpenAIAvailable } from '@scorpion/core/llm';
import { runModel } from '@scorpion/core';

export const name = 'user.transcribe';
export const label = 'Transcription Tool';
export const description = 'Transcribe audio/video recordings and generate summaries with action items';

export const schema = z.object({
  audioUrl: z.string().optional(),
  file: z.string().optional(), // Base64 encoded audio/video file
  includeSummary: z.boolean().default(true),
  includeActions: z.boolean().default(true),
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    // Check if OpenAI is available (hybrid approach)
    if (!isOpenAIAvailable()) {
      return {
        ok: false,
        error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.',
        message: 'OpenAI Whisper API is required for transcription.',
      };
    }

    const openai = getOpenAIService();

    // Handle file input (base64 or URL)
    let audioFile: File | Blob | Buffer;
    
    if (args.file) {
      // Convert base64 to Buffer
      const base64Data = args.file.replace(/^data:audio\/\w+;base64,/, '');
      audioFile = Buffer.from(base64Data, 'base64');
    } else if (args.audioUrl) {
      // Fetch from URL
      const response = await fetch(args.audioUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio from URL: ${response.statusText}`);
      }
      audioFile = await response.blob();
    } else {
      return {
        ok: false,
        error: 'Either file or audioUrl must be provided',
      };
    }

    // Transcribe using OpenAI Whisper
    const transcription = await openai.createTranscription({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['word', 'segment'],
    });

    let summary: string | undefined;
    let actions: string[] | undefined;

    // Generate summary and actions if requested (using hybrid: OpenAI if available, else Ollama)
    if (args.includeSummary || args.includeActions) {
      const summaryPrompt = `Transcription:\n${transcription.text}\n\n${
        args.includeSummary ? 'Provide a concise summary.\n' : ''
      }${
        args.includeActions ? 'Extract action items as a bulleted list.\n' : ''
      }`;

      try {
        // Try OpenAI first for better quality
        if (isOpenAIAvailable()) {
          const summaryResponse = await openai.chatCompletion({
            messages: [
              {
                role: 'system',
                content: 'You are a helpful assistant that summarizes transcriptions and extracts action items.',
              },
              { role: 'user', content: summaryPrompt },
            ],
            model: 'gpt-4o-mini',
            temperature: 0.7,
          });

          const summaryText = summaryResponse.choices[0]?.message?.content || '';
          
          if (args.includeSummary) {
            summary = summaryText.split('Action Items:')[0].trim();
          }
          
          if (args.includeActions) {
            const actionsMatch = summaryText.match(/Action Items?:?\s*\n((?:[-•]\s*.+\n?)+)/i);
            actions = actionsMatch
              ? actionsMatch[1]
                  .split('\n')
                  .filter((line) => line.trim())
                  .map((line) => line.replace(/^[-•]\s*/, '').trim())
              : [];
          }
        } else {
          // Fallback to Ollama
          const summaryResponse = await runModel({
            prompt: summaryPrompt,
            system: 'You are a helpful assistant that summarizes transcriptions and extracts action items.',
            temperature: 0.7,
          });

          const summaryText = summaryResponse.content;
          
          if (args.includeSummary) {
            summary = summaryText.split('Action Items:')[0].trim();
          }
          
          if (args.includeActions) {
            const actionsMatch = summaryText.match(/Action Items?:?\s*\n((?:[-•]\s*.+\n?)+)/i);
            actions = actionsMatch
              ? actionsMatch[1]
                  .split('\n')
                  .filter((line) => line.trim())
                  .map((line) => line.replace(/^[-•]\s*/, '').trim())
              : [];
          }
        }
      } catch (error) {
        console.warn('Failed to generate summary/actions:', error);
        // Continue without summary/actions
      }
    }

    return {
      ok: true,
      transcription: transcription.text,
      summary,
      actions,
      metadata: {
        language: transcription.language,
        duration: transcription.duration,
        words: transcription.words?.length || 0,
        segments: transcription.segments?.length || 0,
      },
      message: 'Transcription completed successfully.',
    };
  } catch (error: any) {
    return {
      ok: false,
      error: error.message,
    };
  }
}

