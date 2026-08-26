import {diffEpisodes} from '../data/delta';
import {findName} from '../data/compute';
import type {DailyReport, NameBlock, UnknownItem} from '../data/schema';
import {pickUnknowns} from '../data/unknowns';
import {calendarItems, featuredScout, visibleOpportunities, worldTapeLanes} from '../data/view';
import type {CutKind, PlannedScene, SceneKind, ScenePlan} from '../engine/selectScenes';
import {FPS} from '../engine/timing';
import {clampLines, maxWordsForFrames} from './clampSpeech';
import {
  sentence,
  speakHandle,
  speakPctMove,
  speakPointDecimal,
  speakReady,
  speakTicker,
  words0to99,
} from './speakFormat';
import type {VoiceCue, VoiceScript} from './types';
import {WORDS_PER_SEC} from './voiceConfig';

type VoiceCtx = {cut: CutKind};

const morning = (ctx: VoiceCtx): boolean => ctx.cut === 'morning60';

const ifHead = (iff: string): string => iff.split(/[+/,]/)[0]?.trim() ?? iff;

const speakStreetBillions = (value: string): string | null => {
  if (!/B/i.test(value)) return null;
  const m = value.match(/([0-9]+(?:\.[0-9]+)?)/);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n) || n < 1 || n > 99) return null;
  return `Street wants about ${words0to99(Math.round(n))} billion this quarter`;
};

/** Restate an unknown as an unknown. Do not fill a number. */
export function speakUnknown(item: UnknownItem): string {
  const q = item.question.toLowerCase();
  if (item.area === 'CA' && /tsx/.test(q)) {
    return "We do not have a TSX number — so we won't fake one.";
  }
  if (item.area === 'book' && /weight/.test(q)) {
    return 'No sourced account weights tonight.';
  }
  if (item.area === 'opportunity' && /next-nvda|scout/.test(q)) {
    return 'No Next-NVDA named tonight. We will not invent one.';
  }
  if (item.area === 'name' && /score/.test(q)) {
    const who = item.ticker ? `${speakTicker(item.ticker)} ` : '';
    return `No composite ${who}score. We will not fake one.`;
  }
  if (item.area === 'GLOBAL' && /europe|asia|indice/.test(q)) {
    return 'No Europe or Asia prints.';
  }
  return `We do not know — ${item.question.replace(/\?$/, '')}. We will not fake an answer.`;
}

const linesForDelta = (report: DailyReport, previous: DailyReport | null, ctx: VoiceCtx): string[] => {
  const delta = diffEpisodes(previous, report);
  if (!delta.hasPrior) {
    const lines = [
      'First session on this tape.',
      'No overnight delta — we will not invent a prior print.',
    ];
    if (!morning(ctx)) lines.push(speakReady(delta.currCatalyst));
    return lines;
  }
  const lines: string[] = [sentence(`Here's what changed versus ${delta.priorDate}`)];
  for (const flip of delta.ratingFlips) {
    lines.push(sentence(`${speakTicker(flip.ticker)} was ${flip.from}. Now it's ${flip.to}`));
  }
  if (delta.addedTickers.length) {
    lines.push(sentence(`New in the book: ${delta.addedTickers.map(speakTicker).join(', ')}`));
  }
  if (delta.removedTickers.length) {
    lines.push(sentence(`Off the board: ${delta.removedTickers.map(speakTicker).join(', ')}`));
  }
  if (delta.catalystChanged) lines.push(speakReady(delta.currCatalyst));
  for (const move of delta.tapeMoves.slice(0, morning(ctx) ? 1 : 3)) {
    lines.push(sentence(`${move.field} went from ${move.prev} to ${move.curr}`));
  }
  const newScouts = [...new Set([...delta.addedScouts, ...delta.addedOpportunities])];
  if (newScouts.length) {
    lines.push(sentence(`New scout names: ${newScouts.join(', ')}`));
  }
  if (delta.thesisChanged) lines.push(speakReady(report.meta.thesis));
  if (lines.length === 1) {
    lines.push(sentence(`Prior tape exists. No rating, ticker, catalyst, or scout change versus ${delta.priorDate}`));
  }
  return lines;
};

