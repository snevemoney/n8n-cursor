import {parseDailyReport, type DailyReport} from '../schema';

// Friday 2026-09-04 cash (US/CA equity + Europe). Saturday 09:05 America/Toronto wake.
// Weekend: no new cash. Next US/CA session after Labor Day is Tuesday Sep 8.
const nvdaClose = 230.36;
const nvdaDayPct = 0.84;
const aaplClose = 319.97;
const aaplDayPct = -2.51;
const vooClose = 708.01;
const vooDayPct = -0.38;
const vtiClose = 379.73;
const vtiDayPct = -0.32;
const vugClose = 88.45;
const vugDayPct = -0.48;
const mgkClose = 90.23;
const mgkDayPct = -0.49;
const gdvClose = 29.98;
const gdvDayPct = -0.6;
const spxClose = 7718.6;
const spxDayPct = -0.38;
const spxYtdPct = 12.8;
const nasdaqDayPct = -0.29;
const tenYearFri = 4.78;
const nvdaGuide = 108.0;

const raw = {
  meta: {
    date: '2026-09-05',
    dateLabel: 'SEP 05, 2026',
    title: 'Daily Wealth Intelligence',
    thesis:
      'Friday the indexes faded after a hot August jobs print. The book did not move together. NVDA was green. AAPL was red. Same mega-cap names.',
    thesisLead: 'Friday the indexes faded.',
    thesisAccent: 'The book did not move together.',
    catalyst: 'August payrolls sourced via AP (+162,000). Official BLS table still blocked. Next: Labor Day Mon Sep 7; CPI recaps Sep 11; FOMC Sep 15–16.',
    kicker: 'Saturday morning · Friday cash · weekend',
    universe: ['AAPL', 'NVDA', 'VOO', 'VTI', 'VUG', 'MGK', 'GDV'],
  },
  market: {
    spxClose,
    spxDayPct,
    spxYtdPct,
    nasdaqDayPct,
    tenYearYield: tenYearFri,
    note: 'S&P 500 7,718.60 (−0.38%) after Thursday 7,747.71. AP YTD +12.8%. 10-year Friday recaps around 4.78% after Thursday ~4.76%. 2-year Friday 4.37% (AP).',
    nextCalendar: {
      label: 'Labor Day · then CPI / FOMC',
      detail: 'U.S. and Canada cash closed Monday Sep 7. Next cash Tuesday Sep 8. Calendar recaps name CPI Friday Sep 11. Fed calendar: FOMC Sep 15–16.',
    },
  },
  markets: {
    global: {
      indices: [
        {label: 'Nikkei 225', value: '65,020.94', dayPct: 1.26, note: 'Friday Tokyo close — last Asia print. Saturday Tokyo closed.'},
        {label: 'DAX', value: '26,048.38', dayPct: 0.17, note: 'Friday close recap; some Xetra services 26,046.40'},
        {label: 'FTSE 100', value: '10,831.09', note: 'Friday close; down 0.43 pts (AJ Bell / Alliance News)'},
      ],
      commodities: [
        {label: 'WTI crude', value: '$91.48', dayPct: 0.2, note: 'Friday NYMEX October settle; Thursday was $91.30'},
      ],
      rates: [{label: 'U.S. 10-year (Fri recap)', value: `${tenYearFri}%`}],
      fx: [{label: 'USD/CAD', note: 'Friday session recaps near 1.3839 (Newsquawk). CAD/USD close unread — omitted.'}],
      note: 'Europe barely moved. Oil still above $90. Tokyo last print is Friday. Weekend: no new Asia or Europe cash.',
    },
    us: {
      indices: [
        {label: 'S&P 500', value: '7,718.60', dayPct: spxDayPct},
        {label: 'Nasdaq', value: '26,506.99', dayPct: nasdaqDayPct},
        {label: 'Dow', value: '53,414.25', dayPct: -0.51},
      ],
      yields: [
        {label: 'U.S. 10-year Friday recap', value: `${tenYearFri}%`},
        {label: 'U.S. 2-year Friday (AP)', value: '4.37%'},
      ],
      note: 'AP: employers added 162,000 jobs in August. Recaps hold unemployment at 4.1%. Official BLS table blocked here. Indexes faded into the long weekend.',
    },
    ca: {
      indices: [{label: 'S&P/TSX Composite', value: '36,513.80', dayPct: -0.33}],
      note: 'Friday TSX −0.33% (Reuters / Canadian Press). StatCan: August employment −42,000; unemployment unchanged at 6.4%. BoC still on the Sep 2 hold at 2.25%. Next date October 28. CAD/USD Friday close unread. TSX Venture unread — omitted. Monday Labour Day — TSX closed.',
    },
    calendar: {
      items: [
        {
          when: 'Monday Sep 7',
          where: 'US' as const,
          label: 'Labor Day — U.S. cash closed',
          why: 'Next U.S. cash session is Tuesday Sep 8.',
        },
        {
          when: 'Monday Sep 7',
          where: 'CA' as const,
          label: 'Labour Day — TSX closed',
          why: 'Canada cash also shut. Next TSX session Tuesday Sep 8.',
        },
        {
          when: 'Friday Sep 11 8:30 a.m. ET',
          where: 'US' as const,
          label: 'CPI (August) — calendar recaps',
          why: 'Named as the last CPI before the September FOMC. Official BLS CPI page unread this sitting.',
        },
        {
          when: 'Sep 15–16 · decision Wed 2:00 p.m. ET',
          where: 'US' as const,
          label: 'FOMC + SEP',
          why: 'Federal Reserve September calendar. Friday jobs recaps lifted hike odds. CPI still unread.',
        },
        {
          when: 'October 28',
          where: 'CA' as const,
          label: 'Bank of Canada rate + MPR',
          why: 'September 2 hold at 2.25% still stands. August LFS is one print, not a rate call.',
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
      whatMatters: 'Friday $230.36 (+0.84%). IR Q3 guide still $108.0B ±2%. Green on a red index day is not a buy.',
    },
    {
      ticker: 'AAPL',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Recent purchase',
      whatMatters: 'Friday $319.97 (−2.51%) after Thursday $328.21. Do not add on a red Friday. Newsroom unread — no event claim.',
    },
    {
      ticker: 'VOO',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      role: 'Best simple core',
      whatMatters: `Friday $${vooClose.toFixed(2)} (${vooDayPct}%). New core money still simplifies here.`,
    },
    {
      ticker: 'VTI',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Broad US',
      whatMatters: `Friday $${vtiClose.toFixed(2)} (${vtiDayPct}%). Excellent fund; still overlaps VOO.`,
      overlapWith: ['VOO'],
    },
    {
      ticker: 'VUG',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Growth sleeve',
      whatMatters: `Friday $${vugClose.toFixed(2)} (${vugDayPct}%). Same mega-cap names you already own.`,
      overlapWith: ['NVDA', 'AAPL', 'VOO', 'MGK'],
    },
    {
      ticker: 'MGK',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Mega-cap growth',
      whatMatters: `Friday $${mgkClose.toFixed(2)} (${mgkDayPct}%). Even tighter overlap with NVDA and AAPL.`,
      overlapWith: ['NVDA', 'AAPL', 'VUG', 'VOO'],
    },
    {
      ticker: 'GDV',
      rating: 'HOLD — income / diversifier',
      tone: 'long' as const,
      role: 'Income sleeve',
      whatMatters: `Friday $${gdvClose.toFixed(2)} (${gdvDayPct}%). Different job. Not a growth engine.`,
    },
  ],
  portfolio: {
    concentrationThesis: 'VOO + VTI + VUG + MGK + AAPL + NVDA still buy the same companies.',
    concentrationBody:
      'Friday split the stack: NVDA up, AAPL down, the index sleeves a little red. That is still one U.S. mega-cap growth factor. Weights are still unknown, so size stays qualitative.',
    factorStack: ['NVDA', 'AAPL', 'MGK', 'VUG', 'VOO', 'VTI'],
    factorLabel: 'U.S. mega-cap / growth',
    overlapNote: 'same ecosystem',
  },
  names: [
    {
      ticker: 'NVDA',
      chapterTitle: 'NVDA · Friday green, same guide',
      rating: 'HOLD — critical watch',
      tone: 'watch' as const,
      price: nvdaClose,
      dayPct: nvdaDayPct,
      holdNote: 'One green Friday against a red tape is not a buy signal. Guide is still $108.0B ±2%.',
      streak: [1.8, 0.84],
      streakHeadline: 'Two sourced sessions: Thursday +1.80%, Friday +0.84%. Zero red in this window.',
      streakNote:
        'Older daily prints were not re-read this sitting. Momentum formula counts red days in this window only. No 0–100 score.',
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
        note: 'NVIDIA IR August 26. Street consensus and whisper unread this sitting — not drawn.',
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
        leftHeadline: '“A hot jobs print can reprice the 10-year and the whole growth stack.”',
        leftBody:
          'Friday indexes faded after AP’s +162,000 August payrolls reprint. IR still names independent compute-financing platforms targeting over $500B of third-party capital over time.',
        rightTitle: 'THE COUNTER',
        rightHeadline: 'Printed demand is still huge. Guide assumes no China DC compute.',
        rightBody:
          'Q2 revenue $96.2B. Data center $89.0B. Q3 guide $108.0B ±2%. Friday +0.84% does not change the guide. Vera Rubin remains the production story on the IR tape.',
      },
      interpretation: {
        chips: [
          {label: 'CONFIRMED', tone: 'long' as const, text: 'Q2 print and Q3 guide are official IR, not a rumor.'},
          {
            label: 'CONFIRMED',
            tone: 'watch' as const,
            text: 'Friday cash $230.36 (+0.84%) while the S&P faded 0.38%.',
          },
          {
            label: 'INFERENCE',
            tone: 'caution' as const,
            text: 'A two-session green window does not tell us whether $108B ±2% will be easy or tight.',
          },
        ],
        note: 'No composite score. No whisper zone. NVDA YTD unread on a quote page this sitting — omitted.',
      },
      actionMatrix: {
        headline: 'HOLD the line. Do not chase Friday.',
        rows: [
          {
            tone: 'long' as const,
            if: 'Guide holds and the book needs a named add',
            then: 'Still VOO first — not more NVDA on two green days',
          },
          {
            tone: 'watch' as const,
            if: 'CPI or FOMC reprices the 10-year hard',
            then: 'Re-read the growth stack. Do not invent a weekend trade.',
          },
          {
            tone: 'caution' as const,
            if: 'Guide or margin talk deteriorates',
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
        headline: 'Polarity from IR + Friday tape — no composite score. Equal node size.',
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
      chapterTitle: 'AAPL · Friday −2.5%, still HOLD',
      rating: 'HOLD',
      tone: 'long' as const,
      price: aaplClose,
      dayPct: aaplDayPct,
      holdNote: 'Do not add on a red Friday after a recent purchase. Next contribution should not double the same name.',
      action: {
        headline: 'HOLD the position.',
        body: 'Friday did the down-day. YTD page unread after the drop — omitted. Apple newsroom unread. Do not stack another AAPL buy.',
      },
    },
    {
      ticker: 'VOO',
      chapterTitle: 'VOO · still the simple core',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      metrics: [{label: 'Friday', value: `$${vooClose.toFixed(2)}  ${vooDayPct}%`}],
      copy: {
        headline: 'Best simple core. New core money simplifies here.',
        body: 'Do not sell. Stop splitting every future contribution with VTI. Friday followed the S&P. YTD page unread this sitting — omitted.',
      },
    },
    {
      ticker: 'VTI',
      chapterTitle: 'VTI · excellent, overlapping',
      rating: 'HOLD',
      tone: 'long' as const,
      metrics: [{label: 'Friday', value: `$${vtiClose.toFixed(2)}  ${vtiDayPct}%`}],
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
      metrics: [{label: 'Friday', value: `$${vugClose.toFixed(2)}  ${vugDayPct}%`}],
      copy: {
        headline: 'You already own the individual winners.',
        body: 'HOLD existing. No priority additions. Friday was a small red day, not a thesis change.',
      },
    },
    {
      ticker: 'MGK',
      chapterTitle: 'MGK · tighter overlap',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      metrics: [{label: 'Friday', value: `$${mgkClose.toFixed(2)}  ${mgkDayPct}%`}],
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
      id: 'bls-official-table',
      area: 'US' as const,
      question: 'What is on the official BLS August Employment Situation table?',
      whyItMatters: 'AP reprints +162,000 jobs and recaps hold unemployment at 4.1%. The official table was blocked here. We will not invent a score from that.',
      neededToKnow: 'BLS empsit table, or a screenshot Evens opens.',
      status: 'partial' as const,
    },
    {
      id: 'weights',
      area: 'book' as const,
      question: 'What is each line’s weight in the book?',
      whyItMatters: 'Concentration stays a count of overlapping lines until weights exist. We cannot size mega-cap.',
      neededToKnow: 'Sourced account weights. Do not estimate from prices.',
      status: 'unknown' as const,
    },
    {
      id: 'nvda-ytd-whisper',
      area: 'name' as const,
      ticker: 'NVDA',
      question: 'What is NVDA YTD on the same page as the $230.36 close — and is there a street whisper vs $108.0B ±2%?',
      whyItMatters: 'Expectation-risk stays UNKNOWN without a sourced whisper. No decorative YTD bar.',
      neededToKnow: 'A quote-page YTD and a named street/whisper print.',
      status: 'unknown' as const,
    },
    {
      id: 'cadusd-friday',
      area: 'CA' as const,
      question: 'What did CAD/USD actually close Friday?',
      whyItMatters: 'The book’s contribution is in C$. A USD/CAD session recap is not a CAD close.',
      neededToKnow: 'A sourced CAD/USD or USD/CAD official close.',
      status: 'unknown' as const,
    },
    {
      id: 'next-nvda',
      area: 'opportunity' as const,
      question: 'Is there a named Next-NVDA or non-book scout?',
      whyItMatters: 'Empty scout board stays empty. A chip rally recap is not a new book ticker.',
      neededToKnow: 'Evens or a filing names a ticker that is not already in the book.',
      status: 'unknown' as const,
    },
  ],
  scenarios: [],
  capitalPlan: {
    existingPortfolio: 'HOLD — sell nothing this weekend.',
    freshCapital: 'New core money still simplifies into VOO. Do not chase NVDA on two green days. Do not add AAPL on a −2.5% Friday.',
    bestAdd: 'VOO',
    highestUpsideWatch: 'none named',
    biggestRisk: 'Mega-cap growth overlap across NVDA, AAPL, MGK, VUG, VOO, VTI — plus a 10-year that can reprice on CPI / FOMC.',
    nextTrigger: 'Labor Day Mon Sep 7 · next cash Tue Sep 8 · CPI recaps Sep 11 · FOMC Sep 15–16',
    ifThen: [
      {
        tone: 'long' as const,
        if: 'The book needs cash put to work after a clean inflation tape',
        then: 'VOO first',
      },
      {
        tone: 'watch' as const,
        if: 'CPI or FOMC reprices the 10-year hard',
        then: 'HOLD the stack. Re-read duration risk. No weekend trade.',
      },
      {
        tone: 'caution' as const,
        if: 'NVDA guide or margin talk deteriorates',
        then: 'Do not automatically buy the dip',
      },
      {
        tone: 'short' as const,
        if: 'Demand talk breaks and NVDA gaps ~10%+',
        then: 'Consider reducing exposure — Evens decides',
      },
    ],
  },
  risks: [
    {
      n: '01',
      title: 'Growth-factor concentration',
      body: 'NVDA + AAPL + MGK + VUG + VOO + VTI repeatedly own the same mega-cap ecosystem. Three of seven lines list overlap. Weights unknown.',
    },
    {
      n: '02',
      title: 'Interest rates',
      body: `Friday 10-year recaps around ${tenYearFri}% after Thursday ~4.76%. Long rates still sit on the exact overweight.`,
    },
    {
      n: '03',
      title: 'Labor / inflation path',
      body: 'August U.S. payrolls reprinted +162,000 (AP). Canada −42,000 (StatCan). Official BLS table still blocked. CPI Sep 11 is the next named print.',
    },
    {
      n: '04',
      title: 'AI ROI / financed demand',
      body: 'IR is mobilizing over $500B of third-party capital for AI factories. That sits under NVDA and most of the indirect book.',
    },
  ],
  close: {
    kicker: 'DIAGNOSTIC',
    headline: 'Friday’s split tape is not a new book.',
    body: 'Indexes faded. Nvidia green. Apple red. Official BLS table still unread here. Oil still above $90. Sell nothing. If any C$ goes to work after the holiday, it still belongs in VOO.',
    pills: [
      {tone: 'watch' as const, label: 'HOLD THIS WEEKEND'},
      {tone: 'long' as const, label: 'VOO IF NEW CASH'},
      {tone: 'caution' as const, label: 'LABOR DAY THEN CPI'},
    ],
    followThrough: [
      {
        tone: 'watch' as const,
        if: 'NVDA stays the guide tape but the stock is unattractive',
        then: 'Do not invent a scout. Empty Next-NVDA stays empty.',
      },
      {
        tone: 'caution' as const,
        if: 'CPI or oil reprice inflation higher',
        then: 'More VOO / cash / non-AI quality — Evens decides.',
      },
      {
        tone: 'long' as const,
        if: 'An asymmetric candidate is named by Evens or a filing',
        then: 'That is when the Next-NVDA sleeve gets a name.',
      },
    ],
  },
  tickerTape: [
    `SPX  ${spxClose.toLocaleString('en-US')}  ${spxDayPct}%`,
    `SPX YTD  +${spxYtdPct}%`,
    `NASDAQ  ${nasdaqDayPct}%`,
    `NVDA  $${nvdaClose.toFixed(2)}  +${nvdaDayPct}%`,
    `AAPL  $${aaplClose.toFixed(2)}  ${aaplDayPct}%`,
    `VOO  $${vooClose.toFixed(2)}  ${vooDayPct}%`,
    `TSX  36,513.80  −0.33%`,
    `10Y  ~${tenYearFri}%`,
    `WTI  $91.48`,
    `JOBS  AP +162k / StatCan −42k`,
    `VOO CORE / ADD`,
    `SELL NOTHING THIS WEEKEND`,
  ],
};

export const episode: DailyReport = parseDailyReport(raw);
