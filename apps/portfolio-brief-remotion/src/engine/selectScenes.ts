import {deltaChangeCount, diffEpisodes} from '../data/delta';
import {holdingsWithYtd} from '../data/compute';
import type {DailyReport, NameBlock} from '../data/schema';
import {calendarItems, featuredScout, hasWorldTape, visibleOpportunities, worldTapeLanes} from '../data/view';
import {durationClamp, sec} from './timing';

export type ActId = 'MARKET' | 'PORTFOLIO' | 'DEEP DIVE' | 'OPPORTUNITY RADAR' | 'ACTION';

export type SceneKind =
  | 'open'
  | 'delta'
  | 'tape'
  | 'worldTape'
  | 'calendar'
  | 'holdings'
  | 'concentration'
  | 'lookThrough'
  | 'relativePerf'
  | 'predictionBoard'
  | 'nameCold'
  | 'streak'
  | 'fundamentals'
  | 'comparison'
  | 'consensus'
  | 'options'
  | 'narrative'
  | 'interpretation'
  | 'actionMatrix'
  | 'network'
  | 'catalyst'
  | 'nameAction'
  | 'nameBoard'
  | 'scenarios'
  | 'nextNvda'
  | 'opportunityScout'
  | 'opportunityRadar'
  | 'scoutCard'
  | 'unknowns'
  | 'risks'
  | 'capitalPlan'
  | 'close';

export type CutKind = 'full' | 'morning60';

export type ComparisonKey = 'vsSpx' | 'returns';

export type SelectScenesOptions = {
  cut?: CutKind;
  previous?: DailyReport | null;
};

export type PlannedScene = {
  id: string;
  kind: SceneKind;
  chapter: string;
  durationInFrames: number;
  ticker?: string;
  comparisonKey?: ComparisonKey;
  opportunityLimit?: number;
  unknownLimit?: number;
  act?: ActId;
};

export type ScenePlan = {
  scenes: PlannedScene[];
  totalFrames: number;
  cut: CutKind;
};

const push = (
  scenes: PlannedScene[],
  scene: Omit<PlannedScene, 'chapter'> & {chapter?: string},
  chapterFor: (label: string) => string,
  label: string,
  act?: ActId,
) => {
  scenes.push({
    ...scene,
    act: scene.act ?? act,
    chapter: scene.chapter ?? chapterFor(label),
  });
};

const sessionLabel = (n: number): string => {
  const named = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
  if (n === 21) return '21 sessions';
  return `${named[n] ?? String(n)} sessions`;
};

const isDeepName = (name: NameBlock): boolean => {
  const t = name.ticker.toUpperCase();
  return t === 'NVDA' || t === 'AAPL';
};