const linesForTape = (report: DailyReport, ctx: VoiceCtx): string[] => {
  const m = report.market;
  const lines: string[] = [];
  if (m.spxClose !== undefined) {
    const day = m.spxDayPct !== undefined ? `, ${speakPctMove(m.spxDayPct)}` : '';
    lines.push(sentence(`S and P at ${speakHandle(m.spxClose)}${day}`));
  }
  if (!morning(ctx) && m.nasdaqDayPct !== undefined) {
    lines.push(sentence(`Nasdaq ${speakPctMove(m.nasdaqDayPct)}`));
  }
  if (!morning(ctx) && m.tenYearYield !== undefined) {
    lines.push(sentence(`Ten-year around ${speakPointDecimal(m.tenYearYield, 2)}`));
  }
  if (morning(ctx) && m.note) {
    lines.push(speakReady(m.note.replace(/^Falling oil and Treasury yields helped/, 'Oil and yields came in. That helped')));
  }
  return lines;
};

const linesForWorld = (report: DailyReport, ctx: VoiceCtx): string[] => {
  const lanes = worldTapeLanes(report);
  const oil = lanes
    .flatMap((lane) => lane.rows)
    .find((row) => /oil/i.test(row.label) && row.note);
  if (morning(ctx)) {
    const lines = linesForTape(report, ctx);
    if (oil?.note) {
      lines.push(sentence(`Oil is ${oil.note.toLowerCase()}`));
    }
    if (mMissingSpx(lines) && report.market.spxClose === undefined) {
      for (const lane of lanes) {
        if (lane.note) lines.push(speakReady(`${lane.key}: ${lane.note}`));
      }
    }
    return lines;
  }
  const lines: string[] = [];
  if (oil?.note) {
    lines.push(sentence(`World tape is thin. The only global line is oil, and it's ${oil.note.toLowerCase()}`));
  } else if (lanes.some((l) => l.key === 'GLOBAL')) {
    lines.push('World tape is thin tonight. We will not invent a global index print.');
  }
  const us = lanes.find((l) => l.key === 'US');
  if (us?.note) lines.push(speakReady(us.note));
  if (lines.length === 0) {
    for (const lane of lanes) {
      if (lane.note) lines.push(speakReady(`${lane.key}: ${lane.note}`));
    }
  }
  return lines;
};

const mMissingSpx = (lines: string[]): boolean => !lines.some((l) => /S and P/i.test(l));

const linesForCalendar = (report: DailyReport, ctx: VoiceCtx): string[] => {
  const items = calendarItems(report);
  if (items.length === 0) return [];
  const when = items[0]?.when;
  const labels = items.map((item) => item.label).join(' and ');
  const lines = ["Don't add before the print.", speakReady(`${when} is ${labels} — same morning`)];
  if (!morning(ctx)) {
    const why = items.find((item) => item.why)?.why;
    if (why) lines.push(speakReady(why));
  }
  return lines;
};

const linesForHoldings = (report: DailyReport): string[] => {
  const n = report.holdings.length;
  if (n === 0) return [];
  const nvda = report.holdings.find((h) => h.ticker === 'NVDA');
  const core = report.holdings.find((h) => /core/i.test(h.rating) || h.ticker === 'VOO');
  const income = report.holdings.find((h) => /income/i.test(h.rating) || /income/i.test(h.role ?? ''));
  const lines = [sentence(`${wordsCount(n)} lines in the book`)];
  if (nvda) {
    lines.push(sentence(`${speakTicker('NVDA')} is the critical watch — ${nvda.whatMatters.replace(/;.*$/, '').toLowerCase()}`));
  }
  if (core) {
    lines.push(sentence(`${core.ticker} is the simple core`));
  }
  const overlap = report.holdings.filter((h) => (h.overlapWith?.length ?? 0) > 0).length;
  if (overlap > 0) {
    const tail = income
      ? `The rest is mostly the same mega-cap stack, plus ${income.ticker} as income`
      : 'The rest is mostly the same mega-cap stack';
    lines.push(sentence(tail));
  }
  return lines;
};

const wordsCount = (n: number): string => {
  const named = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
  return named[n] ?? String(n);
};

const linesForNameCold = (name: NameBlock): string[] => {
  const who = speakTicker(name.ticker);
  const lines: string[] = [sentence(name.rating ? `${who}. ${name.rating}` : who)];
  if (name.price !== undefined) {
    const day = name.dayPct !== undefined ? `, ${speakPctMove(name.dayPct)} today` : '';
    lines.push(sentence(`${speakHandle(name.price)}${day}`));
  } else if (name.dayPct !== undefined) {
    lines.push(sentence(`Today ${speakPctMove(name.dayPct)}`));
  }
  if (name.holdNote) lines.push(speakReady(name.holdNote.replace(/^No buying/, "Don't buy")));
  return lines;
};

