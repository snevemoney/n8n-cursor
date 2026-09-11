import {parseDailyReport, type DailyReport} from '../schema';

// Friday 2026-09-11 America/Toronto (~09:16 EDT). Pre-open.
// Last US / CA cash is Thursday 2026-09-10. Regular session opens 9:30 ET —
// this wake is not a Friday cash print. Do not treat pre-market as cash.
// Tokyo / Hang Seng / Shanghai Friday cash printed. Europe Friday is
// mid-session at this wake — omitted. Europe last lock is Thursday FTSE / CAC.
const nvdaClose = 218.36;
const nvdaDayPct = -2.37;
const aaplClose = 326.57;
const aaplDayPct = 3.56;
const vooClose = 696.65;
const vooDayPct = -0.6;
const vtiClose = 373.24;
const vtiDayPct = -0.62;
const vugClose = 87.21;
const vugDayPct = -0.54;
const mgkClose = 89.09;
const mgkDayPct = -0.52;
const gdvClose = 29.4;
const gdvDayPct = -1.04;
const spxClose = 7591.7;
const spxDayPct = -0.58;
const spxYtdPct = 10.9;
const nasdaqDayPct = -0.65;
const tenYear = 4.95;
const nvdaGuide = 108.0;

const raw = {
  meta: {
    date: '2026-09-11',
    dateLabel: 'SEP 11, 2026',
    title: 'Daily Wealth Intelligence',
    thesis:
      'Four down US sessions. Oil cleared $100 and the 10-year sat near 5%. The book is the same seven lines. Apple’s event cash printed green. Official CPI did not.',
    thesisLead: 'Four down sessions.',
    thesisAccent: 'Oil and the 10-year did the work. Apple printed green.',
    catalyst:
      'US/CA cash 9:30 ET. Official BLS August CPI table unread at 09:16. FOMC Sep 15–16 (Fed calendar, SEP).',
    kicker: 'Thu cash red · Asia red · CPI table unread',
    universe: ['AAPL', 'NVDA', 'VOO', 'VTI', 'VUG', 'MGK', 'GDV'],
  },
  market: {
    spxClose,
    spxDayPct,
    spxYtdPct,
    nasdaqDayPct,
    tenYearYield: tenYear,
    note: 'Last US cash is Thursday: S&P 500 7,591.70 −0.58% (AP / ABC / MarketWatch). Fourth straight down day. Recap YTD +10.9%. 10-year near 4.95% (CNBC / Kiplinger; official Treasury table unread). This 09:16 Toronto wake is pre-open. No Friday US cash print yet.',
    nextCalendar: {
      label: 'Cash 9:30 · CPI table unread · FOMC next week',
      detail: 'Regular US/CA session opens 9:30 ET today. BLS scheduled August CPI at 8:30 a.m. ET — official table unread at this wake (BLS bot-blocked; Reuters still a preview). Fed calendar: FOMC Sep 15–16 with SEP.',
    },
  },
  markets: {
    global: {
      indices: [
        {
          label: 'Nikkei 225',
          value: '64,011.34',
          dayPct: -1.93,
          note: 'Friday Tokyo close (Yonhap Infomax / RTHK / Japan Times). −1,259.61. Held 64,000 after a 63,208.63 low. Topix 4,028 −0.65% (RTHK).',
        },
        {
          label: 'Hang Seng',
          value: '24,805.63',
          dayPct: -0.6,
          note: 'Friday Hong Kong close (RTHK / cngold). −148.84 from Thursday 24,954.47. Week −3.3% (RTHK).',
        },
        {
          label: 'Shanghai Composite',
          value: '3,888.11',
          dayPct: -1.18,
          note: 'Friday close (RTHK / Xinhua-style recap). Below 3,900. Shenzhen Component 13,471 −1.08% (RTHK).',
        },
        {
          label: 'FTSE 100',
          value: '10,608.92',
          dayPct: -0.57,
          note: 'Thursday close (AJ Bell). −61.14. Friday Europe is mid-session at this wake — omitted.',
        },
        {
          label: 'CAC 40',
          value: '8,116.76',
          dayPct: -0.49,
          note: 'Thursday Euronext close (AJ Bell / Digital Look). Friday close unread.',
        },
        {
          label: 'DAX',
          note: 'Thursday lower (AJ Bell −0.7%). Vendor closes disagree (25,401 vs 25,361) — not locked. Friday mid-session omitted.',
        },
      ],
      commodities: [
        {
          label: 'WTI crude',
          value: '$102.48',
          dayPct: 6.7,
          note: 'Thursday settle +6.7% (Kiplinger / Dow Jones Market Data). Cleared $100. Eight-day winning streak in that recap.',
        },
        {
          label: 'Brent',
          value: '$107.63',
          note: 'Thursday recap close (FinancialMarkets). Digital Look had $106.92 late Thursday — settle lock used is $107.63.',
        },
      ],
      rates: [{label: 'U.S. 10-year (Thu recap)', value: `${tenYear}%`}],
      fx: [
        {
          label: 'CAD/USD',
          note: 'Canadian Press via BNN 11:41 a.m. EDT Thursday: 72.38 U.S. cents vs 72.47 Wednesday. Official close unread — not used as a lock.',
        },
      ],
      note: 'New Friday prints are Tokyo, Hang Seng, and Shanghai. Europe last locked close is Thursday FTSE / CAC. US/CA cash has not printed yet this morning. ECB hiked 25 bp Thursday (AJ Bell / Digital Look) — policy fact, not a book trade.',
    },
    us: {
      indices: [
        {label: 'S&P 500', value: '7,591.70', dayPct: spxDayPct},
        {label: 'Nasdaq', value: '26,081.72', dayPct: nasdaqDayPct},
        {label: 'Dow', value: '52,064.10', dayPct: -0.6},
        {label: 'Russell 2000', value: '2,890.95', dayPct: -1.04},
      ],
      yields: [
        {label: 'U.S. 10-year Thursday recap', value: `${tenYear}%`},
        {label: 'U.S. 2-year Thursday recap', value: '4.579%'},
      ],
      note: 'Fourth straight down day (AP / ABC / MarketWatch). Recap YTD S&P +10.9%. 10-year near 4.95% highest since 2023 (CNBC / Kiplinger). Official Treasury par-curve table unread. Official BLS August CPI table unread. Official BLS PPI page still showed July when fetched. Next cash is this morning’s 9:30 ET open.',
    },
    ca: {
      indices: [
        {
          label: 'S&P/TSX Composite (Wed lock)',
          value: '35,906.56',
          dayPct: -0.6,
          note: 'Wednesday close (WSJ / Canadian Press via BNN). Thursday official close unread.',
        },
        {
          label: 'S&P/TSX Composite (Thu mid-session)',
          value: '35,616.77',
          note: 'Canadian Press via BNN 11:41 a.m. EDT Thursday: −289.79. Not a close.',
        },
      ],
      note: 'Thursday TSX close unread. Wednesday 35,906.56 −0.60% still the last lock. BoC Sep 2 hold at 2.25% (official FAD) still stands. Next date October 28 + MPR. CAD/USD official close unread.',
    },
    calendar: {
      items: [
        {
          when: 'Friday Sep 11 — today 8:30 a.m. ET',
          where: 'US' as const,
          label: 'CPI (August) — official table unread',
          why: 'BLS scheduled the August CPI here. Official table unread at this 09:16 wake. Do not invent a print.',
        },
        {
          when: 'Friday Sep 11 — today 9:30 ET',
          where: 'US' as const,
          label: 'US cash open after Thursday’s fourth down day',
          why: 'Regular session opens 9:30 ET. Thursday is still the last print at this 09:16 wake.',
        },
        {
          when: 'Friday Sep 11 — today',
          where: 'CA' as const,
          label: 'TSX session after Thursday mid-session red',
          why: 'Thursday official TSX close unread. Wednesday lock still stands until a sourced close.',
        },
        {
          when: 'Saturday Sep 12 5:00 a.m. PT',
          where: 'US' as const,
          label: 'iPhone 18 Pro pre-orders',
          why: 'Apple newsroom Sep 9. Availability Friday Sep 18. iPhone Duo pre-order Oct 16 / launch Oct 23.',
        },
        {
          when: 'Sep 15–16 · SEP meeting',
          where: 'US' as const,
          label: 'FOMC + SEP',
          why: 'federalreserve.gov 2026 calendar. Decision day is Wednesday Sep 16.',
        },
        {
          when: 'October 1',
          where: 'US' as const,
          label: 'NVIDIA $0.25 dividend pay date',
          why: 'NVIDIA IR Aug 26: record was yesterday Sep 10; pay Oct 1. Calendar fact, not a thesis.',
        },
        {
          when: 'October 28',
          where: 'CA' as const,
          label: 'Bank of Canada rate + MPR',
          why: 'Official Sep 2 hold at 2.25% still stands. Next announcement Oct 28 with the MPR.',
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
      role: 'Guide tape',
      whatMatters:
        'Thursday $218.36 (−2.37%). Third red US session after Labor Day. IR Q3 guide still $108.0B ±2%. Pre-market is not cash.',
    },
    {
      ticker: 'AAPL',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Recent purchase',
      whatMatters:
        'Thursday $326.57 (+3.56%) — first cash after the newsroom event. Do not add on the event print.',
    },
    {
      ticker: 'VOO',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      role: 'Best simple core',
      whatMatters: `Thursday $${vooClose.toFixed(2)} (${vooDayPct}%). New core money still simplifies here after a real cash session.`,
    },
    {
      ticker: 'VTI',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Broad US',
      whatMatters: `Thursday $${vtiClose.toFixed(2)} (${vtiDayPct}%). Excellent fund; still overlaps VOO.`,
      overlapWith: ['VOO'],
    },
    {
      ticker: 'VUG',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Growth sleeve',
      whatMatters: `Thursday $${vugClose.toFixed(2)} (${vugDayPct}%). Same mega-cap names you already own.`,
      overlapWith: ['NVDA', 'AAPL', 'VOO', 'MGK'],
    },
    {
      ticker: 'MGK',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Mega-cap growth',
      whatMatters: `Thursday $${mgkClose.toFixed(2)} (${mgkDayPct}%). Even tighter overlap with NVDA and AAPL.`,
      overlapWith: ['NVDA', 'AAPL', 'VUG', 'VOO'],
    },
    {
      ticker: 'GDV',
      rating: 'HOLD — income / diversifier',
      tone: 'long' as const,
      role: 'Income sleeve',
      whatMatters: `Thursday $${gdvClose.toFixed(2)} (${gdvDayPct}%). Different job. Not a growth engine.`,
    },
  ],
  portfolio: {
    concentrationThesis: 'VOO + VTI + VUG + MGK + AAPL + NVDA still buy the same companies.',
    concentrationBody:
      'Thursday turned the growth stack red again while AAPL printed green on the event. Oil over $100 and a ~4.95% 10-year is the same duration hit. Weights are still unknown, so size stays qualitative.',
    factorStack: ['NVDA', 'AAPL', 'MGK', 'VUG', 'VOO', 'VTI'],
    factorLabel: 'U.S. mega-cap / growth',
    overlapNote: 'same ecosystem',
  },
  names: [
    {
      ticker: 'NVDA',
      chapterTitle: 'NVDA · three red US sessions, guide unchanged',
      rating: 'HOLD — critical watch',
      tone: 'watch' as const,
      price: nvdaClose,
      dayPct: nvdaDayPct,
      holdNote: 'Three red sessions after Labor Day is not a buy. Guide is still $108.0B ±2%. Pre-market is not a cash print.',
      streak: [-1.51, 3.21, 1.8, 0.84, -2.01, -0.91, -2.37],
      streakHeadline: 'Seven sourced US sessions: 4 red. Last three after Labor Day are red.',
      streakNote:
        'StockAnalysis / Google Finance: Sep 1 −1.51, Sep 2 +3.21, Sep 3 +1.80, Sep 4 +0.84, Sep 8 −2.01, Sep 9 −0.91, Sep 10 −2.37 to $218.36. Labor Day Sep 7 had no cash. Momentum formula counts red days in this window only. No 0–100 score.',
      fundamentals: [
        {label: 'Q2 FY27 revenue', value: '$96.2B  +106% y/y'},
        {label: 'Q2 data center', value: '$89.0B  +117% y/y'},
        {label: 'Q2 GAAP / non-GAAP EPS', value: '$2.46  /  $2.22'},
        {label: 'Q2 gross margin', value: '75.0%'},
        {label: 'Q3 revenue guide', value: '$108.0B ±2%'},
        {label: 'Q3 gross margin guide', value: '74.0% ±50 bps'},
      ],
      consensus: {
        rows: [
          {label: 'Q2 printed revenue', value: '$96.2B'},
          {label: 'Q3 company guide', value: '$108.0B ±2%'},
          {label: 'Q3 margin guide', value: '74.0% ±50 bps'},
          {label: 'China DC compute in guide', value: 'none assumed'},
        ],
        note: 'NVIDIA IR August 26. Street consensus and whisper unread this sitting — not drawn. Next dividend $0.25 on Oct 1; record was yesterday Sep 10 (same IR).',
        range: {
          metric: 'Q3 revenue guide',
          unit: 'B',
          guide: nvdaGuide,
          low: 105.84,
          high: 110.16,
        },
      },
      narrative: {
        leftTitle: 'THE FEAR',
        leftHeadline: '“Oil over $102 and a ~4.95% 10-year can reprice the whole stack.”',
        leftBody:
          'Thursday: WTI $102.48 +6.7%, Brent recap $107.63, 10-year near 4.95%. Fourth down day on the S&P. NVDA $218.36 −2.37% after Wednesday −0.91% and Tuesday −2.01%. IR still names independent compute-financing platforms targeting over $500B of third-party capital over time.',
        rightTitle: 'THE COUNTER',
        rightHeadline: 'Printed demand is still huge. Guide assumes no China DC compute.',
        rightBody:
          'Q2 revenue $96.2B. Data center $89.0B. Q3 guide $108.0B ±2%. A red oil session does not change the guide. Vera Rubin remains the production story on the IR tape. Dividend record was yesterday; pay is Oct 1.',
      },
      interpretation: {
        chips: [
          {label: 'CONFIRMED', tone: 'long' as const, text: 'Q2 print and Q3 guide are official IR, not a rumor.'},
          {
            label: 'CONFIRMED',
            tone: 'watch' as const,
            text: 'Three red US sessions after Labor Day. That is a streak fact, not a regime score.',
          },
          {
            label: 'INFERENCE',
            tone: 'caution' as const,
            text: 'Oil and the 10-year moved together again. Official CPI is still unread. FOMC still sits on this stack.',
          },
        ],
        note: 'No composite score. Missing whisper stays UNKNOWN. Empty Next-NVDA stays empty.',
      },
      actionMatrix: {
        headline: 'Today: HOLD into the open. No pre-open trade.',
        rows: [
          {
            tone: 'long' as const,
            if: 'After a clean inflation tape the book needs cash put to work',
            then: 'VOO first',
          },
          {
            tone: 'watch' as const,
            if: 'Official CPI or FOMC reprices the 10-year hard',
            then: 'HOLD the stack. Re-read duration risk.',
          },
          {
            tone: 'caution' as const,
            if: 'NVDA guide or margin talk deteriorates',
            then: 'Do not automatically buy the dip',
          },
          {
            tone: 'short' as const,
            if: 'Demand talk breaks and the name gaps ~10%+',
            then: 'Consider reducing exposure — Evens decides',
          },
        ],
      },
      network: {
        title: 'NVDA · qualitative demand chain',
        headline: 'Polarity from IR + Thursday tape — no composite score. Equal node size.',
        nodes: [
          {id: 'labs', label: 'Frontier labs / clouds', polarity: 'confirmed' as const, x: 0.08, y: 0.22},
          {id: 'demand', label: 'GPU demand', polarity: 'confirmed' as const, x: 0.3, y: 0.22},
          {id: 'spend', label: 'AI factory buildout', polarity: 'confirmed' as const, x: 0.5, y: 0.22, evidence: 'Q2 DC $89.0B'},
          {id: 'financing', label: 'Third-party capital', polarity: 'concern' as const, x: 0.3, y: 0.78, evidence: '>$500B platforms'},
          {id: 'nvda', label: 'NVDA', polarity: 'neutral' as const, x: 0.62, y: 0.5},
          {id: 'supply', label: 'Vera Rubin / partners', polarity: 'confirmed' as const, x: 0.82, y: 0.18, evidence: 'Full production'},
          {id: 'margins', label: 'Margins', polarity: 'confirmed' as const, x: 0.82, y: 0.5, evidence: 'Q2 75.0%'},
          {id: 'eps', label: 'Q3 guide', polarity: 'inference' as const, x: 0.82, y: 0.82, evidence: '$108.0B ±2%'},
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
      chapterTitle: 'AAPL · event cash printed green',
      rating: 'HOLD',
      tone: 'long' as const,
      price: aaplClose,
      dayPct: aaplDayPct,
      holdNote: 'You already own it. A green event day is not an add day.',
      catalyst: {
        headline: 'Apple newsroom Sep 9: iPhone Duo (first foldable) and iPhone 18 Pro / Pro Max.',
        steps: [
          'iPhone Duo: 7.6-in inner / 5.4-in outer, A20 Pro',
          'iPhone 18 Pro: 48MP Fusion Main, variable aperture',
          'Pro pre-order Sat Sep 12 · availability Fri Sep 18',
          'Duo pre-order Oct 16 · launch Oct 23',
        ],
        note: 'Official newsroom only. No unit guide. No revenue claim. Thursday cash $326.57 (+3.56%) vs Wednesday $315.34.',
      },
      action: {
        headline: 'HOLD the position.',
        body: 'The event is real. The first cash after it is one green day. YTD page unread this sitting — omitted. Do not stack another AAPL buy into the same mega-cap sleeve.',
      },
    },
    {
      ticker: 'VOO',
      chapterTitle: 'VOO · still the simple core',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      metrics: [{label: 'Thursday', value: `$${vooClose.toFixed(2)}  ${vooDayPct}%`}],
      copy: {
        headline: 'Best simple core. New core money simplifies here.',
        body: 'Do not sell. Stop splitting every future contribution with VTI. Thursday followed the S&P. YTD page unread this sitting — omitted.',
      },
    },
    {
      ticker: 'VTI',
      chapterTitle: 'VTI · excellent, overlapping',
      rating: 'HOLD',
      tone: 'long' as const,
      metrics: [{label: 'Thursday', value: `$${vtiClose.toFixed(2)}  ${vtiDayPct}%`}],
      copy: {
        headline: 'Excellent. The top still looks like VOO.',
        body: 'Do not sell. The overlap with VOO is the issue — not the fund quality.',
      },
    },
    {
      ticker: 'VUG',
      chapterTitle: 'VUG · growth sleeve, no add',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      metrics: [{label: 'Thursday', value: `$${vugClose.toFixed(2)}  ${vugDayPct}%`}],
      copy: {
        headline: 'You already own the individual winners.',
        body: 'HOLD existing. No priority additions. A fourth red index day is not a thesis change.',
      },
    },
    {
      ticker: 'MGK',
      chapterTitle: 'MGK · tighter overlap',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      metrics: [{label: 'Thursday', value: `$${mgkClose.toFixed(2)}  ${mgkDayPct}%`}],
      copy: {
        body: 'You already own NVDA and AAPL directly. HOLD. Stop feeding it. Not a sell call — tax and account mechanics are not on this tape.',
      },
    },
    {
      ticker: 'GDV',
      chapterTitle: 'GDV · a different job',
      rating: 'HOLD · INCOME / DIVERSIFIER',
      tone: 'long' as const,
      metrics: [{label: 'Market', value: `$${gdvClose.toFixed(2)}  ${gdvDayPct}%`}],
      copy: {
        body: 'Closed-end income/value. NAV and discount unread this sitting — omitted. Not “Next NVDA.”',
      },
    },
  ],
  nextNvda: [],
  unknowns: [
    {
      id: 'bls-cpi-official',
      area: 'US' as const,
      question: 'What did the official BLS August CPI table print this morning?',
      whyItMatters:
        'BLS scheduled the release at 8:30 a.m. ET. Official table unread at this 09:16 wake (BLS bot-blocked; Reuters still a preview). A forecast is not the table.',
      neededToKnow: 'BLS cpi.nr0.htm / PDF for August 2026, or a screenshot Evens opens.',
      status: 'unknown' as const,
    },
    {
      id: 'bls-ppi-official',
      area: 'US' as const,
      question: 'What did the official BLS August PPI table print Thursday?',
      whyItMatters:
        'BLS scheduled August PPI Thursday 8:30 a.m. ET. The public latest-numbers page still showed July when fetched. Recaps are not the table.',
      neededToKnow: 'BLS ppi.nr0.htm / PDF for August 2026.',
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
      id: 'tsx-thu-close',
      area: 'CA' as const,
      question: 'What did the S&P/TSX Composite close Thursday?',
      whyItMatters:
        'Canadian Press mid-session 35,616.77 is not a close. Wednesday 35,906.56 still the last lock. The contribution is in C$.',
      neededToKnow: 'TMX / WSJ / CP close print for Thursday Sep 10.',
      status: 'partial' as const,
    },
    {
      id: 'next-nvda',
      area: 'opportunity' as const,
      question: 'Is there a named Next-NVDA or non-book scout?',
      whyItMatters: 'The sleeve and opportunity board stay empty until a name is sourced.',
      neededToKnow: 'Evens or a filing names a ticker that is not already in the book.',
      status: 'unknown' as const,
    },
  ],
  scenarios: [],
  capitalPlan: {
    existingPortfolio: 'HOLD — sell nothing this morning.',
    freshCapital: 'No pre-open buy. New core money simplifies into VOO after a real cash session.',
    bestAdd: 'VOO',
    highestUpsideWatch: 'none named',
    biggestRisk:
      'Mega-cap growth overlap across NVDA, AAPL, MGK, VUG, VOO, VTI — now sitting under a ~4.95% 10-year and $102 WTI',
    nextTrigger: 'Official August CPI table · cash 9:30 ET · FOMC Sep 15–16',
    ifThen: [
      {
        tone: 'long' as const,
        if: 'After a clean inflation tape the book needs cash put to work',
        then: 'VOO first',
      },
      {
        tone: 'watch' as const,
        if: 'Official CPI or FOMC reprices the 10-year hard',
        then: 'HOLD the stack. Re-read duration risk.',
      },
      {
        tone: 'caution' as const,
        if: 'NVDA guide or margin talk deteriorates',
        then: 'Do not automatically buy the dip',
      },
      {
        tone: 'short' as const,
        if: 'Demand talk breaks and the name gaps ~10%+',
        then: 'Consider reducing exposure — Evens decides',
      },
    ],
  },
  risks: [
    {
      n: '01',
      title: 'Growth-factor concentration',
      body: 'NVDA + AAPL + MGK + VUG + VOO + VTI repeatedly own the same mega-cap ecosystem. Thursday the growth lines went red together while AAPL printed the event.',
    },
    {
      n: '02',
      title: 'Interest rates + oil',
      body: `The 10-year sat near ${tenYear}% — highest since late 2023. WTI settled $102.48. High long rates compress the exact overweight. Oil feeds the inflation tape into unread CPI and next week’s FOMC.`,
    },
    {
      n: '03',
      title: 'AI ROI / financed demand',
      body: 'IR still names third-party platforms targeting over $500B of AI infrastructure capital. The debate is still “will profits justify the buildout?” That sits under NVDA and most of the indirect book.',
    },
  ],
  close: {
    kicker: 'DIAGNOSTIC',
    headline: 'Thursday was an oil-and-yield day. Apple was the exception, not a new book.',
    body: 'Seven names. Same overlap. Apple’s event cash is on the tape. Official CPI is not. After the open: numbers, then HOLD / VOO — Evens decides. No trade from this desk.',
    pills: [
      {tone: 'watch' as const, label: 'HOLD THIS MORNING'},
      {tone: 'caution' as const, label: 'NO PRE-OPEN BUY'},
      {tone: 'long' as const, label: 'VOO IF CASH MUST WORK'},
    ],
    followThrough: [
      {
        tone: 'watch' as const,
        if: 'Official CPI keeps the 10-year bid',
        then: 'Do not add growth overlap. Re-read duration.',
      },
      {
        tone: 'caution' as const,
        if: 'Oil stays over $100 into FOMC week',
        then: 'More VOO / cash / non-AI quality — Evens decides.',
      },
      {
        tone: 'long' as const,
        if: 'An asymmetric candidate is named',
        then: 'That is when the Next-NVDA sleeve gets capital.',
      },
    ],
  },
  tickerTape: [
    `SPX ${spxClose.toLocaleString('en-US')}  ${spxDayPct}%`,
    `SPX YTD  +${spxYtdPct}%`,
    `NASDAQ  ${nasdaqDayPct}%`,
    `NVDA  $${nvdaClose.toFixed(2)}  ${nvdaDayPct}%`,
    `AAPL  $${aaplClose.toFixed(2)}  +${aaplDayPct}%`,
    `10Y  ${tenYear}%`,
    `WTI  $102.48`,
    `TSX CLOSE UNREAD`,
    `CPI TABLE UNREAD`,
    `VOO CORE / ADD`,
    `SELL NOTHING THIS MORNING`,
  ],
};

export const episode: DailyReport = parseDailyReport(raw);