const nameScenes = (name: NameBlock, chapterFor: (label: string) => string, act: ActId): PlannedScene[] => {
  const scenes: PlannedScene[] = [];
  const t = name.ticker;
  const deep = isDeepName(name);

  if (deep && name.network && name.network.nodes.length > 0) {
    push(scenes, {id: `${t}-network`, kind: 'network', ticker: t, durationInFrames: sec(18)}, chapterFor, 'Chain', act);
  }

  if (name.streak && name.streak.length > 0) {
    push(
      scenes,
      {
        id: `${t}-streak`,
        kind: 'streak',
        ticker: t,
        durationInFrames: durationClamp(sec(8) + name.streak.length * sec(0.8), sec(10), sec(16)),
      },
      chapterFor,
      sessionLabel(name.streak.length),
      act,
    );
  }

  if (name.consensus && name.consensus.rows.length > 0) {
    push(scenes, {id: `${t}-consensus`, kind: 'consensus', ticker: t, durationInFrames: sec(16)}, chapterFor, 'Consensus', act);
  }

  if (name.price !== undefined || name.holdNote || name.rating) {
    if (name.price !== undefined || name.dayPct !== undefined || name.holdNote) {
      push(scenes, {id: `${t}-cold`, kind: 'nameCold', ticker: t, durationInFrames: sec(10)}, chapterFor, `${t} print`, act);
    }
  }

  if (name.fundamentals && name.fundamentals.length > 0) {
    push(
      scenes,
      {
        id: `${t}-fund`,
        kind: 'fundamentals',
        ticker: t,
        durationInFrames: durationClamp(sec(8) + name.fundamentals.length * sec(1.5), sec(12), sec(18)),
      },
      chapterFor,
      'Fundamentals',
      act,
    );
  }

  if (name.vsSpx && name.vsSpx.bars.length > 0) {
    push(
      scenes,
      {id: `${t}-vsspx`, kind: 'comparison', ticker: t, comparisonKey: 'vsSpx', durationInFrames: sec(10)},
      chapterFor,
      'Vs S&P',
      act,
    );
  }

  if (name.returns && name.returns.bars.length > 0) {
    push(
      scenes,
      {
        id: `${t}-returns`,
        kind: 'comparison',
        ticker: t,
        comparisonKey: 'returns',
        durationInFrames: durationClamp(sec(8) + name.returns.bars.length * sec(1.2), sec(10), sec(16)),
      },
      chapterFor,
      'Returns',
      act,
    );
  }

  if (name.options) {
    push(scenes, {id: `${t}-options`, kind: 'options', ticker: t, durationInFrames: sec(10)}, chapterFor, 'Options', act);
  }

  if (name.narrative) {
    push(scenes, {id: `${t}-narrative`, kind: 'narrative', ticker: t, durationInFrames: sec(16)}, chapterFor, 'Narrative', act);
  }

  if (name.interpretation && name.interpretation.chips.length > 0) {
    push(
      scenes,
      {
        id: `${t}-read`,
        kind: 'interpretation',
        ticker: t,
        durationInFrames: durationClamp(sec(10) + name.interpretation.chips.length * sec(2), sec(12), sec(18)),
      },
      chapterFor,
      'Read',
      act,
    );
  }

  if (name.actionMatrix && name.actionMatrix.rows.length > 0) {
    push(
      scenes,
      {
        id: `${t}-matrix`,
        kind: 'actionMatrix',
        ticker: t,
        durationInFrames: durationClamp(sec(8) + name.actionMatrix.rows.length * sec(3), sec(12), sec(20)),
      },
      chapterFor,
      `${t} if/then`,
      act,
    );
  }

  if (!deep && name.network && name.network.nodes.length > 0) {
    push(scenes, {id: `${t}-network`, kind: 'network', ticker: t, durationInFrames: sec(16)}, chapterFor, 'Chain', act);
  }

  if (name.catalyst) {
    push(scenes, {id: `${t}-catalyst`, kind: 'catalyst', ticker: t, durationInFrames: sec(14)}, chapterFor, 'Catalyst', act);
  }

  if (name.action) {
    push(scenes, {id: `${t}-act`, kind: 'nameAction', ticker: t, durationInFrames: sec(8)}, chapterFor, 'Hold', act);
  }

  const deepDive =
    Boolean(name.price) ||
    Boolean(name.fundamentals?.length) ||
    Boolean(name.streak?.length) ||
    Boolean(name.narrative) ||
    Boolean(name.action);
  if ((name.metrics?.length || name.copy) && !deepDive) {
    push(
      scenes,
      {
        id: `${t}-board`,
        kind: 'nameBoard',
        ticker: t,
        durationInFrames: durationClamp(sec(8) + (name.metrics?.length ?? 0) * sec(1.2), sec(10), sec(14)),
      },
      chapterFor,
      t,
      act,
    );
  }

  return scenes;
};

const chapterFactory = () => {
  let n = 1;
  return (label: string) => {
    const id = String(n).padStart(2, '0');
    n += 1;
    return `${id}  ${label}`;
  };
};

const pushDelta = (scenes: PlannedScene[], report: DailyReport, previous: DailyReport | null, chapterFor: (label: string) => string) => {
  const delta = diffEpisodes(previous, report);
  const durationInFrames = delta.hasPrior
    ? durationClamp(sec(10) + deltaChangeCount(delta) * sec(0.6), sec(10), sec(14))
    : sec(12);
  push(
    scenes,
    {id: 'delta', kind: 'delta', durationInFrames},
    chapterFor,
    delta.hasPrior ? 'What changed' : 'First book',
    'MARKET',
  );
};

const pushWorldAndCalendar = (
  scenes: PlannedScene[],
  report: DailyReport,
  chapterFor: (label: string) => string,
  opts: {calendarMax: number; tapeMax?: number},
  act: ActId = 'MARKET',
) => {
  if (hasWorldTape(report)) {
    const lanes = worldTapeLanes(report).length;
    push(
      scenes,
      {
        id: 'world-tape',
        kind: 'worldTape',
        durationInFrames: durationClamp(sec(10) + lanes * sec(2), sec(12), opts.tapeMax ?? sec(16)),
      },
      chapterFor,
      'World tape',
      act,
    );
  }
  const items = calendarItems(report);
  if (items.length > 0) {
    push(
      scenes,
      {
        id: 'calendar',
        kind: 'calendar',
        durationInFrames: durationClamp(sec(8) + items.length * sec(2), sec(10), opts.calendarMax),
      },
      chapterFor,
      'Calendar',
      act,
    );
  }
};