const linesForComparison = (name: NameBlock, scene: PlannedScene): string[] => {
  const block = scene.comparisonKey === 'returns' ? name.returns : name.vsSpx;
  if (!block) return [];
  const lines: string[] = [];
  if (block.headline) lines.push(speakReady(block.headline));
  if (block.panelBody) lines.push(speakReady(block.panelBody.replace(/^~/, 'About ')));
  else if (block.note && !block.headline) {
    const bits = block.note.split(/(?<=\.)\s+/);
    const pick = bits.find((s) => /paying you|not enough/i.test(s)) ?? bits[bits.length - 1] ?? block.note;
    if (pick && !/^Spread:/i.test(pick)) lines.push(speakReady(pick));
  }
  return lines;
};

const linesForCapital = (report: DailyReport, ctx: VoiceCtx): string[] => {
  const p = report.capitalPlan;
  if (morning(ctx)) {
    return [
      'Hold tonight. Sell nothing.',
      "Don't add before the print.",
      speakReady(`Fresh core money goes to ${p.bestAdd} after we see it`),
      speakReady(`Highest-upside watch: ${p.highestUpsideWatch}`),
    ];
  }
  const lines = [
    speakReady(p.existingPortfolio.replace(/^HOLD — /i, 'Hold. ').replace(/^HOLD /i, 'Hold. ')),
    "Don't add before the print.",
    speakReady(`Best current add is ${p.bestAdd}`),
    speakReady(`Highest-upside watch: ${p.highestUpsideWatch}`),
    speakReady(`Next trigger: ${p.nextTrigger}`),
  ];
  const add = p.ifThen.find((row) => /add/i.test(row.then));
  const caution = p.ifThen.find((row) => /not automatically|do not automatically/i.test(row.then));
  if (add) lines.push(speakReady(`${ifHead(add.if)} — ${add.then}`));
  if (caution) lines.push(speakReady(caution.then));
  return lines;
};

