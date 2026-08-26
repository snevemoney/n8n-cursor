import {z} from 'zod';

export const RatingToneSchema = z.enum(['long', 'watch', 'caution', 'short']);
export type RatingTone = z.infer<typeof RatingToneSchema>;

export const PolaritySchema = z.enum(['confirmed', 'concern', 'inference', 'neutral']);
export type Polarity = z.infer<typeof PolaritySchema>;

export const DailyMetaSchema = z.object({
  date: z.string(),
  dateLabel: z.string(),
  title: z.string(),
  thesis: z.string(),
  thesisLead: z.string().optional(),
  thesisAccent: z.string().optional(),
  catalyst: z.string(),
  kicker: z.string().optional(),
  universe: z.array(z.string()),
});
export type DailyMeta = z.infer<typeof DailyMetaSchema>;

export const MarketTapeSchema = z.object({
  spxClose: z.number().optional(),
  spxDayPct: z.number().optional(),
  spxYtdPct: z.number().optional(),
  nasdaqDayPct: z.number().optional(),
  tenYearYield: z.number().optional(),
  note: z.string().optional(),
  nextCalendar: z
    .object({
      label: z.string(),
      detail: z.string().optional(),
    })
    .optional(),
});
export type MarketTape = z.infer<typeof MarketTapeSchema>;

export const HoldingSchema = z.object({
  ticker: z.string(),
  rating: z.string(),
  tone: RatingToneSchema,
  role: z.string().optional(),
  whatMatters: z.string(),
  ytd: z.number().optional(),
  drawdown: z.number().optional(),
  /** Portfolio weight. Omit when not sourced — never estimate. */
  weight: z.number().optional(),
  overlapWith: z.array(z.string()).optional(),
});
export type Holding = z.infer<typeof HoldingSchema>;

export const ComparisonBarSchema = z.object({
  label: z.string(),
  pct: z.number(),
  valueLabel: z.string().optional(),
  tone: z.enum(['long', 'watch', 'caution', 'short', 'muted', 'gold', 'nvda', 'aapl']).optional(),
});
export type ComparisonBar = z.infer<typeof ComparisonBarSchema>;

export const PortfolioBlockSchema = z.object({
  concentrationThesis: z.string(),
  concentrationBody: z.string().optional(),
  factorStack: z.array(z.string()).optional(),
  factorLabel: z.string().optional(),
  overlapNote: z.string().optional(),
});
export type PortfolioBlock = z.infer<typeof PortfolioBlockSchema>;

export const MetricSchema = z.object({
  label: z.string(),
  value: z.string(),
  numeric: z.number().optional(),
  hint: z.string().optional(),
});
export type Metric = z.infer<typeof MetricSchema>;

export const ConsensusSchema = z.object({
  rows: z.array(z.object({label: z.string(), value: z.string()})),
  note: z.string().optional(),
  /** Sourced street / guide / whisper only. Missing whisper → label UNKNOWN, do not draw a zone. */
  range: z
    .object({
      metric: z.string(),
      unit: z.string().optional(),
      consensus: z.number().optional(),
      guide: z.number().optional(),
      whisper: z.number().optional(),
      low: z.number().optional(),
      high: z.number().optional(),
    })
    .optional(),
});
export type Consensus = z.infer<typeof ConsensusSchema>;
export type ConsensusRange = NonNullable<Consensus['range']>;

export const OptionsBandSchema = z.object({
  movePct: z.number(),
  range: z.tuple([z.number(), z.number()]),
  valueB: z.number().optional(),
  note: z.string().optional(),
});
export type OptionsBand = z.infer<typeof OptionsBandSchema>;

export const NarrativeSplitSchema = z.object({
  leftTitle: z.string(),
  leftHeadline: z.string(),
  leftBody: z.string(),
  rightTitle: z.string(),
  rightHeadline: z.string(),
  rightBody: z.string(),
});
export type NarrativeSplit = z.infer<typeof NarrativeSplitSchema>;

export const InterpChipSchema = z.object({
  label: z.string(),
  tone: RatingToneSchema,
  text: z.string(),
});
export type InterpChip = z.infer<typeof InterpChipSchema>;

export const ActionRowSchema = z.object({
  if: z.string(),
  then: z.string(),
  tone: RatingToneSchema,
});
export type ActionRow = z.infer<typeof ActionRowSchema>;

export const NetworkNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  polarity: PolaritySchema,
  x: z.number(),
  y: z.number(),
  /** Sourced weight/importance only. Omit → equal size, no fake weights. */
  importance: z.number().optional(),
  /** Sourced note already on the tape (capex, financing). Omit → no chip. */
  evidence: z.string().optional(),
});
export type NetworkNode = z.infer<typeof NetworkNodeSchema>;

export const NetworkEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  label: z.string().optional(),
});
export type NetworkEdge = z.infer<typeof NetworkEdgeSchema>;