const pushRadar = (
  scenes: PlannedScene[],
  report: DailyReport,
  chapterFor: (label: string) => string,
  limit?: number,
) => {
  push(
    scenes,
    {id: 'opportunity-radar', kind: 'opportunityRadar', opportunityLimit: limit, durationInFrames: sec(14)},
    chapterFor,
    'Funnel',
    'OPPORTUNITY RADAR',
  );
  if (report.nextNvda.length > 0) {
    push(
      scenes,
      {
        id: 'next-nvda',
        kind: 'nextNvda',
        durationInFrames: durationClamp(sec(8) + report.nextNvda.length * sec(3), sec(10), sec(18)),
      },
      chapterFor,
      'Next NVDA',
      'OPPORTUNITY RADAR',
    );
  }
  const rows = visibleOpportunities(report);
  const shown = limit === undefined ? rows : rows.slice(0, limit);
  if (shown.length > 0) {
    push(
      scenes,
      {
        id: 'opportunity-scout',
        kind: 'opportunityScout',
        opportunityLimit: limit,
        durationInFrames: durationClamp(sec(8) + shown.length * sec(3), sec(10), sec(16)),
      },
      chapterFor,
      'Scout',
      'OPPORTUNITY RADAR',
    );
  }
  if (featuredScout(report)) {
    push(scenes, {id: 'scout-card', kind: 'scoutCard', durationInFrames: sec(10)}, chapterFor, 'Scout', 'OPPORTUNITY RADAR');
  }
};

const pushUnknowns = (
  scenes: PlannedScene[],
  report: DailyReport,
  chapterFor: (label: string) => string,
  limit?: number,
) => {
  if (report.unknowns.length === 0) return;
  const shown = limit === undefined ? report.unknowns : report.unknowns.slice(0, limit);
  push(
    scenes,
    {
      id: 'unknowns',
      kind: 'unknowns',
      unknownLimit: limit,
      durationInFrames: durationClamp(sec(8) + shown.length * sec(2), sec(8), limit === undefined ? sec(16) : sec(8)),
    },
    chapterFor,
    'Unknowns',
    'ACTION',
  );
};

const selectFull = (report: DailyReport, previous: DailyReport | null): PlannedScene[] => {
  const scenes: PlannedScene[] = [];
  const chapterFor = chapterFactory();

  scenes.push({
    id: 'open',
    kind: 'open',
    chapter: 'OPEN',
    durationInFrames: sec(14),
    act: 'MARKET',
  });

  pushDelta(scenes, report, previous, chapterFor);

  const tapeHas =
    report.market.spxClose !== undefined ||
    report.market.note !== undefined ||
    report.market.nextCalendar !== undefined;
  if (tapeHas) {
    push(scenes, {id: 'tape', kind: 'tape', durationInFrames: sec(12)}, chapterFor, 'Tape', 'MARKET');
  }

  pushWorldAndCalendar(scenes, report, chapterFor, {calendarMax: sec(16)});

  if (report.holdings.length > 0) {
    push(
      scenes,
      {
        id: 'holdings',
        kind: 'holdings',
        durationInFrames: durationClamp(sec(8) + report.holdings.length * sec(1.5), sec(12), sec(20)),
      },
      chapterFor,
      'Holdings',
      'PORTFOLIO',
    );
  }

  if (report.portfolio?.concentrationThesis) {
    push(scenes, {id: 'concentration', kind: 'concentration', durationInFrames: sec(14)}, chapterFor, 'Concentration', 'PORTFOLIO');
  }

  if (report.holdings.length > 0) {
    push(scenes, {id: 'look-through', kind: 'lookThrough', durationInFrames: sec(14)}, chapterFor, 'Look-through', 'PORTFOLIO');
  }

  if (holdingsWithYtd(report.holdings).length > 0) {
    push(scenes, {id: 'relative', kind: 'relativePerf', durationInFrames: sec(12)}, chapterFor, 'Relative', 'PORTFOLIO');
  }

  push(scenes, {id: 'prediction-board', kind: 'predictionBoard', durationInFrames: sec(14)}, chapterFor, 'Board', 'PORTFOLIO');

  for (const name of report.names.filter((n) => !isDeepName(n))) {
    scenes.push(...nameScenes(name, chapterFor, 'PORTFOLIO'));
  }

  for (const name of report.names.filter(isDeepName)) {
    scenes.push(...nameScenes(name, chapterFor, 'DEEP DIVE'));
  }

  if (report.scenarios.length > 0) {
    push(
      scenes,
      {
        id: 'scenarios',
        kind: 'scenarios',
        durationInFrames: durationClamp(sec(10) + report.scenarios.length * sec(3), sec(12), sec(18)),
      },
      chapterFor,
      'Scenarios',
      'DEEP DIVE',
    );
  }

  pushRadar(scenes, report, chapterFor);
  pushUnknowns(scenes, report, chapterFor);

  if (report.risks && report.risks.length > 0) {
    push(scenes, {id: 'risks', kind: 'risks', durationInFrames: sec(16)}, chapterFor, 'Risks', 'ACTION');
  }

  push(
    scenes,
    {
      id: 'capital',
      kind: 'capitalPlan',
      durationInFrames: durationClamp(sec(18) + report.capitalPlan.ifThen.length * sec(2), sec(20), sec(28)),
    },
    chapterFor,
    'Capital plan',
    'ACTION',
  );

  scenes.push({
    id: 'close',
    kind: 'close',
    chapter: 'CLOSE',
    durationInFrames: report.close.followThrough && report.close.followThrough.length > 0 ? sec(16) : sec(12),
    act: 'ACTION',
  });

  return scenes;
};

