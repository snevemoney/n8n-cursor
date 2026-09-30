import {parseDailyReport, type DailyReport} from '../schema';

// Thursday 2026-09-10 America/Toronto (~09:00 EDT). Pre-open.
// Last US / CA cash is Wednesday 2026-09-09. Regular session opens 9:30 ET —
// this wake is not a Thursday cash print. Do not treat pre-market as cash.
// Tokyo / Hang Seng / Shanghai Thursday cash printed. Europe Thursday is
// mid-session at this wake — omitted. Europe last lock is Wednesday.
const nvdaClose = 223.67;
const nvdaDayPct = -0.91;
const aaplClose = 315.34;
const aaplDayPct = -0.28;
const vooClose = 700.87;
const vooDayPct = -0.45;
const vtiClose = 375.56;
const vtiDayPct = -0.54;
const vugClose = 87.68;
const vugDayPct = -0.5;
const mgkClose = 89.56;
const mgkDayPct = -0.42;
const gdvClose = 29.71;
const gdvDayPct = -0.4;
const spxClose = 7636.36;
const spxDayPct = -0.48;
const spxYtdPct = 11.6;
const nasdaqDayPct = -0.64;
const tenYear = 4.836;
const nvdaGuide = 108.0;

const raw = {
  meta: {
    date: '2026-09-10',
    dateLabel: 'SEP 10, 2026',
    title: 'Daily Wealth Intelligence',
    thesis:
      'Three down US sessions. Oil and the 10-year did the work. The book is the same seven lines. Apple’s event printed. Official PPI did not.',
    thesisLead: 'Three down sessions.',
    thesisAccent: 'Oil and the 10-year did the work.',
    catalyst:
      'US/CA cash 9:30 ET. Official BLS August PPI table unread at 09:00. CPI Fri Sep 11 8:30 a.m. ET. FOMC Sep 15–16 (Fed calendar, SEP).',
    kicker: 'Wed cash red · Tokyo green · PPI table unread',
    universe: ['AAPL', 'NVDA', 'VOO', 'VTI', 'VUG', 'MGK', 'GDV'],
  },
  market: {
    spxClose,
    spxDayPct,
    spxYtdPct,
    nasdaqDayPct,
    tenYearYield: tenYear,
    note: 'Last US cash is Wednesday: S&P 500 7,636.36 −0.48% (AP YTD +11.6%). Third straight down day. 10-year close 4.836% (MarketWatch / Dow Jones Market Data). This 09:00 Toronto wake is pre-open. No Thursday US cash print yet.',
    nextCalendar: {
      label: 'Cash 9:30 · PPI table unread · CPI Fri · FOMC next week',
      detail: 'Regular US/CA session opens 9:30 ET today. BLS scheduled August PPI at 8:30 a.m. ET — official table still showed July at this wake. CPI Fri Sep 11 8:30 a.m. ET. Fed calendar: FOMC Sep 15–16 with SEP.',
    },
  },
  markets: {
    global: {
      indices: [
        {
          label: 'Nikkei 225',
          value: '65,270.95',
          dayPct: 0.2,
          note: 'Thursday Tokyo close (Yomiuri / Yonhap Infomax / Kabutan). +128.17 after a near-1,000-point morning dip. Topix 4,054.58 +0.20% (Yomiuri).',
        },
        {
          label: 'Hang Seng',
          value: '24,954.47',
          dayPct: -1.27,
          note: 'Thursday Hong Kong close (Stooq / Gate recap). −320.49 from Wednesday 25,274.96.',
        },
        {
          label: 'Shanghai Composite',
          value: '3,934.40',
          dayPct: -0.43,
          note: 'Thursday close (Xinhua / 中国经济网). Shenzhen Component 13,617.67 −0.77% (Xinhua).',
        },
        {
          label: 'DAX',
          value: '25,576.45',
          dayPct: -1.66,
          note: 'Wednesday Xetra close (Bastille Post / Armenpress Europe wrap). Thursday Europe is mid-session at this wake — omitted.',
        },
        {
          label: 'FTSE 100',
          value: '10,670.06',
          dayPct: -1.31,
          note: 'Wednesday close (same Europe wrap). Thursday close unread.',
        },
        {
          label: 'CAC 40',
          value: '8,156.67',
          dayPct: -1.94,
          note: 'Wednesday Euronext close (same wrap).',
        },
      ],
      commodities: [
        {
          label: 'WTI crude (Oct)',
          value: '$96.05',
          dayPct: 3.25,
          note: 'Wednesday NYMEX October settle +$3.02 (Reuters / Newsquawk / SunSirs). Highest close since May 22.',
        },
        {
          label: 'Brent (Nov)',
          value: '$101.21',
          dayPct: 3.4,
          note: 'Wednesday ICE November settle +$3.29 (Reuters). First $100+ settle in this run.',
        },
      ],
      rates: [{label: 'U.S. 10-year (Wed close)', value: `${tenYear}%`}],
      fx: [
        {
          label: 'CAD/USD',
          note: 'Canadian Press via BNN recap: 72.47 U.S. cents vs 72.55 Tuesday. Official close unread — not used as a lock.',
        },
      ],
      note: 'New Thursday prints are Tokyo, Hang Seng, and Shanghai. Europe last locked close is Wednesday. US/CA cash has not printed yet this morning.',
    },
    us: {
      indices: [
        {label: 'S&P 500', value: '7,636.36', dayPct: spxDayPct},
        {label: 'Nasdaq', value: '26,253.34', dayPct: nasdaqDayPct},
        {label: 'Dow', value: '52,380.66', dayPct: -0.77},
        {label: 'Russell 2000', value: '2,921.23', dayPct: -1.3},
      ],
      yields: [
        {label: 'U.S. 10-year Wednesday', value: `${tenYear}%`},
        {label: 'U.S. 2-year Wednesday recap', value: '4.42%'},
      ],
      note: 'Third straight down day (MarketWatch / AP). AP YTD: S&P +11.6%, Dow +9%, Nasdaq +13%. 10-year 4.836% highest close since Oct 31, 2023 (DJ Market Data). 2-year recap 4.42% (Longbridge / WSJ-style settle). Official BLS August PPI table unread — July page still up. Next cash is this morning’s 9:30 ET open.',
    },
    ca: {
      indices: [{label: 'S&P/TSX Composite', value: '35,906.56', dayPct: -0.6}],
      note: 'Wednesday TSX 35,906.56 −216.49 (−0.60%) (WSJ 5:16 p.m. EDT / Canadian Press via BNN). Next TSX session is this morning. BoC Sep 2 hold at 2.25% (official FAD) still stands. Next date October 28 + MPR. CAD/USD official close unread.',
    },
    calendar: {
      items: [
        {
          when: 'Thursday Sep 10 — today 8:30 a.m. ET',
          where: 'US' as const,
          label: 'PPI (August) — official table unread',
          why: 'BLS scheduled the August PPI here. The public table still showed July at this 09:00 wake. Do not invent a print.',
        },
        {
          when: 'Thursday Sep 10 — today 9:30 ET',
          where: 'US' as const,
          label: 'US cash open after Wednesday’s third down day',
          why: 'Regular session opens 9:30 ET. Wednesday is still the last print at this 09:00 wake.',
        },
        {
          when: 'Thursday Sep 10 — today',
          where: 'CA' as const,
          label: 'TSX session after Wednesday −0.60%',
          why: 'Wednesday TSX still stands until the cash close.',
        },
        {
          when: 'Thursday Sep 10 — today',
          where: 'US' as const,
          label: 'NVIDIA $0.25 dividend record date',
          why: 'NVIDIA IR Aug 26: record Sep 10, pay Oct 1. Calendar fact, not a thesis.',
        },
        {
          when: 'Friday Sep 11 8:30 a.m. ET',
          where: 'US' as const,
          label: 'CPI (August)',
          why: 'BLS CPI schedule. Last CPI before the September FOMC.',
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
        'Wednesday $223.67 (−0.91%). Second red US session after Labor Day. IR Q3 guide still $108.0B ±2%. Pre-market is not cash.',
    },
    {
      ticker: 'AAPL',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Recent purchase',
      whatMatters:
        'Wednesday $315.34 (−0.28%) after the newsroom event: iPhone Duo + iPhone 18 Pro. Do not add on the event print.',
    },
    {
      ticker: 'VOO',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      role: 'Best simple core',
      whatMatters: `Wednesday $${vooClose.toFixed(2)} (${vooDayPct}%). New core money still simplifies here after a real cash session.`,
    },
    {
      ticker: 'VTI',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Broad US',
      whatMatters: `Wednesday $${vtiClose.toFixed(2)} (${vtiDayPct}%). Excellent fund; still overlaps VOO.`,
      overlapWith: ['VOO'],
    },
    {
      ticker: 'VUG',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Growth sleeve',
      whatMatters: `Wednesday $${vugClose.toFixed(2)} (${vugDayPct}%). Same mega-cap names you already own.`,
      overlapWith: ['NVDA', 'AAPL', 'VOO', 'MGK'],
    },
    {
      ticker: 'MGK',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Mega-cap growth',
      whatMatters: `Wednesday $${mgkClose.toFixed(2)} (${mgkDayPct}%). Even tighter overlap with NVDA and AAPL.`,
      overlapWith: ['NVDA', 'AAPL', 'VUG', 'VOO'],
    },
    {
      ticker: 'GDV',
      rating: 'HOLD — income / diversifier',
      tone: 'long' as const,
      role: 'Income sleeve',
      whatMatters: `Wednesday $${gdvClose.toFixed(2)} (${gdvDayPct}%). Different job. Not a growth engine.`,
    },
  ],
  portfolio: {
    concentrationThesis: 'VOO + VTI + VUG + MGK + AAPL + NVDA still buy the same companies.',
    concentrationBody:
      'Wednesday turned the whole stack red together: oil up, 10-year up, indexes down a third day. That is the overlap talking. Weights are still unknown, so size stays qualitative.',
    factorStack: ['NVDA', 'AAPL', 'MGK', 'VUG', 'VOO', 'VTI'],
    factorLabel: 'U.S. mega-cap / growth',
    overlapNote: 'same ecosystem',
  },
  names: [
    {
      ticker: 'NVDA',
      chapterTitle: 'NVDA · two red US sessions, guide unchanged',
      rating: 'HOLD — critical watch',
      tone: 'watch' as const,
      price: nvdaClose,
      dayPct: nvdaDayPct,
      holdNote: 'Two red sessions after Labor Day is not a buy. Guide is still $108.0B ±2%. Pre-market is not a cash print.',
      streak: [1.48, -1.51, 3.21, 1.8, 0.84, -2.01, -0.91],
      streakHeadline: 'Seven sourced US sessions: 3 red. Last two after Labor Day are red.',
      streakNote:
        'StockAnalysis / S&P Global: Aug 31 +1.48, Sep 1 −1.51, Sep 2 +3.21, Sep 3 +1.80, Sep 4 +0.84, Sep 8 −2.01, Sep 9 −0.91. Labor Day Sep 7 had no cash. Momentum formula counts red days in this window only. No 0–100 score.',
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
        note: 'NVIDIA IR August 26. Street consensus and whisper unread this sitting — not drawn. Next dividend $0.25 on Oct 1; record is today Sep 10 (same IR).',
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
        leftHeadline: '“Oil over $100 and a 4.84% 10-year can reprice the whole stack.”',
        leftBody:
          'Wednesday: Brent $101.21, WTI $96.05, 10-year 4.836%. Third down day on the S&P. NVDA $223.67 −0.91% after Tuesday −2.01%. IR still names independent compute-financing platforms targeting over $500B of third-party capital over time.',
        rightTitle: 'THE COUNTER',
        rightHeadline: 'Printed demand is still huge. Guide assumes no China DC compute.',
        rightBody:
          'Q2 revenue $96.2B. Data center $89.0B. Q3 guide $108.0B ±2%. A red oil session does not change the guide. Vera Rubin remains the production story on the IR tape. Tokyo finished +0.20% after a deep dip.',
      },
      interpretation: {
        chips: [
          {label: 'CONFIRMED', tone: 'long' as const, text: 'Q2 print and Q3 guide are official IR, not a rumor.'},
          {
            label: 'CONFIRMED',
            tone: 'watch' as const,
            text: 'Two red US sessions after Labor Day. That is a streak fact, not a regime score.',
          },
          {
            label: 'INFERENCE',
            tone: 'caution' as const,
            text: 'Oil and the 10-year moved together. CPI and FOMC still sit on this stack.',
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
            if: 'CPI or FOMC reprices the 10-year hard',
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
        headline: 'Polarity from IR + Wednesday tape — no composite score. Equal node size.',
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
      chapterTitle: 'AAPL · event printed, stock barely red',
      rating: 'HOLD',
      tone: 'long' as const,
      price: aaplClose,
      dayPct: aaplDayPct,
      holdNote: 'You already own it. An event day is not an add day.',
      catalyst: {
        headline: 'Apple newsroom Sep 9: iPhone Duo (first foldable) and iPhone 18 Pro / Pro Max.',
        steps: [
          'iPhone Duo: 7.6-in inner / 5.4-in outer, A20 Pro',
          'iPhone 18 Pro: 48MP Fusion Main, variable aperture',
          'Pro pre-order Sat Sep 12 · availability Fri Sep 18',
          'Duo pre-order Oct 16 · launch Oct 23',
        ],
        note: 'Official newsroom only. No unit guide. No revenue claim. Wednesday cash $315.34 (−0.28%).',
      },
      action: {
        headline: 'HOLD the position.',
        body: 'The event is real. The print is one quiet red day. YTD page unread this sitting — omitted. Do not stack another AAPL buy into the same mega-cap sleeve.',
      },
    },
    {
      ticker: 'VOO',
      chapterTitle: 'VOO · still the simple core',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      metrics: [{label: 'Wednesday', value: `$${vooClose.toFixed(2)}  ${vooDayPct}%`}],
      copy: {
        headline: 'Best simple core. New core money simplifies here.',
        body: 'Do not sell. Stop splitting every future contribution with VTI. Wednesday followed the S&P. YTD page unread this sitting — omitted.',
      },
    },
    {
      ticker: 'VTI',
      chapterTitle: 'VTI · excellent, overlapping',
      rating: 'HOLD',
      tone: 'long' as const,
      metrics: [{label: 'Wednesday', value: `$${vtiClose.toFixed(2)}  ${vtiDayPct}%`}],
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
      metrics: [{label: 'Wednesday', value: `$${vugClose.toFixed(2)}  ${vugDayPct}%`}],
      copy: {
        headline: 'You already own the individual winners.',
        body: 'HOLD existing. No priority additions. A third red index day is not a thesis change.',
      },
    },
    {
      ticker: 'MGK',
      chapterTitle: 'MGK · tighter overlap',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      metrics: [{label: 'Wednesday', value: `$${mgkClose.toFixed(2)}  ${mgkDayPct}%`}],
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
      id: 'bls-ppi-official',
      area: 'US' as const,
      question: 'What did the official BLS August PPI table print this morning?',
      whyItMatters:
        'BLS scheduled the release at 8:30 a.m. ET. The public page still showed July (final demand unchanged; +4.7% y/y) at this 09:00 wake. A recap is not the table.',
      neededToKnow: 'BLS ppi.nr0.htm / PDF for August 2026, or a screenshot Evens opens.',
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
      id: 'cad-official',
      area: 'CA' as const,
      question: 'What is the official CAD/USD close?',
      whyItMatters:
        'Canadian Press via BNN recapped 72.47 U.S. cents. A cents recap is not a lock. The Thursday contribution is in C$.',
      neededToKnow: 'Bank of Canada or an official FX close page.',
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
    {
      id: 'nvda-score',
      area: 'name' as const,
      ticker: 'NVDA',
      question: 'What is a composite NVDA score this morning?',
      whyItMatters: 'No 0–100 exists on this tape. A decorative score would be a lie.',
      neededToKnow: 'A named formula and inputs — or omit the score field.',
      status: 'unknown' as const,
    },
  ],
  scenarios: [],
  capitalPlan: {
    existingPortfolio: 'HOLD — sell nothing this morning.',
    freshCapital: 'No pre-open buy. New core money simplifies into VOO after a real cash session.',
    bestAdd: 'VOO',
    highestUpsideWatch: 'none named',
    biggestRisk: 'Mega-cap growth overlap across NVDA, AAPL, MGK, VUG, VOO, VTI — now sitting under a 4.84% 10-year and $100 Brent',
    nextTrigger: 'Official August PPI table · cash 9:30 ET · CPI Friday · FOMC Sep 15–16',
    ifThen: [
      {
        tone: 'long' as const,
        if: 'After a clean inflation tape the book needs cash put to work',
        then: 'VOO first',
      },
      {
        tone: 'watch' as const,
        if: 'CPI or FOMC reprices the 10-year hard',
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
      body: 'NVDA + AAPL + MGK + VUG + VOO + VTI repeatedly own the same mega-cap ecosystem. Wednesday they went red together.',
    },
    {
      n: '02',
      title: 'Interest rates + oil',
      body: `The 10-year closed ${tenYear}% — highest since late 2023. Brent settled $101.21. High long rates compress the exact overweight. Oil feeds the inflation tape into CPI and FOMC.`,
    },
    {
      n: '03',
      title: 'AI ROI / financed demand',
      body: 'IR still names third-party platforms targeting over $500B of AI infrastructure capital. The debate is still “will profits justify the buildout?” That sits under NVDA and most of the indirect book.',
    },
  ],
  close: {
    kicker: 'DIAGNOSTIC',
    headline: 'Wednesday was an oil-and-yield day, not a new book.',
    body: 'Seven names. Same overlap. Apple’s event is on the newsroom tape. Official PPI is not. After the open: numbers, then HOLD / VOO — Evens decides. No trade from this desk.',
    pills: [
      {tone: 'watch' as const, label: 'HOLD THIS MORNING'},
      {tone: 'caution' as const, label: 'NO PRE-OPEN BUY'},
      {tone: 'long' as const, label: 'VOO IF CASH MUST WORK'},
    ],
    followThrough: [
      {
        tone: 'watch' as const,
        if: 'PPI / CPI keep the 10-year bid',
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
    `AAPL  $${aaplClose.toFixed(2)}  ${aaplDayPct}%`,
    `10Y  ${tenYear}%`,
    `BRENT  $101.21`,
    `TSX  35,906.56  −0.60%`,
    `PPI TABLE UNREAD`,
    `VOO CORE / ADD`,
    `SELL NOTHING THIS MORNING`,
  ],
};

export const episode: DailyReport = parseDailyReport(raw);
