import React from 'react';
import {Audio, Sequence, getStaticFiles, staticFile} from 'remotion';
import type {CutKind} from '../engine/selectScenes';
import {buildVoiceScript} from './buildVoiceScript';
import {voiceFileName} from './voiceConfig';

/**
 * Plays one local cue per scene. Missing files are skipped — picture still plays.
 * `voicePack` overrides the public/voice/{episode}/{pack} folder (e.g. morning60-higgs).
 */
export const VoiceTrack: React.FC<{episodeId: string; cut: CutKind; voicePack?: string}> = ({
  episodeId,
  cut,
  voicePack,
}) => {
  const script = buildVoiceScript(episodeId, cut);
  const available = new Set(getStaticFiles().map((f) => f.name));
  const pack = voicePack ?? cut;

  return (
    <>
      {script.cues.map((cue) => {
        const name = voiceFileName(episodeId, pack, cue.sceneId);
        if (!available.has(name)) return null;
        return (
          <Sequence
            key={cue.sceneId}
            from={cue.startFrame}
            durationInFrames={cue.durationInFrames}
            name={`vo-${cue.sceneId}`}
            layout="none"
          >
            <Audio src={staticFile(name)} />
          </Sequence>
        );
      })}
    </>
  );
};