const selectMorning60 = (report: DailyReport, previous: DailyReport | null): PlannedScene[] => {
  const scenes: PlannedScene[] = [];
  const chapterFor = chapterFactory();

  pushDelta(scenes, report, previous, chapterFor);

  scenes.push({
    id: 'open',
    kind: 'open',
    chapter: 'OPEN',
    durationInFrames: sec(8),
    act: 'MARKET',
  });

  pushWorldAndCalendar(scenes, report, chapterFor, {calendarMax: sec(10), tapeMax: sec(12)});
  push(
    scenes,
    {id: 'opportunity-radar', kind: 'opportunityRadar', opportunityLimit: 2, durationInFrames: sec(8)},
    chapterFor,
    'Funnel',
    'OPPORTUNITY RADAR',
  );
  pushUnknowns(scenes, report, chapterFor, 2);

  push(
    scenes,
    {
      id: 'capital',
      kind: 'capitalPlan',
      durationInFrames: durationClamp(sec(12) + Math.min(2, report.capitalPlan.ifThen.length) * sec(2), sec(14), sec(16)),
    },
    chapterFor,
    'Capital plan',
    'ACTION',
  );

  return scenes;
};

export function selectScenes(report: DailyReport, options: SelectScenesOptions = {}): ScenePlan {
  const cut = options.cut ?? 'full';
  const previous = options.previous ?? null;
  const scenes = cut === 'morning60' ? selectMorning60(report, previous) : selectFull(report, previous);
  const totalFrames = scenes.reduce((sum, s) => sum + s.durationInFrames, 0);
  return {scenes, totalFrames, cut};
}

export function chromeLabel(scene: PlannedScene): string {
  if (!scene.act) return scene.chapter;
  const label = scene.chapter.includes('  ') ? scene.chapter.split('  ').slice(1).join('  ') : scene.chapter;
  return `${scene.act} · ${label}`;
}

export function chapterAt(frame: number, scenes: PlannedScene[]): string {
  const scene = sceneAt(frame, scenes);
  if (!scene) return 'CLOSE';
  return chromeLabel(scene);
}

export function sceneAt(frame: number, scenes: PlannedScene[]): PlannedScene | undefined {
  let acc = 0;
  for (const s of scenes) {
    acc += s.durationInFrames;
    if (frame < acc) return s;
  }
  return scenes[scenes.length - 1];
}

export function findScene(plan: ScenePlan, kind: SceneKind, ticker?: string): PlannedScene | undefined {
  return plan.scenes.find((s) => s.kind === kind && (ticker === undefined || s.ticker === ticker));
}

export function actsInOrder(plan: ScenePlan): ActId[] {
  const seen: ActId[] = [];
  for (const s of plan.scenes) {
    if (s.act && seen[seen.length - 1] !== s.act && !seen.includes(s.act)) {
      seen.push(s.act);
    }
  }
  return seen;
}
