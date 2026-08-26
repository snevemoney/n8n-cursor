import {vsSpxSpread} from '../compute';
import {parseDailyReport, type DailyReport} from '../schema';

const nvdaYtd = 13.8;
const nvdaSpxYtd = 12.0;
const aaplYtd = 13.9;
const aaplSpxYtd = 12.0;
const nvdaClose = 212.1;
const nvdaDayPct = 1.74;
const nvdaBeta = 2.21;
const nvdaOptionsMove = 5.4;
const nvdaOptionsRange = [201, 224] as const;
const nvdaOptionsValueB = 280;
const spxClose = 7677.28;
const spxDayPct = 0.32;
const spxYtdPct = 12.2;
const nasdaqDayPct = 0.66;
const tenYear = 4.64;

const raw = {
  meta: {
    date: '2026-08-25',
    dateLabel: 'AUG 25, 2026',
    title: 'Daily Wealth Intelligence',
    thesis:
      'The book is not fundamentally broken. It is more concentrated in the same U.S. mega-cap growth factor than it looks.',
    thesisLead: 'The portfolio isn’t broken.',
    thesisAccent: 'It’s more concentrated than it looks.',
    catalyst: "Tomorrow's NVDA earnings are the biggest immediate risk and catalyst.",
    universe: ['AAPL', 'NVDA', 'VOO', 'VTI', 'VUG', 'MGK', 'GDV'],
  },
  market: {
    spxClose,
    spxDayPct,
    spxYtdPct,
    nasdaqDayPct,
    tenYearYield: tenYear,
    note: 'Falling oil and Treasury yields helped growth recover.',
    nextCalendar: {
      label: 'Nvidia earnings + PCE inflation',
      detail: 'Earnings event risk and inflation data on the same morning.',
    },
  },
  markets: {
    global: {
      commodities: [{label: 'Oil', note: 'Falling'}],
    },
    us: {
      indices: [
        {label: 'S&P 500', value: spxClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}), dayPct: spxDayPct},
        {label: 'Nasdaq', dayPct: nasdaqDayPct},
      ],
      yields: [{label: 'U.S. 10-year', value: `${tenYear}%`}],
      note: 'Falling oil and Treasury yields helped growth recover.',
    },
    calendar: {
      items: [
        {
          when: 'Wednesday',
          where: 'US' as const,
          label: 'Nvidia earnings',
          why: "Tomorrow's NVDA earnings are the biggest immediate risk and catalyst.",
        },
        {
          when: 'Wednesday',
          where: 'US' as const,
          label: 'PCE inflation',
          why: 'Earnings event risk and inflation data on the same morning.',
        },
      ],
    },
  },
  opportunities: {
    candidates: [],
    excludePortfolioDupes: true,
  },
  holdings: [
    {
      ticker: 'NVDA',
      rating: 'HOLD — critical watch',
      tone: 'watch' as const,
      role: 'Highest event risk',
      whatMatters: 'Earnings tomorrow; highest event risk',
      ytd: nvdaYtd,
    },
    {
      ticker: 'AAPL',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Recent purchase',
      whatMatters: 'New AI-Mac catalyst; beating S&P YTD',
      ytd: aaplYtd,
    },
    {
      ticker: 'VOO',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      role: 'Best simple core',
      whatMatters: 'Best simple core holding',
      ytd: 9.0,
      drawdown: -1.9,
    },
    {
      ticker: 'VTI',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Broad US',
      whatMatters: 'Excellent, but heavily overlaps VOO',
      ytd: 9.6,
      overlapWith: ['VOO'],
    },
    {
      ticker: 'VUG',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Growth sleeve',
      whatMatters: 'Growth sleeve, currently lagging S&P',
      ytd: 7.2,
      drawdown: -3.6,
      overlapWith: ['NVDA', 'AAPL', 'VOO', 'MGK'],
    },
    {
      ticker: 'MGK',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Mega-cap growth',
      whatMatters: 'Even more mega-cap overlap',
      ytd: 3.85,
      drawdown: -3.79,
      overlapWith: ['NVDA', 'AAPL', 'VUG', 'VOO'],
    },
    {
      ticker: 'GDV',
      rating: 'HOLD — income / diversifier',
      tone: 'long' as const,
      role: 'Income sleeve',
      whatMatters: 'Different job; ~6% distribution',
      ytd: 11.11,
    },
  ],
  portfolio: {
    concentrationThesis: 'VOO + VTI + VUG + MGK + AAPL + NVDA keep buying the same companies.',
    concentrationBody:
      'When mega-cap growth gets hit, several Wealthsimple lines turn red at once. That is why last week’s loss felt larger than the book looked.',
    factorStack: ['NVDA', 'AAPL', 'MGK', 'VUG', 'VOO', 'VTI'],
    factorLabel: 'U.S. mega-cap / growth',
    overlapNote: 'same ecosystem',
  },
  names: [
    {
      ticker: 'NVDA',
      chapterTitle: 'NVDA · tomorrow determines the next move',
      rating: 'CRITICAL WATCH',
      tone: 'watch' as const,
      price: nvdaClose,
      dayPct: nvdaDayPct,
      holdNote: 'No buying before earnings.',
      streak: [-0.07, -2.34, -0.99, -0.33, -0.98, -2.91, 1.74],
      streakHeadline: 'No catastrophic collapse. An unacceptable cluster of red days.',
      streakNote:
        'Useful for the system: NVDA receives a momentum penalty even as the fundamental tape stays extraordinary.',
      fundamentals: [
        {label: 'Market cap', value: '$5.16T'},
        {label: 'TTM revenue', value: '$253.5B  +70.7%'},
        {label: 'TTM net income', value: '$159.6B  +107.9%'},
        {label: 'TTM EPS', value: '$6.53  +110.6%'},
        {label: 'P/E  /  Fwd P/E', value: '31.9×  /  20.8×'},
        {label: 'Beta', value: String(nvdaBeta)},
      ],
      vsSpx: {
        headline: 'Beating the S&P slightly YTD is not enough for this much extra volatility.',
        bars: [
          {label: 'NVDA YTD', pct: nvdaYtd, tone: 'nvda' as const},
          {label: 'S&P YTD', pct: nvdaSpxYtd, tone: 'muted' as const},
        ],
        note: `Spread: ${vsSpxSpread(nvdaYtd, nvdaSpxYtd) >= 0 ? '+' : ''}${vsSpxSpread(nvdaYtd, nvdaSpxYtd).toFixed(1)} points (NVDA YTD − S&P YTD). Beta: ${nvdaBeta}. The market is paying you almost nothing extra for a 2.2-beta name.`,
      },
      consensus: {
        rows: [
          {label: 'This quarter revenue', value: '$92.2–92.3B'},
          {label: 'This quarter EPS', value: '~$2.09'},
          {label: 'Next-quarter revenue', value: '~$104.2B'},
          {label: 'Next-quarter EPS', value: '~$2.37'},
        ],
        note: 'Expected gross margin around 75%. Guidance quality will matter more than the print.',
        range: {metric: 'This quarter revenue', unit: 'B', low: 92.2, high: 92.3},
      },
      options: {
        movePct: nvdaOptionsMove,
        range: nvdaOptionsRange,
        valueB: nvdaOptionsValueB,
        note: `Roughly $${nvdaOptionsValueB}B of market value — a band around $${nvdaOptionsRange[0]}–$${nvdaOptionsRange[1]} from today’s ~$${nvdaClose.toFixed(0)}.`,
      },
      narrative: {
        leftTitle: 'THE FEAR',
        leftHeadline: '“AI spend may be a bubble. Nvidia may be financing its own demand.”',
        leftBody:
          'Financing arrangements targeting 500B+ of AI infrastructure. Guarantee of up to $105B tied to OpenAI’s Ohio data-center lease. Not something to dismiss.',
        rightTitle: 'THE COUNTER',
        rightHeadline: 'Big Tech AI / data-center spend is projected above $730B+ this year.',
        rightBody:
          'CoreWeave raised 2026 revenue, operating-profit and capex outlook. New compute relationships: Anthropic, Meta, Jane Street, Hudson River Trading. Vera Rubin already being validated.',
      },
      interpretation: {
        chips: [
          {label: 'CONFIRMED', tone: 'long' as const, text: 'AI compute demand remains extremely large.'},
          {
            label: 'CONFIRMED',
            tone: 'watch' as const,
            text: 'Nvidia is assuming more financial exposure to its own ecosystem.',
          },
          {
            label: 'INFERENCE',
            tone: 'caution' as const,
            text: 'We are leaving “everyone desperately needs GPUs” and entering “ROI on hundreds of billions of infrastructure.”',
          },
        ],
        note: 'If usage explodes but revenue per dollar of compute does not, customers eventually cannot keep raising capex. That is a deeper risk than tomorrow’s EPS.',
      },
      actionMatrix: {
        headline: 'Tonight: HOLD. Tomorrow: no buy before earnings.',
        rows: [
          {
            tone: 'long' as const,
            if: 'Excellent beat + >$108–110B guidance + ~75% margins + strong Rubin',
            then: 'Potentially ADD Thursday',
          },
          {
            tone: 'watch' as const,
            if: 'Normal beat + ~$104B guidance',
            then: 'HOLD',
          },
          {
            tone: 'caution' as const,
            if: 'Weak guidance / margin deterioration / financing concerns intensify',
            then: 'Do not automatically buy the dip',
          },
          {
            tone: 'short' as const,
            if: 'Demand deterioration + ~10%+ collapse',
            then: 'Consider reducing exposure',
          },
        ],
      },
      network: {
        title: 'NVDA · qualitative demand chain',
        headline: 'Polarity from the brief — no composite score. Nodes pulse from evidence labels only.',
        nodes: [
          {id: 'labs', label: 'OpenAI / Anthropic / xAI / Meta', polarity: 'confirmed' as const, x: 0.08, y: 0.22},
          {id: 'demand', label: 'GPU demand', polarity: 'confirmed' as const, x: 0.3, y: 0.22},
          {id: 'spend', label: 'Big Tech DC spend', polarity: 'confirmed' as const, x: 0.5, y: 0.22, evidence: '$730B+ DC spend'},
          {id: 'financing', label: 'Customer financing', polarity: 'concern' as const, x: 0.3, y: 0.78, evidence: 'Up to $105B OpenAI lease'},
          {id: 'nvda', label: 'NVDA', polarity: 'neutral' as const, x: 0.62, y: 0.5},
          {id: 'supply', label: 'TSM / HBM', polarity: 'inference' as const, x: 0.82, y: 0.18},
          {id: 'margins', label: 'Margins', polarity: 'confirmed' as const, x: 0.82, y: 0.5},
          {id: 'eps', label: 'EPS / guide', polarity: 'inference' as const, x: 0.82, y: 0.82},
          {id: 'valuation', label: 'Valuation', polarity: 'inference' as const, x: 0.94, y: 0.5},
        ],
        edges: [
          {from: 'labs', to: 'demand'},
          {from: 'demand', to: 'spend'},
          {from: 'spend', to: 'nvda'},
          {from: 'financing', to: 'nvda', label: 'exposure'},
          {from: 'nvda', to: 'supply'},
          {from: 'nvda', to: 'margins'},
          {from: 'margins', to: 'eps'},
          {from: 'eps', to: 'valuation'},
        ],
      },
    },
    {
      ticker: 'AAPL',
      chapterTitle: 'AAPL · the recent purchase',
      rating: 'HOLD',
      tone: 'long' as const,
      returns: {
        headline: 'Beating the S&P YTD and crushing it over one year. Short-term momentum has clearly cooled.',
        bars: [
          {label: 'YTD', pct: aaplYtd, tone: 'long' as const},
          {label: 'S&P YTD', pct: aaplSpxYtd, tone: 'muted' as const},
          {label: '1 year', pct: 36.5, tone: 'gold' as const},
          {label: '6 months', pct: 13.1, tone: 'aapl' as const},
          {label: '3 months', pct: 0.4, tone: 'muted' as const},
          {label: '1 month', pct: -6.9, tone: 'short' as const},
        ],
        panelTitle: 'VOLATILITY BLEMISH',
        panelBody: '~10% off the July 29 three-month high',
        note: `Spread vs S&P YTD: ${vsSpxSpread(aaplYtd, aaplSpxYtd) >= 0 ? '+' : ''}${vsSpxSpread(aaplYtd, aaplSpxYtd).toFixed(1)} points.`,
      },
      catalyst: {
        headline: 'Mac mini M6/M5 Pro and Mac Studio up to M5 Ultra, aimed at local AI agents.',
        steps: [
          'Better AI agents',
          'People want local / persistent agents',
          'Local inference needs RAM + compute',
          'Macs become AI workstations',
        ],
        note: 'Evidence-based inference, not yet a proven major revenue driver. Exactly the second-order signal we wanted before it shows up in the quarter.',
      },
      action: {
        headline: 'HOLD the position.',
        body: 'Do not add again Thursday. You just bought it. The next contribution should diversify, not double the same name.',
      },
    },
    {
      ticker: 'VOO',
      chapterTitle: 'VOO · the foundation is not the problem',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      metrics: [{label: 'YTD', value: '+9.0%'}],
      copy: {
        headline: 'Best simple core. New core money simplifies here.',
        body: 'Drawdowns only around −1.9% from recent peaks through Aug. 24. Do not sell. Stop splitting every future contribution with VTI.',
      },
    },
    {
      ticker: 'VTI',
      chapterTitle: 'VTI · excellent, overlapping',
      rating: 'HOLD',
      tone: 'long' as const,
      metrics: [{label: 'YTD', value: '+9.6%'}],
      copy: {
        headline: 'Excellent. Mega-caps still dominate, so the top looks like VOO.',
        body: 'Do not sell. The overlap with VOO is the issue — not the fund quality.',
      },
    },
    {
      ticker: 'VUG',
      chapterTitle: 'VUG · good ETF, disappointing 2026 relative strength',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      returns: {
        headline: 'Despite the growth label, VUG is losing to the index — while you already own the individual winners.',
        bars: [
          {label: 'VUG YTD', pct: 7.2, tone: 'watch' as const},
          {label: 'S&P / SPY YTD', pct: 12.5, tone: 'long' as const},
          {label: 'VUG 1-year', pct: 14.3, tone: 'muted' as const},
          {label: 'SPY 1-year', pct: 19.6, tone: 'gold' as const},
        ],
        note: 'Current drawdown ~−3.6%. Action: HOLD existing. No priority additions.',
      },
    },
    {
      ticker: 'MGK',
      chapterTitle: 'MGK · same issue, even more concentrated',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      metrics: [
        {label: 'YTD', value: '+3.85%'},
        {label: '1 year', value: '+11.7%'},
        {label: 'Drawdown', value: '−3.79%'},
      ],
      copy: {
        body: 'Significantly weaker than the broad market this year. You already own NVDA and AAPL directly. HOLD. Stop feeding it. Not a sell call — tax and account mechanics are not reconstructed from the latest screen.',
      },
    },
    {
      ticker: 'GDV',
      chapterTitle: 'GDV · a completely different job',
      rating: 'HOLD · INCOME / DIVERSIFIER',
      tone: 'long' as const,
      metrics: [
        {label: 'NAV', value: '$33.45'},
        {label: 'Market', value: '$29.76'},
        {label: 'Discount', value: '−11.03%'},
        {label: 'Dist. rate', value: '~5.9%'},
      ],
      copy: {
        body: 'Closed-end income/value. YTD NAV +11.11%. July 31 snapshot; discount still ~11% more recently. When AI/growth gets punched, this sleeve is supposed to look different. Not a growth engine. Not “Next NVDA.”',
      },
    },
  ],
  nextNvda: [],
  unknowns: [
    {
      id: 'ca-tape',
      area: 'CA' as const,
      question: 'What did TSX / TSX-V / CAD-USD actually print?',
      whyItMatters: 'The Thursday contribution is in C$. A US-only tape hides the local session.',
      neededToKnow: 'A sourced TSX close and a CAD-USD print from an index or FX page.',
      status: 'unknown' as const,
    },
    {
      id: 'weights',
      area: 'book' as const,
      question: 'What is each line’s weight in the book?',
      whyItMatters: 'Concentration stays qualitative until weights exist. We cannot size how much mega-cap.',
      neededToKnow: 'Sourced account weights. Do not estimate from prices.',
      status: 'unknown' as const,
    },
    {
      id: 'next-nvda',
      area: 'opportunity' as const,
      question: 'Is there a named Next-NVDA or non-book scout?',
      whyItMatters: 'The sleeve and opportunity board stay empty until a name is sourced.',
      neededToKnow: 'Evens or a filing names a ticker that is not already in the book.',
      status: 'unknown' as const,
    },
    {
      id: 'nvda-score',
      area: 'name' as const,
      ticker: 'NVDA',
      question: 'What is a composite NVDA score tonight?',
      whyItMatters: 'No 73/100 exists in the brief. A decorative score would be a lie.',
      neededToKnow: 'A named formula and inputs — or omit the score field.',
      status: 'unknown' as const,
    },
    {
      id: 'global-indices',
      area: 'GLOBAL' as const,
      question: 'Where did Europe / Asia / EM indices close?',
      whyItMatters: 'World tape has oil as qualitative only. No sourced global index print.',
      neededToKnow: 'Index-page prints for any session we claim to cover.',
      status: 'unknown' as const,
    },
  ],
  scenarios: [],
  capitalPlan: {
    existingPortfolio: 'HOLD — sell nothing tonight.',
    freshCapital: 'No buy before NVDA earnings. New core money simplifies into VOO.',
    bestAdd: 'VOO',
    highestUpsideWatch: 'none named',
    biggestRisk: 'Mega-cap growth overlap across NVDA, AAPL, MGK, VUG, VOO, VTI',
    nextTrigger: 'Wednesday — Nvidia earnings + PCE inflation',
    ifThen: [
      {
        tone: 'long' as const,
        if: 'Excellent beat + >$108–110B guidance + ~75% margins + strong Rubin',
        then: 'Potentially ADD Thursday',
      },
      {
        tone: 'watch' as const,
        if: 'Normal beat + ~$104B guidance',
        then: 'HOLD',
      },
      {
        tone: 'caution' as const,
        if: 'Weak guidance / margin deterioration / financing concerns intensify',
        then: 'Do not automatically buy the dip',
      },
      {
        tone: 'short' as const,
        if: 'Demand deterioration + ~10%+ collapse',
        then: 'Consider reducing exposure',
      },
    ],
  },
  risks: [
    {
      n: '01',
      title: 'Growth-factor concentration',
      body: 'NVDA + AAPL + MGK + VUG + VOO + VTI repeatedly own the same mega-cap ecosystem.',
    },
    {
      n: '02',
      title: 'Interest rates',
      body: `The 10-year is still around ${tenYear}% even after today’s yield dip. High long rates compress long-duration growth — the exact overweight.`,
    },
    {
      n: '03',
      title: 'AI ROI',
      body: 'The debate shifted from “Is AI real?” to “Will profits justify $700B+ of annual infrastructure?” That sits under NVDA and most of the indirect book.',
    },
  ],
  close: {
    kicker: 'DIAGNOSTIC',
    headline: 'Tomorrow’s NVDA report is not merely an NVDA event.',
    body: 'It is a read on a major portion of the entire book. After the release: numbers, guidance, call — then a Thursday morning BUY / HOLD / REDUCE for the C$250–C$800 contribution.',
    pills: [
      {tone: 'watch' as const, label: 'HOLD TONIGHT'},
      {tone: 'caution' as const, label: 'NO PRE-EARNINGS BUY'},
      {tone: 'long' as const, label: 'DECIDE THURSDAY'},
    ],
    followThrough: [
      {
        tone: 'watch' as const,
        if: 'NVDA confirms demand but the stock is unattractive',
        then: 'Look downstream / upstream for better risk-reward.',
      },
      {
        tone: 'caution' as const,
        if: 'AI demand looks weaker',
        then: 'More VOO / cash / non-AI quality.',
      },
      {
        tone: 'long' as const,
        if: 'An asymmetric candidate lines up',
        then: 'That is when the Next-NVDA sleeve gets capital.',
      },
    ],
  },
  tickerTape: [
    `SPX ${spxClose.toLocaleString('en-US')}  +${spxDayPct}%`,
    `SPX YTD  +${spxYtdPct}%`,
    `NASDAQ  +${nasdaqDayPct}%`,
    `NVDA  $${nvdaClose.toFixed(2)}  +${nvdaDayPct}%`,
    `AAPL YTD  +${aaplYtd}%`,
    `10Y  ${tenYear}%`,
    `NVDA event  ±${nvdaOptionsMove}%`,
    `PCE + NVDA  WEDNESDAY`,
    `VOO CORE / ADD`,
    `SELL NOTHING TONIGHT`,
  ],
};

export const episode: DailyReport = parseDailyReport(raw);
