import {vsSpxSpread} from '../compute';
import {parseDailyReport, type DailyReport} from '../schema';

// Thursday 2026-09-03 cash (US/CA equity). Friday 09:04 America/Toronto wake.
// US cash not open yet. August BLS print unread (official page blocked; recaps still forecast).
const nvdaClose = 228.45;
const nvdaDayPct = 1.8;
const aaplClose = 328.21;
const aaplDayPct = 1.0;
const aaplYtd = 21.06;
const spxClose = 7747.71;
const spxDayPct = 1.06;
const spxYtdPct = 13.18;
const nasdaqDayPct = 1.4;
const tenYearThu = 4.76;
const nvdaGuide = 108.0;

const raw = {
  meta: {
    date: '2026-09-04',
    dateLabel: 'SEP 04, 2026',
    title: 'Daily Wealth Intelligence',
    thesis:
      'Thursday the whole growth stack moved together again. Official August jobs are still unread. The book is the same U.S. mega-cap names.',
    thesisLead: 'Thursday the stack moved together.',
    thesisAccent: 'Official August jobs are still unread.',
    catalyst: 'August Employment Situation unread this sitting. Next named: CPI recaps Sep 11; FOMC Sep 15–16.',
    kicker: 'Friday morning · Thursday cash',
    universe: ['AAPL', 'NVDA', 'VOO', 'VTI', 'VUG', 'MGK', 'GDV'],
  },
  market: {
    spxClose,
    spxDayPct,
    spxYtdPct,
    nasdaqDayPct,
    tenYearYield: tenYearThu,
    note: 'S&P 500 7,747.71 (+1.06%) after Wednesday’s 7,666.60. 10-year Thursday recaps close near 4.76% (cluster 4.76–4.77) after Wednesday 4.796%.',
    nextCalendar: {
      label: 'August jobs unread · CPI / FOMC next',
      detail: 'BLS official August table was unread here. Calendar recaps name CPI Friday Sep 11. Fed calendar: FOMC Sep 15–16.',
    },
  },
  markets: {
    global: {
      indices: [
        {label: 'Nikkei 225', value: '65,020.94', dayPct: 1.26, note: 'Friday Tokyo close'},
        {label: 'DAX', value: '26,003.32', note: 'Thursday close recap; Friday Europe still open'},
        {label: 'FTSE 100', value: '10,831.52', dayPct: 0.7, note: 'Thursday close recap; Friday Europe still open'},
      ],
      commodities: [
        {label: 'WTI crude', value: '$91.30', dayPct: 0.32, note: 'Thursday NYMEX October close'},
      ],
      rates: [{label: 'U.S. 10-year (Thu recap close)', value: `${tenYearThu}%`}],
      fx: [{label: 'CAD/USD', value: '0.7251', note: 'Thursday close recap'}],
      note: 'Tokyo followed Thursday’s U.S. mega-cap bounce. Oil still above $90. Europe Friday cash not closed at write.',
    },
    us: {
      indices: [
        {label: 'S&P 500', value: '7,747.71', dayPct: spxDayPct},
        {label: 'Nasdaq', value: '26,584.06', dayPct: nasdaqDayPct},
        {label: 'Dow', value: '53,686.11', dayPct: 1.18},
      ],
      yields: [
        {label: 'U.S. 10-year Thursday recap', value: `${tenYearThu}%`},
        {label: 'U.S. 10-year Wednesday', value: '4.796%'},
      ],
      note: 'Thursday +1% across the board after Waller said he could support a hold if inflation keeps cooling. Friday cash not open at 9:04 ET.',
    },
    ca: {
      indices: [{label: 'S&P/TSX Composite', value: '36,633.12', dayPct: 1.5}],
      cadUsd: '0.7251',
      note: 'Thursday TSX +1.50% (Morningstar Data Talk). BoC still on the Sep 2 hold at 2.25%. Next date October 28. TSX Venture unread — omitted. Friday TSX not open.',
    },
    calendar: {
      items: [
        {
          when: 'This sitting',
          where: 'US' as const,
          label: 'BLS Employment Situation (August)',
          why: 'Due 8:30 a.m. ET. Official table unread here (bot block; republishers still showed forecast). Do not invent the print.',
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
          why: 'Federal Reserve September calendar: two-day meeting. Waller Thursday leaned hold if disinflation continues.',
        },
        {
          when: 'Monday Sep 7',
          where: 'US' as const,
          label: 'Labor Day — U.S. cash closed',
          why: 'Fed calendar names the holiday. Next U.S. cash session after Friday is Tuesday Sep 8.',
        },
        {
          when: 'October 28',
          where: 'CA' as const,
          label: 'Bank of Canada rate + MPR',
          why: 'September 2 hold at 2.25% still stands.',
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
      whatMatters: 'Thursday $228.45 (+1.80%). IR Q3 guide still $108.0B ±2%. Recaps name a $12.93B Hugging Face agreement. Not a new book line.',
    },
    {
      ticker: 'AAPL',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Recent purchase',
      whatMatters: 'Thursday $328.21 (+1.00%). Yahoo YTD +21.06% vs S&P +13.18%. Apple newsroom unread — no event claim.',
      ytd: aaplYtd,
    },
    {
      ticker: 'VOO',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      role: 'Best simple core',
      whatMatters: 'Thursday $710.72 (+1.04%). New core money still simplifies here.',
    },
    {
      ticker: 'VTI',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Broad US',
      whatMatters: 'Thursday $380.93 (+1.07%). Yahoo chart YTD +13.62%. Excellent fund; still overlaps VOO.',
      overlapWith: ['VOO'],
    },
    {
      ticker: 'VUG',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Growth sleeve',
      whatMatters: 'Thursday $88.88 (+1.46%). Same mega-cap names you already own. YTD page was as-of Wednesday — omitted.',
      overlapWith: ['NVDA', 'AAPL', 'VOO', 'MGK'],
    },
    {
      ticker: 'MGK',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Mega-cap growth',
      whatMatters: 'Thursday $90.67 (+1.56%). Even tighter overlap with NVDA and AAPL.',
      overlapWith: ['NVDA', 'AAPL', 'VUG', 'VOO'],
    },
    {
      ticker: 'GDV',
      rating: 'HOLD — income / diversifier',
      tone: 'long' as const,
      role: 'Income sleeve',
      whatMatters: 'Thursday $30.16 (+0.90%). Yahoo YTD +13.19% vs S&P +13.18%. Different job. Not a growth engine.',
      ytd: 13.19,
    },
  ],
  portfolio: {
    concentrationThesis: 'VOO + VTI + VUG + MGK + AAPL + NVDA still buy the same companies.',
    concentrationBody:
      'Thursday’s +1% day lit several lines at once because they share the same U.S. mega-cap growth factor. Weights are still unknown, so size stays qualitative.',
    factorStack: ['NVDA', 'AAPL', 'MGK', 'VUG', 'VOO', 'VTI'],
    factorLabel: 'U.S. mega-cap / growth',
    overlapNote: 'same ecosystem',
  },
  names: [
    {
      ticker: 'NVDA',
      chapterTitle: 'NVDA · Thursday green, same guide',
      rating: 'HOLD — critical watch',
      tone: 'watch' as const,
      price: nvdaClose,
      dayPct: nvdaDayPct,
      holdNote: 'Two green sessions in a row is not a buy signal. Guide is still $108.0B ±2%. Hugging Face is not a new holding.',
      streak: [-1.59, 8.74, -4.57, 1.48, -1.51, 3.21, 1.8],
      streakHeadline: 'Seven sessions: three red. Thursday +1.80% after Wednesday +3.21%.',
      streakNote: 'Momentum formula counts red days in this window only. No 0–100 score. Friday pre-market recaps are not cash.',
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
        note: 'NVIDIA IR August 26. Street consensus and whisper unread this sitting — not drawn. Hugging Face recaps are not a revenue guide.',
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
        leftHeadline: '“AI factories need other people’s money — and now a software platform too.”',
        leftBody:
          'IR still names independent compute-financing platforms targeting over $500B of third-party capital over time. Thursday recaps add a $12.93B Hugging Face agreement from Huang’s blog. We did not open an 8-K this sitting.',
        rightTitle: 'THE COUNTER',
        rightHeadline: 'Printed demand is still huge. Guide assumes no China DC compute.',
        rightBody:
          'Q2 revenue $96.2B. Data center $89.0B. Q3 guide $108.0B ±2%. A deal recap does not replace the guide. Vera Rubin remains the production story on the IR tape.',
      },
      interpretation: {
        chips: [
          {label: 'CONFIRMED', tone: 'long' as const, text: 'Q2 print and Q3 guide are official IR, not a rumor.'},
          {
            label: 'CONFIRMED',
            tone: 'watch' as const,
            text: 'Thursday recaps name a $12.93B Hugging Face agreement. Not a new book ticker.',
          },
          {
            label: 'INFERENCE',
            tone: 'caution' as const,
            text: 'Two green days do not tell us whether $108B ±2% will be easy or tight.',
          },
        ],
        note: 'No composite score. No whisper zone. NVDA YTD unread on the quote page this sitting — omitted. Missing street number stays UNKNOWN.',
      },
      actionMatrix: {
        headline: 'HOLD the line. Do not chase Thursday.',
        rows: [
          {
            tone: 'long' as const,
            if: 'Guide holds and the book needs a named add',
            then: 'Still VOO first — not more NVDA on two green days',
          },
          {
            tone: 'watch' as const,
            if: 'The unread jobs print later reprices rates hard',
            then: 'Re-read the growth stack. Do not invent a trade overnight.',
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
        headline: 'Polarity from IR + Thursday recaps — no composite score. Equal node size.',
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
      chapterTitle: 'AAPL · Thursday +1%, still HOLD',
      rating: 'HOLD',
      tone: 'long' as const,
      price: aaplClose,
      dayPct: aaplDayPct,
      holdNote: 'Do not add on one green Thursday. Next contribution should not double the same name.',
      returns: {
        headline: 'Still ahead of the S&P YTD. Apple newsroom was unread this sitting — no event claim.',
        bars: [
          {label: 'AAPL YTD', pct: aaplYtd, tone: 'long' as const},
          {label: 'S&P YTD', pct: spxYtdPct, tone: 'muted' as const},
        ],
        note: `Spread vs S&P YTD: ${vsSpxSpread(aaplYtd, spxYtdPct) >= 0 ? '+' : ''}${vsSpxSpread(aaplYtd, spxYtdPct).toFixed(1)} points. Yahoo trailing total returns as of 9/3/2026.`,
      },
      action: {
        headline: 'HOLD the position.',
        body: 'Thursday did the up-day. Recaps name a Sept 9 hardware event; we did not open Apple newsroom. Do not stack another AAPL buy on a recent purchase.',
      },
    },
    {
      ticker: 'VOO',
      chapterTitle: 'VOO · still the simple core',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      metrics: [{label: 'Thursday', value: '$710.72  +1.04%'}],
      copy: {
        headline: 'Best simple core. New core money simplifies here.',
        body: 'Do not sell. Stop splitting every future contribution with VTI. Yahoo YTD daily total return was as-of Wednesday (12.85%) — omitted as stale.',
      },
    },
    {
      ticker: 'VTI',
      chapterTitle: 'VTI · excellent, overlapping',
      rating: 'HOLD',
      tone: 'long' as const,
      metrics: [
        {label: 'Thursday', value: '$380.93  +1.07%'},
        {label: 'YTD (Yahoo chart)', value: '+13.62%'},
      ],
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
      metrics: [{label: 'Thursday', value: '$88.88  +1.46%'}],
      copy: {
        headline: 'You already own the individual winners.',
        body: 'HOLD existing. No priority additions. Yahoo YTD 7.98% was as-of Wednesday — omitted.',
      },
    },
    {
      ticker: 'MGK',
      chapterTitle: 'MGK · tighter overlap',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      metrics: [{label: 'Thursday', value: '$90.67  +1.56%'}],
      copy: {
        body: 'You already own NVDA and AAPL directly. HOLD. Stop feeding it. Not a sell call — tax and account mechanics are not on this tape.',
      },
    },
    {
      ticker: 'GDV',
      chapterTitle: 'GDV · a different job',
      rating: 'HOLD · INCOME / DIVERSIFIER',
      tone: 'long' as const,
      metrics: [
        {label: 'Market', value: '$30.16  +0.90%'},
        {label: 'YTD vs S&P', value: '+13.19% / +13.18%'},
      ],
      copy: {
        body: 'Closed-end income/value. Yahoo trailing as of 9/3. NAV and discount unread this sitting — omitted. Forward yield page ~5.97%. Not “Next NVDA.”',
      },
    },
  ],
  nextNvda: [],
  unknowns: [
    {
      id: 'aug-payrolls',
      area: 'US' as const,
      question: 'What did BLS actually print for August payrolls and the unemployment rate?',
      whyItMatters: 'Friday’s named catalyst. A forecast is not a print. We will not invent jobs or a score from recaps.',
      neededToKnow: 'BLS Employment Situation table or a republisher that quotes the official August headline.',
      status: 'unknown' as const,
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
      question: 'What is NVDA YTD on the same page as the $228.45 close — and is there a street whisper vs $108.0B ±2%?',
      whyItMatters: 'Yahoo NVDA quote timed out. Expectation-risk stays UNKNOWN without a sourced whisper. No decorative YTD bar.',
      neededToKnow: 'A quote-page YTD and a named street/whisper print.',
      status: 'unknown' as const,
    },
    {
      id: 'aapl-catalyst',
      area: 'name' as const,
      ticker: 'AAPL',
      question: 'What is Apple’s next official catalyst?',
      whyItMatters: 'Recaps name Sept 9. Newsroom was unread. We will not carry an event date from memory.',
      neededToKnow: 'Apple newsroom or IR notice with a dated event.',
      status: 'unknown' as const,
    },
    {
      id: 'next-nvda',
      area: 'opportunity' as const,
      question: 'Is there a named Next-NVDA or non-book scout?',
      whyItMatters: 'Hugging Face is a deal recap on NVDA, not a new book ticker. Empty scout board stays empty.',
      neededToKnow: 'Evens or a filing names a ticker that is not already in the book.',
      status: 'unknown' as const,
    },
  ],
  scenarios: [],
  capitalPlan: {
    existingPortfolio: 'HOLD — sell nothing this morning.',
    freshCapital: 'New core money still simplifies into VOO. Do not chase NVDA on two green days. Do not invent a jobs trade.',
    bestAdd: 'VOO',
    highestUpsideWatch: 'none named',
    biggestRisk: 'Mega-cap growth overlap across NVDA, AAPL, MGK, VUG, VOO, VTI — plus an unread jobs print that can reprice the 10-year.',
    nextTrigger: 'Unread August jobs · then CPI recaps Sep 11 · FOMC Sep 15–16',
    ifThen: [
      {
        tone: 'long' as const,
        if: 'The book needs cash put to work after a clean labor/inflation tape',
        then: 'VOO first',
      },
      {
        tone: 'watch' as const,
        if: 'The jobs print (once sourced) reprices the 10-year hard',
        then: 'HOLD the stack. Re-read duration risk. No overnight trade.',
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
      body: `Thursday 10-year recaps near ${tenYearThu}% after Wednesday 4.796%. Long rates still sit on the exact overweight.`,
    },
    {
      n: '03',
      title: 'Unread labor print',
      body: 'August payrolls were due 8:30 a.m. ET. Official table unread. A forecast is not a number we can put on the board.',
    },
    {
      n: '04',
      title: 'AI ROI / financed demand',
      body: 'IR is mobilizing over $500B of third-party capital for AI factories. Thursday recaps add Hugging Face. That sits under NVDA and most of the indirect book.',
    },
  ],
  close: {
    kicker: 'DIAGNOSTIC',
    headline: 'Thursday’s +1% is not a new book.',
    body: 'Nvidia and Apple both green. The sleeves followed. Official August jobs unread. Oil still above $90. Sell nothing. Do not invent a payrolls trade. If any C$ goes to work, it still belongs in VOO.',
    pills: [
      {tone: 'watch' as const, label: 'HOLD THIS MORNING'},
      {tone: 'long' as const, label: 'VOO IF NEW CASH'},
      {tone: 'caution' as const, label: 'JOBS PRINT UNREAD'},
    ],
    followThrough: [
      {
        tone: 'watch' as const,
        if: 'NVDA stays the guide tape but the stock is unattractive',
        then: 'Do not invent a scout. Empty Next-NVDA stays empty.',
      },
      {
        tone: 'caution' as const,
        if: 'Once sourced, jobs or oil reprice inflation higher',
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
    `SPX  ${spxClose.toLocaleString('en-US')}  +${spxDayPct}%`,
    `SPX YTD  +${spxYtdPct}%`,
    `NASDAQ  +${nasdaqDayPct}%`,
    `NVDA  $${nvdaClose.toFixed(2)}  +${nvdaDayPct}%`,
    `AAPL  $${aaplClose.toFixed(2)}  +${aaplDayPct}%`,
    `VOO  $710.72  +1.04%`,
    `TSX  36,633.12  +1.50%`,
    `10Y  ~${tenYearThu}%`,
    `WTI  $91.30`,
    `NIKKEI  65,020.94  +1.26%`,
    `JOBS PRINT  UNREAD`,
    `VOO CORE / ADD`,
    `SELL NOTHING THIS MORNING`,
  ],
};

export const episode: DailyReport = parseDailyReport(raw);
