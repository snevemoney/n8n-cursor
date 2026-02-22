/**
 * YouTube Transcript Ingestion System — Public API
 *
 * Usage:
 *   import { ingestVideo, ingestChannel, parseYouTubeURL } from '@/lib/youtube';
 */

export { parseYouTubeURL, extractVideoId, extractChannelId, isVideoUrl, isChannelUrl } from './normalize';
export { resolveTranscript } from './transcriptResolver';
export { ingestVideo } from './videoIngest';
export { ingestChannel } from './channelIngest';
export { generateLearningProposal } from './learningProposal';
export * from './types';
export * from './errors';
export * as youtubeDb from './db';