const linesForKind = (
  scene: PlannedScene,
  report: DailyReport,
  previous: DailyReport | null,
  ctx: VoiceCtx,
): string[] => {
  const name = scene.ticker ? findName(report, scene.ticker) : undefined;
  const kind: SceneKind = scene.kind;

  switch (kind) {
    case 'open': {
      const lines = ["Here's the only thing that matters tonight."];
      if (report.meta.thesisLead) {
        lines.push(speakReady(report.meta.thesisLead));
        if (report.meta.thesisAccent) lines.push(speakReady(report.meta.thesisAccent));
      } else {
        lines.push(speakReady(report.meta.thesis));
      }
      if (!morning(ctx)) lines.push(speakReady(report.meta.catalyst));
      return lines;
    }
    case 'delta':
      return linesForDelta(report, previous, ctx);
    case 'tape':
      return linesForTape(report, ctx);
    case 'worldTape':
      return linesForWorld(report, ctx);
    case 'calendar':
      return linesForCalendar(report, ctx);
    case 'holdings':
      return linesForHoldings(report);
    case 'lookThrough': {
      const overlap = report.holdings.filter((h) => (h.overlapWith?.length ?? 0) > 0).length;
      const lines = ['Look-through is the overlap, not the labels.'];
      if (overlap > 0) {
        lines.push(sentence(`${wordsCount(overlap)} lines already list the same names underneath`));
      }
      if (report.holdings.every((h) => h.weight === undefined)) {
        lines.push('Weights stay unknown. We will not draw a fake stack.');
      }
      return lines;
    }
    case 'relativePerf': {
      const withYtd = report.holdings.filter((h) => h.ytd !== undefined);
      if (withYtd.length === 0) return ['No sourced year-to-date prints to rank tonight.'];
      return [sentence(`${wordsCount(withYtd.length)} sourced year-to-date prints. The bars do the ranking.`)];
    }
    case 'predictionBoard':
      return [
        'The board only scores what a named formula can compute.',
        'The rest stay unknown. We will not fill a decorative number.',
      ];
    case 'concentration': {
      const p = report.portfolio;
      if (!p) return [];
      const lines = [speakReady(`Here's the concentration problem. ${p.concentrationThesis}`)];
      if (p.concentrationBody) {
        lines.push(speakReady(p.concentrationBody.split(/(?<=\.)\s+/)[0] ?? p.concentrationBody));
      }
      return lines;
    }
    case 'nameCold':
      return name ? linesForNameCold(name) : [];
    case 'streak': {
      if (!name?.streak?.length) return [];
      const red = name.streak.filter((d) => d < 0).length;
      const lines = [
        sentence(`${wordsCount(red)} red sessions in a ${wordsCount(name.streak.length).toLowerCase()}-session window`),
      ];
      if (name.streakNote) {
        lines.push(speakReady(name.streakNote.replace(/^Useful for the system:\s*/i, '')));
      } else {
        lines.push('That streak is the penalty. The fundamental tape is a different question.');
      }
      return lines;
    }
    case 'fundamentals': {
      if (!name || !name.fundamentals?.length) return [];
      return [
        sentence(`The ${speakTicker(name.ticker)} fundamental tape is still extraordinary`),
        'Huge revenue and earnings growth.',
        sentence(`We will not invent a composite ${speakTicker(name.ticker)} score tonight`),
      ];
    }
    case 'comparison':
      return name ? linesForComparison(name, scene) : [];
    case 'consensus': {
      if (!name?.consensus) return [];
      const lines: string[] = [];
      const rev = name.consensus.rows.find((row) => /this quarter revenue/i.test(row.label));
      const spokenRev = rev ? speakStreetBillions(rev.value) : null;
      if (spokenRev) lines.push(sentence(spokenRev));
      else if (name.consensus.rows[0]) {
        lines.push(speakReady(`${name.consensus.rows[0].label} ${name.consensus.rows[0].value}`));
      }
      if (name.consensus.note) {
        lines.push(speakReady(name.consensus.note.split(/(?<=\.)\s+/)[0] ?? name.consensus.note));
      }
      return lines;
    }
    case 'options': {
      if (!name?.options) return [];
      const o = name.options;
      return [
        sentence(`Options are pricing a ${speakPointDecimal(o.movePct, 1)} percent move`),
        sentence(
          `That's ${speakHandle(o.range[0])} to ${speakHandle(o.range[1])} from today's ${name.price !== undefined ? speakHandle(name.price) : speakTicker(name.ticker)}`,
        ),
      ];
    }
    case 'narrative': {
      if (!name?.narrative) return [];
      const n = name.narrative;
      return [speakReady(`The fear: ${n.leftHeadline.replace(/^[“"]|["”]$/g, '')}`), speakReady(`The counter: ${n.rightHeadline}`)];
    }
    case 'interpretation': {
      if (!name?.interpretation) return [];
      const confirmed = name.interpretation.chips.filter((c) => /confirmed/i.test(c.label));
      const lines = (confirmed.length ? confirmed : name.interpretation.chips.slice(0, 2)).map((c) =>
        speakReady(c.text),
      );
      if (name.interpretation.note) {
        lines.push(speakReady(name.interpretation.note.split(/(?<=\.)\s+/).pop() ?? name.interpretation.note));
      }
      return lines;
    }
    case 'actionMatrix': {
      if (!name?.actionMatrix) return [];
      const lines: string[] = [];
      if (name.actionMatrix.headline) {
        lines.push(speakReady(name.actionMatrix.headline.replace('Tonight: HOLD. Tomorrow: no buy before earnings.', "Tonight: hold. Tomorrow: don't buy before earnings.")));
      }
      const add = name.actionMatrix.rows.find((row) => /add/i.test(row.then));
      const caution = name.actionMatrix.rows.find((row) => /not automatically/i.test(row.then));
      if (add) lines.push(speakReady(`${ifHead(add.if)} — ${add.then}`));
      if (caution) lines.push(speakReady(caution.then));
      return lines;
    }
    case 'network': {
      if (!name?.network) return [];
      return [
        'This is a qualitative demand chain. Evidence labels only.',
        sentence(`We do not have a composite ${speakTicker(name.ticker)} score tonight — so we will not fake one`),
      ];
    }
    case 'catalyst': {
      if (!name?.catalyst) return [];
      const lines = [speakReady(name.catalyst.headline)];
      if (name.catalyst.note) {
        lines.push(speakReady(name.catalyst.note.split(/(?<=\.)\s+/)[0] ?? name.catalyst.note));
      }
      return lines;
    }
    case 'nameAction': {
      if (!name?.action) return [];
      const lines = [speakReady(name.action.headline)];
      if (name.action.body) lines.push(speakReady(name.action.body.split(/(?<=\.)\s+/).slice(0, 2).join(' ')));
      return lines;
    }
    case 'nameBoard': {
      if (!name) return [];
      const lines: string[] = [];
      if (name.copy?.headline) lines.push(speakReady(name.copy.headline));
      if (name.copy?.body) {
        lines.push(speakReady(name.copy.body.split(/(?<=\.)\s+/).slice(0, 2).join(' ')));
      }
      return lines;
    }
    case 'scenarios':
      return report.scenarios.map((s) => speakReady(`${s.title}: ${s.body}`));
    case 'nextNvda':
      if (report.nextNvda.length === 0) {
        return ['No Next-NVDA candidate named today. We will not invent one.'];
      }
      return report.nextNvda.map((c) => speakReady(`${c.ticker}: ${c.thesis}`));
    case 'opportunityRadar': {
      const named = report.nextNvda.length + (report.opportunities?.candidates.length ?? 0);
      if (named === 0) {
        return [
          'No name passed the Next-NVDA bar tonight.',
          'No close fails on the book. We will not invent a scout.',
        ];
      }
      return [
        sentence(`${wordsCount(named)} names on the scout tape. Zero passed`),
        'Closest fails stay on screen. We will not invent a winner.',
      ];
    }
    case 'opportunityScout': {
      const rows =
        scene.opportunityLimit === undefined
          ? visibleOpportunities(report)
          : visibleOpportunities(report).slice(0, scene.opportunityLimit);
      if (rows.length === 0) {
        return ['No new names today. The scout board stays empty — we will not invent a Next-NVDA.'];
      }
      return rows.map((c) => speakReady(`${c.ticker}: ${c.thesis}`));
    }
    case 'scoutCard': {
      const scout = featuredScout(report);
      if (!scout) return [];
      const lines = [speakReady(`${scout.ticker}: ${scout.thesis}`)];
      if (scout.whyNow) lines.push(speakReady(scout.whyNow));
      return lines;
    }
    case 'unknowns':
      return pickUnknowns(report, scene.unknownLimit).map(speakUnknown);
    case 'risks': {
      const risks = report.risks ?? [];
      if (risks.length === 0) return [];
      const lines = [sentence(`${wordsCount(risks.length)} risks`)];
      for (const r of risks) {
        if (/interest/i.test(r.title) && report.market.tenYearYield !== undefined) {
          lines.push(
            sentence(`Interest rates. The ten-year is still around ${speakPointDecimal(report.market.tenYearYield, 2)}`),
          );
        } else if (/ROI/i.test(r.title)) {
          lines.push('AI ROI. Will profits justify the infrastructure spend?');
        } else {
          lines.push(speakReady(r.title));
        }
      }
      return lines;
    }
    case 'capitalPlan':
      return linesForCapital(report, ctx);
    case 'close': {
      const lines = [speakReady(report.close.headline), speakReady(report.close.body.split(/(?<=\.)\s+/)[0] ?? report.close.body)];
      const pills = (report.close.pills ?? []).map((p) => p.label.toLowerCase());
      if (pills.length) {
        lines.push(sentence(pills.map((p) => p.replace(/_/g, ' ')).join('. ')));
      }
      return lines;
    }
    default: {
      const _n: never = kind;
      return _n;
    }
  }
};

/**
 * Timed cues from the episode + the same ScenePlan that drives picture.
 * Presenter voice, one idea per scene. Facts stay on-report.
 */
export function scriptFromReport(
  report: DailyReport,
  plan: ScenePlan,
  previous: DailyReport | null = null,
): VoiceScript {
  const ctx: VoiceCtx = {cut: plan.cut};
  const cues: VoiceCue[] = [];
  let startFrame = 0;
  for (const scene of plan.scenes) {
    const raw = linesForKind(scene, report, previous, ctx);
    const lines = clampLines(raw, maxWordsForFrames(scene.durationInFrames, FPS));
    if (lines.length > 0) {
      cues.push({
        sceneId: scene.id,
        startFrame,
        durationInFrames: scene.durationInFrames,
        lines,
      });
    }
    startFrame += scene.durationInFrames;
  }
  return {
    episodeId: report.meta.date,
    cut: plan.cut,
    fps: FPS,
    wordsPerSec: WORDS_PER_SEC,
    totalFrames: plan.totalFrames,
    cues,
  };
}

export function lastCueEndFrame(script: VoiceScript): number {
  const last = script.cues[script.cues.length - 1];
  if (!last) return 0;
  return last.startFrame + last.durationInFrames;
}