export const CausalNetworkSchema = z.object({
  title: z.string().optional(),
  headline: z.string().optional(),
  nodes: z.array(NetworkNodeSchema),
  edges: z.array(NetworkEdgeSchema),
});
export type CausalNetwork = z.infer<typeof CausalNetworkSchema>;

/** Optional score: only when provided in JSON or computed by a named formula. */
export const ScoreFieldSchema = z.object({
  label: z.string(),
  value: z.number(),
  max: z.number(),
  formula: z.string(),
});
export type ScoreField = z.infer<typeof ScoreFieldSchema>;

export const ComparisonBlockSchema = z.object({
  headline: z.string().optional(),
  bars: z.array(ComparisonBarSchema),
  note: z.string().optional(),
  panelTitle: z.string().optional(),
  panelBody: z.string().optional(),
});
export type ComparisonBlock = z.infer<typeof ComparisonBlockSchema>;

export const NameBlockSchema = z.object({
  ticker: z.string(),
  chapterTitle: z.string().optional(),
  rating: z.string().optional(),
  tone: RatingToneSchema.optional(),
  price: z.number().optional(),
  dayPct: z.number().optional(),
  holdNote: z.string().optional(),
  streak: z.array(z.number()).optional(),
  streakHeadline: z.string().optional(),
  streakNote: z.string().optional(),
  fundamentals: z.array(MetricSchema).optional(),
  vsSpx: ComparisonBlockSchema.optional(),
  returns: ComparisonBlockSchema.optional(),
  consensus: ConsensusSchema.optional(),
  options: OptionsBandSchema.optional(),
  narrative: NarrativeSplitSchema.optional(),
  interpretation: z
    .object({
      chips: z.array(InterpChipSchema),
      note: z.string().optional(),
    })
    .optional(),
  actionMatrix: z
    .object({
      headline: z.string().optional(),
      rows: z.array(ActionRowSchema),
    })
    .optional(),
  network: CausalNetworkSchema.optional(),
  catalyst: z
    .object({
      headline: z.string(),
      steps: z.array(z.string()).optional(),
      note: z.string().optional(),
    })
    .optional(),
  action: z
    .object({
      headline: z.string(),
      body: z.string().optional(),
    })
    .optional(),
  metrics: z.array(MetricSchema).optional(),
  copy: z
    .object({
      headline: z.string().optional(),
      body: z.string().optional(),
    })
    .optional(),
  scores: z.array(ScoreFieldSchema).optional(),
  /** Daily/normalized path. Omit unless the episode has a real series — never interpolate from two YTD scalars. */
  priceSeries: z
    .array(
      z.object({
        label: z.string(),
        points: z.array(z.number()),
      }),
    )
    .optional(),
});
export type NameBlock = z.infer<typeof NameBlockSchema>;

export const ScenarioSchema = z.object({
  kind: z.enum(['bear', 'base', 'bull']),
  title: z.string(),
  body: z.string(),
  probability: z.number().optional(),
});
export type Scenario = z.infer<typeof ScenarioSchema>;

export const NextNvdaCandidateSchema = z.object({
  ticker: z.string(),
  thesis: z.string(),
  tone: RatingToneSchema.optional(),
});
export type NextNvdaCandidate = z.infer<typeof NextNvdaCandidateSchema>;

export const CapitalPlanSchema = z.object({
  existingPortfolio: z.string(),
  freshCapital: z.string(),
  bestAdd: z.string(),
  highestUpsideWatch: z.string(),
  biggestRisk: z.string(),
  nextTrigger: z.string(),
  ifThen: z.array(ActionRowSchema),
});
export type CapitalPlan = z.infer<typeof CapitalPlanSchema>;

export const RiskItemSchema = z.object({
  n: z.string(),
  title: z.string(),
  body: z.string(),
});
export type RiskItem = z.infer<typeof RiskItemSchema>;

export const CloseBlockSchema = z.object({
  kicker: z.string().optional(),
  headline: z.string(),
  body: z.string(),
  pills: z.array(z.object({tone: RatingToneSchema, label: z.string()})).optional(),
  followThrough: z.array(ActionRowSchema).optional(),
});
export type CloseBlock = z.infer<typeof CloseBlockSchema>;

export const MarketVenueSchema = z.enum(['US', 'CA', 'GLOBAL']);
export type MarketVenue = z.infer<typeof MarketVenueSchema>;

/** Sourced print only. Omit value / dayPct when the brief has no number. */
export const MarketPrintSchema = z.object({
  label: z.string(),
  value: z.string().optional(),
  dayPct: z.number().optional(),
  note: z.string().optional(),
});
export type MarketPrint = z.infer<typeof MarketPrintSchema>;

export const GlobalTapeSchema = z.object({
  indices: z.array(MarketPrintSchema).optional(),
  fx: z.array(MarketPrintSchema).optional(),
  commodities: z.array(MarketPrintSchema).optional(),
  rates: z.array(MarketPrintSchema).optional(),
  note: z.string().optional(),
});
export type GlobalTape = z.infer<typeof GlobalTapeSchema>;

