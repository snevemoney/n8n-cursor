import React from 'react';
import {Composition, type CalculateMetadataFunction} from 'remotion';
import {DailyShow, type DailyShowProps} from './compositions/DailyShow';
import {Morning60} from './compositions/Morning60';
import {SceneStill, type SceneStillProps} from './compositions/SceneStill';
import {DEFAULT_EPISODE_ID, loadEpisode, previousEpisode} from './data/loadEpisode';
import {selectScenes, type CutKind} from './engine/selectScenes';
import {FPS, HEIGHT, WIDTH} from './engine/timing';

const framesFor = (episodeId: string, cut: CutKind) =>
  selectScenes(loadEpisode(episodeId), {cut, previous: previousEpisode(episodeId)}).totalFrames;

const dailyMetadata: CalculateMetadataFunction<DailyShowProps> = ({props}) => {
  const id = props.episodeId ?? DEFAULT_EPISODE_ID;
  return {durationInFrames: framesFor(id, props.cut ?? 'full')};
};

const morningMetadata: CalculateMetadataFunction<DailyShowProps> = ({props}) => {
  const id = props.episodeId ?? DEFAULT_EPISODE_ID;
  return {durationInFrames: framesFor(id, 'morning60')};
};

const stillMetadata: CalculateMetadataFunction<SceneStillProps> = () => ({
  durationInFrames: 90,
});

export const RemotionRoot: React.FC = () => {
  const fallbackFull = framesFor(DEFAULT_EPISODE_ID, 'full');
  const fallbackMorning = framesFor(DEFAULT_EPISODE_ID, 'morning60');
  return (
    <>
      <Composition
        id="DailyShow"
        component={DailyShow}
        durationInFrames={fallbackFull}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{episodeId: DEFAULT_EPISODE_ID, cut: 'full'}}
        calculateMetadata={dailyMetadata}
      />
      <Composition
        id="Morning60"
        component={Morning60}
        durationInFrames={fallbackMorning}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{episodeId: DEFAULT_EPISODE_ID, cut: 'morning60'}}
        calculateMetadata={morningMetadata}
      />
      <Composition
        id="PortfolioBrief"
        component={DailyShow}
        durationInFrames={fallbackFull}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{episodeId: DEFAULT_EPISODE_ID, cut: 'full'}}
        calculateMetadata={dailyMetadata}
      />
      <Composition
        id="EngineQA"
        component={SceneStill}
        durationInFrames={90}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{episodeId: DEFAULT_EPISODE_ID, kind: 'delta', cut: 'full'}}
        calculateMetadata={stillMetadata}
      />
    </>
  );
};
