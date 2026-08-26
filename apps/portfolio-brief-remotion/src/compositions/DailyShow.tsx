import React from 'react';
import {AbsoluteFill, Series, useCurrentFrame} from 'remotion';
import {Chrome} from '../chrome/Chrome';
import {Grid} from '../chrome/Grid';
import {DEFAULT_EPISODE_ID, loadEpisode, previousEpisode} from '../data/loadEpisode';
import {color} from '../engine/theme';
import {chapterAt, selectScenes, type CutKind} from '../engine/selectScenes';
import {SceneFade} from '../primitives/SceneFade';
import {renderScene} from '../primitives/renderScene';
import {VoiceTrack} from '../voice/VoiceTrack';

export type DailyShowProps = {
  episodeId: string;
  cut?: CutKind;
  voicePack?: string;
};

export const DailyShow: React.FC<DailyShowProps> = ({
  episodeId = DEFAULT_EPISODE_ID,
  cut = 'full',
  voicePack,
}) => {
  const report = loadEpisode(episodeId);
  const plan = selectScenes(report, {cut, previous: previousEpisode(episodeId)});
  const frame = useCurrentFrame();
  const chapter = chapterAt(frame, plan.scenes);

  return (
    <AbsoluteFill style={{backgroundColor: color.bg, color: color.text}}>
      <Grid />
      <Series>
        {plan.scenes.map((scene) => (
          <Series.Sequence key={scene.id} durationInFrames={scene.durationInFrames}>
            <SceneFade>{renderScene(scene, report)}</SceneFade>
          </Series.Sequence>
        ))}
      </Series>
      <VoiceTrack episodeId={episodeId} cut={cut} voicePack={voicePack} />
      <Chrome report={report} chapter={chapter} />
    </AbsoluteFill>
  );
};