export const UsTapeSchema = z.object({
  indices: z.array(MarketPrintSchema).optional(),
  sectors: z.array(MarketPrintSchema).optional(),
  breadth: z.string().optional(),
  yields: z.array(MarketPrintSchema).optional(),
  note: z.string().optional(),
});
export type UsTape = z.infer<typeof UsTapeSchema>;

export const CaTapeSchema = z.object({
  indices: z.array(MarketPrintSchema).optional(),
  cadUsd: z.string().optional(),
  sectors: z.array(MarketPrintSchema).optional(),
  note: z.string().optional(),
});
export type CaTape = z.infer<typeof CaTapeSchema>;

export const CalendarItemSchema = z.object({
  when: z.string(),
  where: MarketVenueSchema,
  label: z.string(),
  why: z.string(),
});
export type CalendarItem = z.infer<typeof CalendarItemSchema>;

export const MarketsBlockSchema = z.object({
  global: GlobalTapeSchema.optional(),
  us: UsTapeSchema.optional(),
  ca: CaTapeSchema.optional(),
  calendar: z.object({items: z.array(CalendarItemSchema)}).optional(),
});
export type MarketsBlock = z.infer<typeof MarketsBlockSchema>;

export const OpportunityCandidateSchema = z.object({
  ticker: z.string(),
  market: MarketVenueSchema,
  thesis: z.string(),
  tone: RatingToneSchema,
  whyNow: z.string(),
  whatKillsIt: z.string(),
  relativeToBook: z.string().optional(),
});
export type OpportunityCandidate = z.infer<typeof OpportunityCandidateSchema>;

export const OpportunitiesBlockSchema = z.object({
  candidates: z.array(OpportunityCandidateSchema),
  /** Default true: names already in holdings / universe are not “new opportunities”. */
  excludePortfolioDupes: z.boolean().optional(),
});
export type OpportunitiesBlock = z.infer<typeof OpportunitiesBlockSchema>;

export const UnknownAreaSchema = z.enum(['book', 'US', 'CA', 'GLOBAL', 'name', 'opportunity']);
export type UnknownArea = z.infer<typeof UnknownAreaSchema>;

export const UnknownStatusSchema = z.enum(['unknown', 'partial', 'blocked']);
export type UnknownStatus = z.infer<typeof UnknownStatusSchema>;

/** Optional and only when a source named the number. Never invent 0–100. */
export const SourcedConfidenceSchema = z.object({
  label: z.string(),
  value: z.number(),
  max: z.number(),
  source: z.string(),
});
export type SourcedConfidence = z.infer<typeof SourcedConfidenceSchema>;

export const UnknownItemSchema = z.object({
  id: z.string(),
  area: UnknownAreaSchema,
  ticker: z.string().optional(),
  question: z.string(),
  whyItMatters: z.string(),
  neededToKnow: z.string(),
  status: UnknownStatusSchema,
  confidence: SourcedConfidenceSchema.optional(),
});
export type UnknownItem = z.infer<typeof UnknownItemSchema>;

/** Board row. Values come from named formulas only — never LLM-fill. */
export const PredictionRowSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.number().optional(),
  unit: z.string().optional(),
  change: z.number().optional(),
  formulaId: z.string(),
  inputs: z.array(z.string()),
  status: z.enum(['ok', 'unknown']).optional(),
});
export type PredictionRow = z.infer<typeof PredictionRowSchema>;

export const DailyReportSchema = z.object({
  meta: DailyMetaSchema,
  market: MarketTapeSchema,
  markets: MarketsBlockSchema.optional(),
  holdings: z.array(HoldingSchema),
  portfolio: PortfolioBlockSchema.optional(),
  names: z.array(NameBlockSchema),
  /** Optional. Render still runs `buildPredictionBoard` — this is not a place to paste decorative scores. */
  predictions: z.array(PredictionRowSchema).optional(),
  ecosystem: z
    .object({
      headline: z.string().optional(),
      items: z.array(
        z.object({
          label: z.string(),
          polarity: PolaritySchema,
          text: z.string(),
        }),
      ),
    })
    .optional(),
  nextNvda: z.array(NextNvdaCandidateSchema),
  opportunities: OpportunitiesBlockSchema.optional(),
  /** Required every episode. Short is fine. Empty skips the scene. */
  unknowns: z.array(UnknownItemSchema),
  scenarios: z.array(ScenarioSchema),
  capitalPlan: CapitalPlanSchema,
  risks: z.array(RiskItemSchema).optional(),
  close: CloseBlockSchema,
  tickerTape: z.array(z.string()),
});
export type DailyReport = z.infer<typeof DailyReportSchema>;

export function parseDailyReport(input: unknown): DailyReport {
  return DailyReportSchema.parse(input);
}
