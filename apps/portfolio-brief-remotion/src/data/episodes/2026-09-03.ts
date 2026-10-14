import {vsSpxSpread} from '../compute';
import {parseDailyReport, type DailyReport} from '../schema';

// Wednesday 2026-09-02 cash (US/CA equity). Thursday 09:03 America/Toronto wake.
// GLOBAL Europe/Asia + FX + oil + TNX from Yahoo chart at write. BoC + NVIDIA IR official.
const nvdaClose = 224.41;
const nvdaDayPct = 3.205;
const nvdaYtd = 20.33;
const aaplClose = 324.96;
const aaplDayPct = -0.052;
const aaplYtd = 19.53;
const spxClose = 7666.6;
const spxDayPct = 0.46;
const spxYtdPct = 11.99;
const nasdaqDayPct = 0.452;
const tenYearWed = 4.796;
const tenYearThuLive = 4.746;
const nvdaGuide = 108.0;

const raw = {
  meta: {
    date: '2026-09-03',
    dateLabel: 'SEP 03, 2026',
    title: 'Daily Wealth Intelligence',
    thesis:
      'Wednesday bounced. Nvidia led. The book is still the same U.S. mega-cap growth stack. Bank of Canada held. Friday’s U.S. jobs print is next.',
    thesisLead: 'Wednesday bounced. The stack did not change.',
    thesisAccent: 'Nvidia led. Friday payrolls is next.',
    catalyst: 'Friday — BLS Employment Situation (August), 8:30 a.m. ET.',
    kicker: 'Thursday morning · Wednesday cash',
    universe: ['AAPL', 'NVDA', 'VOO', 'VTI', 'VUG', 'MGK', 'GDV'],
  },
  market: {
    spxClose,
    spxDayPct,
    spxYtdPct,
    nasdaqDayPct,
    tenYearYield: tenYearWed,
    note: 'S&P 500 7,666.60 (+0.46%) after Tuesday’s 7,631.47. 10-year Wednesday 4.796%; Thursday morning live 4.746%.',
    nextCalendar: {
      label: 'U.S. August payrolls',
      detail: 'BLS Employment Situation Friday 8:30 a.m. ET. July JOLTS openings were little changed at 7.3 million.',
    },
  },
  markets: {
    global: {
      indices: [
        {label: 'Nikkei 225', value: '64,214.48', dayPct: -0.173, note: 'Thursday Tokyo session'},
        {label: 'DAX', value: '25,907.74', dayPct: 0.265, note: 'Thursday Europe live'},
        {label: 'FTSE 100', value: '10,829.75', dayPct: 0.681, note: 'Thursday Europe live'},
      ],
      commodities: [
        {label: 'WTI crude', value: '$91.01', dayPct: 0.876, note: 'Wednesday close; Thursday morning live $91.92'},
      ],
      rates: [{label: 'U.S. 10-year (Wed close)', value: `${tenYearWed}%`}],
      fx: [{label: 'CAD/USD', value: '0.7251', dayPct: 0.368, note: 'Thursday morning live'}],
      note: 'Oil still above $90. BoC named high energy prices and new U.S./Canada tariffs as inflation and growth risks.',
    },
    us: {
      indices: [
        {label: 'S&P 500', value: '7,666.60', dayPct: spxDayPct},
        {label: 'Nasdaq', value: '26,217.83', dayPct: nasdaqDayPct},
        {label: 'Dow', value: '53,061.95', dayPct: 0.559},
      ],
      yields: [
        {label: 'U.S. 10-year Wednesday', value: `${tenYearWed}%`},
        {label: 'U.S. 10-year Thursday live', value: `${tenYearThuLive}%`},
      ],
      note: 'Wednesday bounce after Tuesday’s red. Nvidia +3.21% led the book. Apple was flat (−0.05%).',
    },
    ca: {
      indices: [{label: 'S&P/TSX Composite', value: '36,091.61', dayPct: 0.742}],
      cadUsd: '0.7251',
      note: 'BoC held the overnight target at 2.25% on September 2 (Bank Rate 2.50%, deposit 2.20%). Next date October 28. TSX Venture unread — omitted.',
    },
    calendar: {
      items: [
        {
          when: 'Friday 8:30 a.m. ET',
          where: 'US' as const,
          label: 'BLS Employment Situation (August)',
          why: 'July JOLTS openings were little changed at 7.3 million (USDL-26-1432). Friday is the next official labor print.',
        },
        {
          when: 'October 28',
          where: 'CA' as const,
          label: 'Bank of Canada rate + MPR',
          why: 'September 2 hold at 2.25%. Governing Council flagged higher upside inflation risk from oil and new tariffs.',
        },
        {
          when: 'September 10 / October 1',
          where: 'US' as const,
          label: 'NVIDIA $0.25 dividend',
          why: 'Record date September 10. Pay date October 1. IR Q3 revenue guide remains $108.0B ±2%.',
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
      whatMatters: 'Wednesday +3.21% to $224.41. IR Q3 guide still $108.0B ±2%, no China data-center compute.',
      ytd: nvdaYtd,
    },
    {
      ticker: 'AAPL',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Recent purchase',
      whatMatters: 'Wednesday $324.96 (−0.05%) after Tuesday’s +2.61%. Apple newsroom catalyst unread this sitting.',
      ytd: aaplYtd,
    },
    {
      ticker: 'VOO',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      role: 'Best simple core',
      whatMatters: 'Wednesday $703.41 (+0.45%). New core money still simplifies here.',
    },
    {
      ticker: 'VTI',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Broad US',
      whatMatters: 'Wednesday $376.88 (+0.46%). Excellent fund; still overlaps VOO.',
      overlapWith: ['VOO'],
    },
    {
      ticker: 'VUG',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Growth sleeve',
      whatMatters: 'Wednesday $87.60 (+0.26%). Same mega-cap names you already own.',
      overlapWith: ['NVDA', 'AAPL', 'VOO', 'MGK'],
    },
    {
      ticker: 'MGK',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Mega-cap growth',
      whatMatters: 'Wednesday $89.28 (+0.27%). Even tighter overlap with NVDA and AAPL.',
      overlapWith: ['NVDA', 'AAPL', 'VUG', 'VOO'],
    },
    {
      ticker: 'GDV',
      rating: 'HOLD — income / diversifier',
      tone: 'long' as const,
      role: 'Income sleeve',
      whatMatters: 'Wednesday $29.89 (−0.10%). Different job. Not a growth engine.',
    },
  ],
  portfolio: {
    concentrationThesis: 'VOO + VTI + VUG + MGK + AAPL + NVDA still buy the same companies.',
    concentrationBody:
      'Wednesday’s bounce lit several lines at once because they share the same U.S. mega-cap growth factor. Weights are still unknown, so size stays qualitative.',
    factorStack: ['NVDA', 'AAPL', 'MGK', 'VUG', 'VOO', 'VTI'],
    factorLabel: 'U.S. mega-cap / growth',
    overlapNote: 'same ecosystem',
  },
  names: [
    {
      ticker: 'NVDA',
      chapterTitle: 'NVDA · bounce, same guide',
      rating: 'HOLD — critical watch',
      tone: 'watch' as const,
      price: nvdaClose,
      dayPct: nvdaDayPct,
      holdNote: 'One green session after Tuesday’s −1.51% is not a buy signal. Guide is still the tape.',
      streak: [2.19, -1.59, 8.74, -4.57, 1.48, -1.51, 3.21],
      streakHeadline: 'Seven sessions: three red. Wednesday +3.21% after Tuesday −1.51%.',
      streakNote: 'Momentum formula counts red days in this window only. No 0–100 score.',
      fundamentals: [
        {label: 'Q2 FY27 revenue', value: '$96.2B  +106% y/y'},
        {label: 'Q2 data center', value: '$89.0B  +117% y/y'},
        {label: 'Q2 GAAP / non-GAAP EPS', value: '$2.46  /  $2.22'},
        {label: 'Q2 gross margin', value: '75.0%'},
        {label: 'Q3 revenue guide', value: '$108.0B ±2%'},
        {label: 'Q3 gross margin guide', value: '74.0% ±50 bps'},
      ],
      vsSpx: {
        headline: 'YTD still ahead of the S&P. One bounce does not settle the guide.',
        bars: [
          {label: 'NVDA YTD', pct: nvdaYtd, tone: 'nvda' as const},
          {label: 'S&P YTD', pct: spxYtdPct, tone: 'muted' as const},
        ],
        note: `Spread: ${vsSpxSpread(nvdaYtd, spxYtdPct) >= 0 ? '+' : ''}${vsSpxSpread(nvdaYtd, spxYtdPct).toFixed(1)} points (NVDA YTD − S&P YTD). Yahoo ytd vs prior close.`,
      },
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
        leftHeadline: '“AI factories need other people’s money.”',
        leftBody:
          'IR named independent compute-financing platforms with Apollo, BlackRock, Blackstone, Brookfield, Goldman Sachs and KKR, targeting over $500B of third-party capital over time, subject to definitive agreements.',
        rightTitle: 'THE COUNTER',
        rightHeadline: 'Printed demand is still huge. Guide assumes no China DC compute.',
        rightBody:
          'Q2 revenue $96.2B. Data center $89.0B. Q3 guide $108.0B ±2%. Vera Rubin in full production at named cloud partners. Huang: compute is revenue.',
      },
      interpretation: {
        chips: [
          {label: 'CONFIRMED', tone: 'long' as const, text: 'Q2 print and Q3 guide are official IR, not a rumor.'},
          {
            label: 'CONFIRMED',
            tone: 'watch' as const,
            text: 'Nvidia is helping mobilize third-party capital for the same buildout.',
          },
          {
            label: 'INFERENCE',
            tone: 'caution' as const,
            text: 'A +3% Wednesday does not tell us whether $108B ±2% will be easy or tight.',
          },
        ],
        note: 'No composite score. No whisper zone. Missing street number stays UNKNOWN.',
      },
      actionMatrix: {
        headline: 'HOLD the line. Do not chase Wednesday.',
        rows: [
          {
            tone: 'long' as const,
            if: 'Guide holds and the book needs a named add',
            then: 'Still VOO first — not more NVDA on one bounce',
          },
          {
            tone: 'watch' as const,
            if: 'Friday payrolls reprice rates hard',
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
        headline: 'Polarity from IR — no composite score. Equal node size.',
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
      chapterTitle: 'AAPL · flat after Tuesday',
      rating: 'HOLD',
      tone: 'long' as const,
      price: aaplClose,
      dayPct: aaplDayPct,
      holdNote: 'Do not add on a flat Wednesday. Next contribution should not double the same name.',
      returns: {
        headline: 'Still ahead of the S&P YTD. Apple newsroom was unread this sitting — no event claim.',
        bars: [
          {label: 'AAPL YTD', pct: aaplYtd, tone: 'long' as const},
          {label: 'S&P YTD', pct: spxYtdPct, tone: 'muted' as const},
        ],
        note: `Spread vs S&P YTD: ${vsSpxSpread(aaplYtd, spxYtdPct) >= 0 ? '+' : ''}${vsSpxSpread(aaplYtd, spxYtdPct).toFixed(1)} points. Yahoo ytd vs prior close.`,
      },
      action: {
        headline: 'HOLD the position.',
        body: 'Tuesday already did the up-day. Wednesday was flat. Do not stack another AAPL buy on top of a recent purchase.',
      },
    },
    {
      ticker: 'VOO',
      chapterTitle: 'VOO · still the simple core',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      metrics: [{label: 'Wednesday', value: '$703.41  +0.45%'}],
      copy: {
        headline: 'Best simple core. New core money simplifies here.',
        body: 'Do not sell. Stop splitting every future contribution with VTI. YTD unread this sitting — omitted.',
      },
    },
    {
      ticker: 'VTI',
      chapterTitle: 'VTI · excellent, overlapping',
      rating: 'HOLD',
      tone: 'long' as const,
      metrics: [{label: 'Wednesday', value: '$376.88  +0.46%'}],
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
      metrics: [{label: 'Wednesday', value: '$87.60  +0.26%'}],
      copy: {
        headline: 'You already own the individual winners.',
        body: 'HOLD existing. No priority additions. YTD unread this sitting — omitted.',
      },
    },
    {
      ticker: 'MGK',
      chapterTitle: 'MGK · tighter overlap',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      metrics: [{label: 'Wednesday', value: '$89.28  +0.27%'}],
      copy: {
        body: 'You already own NVDA and AAPL directly. HOLD. Stop feeding it. Not a sell call — tax and account mechanics are not on this tape.',
      },
    },
    {
      ticker: 'GDV',
      chapterTitle: 'GDV · a different job',
      rating: 'HOLD · INCOME / DIVERSIFIER',
      tone: 'long' as const,
      metrics: [{label: 'Market', value: '$29.89'}],
      copy: {
        body: 'Closed-end income/value. Wednesday −0.10%. NAV and discount unread this sitting — omitted. Not “Next NVDA.”',
      },
    },
  ],
  nextNvda: [],
  unknowns: [
    {
      id: 'weights',
      area: 'book' as const,
      question: 'What is each line’s weight in the book?',
      whyItMatters: 'Concentration stays a count of overlapping lines until weights exist. We cannot size mega-cap.',
      neededToKnow: 'Sourced account weights. Do not estimate from prices.',
      status: 'unknown' as const,
    },
    {
      id: 'nvda-whisper',
      area: 'name' as const,
      ticker: 'NVDA',
      question: 'Where is street Q3 revenue vs the $108.0B ±2% guide — and is there a whisper?',
      whyItMatters: 'Expectation-risk formula stays UNKNOWN without a sourced whisper. A decorative zone would be a lie.',
      neededToKnow: 'A named street/whisper print from a filing or consensus page.',
      status: 'unknown' as const,
    },
    {
      id: 'aapl-catalyst',
      area: 'name' as const,
      ticker: 'AAPL',
      question: 'What is Apple’s next official catalyst?',
      whyItMatters: 'Newsroom HTML was empty this sitting. We will not carry an event date from memory.',
      neededToKnow: 'Apple newsroom or IR notice with a dated event.',
      status: 'unknown' as const,
    },
    {
      id: 'adp-official',
      area: 'US' as const,
      question: 'What did ADP actually print for August?',
      whyItMatters: 'Secondary recaps circulated. The official ADP table was unread. We will not use a second-hand jobs number.',
      neededToKnow: 'ADP National Employment Report page or release PDF.',
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
  ],
  scenarios: [],
  capitalPlan: {
    existingPortfolio: 'HOLD — sell nothing this morning.',
    freshCapital: 'New core money still simplifies into VOO. Do not chase NVDA on one bounce.',
    bestAdd: 'VOO',
    highestUpsideWatch: 'none named',
    biggestRisk: 'Mega-cap growth overlap across NVDA, AAPL, MGK, VUG, VOO, VTI — plus oil-and-tariff inflation risk named by BoC.',
    nextTrigger: 'Friday — BLS August Employment Situation, 8:30 a.m. ET',
    ifThen: [
      {
        tone: 'long' as const,
        if: 'Payrolls land clean and the book needs cash put to work',
        then: 'VOO first',
      },
      {
        tone: 'watch' as const,
        if: 'Payrolls reprice the 10-year hard',
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
      body: `Wednesday 10-year 4.796%. Thursday morning live 4.746%. Long rates still sit on the exact overweight.`,
    },
    {
      n: '03',
      title: 'Oil, tariffs, inflation spillover',
      body: 'BoC held 2.25% and said upside inflation risks rose: oil still high, Hormuz still tight, new U.S. and Canadian tariffs after talks broke down. WTI Wednesday $91.01.',
    },
    {
      n: '04',
      title: 'AI ROI / financed demand',
      body: 'IR is mobilizing over $500B of third-party capital for AI factories. That sits under NVDA and most of the indirect book.',
    },
  ],
  close: {
    kicker: 'DIAGNOSTIC',
    headline: 'Wednesday’s bounce is not a new book.',
    body: 'Nvidia led. Apple was flat. Bank of Canada held 2.25%. Oil is still above $90. Sell nothing. Watch Friday’s payrolls. Then decide whether any C$ contribution still belongs in VOO.',
    pills: [
      {tone: 'watch' as const, label: 'HOLD THIS MORNING'},
      {tone: 'long' as const, label: 'VOO IF NEW CASH'},
      {tone: 'caution' as const, label: 'FRIDAY PAYROLLS'},
    ],
    followThrough: [
      {
        tone: 'watch' as const,
        if: 'NVDA stays the guide tape but the stock is unattractive',
        then: 'Do not invent a scout. Empty Next-NVDA stays empty.',
      },
      {
        tone: 'caution' as const,
        if: 'Payrolls or oil reprice inflation higher',
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
    `AAPL  $${aaplClose.toFixed(2)}  ${aaplDayPct}%`,
    `TSX  36,091.61  +0.74%`,
    `10Y WED  ${tenYearWed}%`,
    `WTI WED  $91.01`,
    `BOC  2.25% HOLD`,
    `NFP  FRIDAY`,
    `VOO CORE / ADD`,
    `SELL NOTHING`,
  ],
};

export const episode: DailyReport = parseDailyReport(raw);
