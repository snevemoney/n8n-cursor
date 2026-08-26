import React from 'react';
import {findName} from '../data/compute';
import type {DailyReport, NameBlock} from '../data/schema';
import type {PlannedScene} from '../engine/selectScenes';
import {ActionMatrix} from './ActionMatrix';
import {CapitalPlanScreen} from './CapitalPlanScreen';
import {CatalystCalendar} from './CatalystCalendar';
import {CatalystSteps} from './CatalystSteps';
import {CausalNetwork} from './CausalNetwork';
import {CommandCenter} from './CommandCenter';
import {ComparisonBars} from './ComparisonBars';
import {Concentration} from './Concentration';
import {ConsensusScreen} from './ConsensusScreen';
import {DeltaOpen} from './DeltaOpen';
import {LookThrough} from './LookThrough';
import {OpportunityRadar} from './OpportunityRadar';
import {PredictionBoard} from './PredictionBoard';
import {RelativePerf} from './RelativePerf';
import {Interpretation} from './Interpretation';
import {KineticOpen} from './KineticOpen';
import {Leaderboard} from './Leaderboard';
import {MarketTape} from './MarketTape';
import {MetricBento} from './MetricBento';
import {NameAction, NameBoard} from './NameStatement';
import {NameCold} from './NameCold';
import {KnownUnknowns} from './KnownUnknowns';
import {OpportunityBoard} from './OpportunityBoard';
import {OptionsBand} from './OptionsBand';
import {PlateBackdrop} from './PlateBackdrop';
import {RiskTrio} from './RiskTrio';
import {ScenarioCards} from './ScenarioCards';
import {ScoutBoard} from './ScoutBoard';
import {ScoutCard} from './ScoutCard';
import {SplitNarrative} from './SplitNarrative';
import {StreakHeatmap} from './StreakHeatmap';
import {WorldTape} from './WorldTape';

const requireName = (report: DailyReport, scene: PlannedScene): NameBlock => {
  const name = findName(report, scene.ticker ?? '');
  if (!name) {
    throw new Error(`Scene ${scene.id} missing name block for ${scene.ticker ?? '?'}`);
  }
  return name;
};

const sceneBody = (scene: PlannedScene, report: DailyReport): React.ReactNode => {
  switch (scene.kind) {
    case 'open':
      return <KineticOpen report={report} />;
    case 'delta':
      return <DeltaOpen report={report} chapter={scene.chapter} />;
    case 'tape':
      return <MarketTape report={report} chapter={scene.chapter} />;
    case 'worldTape':
      return <WorldTape report={report} chapter={scene.chapter} />;
    case 'calendar':
      return <CatalystCalendar report={report} chapter={scene.chapter} />;
    case 'holdings':
      return <Leaderboard report={report} chapter={scene.chapter} />;
    case 'concentration':
      return <Concentration report={report} chapter={scene.chapter} />;
    case 'lookThrough':
      return <LookThrough report={report} chapter={scene.chapter} />;
    case 'relativePerf':
      return <RelativePerf report={report} chapter={scene.chapter} />;
    case 'predictionBoard':
      return <PredictionBoard report={report} chapter={scene.chapter} />;
    case 'nameCold':
      return <NameCold name={requireName(report, scene)} chapter={scene.chapter} />;
    case 'streak':
      return <StreakHeatmap name={requireName(report, scene)} chapter={scene.chapter} />;
    case 'fundamentals': {
      const name = requireName(report, scene);
      return (
        <MetricBento
          name={name}
          chapter={scene.chapter}
          metrics={name.fundamentals ?? []}
          title={`${name.ticker} fundamentals`}
        />
      );
    }
    case 'comparison': {
      const name = requireName(report, scene);
      const block = scene.comparisonKey === 'returns' ? name.returns : name.vsSpx;
      if (!block) return null;
      return <ComparisonBars name={name} chapter={scene.chapter} block={block} />;
    }
    case 'consensus':
      return <ConsensusScreen name={requireName(report, scene)} chapter={scene.chapter} />;
    case 'options':
      return <OptionsBand name={requireName(report, scene)} chapter={scene.chapter} />;
    case 'narrative':
      return <SplitNarrative name={requireName(report, scene)} chapter={scene.chapter} />;
    case 'interpretation':
      return <Interpretation name={requireName(report, scene)} chapter={scene.chapter} />;
    case 'actionMatrix':
      return <ActionMatrix name={requireName(report, scene)} chapter={scene.chapter} />;
    case 'network':
      return <CausalNetwork name={requireName(report, scene)} chapter={scene.chapter} />;
    case 'catalyst':
      return <CatalystSteps name={requireName(report, scene)} chapter={scene.chapter} />;
    case 'nameAction':
      return <NameAction name={requireName(report, scene)} chapter={scene.chapter} />;
    case 'nameBoard':
      return <NameBoard name={requireName(report, scene)} chapter={scene.chapter} />;
    case 'scenarios':
      return <ScenarioCards report={report} chapter={scene.chapter} />;
    case 'nextNvda':
      return <ScoutBoard report={report} chapter={scene.chapter} />;
    case 'opportunityScout':
      return <OpportunityBoard report={report} chapter={scene.chapter} limit={scene.opportunityLimit} />;
    case 'opportunityRadar':
      return <OpportunityRadar report={report} chapter={scene.chapter} />;
    case 'scoutCard':
      return <ScoutCard report={report} chapter={scene.chapter} />;
    case 'unknowns':
      return <KnownUnknowns report={report} chapter={scene.chapter} limit={scene.unknownLimit} />;
    case 'risks':
      return <RiskTrio report={report} chapter={scene.chapter} />;
    case 'capitalPlan':
      return <CapitalPlanScreen report={report} chapter={scene.chapter} />;
    case 'close':
      return <CommandCenter report={report} />;
    default: {
      const _n: never = scene.kind;
      return _n;
    }
  }
};

export const renderScene = (scene: PlannedScene, report: DailyReport): React.ReactNode => (
  <>
    <PlateBackdrop kind={scene.kind} />
    {sceneBody(scene, report)}
  </>
);
