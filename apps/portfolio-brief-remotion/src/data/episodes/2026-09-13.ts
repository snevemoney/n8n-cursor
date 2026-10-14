import {parseDailyReport, type DailyReport} from '../schema';

// Sunday 2026-09-13 America/Toronto (~09:03 EDT). Weekend.
// Last US / CA / Asia cash is still Friday 2026-09-11. Sunday sessions
// are closed — do not invent a weekend print. Saturday Pro pre-orders
// opened (AppleInsider + Apple newsroom schedule). Registered prior on
// this tree is 2026-08-25. 2026-09-12 is still only on open PR 275.
const nvdaClose = 218.29;
const nvdaDayPct = -0.03;
const aaplClose = 332.27;
const aaplDayPct = 1.75;
const vooClose = 702.56;
const vooDayPct = 0.85;
const vtiClose = 376.31;
const vtiDayPct = 0.82;
const vugClose = 88.02;
const vugDayPct = 0.9;
const mgkClose = 89.9;
const mgkDayPct = 0.91;
const gdvClose = 29.55;
const gdvDayPct = 0.51;
const spxClose = 7656.98;
const spxDayPct = 0.86;
const nasdaqDayPct = 0.96;
const tenYearRecap = 4.96;
const nvdaGuide = 108.0;

const raw = {
  meta: {
    date: '2026-09-13',
    dateLabel: 'SEP 13, 2026',
    title: 'Daily Wealth Intelligence',
    thesis:
      'Sunday is closed. Last cash is still Friday. The book is the same seven lines. Apple Pro pre-orders opened yesterday. FOMC starts Tuesday.',
    thesisLead: 'Sunday is closed.',
    thesisAccent: 'Last cash is Friday. FOMC is two days away.',
    catalyst: 'FOMC Sep 15–16 (Fed calendar, SEP). Weekend — no new US/CA/Asia cash.',
    kicker: 'Weekend wrap · Pro pre-order live · FOMC Tue–Wed',
    universe: ['AAPL', 'NVDA', 'VOO', 'VTI', 'VUG', 'MGK', 'GDV'],
  },
  market: {
    spxClose,
    spxDayPct,
    nasdaqDayPct,
    tenYearYield: tenYearRecap,
    note: 'Sunday closed. Last cash Friday: S&P 500 7,656.98 +65.28 / +0.86% (AP / Seattle Times / ABC). Snapped a four-day losing streak. Week still −0.8% (same recap). 10-year recap 4.96% (Madisony / AInvest). Official Treasury table unread this sitting. S&P YTD page unread this sitting — omitted.',
    nextCalendar: {
      label: 'FOMC Sep 15–16 + SEP',
      detail:
        'federalreserve.gov 2026 calendar. Decision Wednesday Sep 16, 2:00 p.m. ET, press conference 2:30. Official BLS August CPI is on the table: +0.4% m/m, +3.4% y/y, core +0.3% / +2.4%. Next cash is Monday.',
    },
  },
  markets: {
    global: {
      indices: [
        {
          label: 'Nikkei 225',
          value: '64,011.34',
          dayPct: -1.93,
          note: 'Friday Tokyo close (Yonhap Infomax / Armenpress / AFP). −1,259.61. Topix 4,028.30 −0.65%. Sunday Tokyo closed. Monday cash has not opened yet (Toronto morning).',
        },
        {
          label: 'Hang Seng',
          value: '24,805.63',
          dayPct: -0.6,
          note: 'Friday Hong Kong close (Yonhap Infomax / Armenpress / AFP). −148.84. Sunday closed.',
        },
        {
          label: 'Shanghai Composite',
          value: '3,888.11',
          dayPct: -1.18,
          note: 'Friday close (Yonhap Infomax / Armenpress). Shenzhen Component 13,471.26 −1.08% (Edge wrap). Sunday closed.',
        },
        {
          label: 'FTSE 100',
          value: '10,650.44',
          dayPct: 0.4,
          note: 'Friday close (AFP). UP 0.4 percent. Sunday London closed.',
        },
        {
          label: 'CAC 40',
          value: '8,179.77',
          dayPct: 0.78,
          note: 'Friday close (AFP). UP 0.8 percent at 8,179.77.',
        },
        {
          label: 'DAX',
          value: '25,568.56',
          dayPct: 0.8,
          note: 'Friday close (AFP). UP 0.8 percent. Sunday Frankfurt closed.',
        },
      ],
      commodities: [
        {
          label: 'WTI crude',
          value: '$100.05',
          dayPct: -2.37,
          note: 'Friday NYMEX October settle −$2.43 / −2.37% (EnergyNow / Gate). Still above $100. Week +$8.57 / +9.37% from Sep 4 $91.48 (EnergyNow).',
        },
        {
          label: 'Brent',
          value: '$104.61',
          dayPct: -2.81,
          note: 'Friday November ICE settle −$3.02 (EnergyNow / Gate). Thursday lock was $107.63.',
        },
      ],
      rates: [
        {
          label: 'U.S. 10-year (Fri recap)',
          value: `${tenYearRecap}%`,
          note: 'Madisony / AInvest Friday close 4.96%. Official Treasury par-curve table unread (fetch 409).',
        },
        {
          label: 'U.S. 2-year (Fri recap)',
          value: '4.63%',
          note: 'Madisony Friday close 4.63%. Official table unread.',
        },
      ],
      fx: [
        {
          label: 'USD/CAD',
          value: '1.3866',
          note: 'Bank of Canada Valet daily average Friday 2026-09-11. 1 CAD = 72.12 U.S. cents. Thursday average was 1.3822. No Saturday/Sunday Valet row.',
        },
      ],
      note: 'Asia and Europe last cash is Friday. Sunday is closed. WTI pulled back and held $100. This wake is the second weekend wrap after Friday cash.',
    },
    us: {
      indices: [
        {label: 'S&P 500', value: '7,656.98', dayPct: spxDayPct},
        {
          label: 'Nasdaq',
          value: '26,333.04',
          dayPct: nasdaqDayPct,
          note: 'AP / Seattle Times / ABC. +251.31.',
        },
        {label: 'Dow', value: '52,573.29', dayPct: 0.98},
        {label: 'Russell 2000', value: '2,903.94', dayPct: 0.45},
      ],
      yields: [
        {label: 'U.S. 10-year Friday recap', value: `${tenYearRecap}%`},
        {label: 'U.S. 2-year Friday recap', value: '4.63%'},
      ],
      note: 'Four-day losing streak snapped Friday (AP / Seattle Times). Week still down: S&P −0.8%, Dow −1.6%, Nasdaq −0.7%, Russell −2.4% (Seattle Times / STL.News). Official BLS August CPI (cpi_09112026.htm): +0.4% m/m, +3.4% y/y; core +0.3% / +2.4%. Gasoline +3.9% m/m, +27.4% y/y. Official PPI table unread this sitting. S&P YTD page unread — omitted.',
    },
    ca: {
      indices: [
        {
          label: 'S&P/TSX Composite',
          value: '35,697.49',
          dayPct: 0.54,
          note: 'TMX Daily Trade Report Sep 11. Previous close 35,506.28. Sunday TSX closed.',
        },
        {
          label: 'S&P/TSX 60',
          value: '2,096.44',
          dayPct: 0.62,
          note: 'TMX Daily Trade Report Sep 11. Previous 2,083.54.',
        },
        {
          label: 'S&P/TSX Venture',
          value: '927.86',
          dayPct: -0.32,
          note: 'TMX Daily Trade Report Sep 11. Previous 930.88.',
        },
      ],
      cadUsd: '72.12¢ (BoC daily average 1.3866 USD/CAD)',
      note: 'Friday official TMX. BoC schedule lists Sep 2 as a FAD and Oct 28 + MPR. Sep 2 hold at 2.25% is the last named decision on the CP24 / FAD tape. Sunday TSX closed.',
    },
    calendar: {
      items: [
        {
          when: 'Saturday Sep 12 — opened 5:00 a.m. PT',
          where: 'US' as const,
          label: 'iPhone 18 Pro pre-orders live',
          why: 'Apple newsroom: pre-order Sat Sep 12, availability Fri Sep 18. AppleInsider confirmed the queue went live. Duo pre-order Oct 16 / launch Oct 23. A pre-order window is not a unit guide.',
        },
        {
          when: 'Monday Sep 14 — next cash',
          where: 'GLOBAL' as const,
          label: 'Asia then US / CA reopen',
          why: 'Sunday morning Toronto: Tokyo / HK / NY / TSX still closed. Do not invent a Sunday print.',
        },
        {
          when: 'Sep 15–16 · SEP meeting',
          where: 'US' as const,
          label: 'FOMC + SEP',
          why: 'federalreserve.gov 2026 calendar. Decision Wednesday Sep 16, 2:00 p.m. ET. August CPI is already official.',
        },
        {
          when: 'October 1',
          where: 'US' as const,
          label: 'NVIDIA $0.25 dividend pay date',
          why: 'NVIDIA IR Aug 26: record was Sep 10; pay Oct 1. Calendar fact, not a thesis.',
        },
        {
          when: 'October 14',
          where: 'US' as const,
          label: 'BLS September CPI',
          why: 'BLS CPI release schedule. Next official table after August.',
        },
        {
          when: 'October 28',
          where: 'CA' as const,
          label: 'Bank of Canada rate + MPR',
          why: 'Official BoC 2026 schedule. Next announcement Oct 28 with the MPR.',
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
        'Last cash Friday $218.29 (−0.03%). Flat on the rebound day. IR Q3 guide still $108.0B ±2%. Four red of the last seven sourced sessions.',
    },
    {
      ticker: 'AAPL',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Recent purchase',
      whatMatters:
        'Last cash Friday $332.27 (+1.75%). Pro pre-orders opened yesterday. Do not add on the event tape.',
    },
    {
      ticker: 'VOO',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      role: 'Best simple core',
      whatMatters: `Friday $${vooClose.toFixed(2)} (+${vooDayPct}%). New core money still simplifies here.`,
    },
    {
      ticker: 'VTI',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Broad US',
      whatMatters: `Friday $${vtiClose.toFixed(2)} (+${vtiDayPct}%). Excellent fund; still overlaps VOO.`,
      overlapWith: ['VOO'],
    },
    {
      ticker: 'VUG',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Growth sleeve',
      whatMatters: `Friday $${vugClose.toFixed(2)} (+${vugDayPct}%, Dow Jones Newswires). Same mega-cap names you already own.`,
      overlapWith: ['NVDA', 'AAPL', 'VOO', 'MGK'],
    },
    {
      ticker: 'MGK',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Mega-cap growth',
      whatMatters: `Friday $${mgkClose.toFixed(2)} (+${mgkDayPct}%). Even tighter overlap with NVDA and AAPL.`,
      overlapWith: ['NVDA', 'AAPL', 'VUG', 'VOO'],
    },
    {
      ticker: 'GDV',
      rating: 'HOLD — income / diversifier',
      tone: 'long' as const,
      role: 'Income sleeve',
      whatMatters: `Friday $${gdvClose.toFixed(2)} (+${gdvDayPct}%). Different job. Not a growth engine.`,
    },
  ],
  portfolio: {
    concentrationThesis: 'VOO + VTI + VUG + MGK + AAPL + NVDA still buy the same companies.',
    concentrationBody:
      'Friday the index rebound painted the sleeves green together. NVDA did not participate. Weights are still unknown, so size stays qualitative.',
    factorStack: ['NVDA', 'AAPL', 'MGK', 'VUG', 'VOO', 'VTI'],
    factorLabel: 'U.S. mega-cap / growth',
    overlapNote: 'same ecosystem',
  },
  names: [
    {
      ticker: 'NVDA',
      chapterTitle: 'NVDA · flat on Friday, guide unchanged',
      rating: 'HOLD — critical watch',
      tone: 'watch' as const,
      price: nvdaClose,
      dayPct: nvdaDayPct,
      holdNote: 'A −0.03% Friday is not a buy. Guide is still $108.0B ±2%. No Sunday trade.',
      streak: [3.21, 1.8, 0.84, -2.01, -0.91, -2.26, -0.03],
      streakHeadline: 'Seven sourced US sessions: 4 red. Friday was the fourth red, almost flat.',
      streakNote:
        'StockAnalysis this sitting: Sep 2 +3.21, Sep 3 +1.80, Sep 4 +0.84, Sep 8 −2.01, Sep 9 −0.91, Sep 10 −2.26 to $218.36, Sep 11 −0.03 to $218.29. Labor Day Sep 7 had no cash. Momentum formula counts red days in this window only. No 0–100 score.',
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
        note: 'NVIDIA IR August 26. Street consensus and whisper unread this sitting — not drawn. Next dividend $0.25 on Oct 1; record was Sep 10 (same IR).',
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
        leftHeadline: '“A ~4.96% 10-year and $100 oil can still reprice the stack into FOMC.”',
        leftBody:
          'Friday: WTI $100.05 −2.37%, Brent $104.61 −2.81%, 10-year recap 4.96%. Official CPI +0.4% / +3.4%; core +2.4% y/y. NVDA $218.29 −0.03% while the S&P bounced +0.86%. IR still names independent compute-financing platforms targeting over $500B of third-party capital over time.',
        rightTitle: 'THE COUNTER',
        rightHeadline: 'Printed demand is still huge. Guide assumes no China DC compute.',
        rightBody:
          'Q2 revenue $96.2B. Data center $89.0B. Q3 guide $108.0B ±2%. A flat Friday does not change the guide. Vera Rubin remains the production story on the IR tape. Dividend record was Sep 10; pay is Oct 1.',
      },
      interpretation: {
        chips: [
          {label: 'CONFIRMED', tone: 'long' as const, text: 'Q2 print and Q3 guide are official IR, not a rumor.'},
          {
            label: 'CONFIRMED',
            tone: 'watch' as const,
            text: 'Four red of the last seven sourced US sessions. Friday was almost flat. That is a streak fact, not a regime score.',
          },
          {
            label: 'CONFIRMED',
            tone: 'watch' as const,
            text: 'Official August CPI is on the BLS table. FOMC Sep 15–16 still sits on this stack.',
          },
        ],
        note: 'No composite score. Missing whisper stays UNKNOWN. Empty Next-NVDA stays empty.',
      },
      actionMatrix: {
        headline: 'Sunday: HOLD. No weekend trade.',
        rows: [
          {
            tone: 'long' as const,
            if: 'After FOMC the book needs cash put to work',
            then: 'VOO first',
          },
          {
            tone: 'watch' as const,
            if: 'FOMC or the 10-year reprices duration hard',
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
      chapterTitle: 'AAPL · pre-orders opened; still one name you own',
      rating: 'HOLD',
      tone: 'long' as const,
      price: aaplClose,
      dayPct: aaplDayPct,
      holdNote: 'You already own it. Friday green cash and a live pre-order window are not an add.',
      catalyst: {
        headline: 'Apple newsroom: iPhone 18 Pro / Pro Max pre-orders + iPhone Duo later.',
        steps: [
          'iPhone 18 Pro: 48MP Fusion Main, variable aperture, A20 Pro',
          'Pro pre-order opened Sat Sep 12 5:00 a.m. PT (AppleInsider live)',
          'Availability Fri Sep 18 in 65+ countries (newsroom)',
          'Duo pre-order Oct 16 · launch Oct 23',
        ],
        note: 'Official newsroom + Saturday live confirm. No unit guide. No revenue claim. Friday cash $332.27 (+1.75%) vs Thursday previous 326.6 (eoddata).',
      },
      action: {
        headline: 'HOLD the position.',
        body: 'The event is real. Pre-orders are live. That is still one name you already own. YTD page unread this sitting — omitted. Do not stack another AAPL buy into the same mega-cap sleeve.',
      },
    },
    {
      ticker: 'VOO',
      chapterTitle: 'VOO · still the simple core',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      metrics: [{label: 'Friday', value: `$${vooClose.toFixed(2)}  +${vooDayPct}%`}],
      copy: {
        headline: 'Best simple core. New core money simplifies here.',
        body: 'Do not sell. Stop splitting every future contribution with VTI. Friday followed the S&P rebound. YTD page unread this sitting — omitted.',
      },
    },
    {
      ticker: 'VTI',
      chapterTitle: 'VTI · excellent, overlapping',
      rating: 'HOLD',
      tone: 'long' as const,
      metrics: [{label: 'Friday', value: `$${vtiClose.toFixed(2)}  +${vtiDayPct}%`}],
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
      metrics: [{label: 'Friday', value: `$${vugClose.toFixed(2)}  +${vugDayPct}%`}],
      copy: {
        headline: 'You already own the individual winners.',
        body: 'HOLD existing. No priority additions. A green Friday is not a thesis change. Dow Jones Newswires: rose 0.9% to $88.02.',
      },
    },
    {
      ticker: 'MGK',
      chapterTitle: 'MGK · tighter overlap',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      metrics: [{label: 'Friday', value: `$${mgkClose.toFixed(2)}  +${mgkDayPct}%`}],
      copy: {
        body: 'You already own NVDA and AAPL directly. HOLD. Stop feeding it. Not a sell call — tax and account mechanics are not on this tape.',
      },
    },
    {
      ticker: 'GDV',
      chapterTitle: 'GDV · a different job',
      rating: 'HOLD · INCOME / DIVERSIFIER',
      tone: 'long' as const,
      metrics: [{label: 'Market', value: `$${gdvClose.toFixed(2)}  +${gdvDayPct}%`}],
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
      question: 'What did the official BLS August PPI table print?',
      whyItMatters:
        'BLS scheduled August PPI last week. This sitting fetched official CPI, not the PPI table. Recaps are not the table.',
      neededToKnow: 'BLS ppi.nr0.htm / PDF for August 2026.',
      status: 'unknown' as const,
    },
    {
      id: 'treasury-par-curve',
      area: 'US' as const,
      question: 'What did the official Treasury par-curve print Friday?',
      whyItMatters:
        '10-year recap 4.96% and 2-year 4.63% are vendor closes. The official table returned 409 this sitting.',
      neededToKnow: 'Treasury.gov daily par-yield curve for 2026-09-11.',
      status: 'partial' as const,
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
      id: 'holding-ytd',
      area: 'book' as const,
      question: 'What is each holding’s sourced YTD?',
      whyItMatters: 'August 25 YTD scalars are stale. Two YTD numbers would draw a lollipop — only if both are live.',
      neededToKnow: 'A fund or quote page YTD for each line, dated Friday or later.',
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
    existingPortfolio: 'HOLD — sell nothing this weekend.',
    freshCapital: 'No Sunday buy. New core money simplifies into VOO after FOMC if cash must work.',
    bestAdd: 'VOO',
    highestUpsideWatch: 'none named',
    biggestRisk:
      'Mega-cap growth overlap across NVDA, AAPL, MGK, VUG, VOO, VTI — still sitting under a 4.96% 10-year recap and $100 WTI into FOMC week',
    nextTrigger: 'Monday cash, then FOMC Sep 15–16 + SEP',
    ifThen: [
      {
        tone: 'long' as const,
        if: 'After FOMC the book needs cash put to work',
        then: 'VOO first',
      },
      {
        tone: 'watch' as const,
        if: 'FOMC or the 10-year reprices duration hard',
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
      body: 'NVDA + AAPL + MGK + VUG + VOO + VTI repeatedly own the same mega-cap ecosystem. Friday the sleeves bounced together; NVDA did not.',
    },
    {
      n: '02',
      title: 'Interest rates + oil into FOMC',
      body: `The 10-year recap sat at ${tenYearRecap}%. WTI settled $100.05 after Thursday $102.48. Official CPI +3.4% y/y with gasoline +27.4% y/y. High long rates compress the exact overweight. FOMC decision is Wednesday.`,
    },
    {
      n: '03',
      title: 'AI ROI / financed demand',
      body: 'IR still names third-party platforms targeting over $500B of AI infrastructure capital. The debate is still “will profits justify the buildout?” That sits under NVDA and most of the indirect book.',
    },
  ],
  close: {
    kicker: 'DIAGNOSTIC',
    headline: 'Sunday adds no new cash. The book is still seven names.',
    body: 'Apple Pro pre-orders opened yesterday. NVDA stayed flat Friday. Oil pulled back and held $100. After Monday cash: FOMC, then HOLD / VOO — Evens decides. No trade from this desk.',
    pills: [
      {tone: 'watch' as const, label: 'HOLD THIS WEEKEND'},
      {tone: 'caution' as const, label: 'NO SUNDAY BUY'},
      {tone: 'long' as const, label: 'VOO IF CASH MUST WORK'},
    ],
    followThrough: [
      {
        tone: 'watch' as const,
        if: 'FOMC keeps the 10-year bid',
        then: 'Do not add growth overlap. Re-read duration.',
      },
      {
        tone: 'caution' as const,
        if: 'Oil stays over $100 into the decision',
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
    `SPX ${spxClose.toLocaleString('en-US')}  +${spxDayPct}%`,
    `NASDAQ  +${nasdaqDayPct}%`,
    `NVDA  $${nvdaClose.toFixed(2)}  ${nvdaDayPct}%`,
    `AAPL  $${aaplClose.toFixed(2)}  +${aaplDayPct}%`,
    `10Y  ${tenYearRecap}% recap`,
    `WTI  $100.05`,
    `TSX  35,697.49  +0.54%`,
    `CPI  +0.4% / +3.4%`,
    `FOMC  SEP 15–16`,
    `PRO PRE-ORDER LIVE`,
    `VOO CORE / ADD`,
    `SELL NOTHING THIS WEEKEND`,
  ],
};

export const episode: DailyReport = parseDailyReport(raw);
