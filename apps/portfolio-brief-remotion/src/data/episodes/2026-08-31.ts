import {parseDailyReport, type DailyReport} from '../schema';

/** Friday 2026-08-28 cash. Monday 2026-08-31 America/Toronto is pre-open at write. */
const nvdaClose = 217.55;
const nvdaDayPct = -4.57;
const nvdaBeta = 2.21;
const aaplClose = 319.7;
const aaplDayPct = 1.63;
const vooClose = 707.24;
const vooDayPct = -0.21;
const vtiClose = 379.36;
const vtiDayPct = -0.33;
const vugClose = 88.54;
const vugDayPct = -0.4;
const mgkClose = 90.12;
const mgkDayPct = -0.4;
const gdvClose = 30.3;
const gdvDayPct = -0.1;
const spxClose = 7711.76;
const spxDayPct = -0.25;
const nasdaqClose = 26402.42;
const nasdaqDayPct = -0.52;
const tenYearFri = 4.72;
const tsxClose = 36553.92;
const tsxDayPct = -0.76;

const raw = {
  meta: {
    date: '2026-08-31',
    dateLabel: 'AUG 31, 2026',
    title: 'Daily Wealth Intelligence',
    thesis:
      'Nvidia printed $96.2B and guided $108B. Friday cash sold the print. The book is still the same U.S. mega-cap stack.',
    thesisLead: 'The print was large.',
    thesisAccent: 'Friday sold it anyway.',
    catalyst: 'Friday cash after the Aug 26 print. Next labor prints: JOLTS Tue, jobs Fri.',
    kicker: 'Monday open · Friday cash',
    universe: ['AAPL', 'NVDA', 'VOO', 'VTI', 'VUG', 'MGK', 'GDV'],
  },
  market: {
    spxClose,
    spxDayPct,
    nasdaqDayPct,
    tenYearYield: tenYearFri,
    note: 'Friday cash. Fed Chair Warsh kept the inflation fight. S&P 7,711.76 (−0.25%). Nasdaq −0.52%. 10-year last cash 4.72%. Monday morning Yahoo ^TNX 4.752 as of 8:05 AM CDT — not a Monday equity close.',
    nextCalendar: {
      label: 'JOLTS Tue · jobs Fri',
      detail: 'BLS: JOLTS (July) Tue Sep 1 10:00 ET. Employment Situation (August) Fri Sep 4 8:30 ET.',
    },
  },
  markets: {
    global: {
      indices: [
        {label: 'Nikkei 225', value: '66,311.93', dayPct: -0.14},
        {label: 'Hang Seng', value: '25,566.99', dayPct: -0.07},
        {label: 'Shanghai Composite', value: '3,986.30', dayPct: 0.86},
        {label: 'DAX', value: '26,370.89', dayPct: -0.75},
        {label: 'FTSE 100', value: '10,824.26', dayPct: 0.29},
        {label: 'EURO STOXX 50', value: '6,467.35', dayPct: -0.28},
        {label: 'S&P/ASX 200', value: '9,076.00', dayPct: -0.18},
        {label: 'KOSPI', value: '6,820.02', dayPct: 0.46},
      ],
      rates: [{label: 'U.S. 10-year (Fri cash)', value: `${tenYearFri}%`}],
      note: 'Last cash from Yahoo world-index quotes on the S&P page. Monday equity session had not printed at write.',
    },
    us: {
      indices: [
        {
          label: 'S&P 500',
          value: spxClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: spxDayPct,
        },
        {
          label: 'Nasdaq',
          value: nasdaqClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: nasdaqDayPct,
        },
        {label: 'Dow', value: '53,559.99', dayPct: -0.02},
        {label: 'Russell 2000', value: '2,972.37', dayPct: -1.39},
      ],
      yields: [
        {label: 'U.S. 10-year Fri cash', value: `${tenYearFri}%`},
        {label: 'VIX Fri cash', value: '15.38', dayPct: 6.59},
      ],
      note: 'Reuters/Yahoo Friday close: Warsh reaffirmed the inflation fight. Breadth on that tape: NYSE decliners led 1.77-to-1; Nasdaq 2.19-to-1.',
    },
    ca: {
      indices: [
        {
          label: 'S&P/TSX Composite',
          value: tsxClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: tsxDayPct,
        },
      ],
      cadUsd: '0.7194 Fri cash (Yahoo/poundsterlinglive). Monday Yahoo CADUSD=X ~0.7204 live — not a Monday TSX close.',
      note: 'TSX Friday cash 36,553.92 (−0.76%). No TSX-V print read this sitting.',
    },
    calendar: {
      items: [
        {
          when: 'Tue Sep 1 · 10:00 ET',
          where: 'US' as const,
          label: 'JOLTS (July)',
          why: 'BLS schedule: Job Openings and Labor Turnover for July 2026.',
        },
        {
          when: 'Fri Sep 4 · 8:30 ET',
          where: 'US' as const,
          label: 'Employment Situation (August)',
          why: 'BLS schedule. Next U.S. jobs print after the Warsh inflation tape.',
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
      rating: 'HOLD — post-print watch',
      tone: 'watch' as const,
      role: 'Highest factor risk',
      whatMatters: 'Q2 $96.2B. Q3 guide $108.0B ±2%, GM 74.0% ±50 bps, no China DC compute. Friday −4.57%.',
    },
    {
      ticker: 'AAPL',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Recent purchase',
      whatMatters: 'Friday cash $319.70 (+1.63%). No new Apple IR print this sitting.',
    },
    {
      ticker: 'VOO',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      role: 'Best simple core',
      whatMatters: `Friday cash $${vooClose.toFixed(2)} (${vooDayPct}%). New core money still simplifies here.`,
    },
    {
      ticker: 'VTI',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Broad US',
      whatMatters: `Friday cash $${vtiClose.toFixed(2)} (${vtiDayPct}%). Still overlaps VOO.`,
      overlapWith: ['VOO'],
    },
    {
      ticker: 'VUG',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Growth sleeve',
      whatMatters: `Friday cash $${vugClose.toFixed(2)} (${vugDayPct}%). Same mega-cap stack as NVDA + AAPL + MGK.`,
      overlapWith: ['NVDA', 'AAPL', 'VOO', 'MGK'],
    },
    {
      ticker: 'MGK',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Mega-cap growth',
      whatMatters: `Friday cash $${mgkClose.toFixed(2)} (${mgkDayPct}%). Even tighter mega-cap overlap.`,
      overlapWith: ['NVDA', 'AAPL', 'VUG', 'VOO'],
    },
    {
      ticker: 'GDV',
      rating: 'HOLD — income / diversifier',
      tone: 'long' as const,
      role: 'Income sleeve',
      whatMatters: `Friday cash $${gdvClose.toFixed(2)} (${gdvDayPct}%). Different job. NAV / discount not re-sourced this sitting.`,
    },
  ],
  portfolio: {
    concentrationThesis: 'VOO + VTI + VUG + MGK + AAPL + NVDA still buy the same companies.',
    concentrationBody:
      'The Aug 26 print did not change the stack. When NVDA is −4.57%, the growth sleeves move with it. Weights are still unknown.',
    factorStack: ['NVDA', 'AAPL', 'MGK', 'VUG', 'VOO', 'VTI'],
    factorLabel: 'U.S. mega-cap / growth',
    overlapNote: 'same ecosystem',
  },
  names: [
    {
      ticker: 'NVDA',
      chapterTitle: 'NVDA · printed, then sold',
      rating: 'POST-PRINT WATCH',
      tone: 'watch' as const,
      price: nvdaClose,
      dayPct: nvdaDayPct,
      holdNote: 'Do not automatically buy Friday’s dip. Guide is $108B, not a buy ticket.',
      streak: [-0.33, -0.98, -2.91, 2.19, -1.59, 8.74, -4.57],
      streakHeadline: 'Seven sessions. Five red. Thursday +8.74% then Friday −4.57%.',
      streakNote:
        'Yahoo closes Aug 20–28. Earnings hit after Wednesday’s close. Thursday ripped. Friday gave a chunk back.',
      fundamentals: [
        {label: 'Q2 FY27 revenue', value: '$96.2B  +18% Q/Q  +106% Y/Y'},
        {label: 'Data Center', value: '$89.0B  +18% Q/Q  +117% Y/Y'},
        {label: 'Q2 GAAP / non-GAAP EPS', value: '$2.46  /  $2.22'},
        {label: 'Q2 GAAP + non-GAAP GM', value: '75.0%'},
        {label: 'Q3 revenue guide', value: '$108.0B ±2%  (no China DC compute)'},
        {label: 'Q3 GM guide', value: '74.0% ±50 bps'},
        {label: 'Market cap (Yahoo Fri)', value: '$5.253T'},
        {label: 'Beta (Yahoo)', value: String(nvdaBeta)},
      ],
      consensus: {
        rows: [
          {label: 'Q2 revenue (IR)', value: '$96.2B'},
          {label: 'Q3 revenue guide (IR)', value: '$108.0B ±2%'},
          {label: 'Q3 GM guide (IR)', value: '74.0% ±50 bps'},
          {label: 'China DC compute in guide', value: 'none assumed'},
        ],
        note: 'IR Aug 26. Whisper not sourced — UNKNOWN. Street EPS whisper not read.',
        range: {
          metric: 'Q3 revenue guide',
          unit: 'B',
          guide: 108,
          low: 105.84,
          high: 110.16,
        },
      },
      narrative: {
        leftTitle: 'THE TAPE',
        leftHeadline: 'A $108B guide still sold Friday.',
        leftBody:
          'IR: $96.2B revenue, $89.0B data center, 75% GM. Guide $108.0B ±2% and 74.0% GM ±50 bps, with no China data-center compute in the outlook. Yahoo Friday cash $217.55 (−4.57%).',
        rightTitle: 'THE BOOK',
        rightHeadline: 'This is still a mega-cap growth stack.',
        rightBody:
          'IR also named $500B+ of third-party AI-infrastructure financing platforms (subject to definitive agreements) and $26.0B returned to shareholders in the quarter. That is demand plus financing exposure — not a new ticker.',
      },
      interpretation: {
        chips: [
          {label: 'CONFIRMED', tone: 'long' as const, text: 'Q2 $96.2B. DC $89.0B. Guide $108B ±2%.'},
          {
            label: 'CONFIRMED',
            tone: 'watch' as const,
            text: 'Friday cash sold the print. GM guide steps to 74.0% ±50 bps.',
          },
          {
            label: 'CONFIRMED',
            tone: 'caution' as const,
            text: 'Guide assumes no China data-center compute.',
          },
          {
            label: 'INFERENCE',
            tone: 'caution' as const,
            text: 'A large print can still be a poor add if the stock is the expensive way to own the same stack.',
          },
        ],
        note: 'No composite NVDA score. Formulas: red-day count from the streak. Whisper stays UNKNOWN.',
      },
      actionMatrix: {
        headline: 'HOLD the line. Do not chase Friday’s dip.',
        rows: [
          {
            tone: 'watch' as const,
            if: 'Guide holds and the book weight is still unknown',
            then: 'HOLD NVDA. Do not size a new add from price alone.',
          },
          {
            tone: 'long' as const,
            if: 'Fresh C$ arrives and you want one simple core',
            then: 'VOO — not another NVDA / VUG / MGK ticket',
          },
          {
            tone: 'caution' as const,
            if: 'The stock keeps selling a $108B / 74% guide',
            then: 'Do not automatically buy the dip',
          },
          {
            tone: 'short' as const,
            if: 'Demand or financing stress shows up in a later print',
            then: 'Consider reducing. Not a trade tonight.',
          },
        ],
      },
      network: {
        title: 'NVDA · after the Aug 26 IR print',
        headline: 'Polarity from IR + Friday cash. No composite score.',
        nodes: [
          {id: 'print', label: 'Q2 $96.2B', polarity: 'confirmed' as const, x: 0.08, y: 0.22, evidence: 'IR Aug 26'},
          {id: 'dc', label: 'DC $89.0B', polarity: 'confirmed' as const, x: 0.3, y: 0.22, evidence: '+117% Y/Y'},
          {id: 'guide', label: 'Q3 $108B ±2%', polarity: 'confirmed' as const, x: 0.52, y: 0.22, evidence: 'no China DC compute'},
          {id: 'gm', label: 'GM 74% guide', polarity: 'concern' as const, x: 0.3, y: 0.78, evidence: '±50 bps vs 75% print'},
          {id: 'nvda', label: 'NVDA', polarity: 'neutral' as const, x: 0.62, y: 0.5},
          {id: 'financing', label: 'AI infra financing', polarity: 'concern' as const, x: 0.52, y: 0.78, evidence: '$500B+ platforms named'},
          {id: 'tape', label: 'Fri cash −4.57%', polarity: 'concern' as const, x: 0.82, y: 0.22, evidence: '$217.55'},
          {id: 'book', label: 'Mega-cap stack', polarity: 'inference' as const, x: 0.82, y: 0.78},
        ],
        edges: [
          {from: 'print', to: 'dc'},
          {from: 'dc', to: 'guide'},
          {from: 'guide', to: 'nvda'},
          {from: 'gm', to: 'nvda'},
          {from: 'financing', to: 'nvda', label: 'exposure'},
          {from: 'nvda', to: 'tape'},
          {from: 'nvda', to: 'book'},
        ],
      },
    },
    {
      ticker: 'AAPL',
      chapterTitle: 'AAPL · Friday bid, no new IR',
      rating: 'HOLD',
      tone: 'long' as const,
      price: aaplClose,
      dayPct: aaplDayPct,
      holdNote: 'HOLD the recent purchase. Do not add the same name with fresh C$.',
      action: {
        headline: 'HOLD the position.',
        body: 'Friday cash $319.70 (+1.63%). No new Apple IR release read this sitting. Next contribution should not double AAPL.',
      },
    },
    {
      ticker: 'VOO',
      chapterTitle: 'VOO · still the simple core',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      metrics: [{label: 'Fri cash', value: `$${vooClose.toFixed(2)}  ${vooDayPct}%`}],
      copy: {
        headline: 'Best simple core. New core money still simplifies here.',
        body: 'Friday cash followed the S&P (−0.21%). Do not sell. Stop splitting every future contribution with VTI.',
      },
    },
    {
      ticker: 'VTI',
      chapterTitle: 'VTI · excellent, overlapping',
      rating: 'HOLD',
      tone: 'long' as const,
      metrics: [{label: 'Fri cash', value: `$${vtiClose.toFixed(2)}  ${vtiDayPct}%`}],
      copy: {
        headline: 'Excellent. The top still looks like VOO.',
        body: 'Do not sell. The overlap with VOO is the issue — not the fund quality.',
      },
    },
    {
      ticker: 'VUG',
      chapterTitle: 'VUG · growth sleeve, no priority add',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      metrics: [{label: 'Fri cash', value: `$${vugClose.toFixed(2)}  ${vugDayPct}%`}],
      copy: {
        headline: 'You already own the individual winners.',
        body: 'Friday −0.40%. HOLD existing. No priority additions. YTD vs S&P not re-sourced this sitting.',
      },
    },
    {
      ticker: 'MGK',
      chapterTitle: 'MGK · tighter overlap',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      metrics: [{label: 'Fri cash', value: `$${mgkClose.toFixed(2)}  ${mgkDayPct}%`}],
      copy: {
        body: 'Friday −0.40%. You already own NVDA and AAPL directly. HOLD. Stop feeding it. Not a sell call — tax and account mechanics were not reconstructed.',
      },
    },
    {
      ticker: 'GDV',
      chapterTitle: 'GDV · a different job',
      rating: 'HOLD · INCOME / DIVERSIFIER',
      tone: 'long' as const,
      metrics: [{label: 'Fri cash', value: `$${gdvClose.toFixed(2)}  ${gdvDayPct}%`}],
      copy: {
        body: 'Closed-end income/value. Friday market $30.30. NAV, discount, and distribution rate were not re-sourced this sitting. Not “Next NVDA.”',
      },
    },
  ],
  nextNvda: [],
  unknowns: [
    {
      id: 'weights',
      area: 'book' as const,
      question: 'What is each line’s weight in the book?',
      whyItMatters: 'Concentration stays a line-count until weights exist. We cannot size how much mega-cap.',
      neededToKnow: 'Sourced account weights. Do not estimate from prices.',
      status: 'unknown' as const,
    },
    {
      id: 'monday-cash',
      area: 'US' as const,
      question: 'Where did Monday’s U.S. cash session actually print?',
      whyItMatters: 'This wake is 9:20 America/Toronto. Friday is last cash. Live pre-market is not a close.',
      neededToKnow: 'Monday regular-session closes for SPX / Nasdaq / NVDA / AAPL after 16:00 ET.',
      status: 'unknown' as const,
    },
    {
      id: 'gdv-nav',
      area: 'name' as const,
      ticker: 'GDV',
      question: 'What is GDV’s current NAV, discount, and distribution rate?',
      whyItMatters: 'The income sleeve is a different job only if the discount and pay rate are still real.',
      neededToKnow: 'A Gabelli / CEF page print dated after July 31.',
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
      id: 'nvda-whisper',
      area: 'name' as const,
      ticker: 'NVDA',
      question: 'What is the street whisper vs the $108.0B ±2% guide?',
      whyItMatters: 'Expectation-risk formula stays UNKNOWN without a sourced whisper.',
      neededToKnow: 'A named street / whisper print. Do not invent a zone.',
      status: 'unknown' as const,
    },
  ],
  scenarios: [],
  capitalPlan: {
    existingPortfolio: 'HOLD — sell nothing on this Monday open.',
    freshCapital: 'New core money simplifies into VOO. Do not add NVDA, VUG, or MGK from Friday’s dip.',
    bestAdd: 'VOO',
    highestUpsideWatch: 'none named',
    biggestRisk: 'Mega-cap growth overlap across NVDA, AAPL, MGK, VUG, VOO, VTI — weights still unknown',
    nextTrigger: 'Tue Sep 1 JOLTS · Fri Sep 4 Employment Situation',
    ifThen: [
      {
        tone: 'watch' as const,
        if: 'Guide holds and weights are still unknown',
        then: 'HOLD NVDA. Do not size a new add from price alone.',
      },
      {
        tone: 'long' as const,
        if: 'Fresh C$ arrives and you want one simple core',
        then: 'VOO',
      },
      {
        tone: 'caution' as const,
        if: 'The stock keeps selling a $108B / 74% guide',
        then: 'Do not automatically buy the dip',
      },
      {
        tone: 'short' as const,
        if: 'A later print shows demand or financing stress',
        then: 'Consider reducing. Not a trade tonight.',
      },
    ],
  },
  risks: [
    {
      n: '01',
      title: 'Growth-factor concentration',
      body: 'NVDA + AAPL + MGK + VUG + VOO + VTI still own the same mega-cap ecosystem. Weights unknown.',
    },
    {
      n: '02',
      title: 'Interest rates',
      body: 'Friday 10-year cash 4.72%. Monday morning Yahoo 4.752. Warsh kept the inflation fight. Long rates still sit on this growth stack.',
    },
    {
      n: '03',
      title: 'Guide vs tape',
      body: 'IR guided $108.0B ±2% and 74% GM with no China DC compute. Friday still sold NVDA 4.57%. A large print is not automatically a good add.',
    },
  ],
  close: {
    kicker: 'FRIDAY CASH',
    headline: 'The print landed. The stack did not change.',
    body: 'Nvidia did the hard thing: $96.2B and a $108B guide. Friday cash sold it. HOLD the book. New money still goes to VOO. Watch JOLTS Tuesday and jobs Friday. No new scout name.',
    pills: [
      {tone: 'watch' as const, label: 'HOLD THE BOOK'},
      {tone: 'caution' as const, label: 'NO AUTO-DIP BUY'},
      {tone: 'long' as const, label: 'FRESH C$ → VOO'},
    ],
    followThrough: [
      {
        tone: 'watch' as const,
        if: 'Monday cash confirms Friday’s NVDA sale',
        then: 'Still HOLD. Re-read weights before any add.',
      },
      {
        tone: 'caution' as const,
        if: 'Labor prints reprice the 10-year higher',
        then: 'More VOO / cash / less growth-sleeve add.',
      },
      {
        tone: 'long' as const,
        if: 'An asymmetric candidate is named by Evens or a filing',
        then: 'That is when the Next-NVDA sleeve gets a name.',
      },
    ],
  },
  tickerTape: [
    `SPX  ${spxClose.toLocaleString('en-US')}  ${spxDayPct}%  FRI`,
    `NASDAQ  ${nasdaqDayPct}%  FRI`,
    `NVDA  $${nvdaClose.toFixed(2)}  ${nvdaDayPct}%  FRI`,
    `AAPL  $${aaplClose.toFixed(2)}  +${aaplDayPct}%  FRI`,
    `10Y  ${tenYearFri}%  FRI CASH`,
    `TSX  ${tsxClose.toLocaleString('en-US')}  ${tsxDayPct}%  FRI`,
    `NVDA Q2  $96.2B`,
    `NVDA Q3 GUIDE  $108B ±2%`,
    `GM GUIDE  74.0%`,
    `JOLTS  TUE SEP 1`,
    `JOBS  FRI SEP 4`,
    `VOO CORE / ADD`,
    `SELL NOTHING`,
  ],
};

export const episode: DailyReport = parseDailyReport(raw);
