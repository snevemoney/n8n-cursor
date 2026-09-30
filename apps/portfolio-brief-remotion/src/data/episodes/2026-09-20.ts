import {parseDailyReport, type DailyReport} from '../schema';

const nvdaClose = 222.27;
const nvdaDayPct = 1.34;
const aaplClose = 336.13;
const aaplDayPct = -0.26;
const vooClose = 701.78;
const vooDayPct = 0.11;
const vtiClose = 375.43;
const vtiDayPct = 0.02;
const vugClose = 88.75;
const vugDayPct = 0.36;
const mgkClose = 90.89;
const mgkDayPct = 0.35;
const gdvClose = 28.95;
const gdvDayPct = -0.41;
const spxClose = 7650.5;
const spxDayPct = 0.17;
const spxYtdPct = 11.8;
const nasdaqClose = 26522.55;
const nasdaqDayPct = 0.4;
const tenYear = 5.0;
const nikkei = 65018.95;
const nikkeiDayPct = 1.38;
const topix = 4091.14;
const topixDayPct = -0.07;
const hangSeng = 24750.78;
const hangSengDayPct = 0.6;
const shanghai = 3911.87;
const shanghaiDayPct = 0.94;
const ftse = 10659.13;
const ftseDayPct = -1.45;
const dax = 25304.06;
const daxDayPct = -1.6;
const cac = 8065.02;
const cacDayPct = -1.49;
const tsxClose = 35804.86;
const tsxDayPct = -0.2;
const wti = 100.3;
const wtiDayPct = -1.58;
const brent = 103.87;
const brentDayPct = -0.91;
const nvdaQ2Rev = 96.2;
const nvdaDcRev = 89.0;
const nvdaQ3Guide = 108.0;

const raw = {
  meta: {
    date: '2026-09-20',
    dateLabel: 'SEP 20, 2026',
    title: 'Daily Wealth Intelligence',
    thesis:
      'Friday cash is still the last print. The book is the same seven U.S. mega-cap growth lines. A Sunday mark is not an add ticket.',
    thesisLead: 'Friday cash still stands. Same book.',
    thesisAccent: 'Sunday is not a new tape.',
    catalyst:
      'Tomorrow is the first cash after a mixed Friday and a 5% 10-year session quote. Official Friday par still posts Monday.',
    kicker:
      'Sunday wake. US, CA, Europe, and Tokyo are closed. Last cash is Friday 2026-09-18. Do not invent a weekend price.',
    universe: ['AAPL', 'NVDA', 'VOO', 'VTI', 'VUG', 'MGK', 'GDV'],
  },
  market: {
    spxClose,
    spxDayPct,
    spxYtdPct,
    nasdaqDayPct,
    tenYearYield: tenYear,
    note: 'Last cash Friday: S&P 7,650.50 +0.17%. Nasdaq 26,522.55 +0.40%. AP: 10-year climbed to 5.00%. NVDA closed $222.27 +1.34%.',
    nextCalendar: {
      label: 'Monday cash open',
      detail: 'First session tomorrow. Mac mini / Studio stores Tue Sep 22. Official Friday 10-year posts with Monday H.15 / FRED.',
    },
  },
  markets: {
    global: {
      indices: [
        {label: 'Nikkei 225', value: nikkei.toLocaleString('en-US'), dayPct: nikkeiDayPct, note: 'Friday Tokyo (FRED NIKKEI225 / RTHK). Reclaimed 65,000. Sunday cash unread.'},
        {label: 'TOPIX', value: topix.toLocaleString('en-US'), dayPct: topixDayPct, note: 'Friday Tokyo (Edge wrap). Broad tape down while Nikkei rose.'},
        {label: 'Hang Seng', value: hangSeng.toLocaleString('en-US'), dayPct: hangSengDayPct, note: 'Friday close (RTHK / Edge wrap)'},
        {label: 'Shanghai Composite', value: shanghai.toLocaleString('en-US'), dayPct: shanghaiDayPct, note: 'Friday close (RTHK / Edge wrap)'},
        {label: 'FTSE 100', value: ftse.toLocaleString('en-US'), dayPct: ftseDayPct, note: 'Friday London (MarketScreener)'},
        {label: 'DAX 40', value: dax.toLocaleString('en-US'), dayPct: daxDayPct, note: 'Friday Frankfurt (dpa-AFX / Stooq)'},
        {label: 'CAC 40', value: cac.toLocaleString('en-US'), dayPct: cacDayPct, note: 'Friday Paris (Stooq / Digital Look)'},
      ],
      fx: [{label: 'USD/JPY', value: '157.45', note: 'Around 0810 GMT Friday (Star Metro). No Sunday official reprint. CME Nikkei not open at this wake.'}],
      commodities: [
        {label: 'WTI Oct', value: `$${wti.toFixed(2)}`, dayPct: wtiDayPct, note: 'Friday settle −$1.61 (EnergyNow / MarketScreener)'},
        {label: 'Brent Nov', value: `$${brent.toFixed(2)}`, dayPct: brentDayPct, note: 'Friday settle −$0.95 (EnergyNow / DTN)'},
      ],
      rates: [
        {
          label: 'U.S. 10-year',
          value: `${tenYear.toFixed(2)}%`,
          note: 'AP Friday session: climbed to 5.00%. Official FRED DGS10 still 4.94% on 09/17. Next FRED release Mon Sep 21.',
        },
        {label: 'Fed funds', value: '3.75–4.00%', note: 'FOMC 12–0 hike Sep 16, effective Sep 17. SEP median funds 4.1% YE 2026.'},
        {label: 'BoJ overnight call', value: 'around 1.25%', note: 'BoJ PDF 7–2. Effective Sep 24. Complementary deposit 1.25%.'},
      ],
      note: 'Sunday. Asia, Europe, and U.S. cash are still Friday closes. Tokyo Monday has not opened at this wake.',
    },
    us: {
      indices: [
        {
          label: 'S&P 500',
          value: spxClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: spxDayPct,
        },
        {label: 'Nasdaq', value: nasdaqClose.toLocaleString('en-US'), dayPct: nasdaqDayPct},
        {label: 'Dow', value: '51,682.64', dayPct: -0.18, note: 'Friday (AP / Reuters)'},
        {label: 'Russell 2000', value: '2,860.40', dayPct: -0.5, note: 'Friday (AP)'},
      ],
      sectors: [
        {label: 'Philadelphia Semiconductor', dayPct: 2.78, note: 'Friday: fourth up day after Huang “twice as many chips next year” (Gate). Not a holding.'},
        {label: 'Energy', note: 'Oil settled lower Friday. Sector level unread — omitted.'},
      ],
      breadth:
        'Friday: NYSE decliners led. Nasdaq 1,973 up / 2,810 down (1.42-to-1). S&P 5 new highs / 30 new lows. Nasdaq 45 new highs / 162 new lows (Reuters).',
      yields: [
        {
          label: 'U.S. 10-year',
          value: `${tenYear.toFixed(2)}%`,
          note: 'AP Friday: climbed to 5.00%. FRED DGS10 last official 4.94% on 09/17. Next official row Mon Sep 21.',
        },
      ],
      note: 'Friday cash still the last print. AP YTD: S&P +11.8%. Week: S&P −0.1%, Nasdaq +0.7%, Dow −1.7% (AP).',
    },
    ca: {
      indices: [
        {
          label: 'S&P/TSX Composite',
          value: tsxClose.toLocaleString('en-US'),
          dayPct: tsxDayPct,
          note: 'Friday close 35,804.86 −69.58 (Reuters via MarketScreener). Week +0.3% after four down weeks. Energy −0.7% (Reuters).',
        },
      ],
      cadUsd: '1.4002 CAD per USD (BoC Valet FXUSDCAD daily average 2026-09-18).',
      note: 'Friday cash. Sunday TSX closed. BoC overnight still 2.25% from the last hold. Next decision Oct 28 (prior tape).',
    },
    calendar: {
      items: [
        {
          when: 'Sunday',
          where: 'GLOBAL' as const,
          label: 'Cash markets closed',
          why: 'US, CA, Europe, and Tokyo are shut. Friday is the last print. Do not invent a Sunday price.',
        },
        {
          when: 'Monday Sep 21',
          where: 'US' as const,
          label: 'U.S. / CA cash open',
          why: 'First session after the mixed Friday close. Official Friday 10-year also posts (FRED next release Sep 21). Do not add into the open.',
        },
        {
          when: 'Tuesday Sep 22',
          where: 'US' as const,
          label: 'Mac mini / Mac Studio in stores',
          why: 'Apple shop: Available starting 9.22. Local-AI Macs. Still inference, not a quarter print.',
        },
        {
          when: 'Thursday Sep 24',
          where: 'GLOBAL' as const,
          label: 'BoJ overnight call effective',
          why: 'Already voted 7–2 around 1.25% (BoJ PDF). Effective date, not a new vote.',
        },
        {
          when: 'Oct 1',
          where: 'US' as const,
          label: 'NVIDIA dividend',
          why: 'IR: $0.25 payable Oct 1 (record Sep 10). Cash event, not a thesis change.',
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
      rating: 'HOLD — no add on the Friday bid',
      tone: 'watch' as const,
      role: 'Highest-beta AI line',
      whatMatters: 'Friday $222.27 +1.34% with SOX +2.78%. Q3 guide already on tape. Green into a 5% 10-year is not an add.',
    },
    {
      ticker: 'AAPL',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Recent purchase',
      whatMatters: 'Friday $336.13 −0.26%. Mac mini / Studio stores Tue Sep 22. Do not add the same name this weekend.',
    },
    {
      ticker: 'VOO',
      rating: 'CORE / ADD after Monday tape',
      tone: 'long' as const,
      role: 'Best simple core',
      whatMatters: 'Friday $701.78 +0.11%. New core money still simplifies here — after Monday cash, not on a Sunday.',
    },
    {
      ticker: 'VTI',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Broad US',
      whatMatters: 'Friday $375.43 +0.02%. Excellent fund. Still overlaps VOO.',
      overlapWith: ['VOO'],
    },
    {
      ticker: 'VUG',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Growth sleeve',
      whatMatters: 'Friday $88.75 +0.36%. You already own the individual winners.',
      overlapWith: ['NVDA', 'AAPL', 'VOO', 'MGK'],
    },
    {
      ticker: 'MGK',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Mega-cap growth',
      whatMatters: 'Friday $90.89 +0.35%. Same stack, more concentrated.',
      overlapWith: ['NVDA', 'AAPL', 'VUG', 'VOO'],
    },
    {
      ticker: 'GDV',
      rating: 'HOLD — income / diversifier',
      tone: 'long' as const,
      role: 'Income sleeve',
      whatMatters: 'Friday market $28.95 −0.41%. Different job. NAV unread this sitting.',
    },
  ],
  portfolio: {
    concentrationThesis: 'VOO + VTI + VUG + MGK + AAPL + NVDA still buy the same companies.',
    concentrationBody:
      'Friday’s chip bid and Europe’s red close move several Wealthsimple lines together. That is structure, not a sell ticket. A Sunday mark is not new capital.',
    factorStack: ['NVDA', 'AAPL', 'MGK', 'VUG', 'VOO', 'VTI'],
    factorLabel: 'U.S. mega-cap / growth',
    overlapNote: 'same ecosystem',
  },
  names: [
    {
      ticker: 'NVDA',
      chapterTitle: 'NVDA · Friday bid. The guide did not change.',
      rating: 'HOLD — NO ADD ON THE FRIDAY BID',
      tone: 'watch' as const,
      price: nvdaClose,
      dayPct: nvdaDayPct,
      holdNote: 'Friday close $222.27. A 1.3% bid the day the 10-year hit 5% is not an add.',
      streak: [1.34],
      streakHeadline: 'One sourced Friday day-change. Not a 21-day grid.',
      streakNote: 'Friday $222.27 +1.34% (exa / prior tape). One cell only. No Sunday print.',
      fundamentals: [
        {label: 'Q2 FY27 revenue', value: `$${nvdaQ2Rev.toFixed(1)}B +106% y/y`},
        {label: 'Q2 data center', value: `$${nvdaDcRev.toFixed(1)}B +117% y/y`},
        {label: 'Q2 GAAP GM / EPS', value: '75.0% / $2.46'},
        {label: 'Q3 revenue guide', value: `$${nvdaQ3Guide.toFixed(1)}B ±2%`},
        {label: 'Q3 GM guide', value: '74.0% ±50 bps'},
        {label: 'China in Q3 DC compute', value: 'Not assumed'},
      ],
      consensus: {
        rows: [
          {label: 'Q2 print (done)', value: `$${nvdaQ2Rev.toFixed(1)}B revenue, 75.0% GM`},
          {label: 'Q3 guide', value: `$${nvdaQ3Guide.toFixed(1)}B ±2%; GM 74.0% ±50 bps`},
          {label: 'Dividend', value: '$0.25 payable Oct 1 (record Sep 10)'},
        ],
        note: 'Guide is NVIDIA IR Aug 26. Street whisper for the next print is unread. Do not draw a fake zone.',
        range: {metric: 'Q3 revenue guide', unit: 'B', guide: nvdaQ3Guide, low: 105.84, high: 110.16},
      },
      narrative: {
        leftTitle: 'THE FEAR',
        leftHeadline: 'AP: 10-year climbed to 5.00%. Long rates still tax this book.',
        leftBody:
          'FOMC 12–0 to 3.75–4.00% is still the U.S. setting. Official Treasury par for Friday is unread; last official FRED print is 4.94% on Thursday. Europe closed red. Oil stayed above $100.',
        rightTitle: 'THE COUNTER',
        rightHeadline: 'The last earnings print was not a miss. Friday NVDA closed +1.34%.',
        rightBody:
          'Q2 $96.2B, data center $89.0B, GM 75.0%. Q3 guide $108.0B ±2%, no China data-center compute in the outlook. SOX +2.78%. Relative strength is not a buy ticket.',
      },
      interpretation: {
        chips: [
          {label: 'CONFIRMED', tone: 'long' as const, text: 'Q2 demand and Q3 guide are still the IR tape.'},
          {label: 'CONFIRMED', tone: 'watch' as const, text: 'AP Friday: 10-year at 5.00%. SOX +2.78%. NVDA $222.27.'},
          {
            label: 'INFERENCE',
            tone: 'caution' as const,
            text: 'Buying Friday’s bid into a closed Sunday is a timing bet we do not have to take.',
          },
        ],
        note: 'No composite score. One Friday day-change is a count, not a 73/100.',
      },
      actionMatrix: {
        headline: 'HOLD the line. Do not add on a Sunday.',
        rows: [
          {
            tone: 'long' as const,
            if: 'Monday cash holds without a chip crash',
            then: 'Still HOLD NVDA. New core money waits, then VOO.',
          },
          {
            tone: 'watch' as const,
            if: 'Chips gap up Monday after Friday’s SOX bid',
            then: 'HOLD. Friday close is not a sourced add.',
          },
          {
            tone: 'caution' as const,
            if: 'Official 10-year stays at 5% and NVDA gives back Friday',
            then: 'Do not automatically buy the dip next week',
          },
          {
            tone: 'short' as const,
            if: 'SEP 4.1% year-end path starts repricing the book harder',
            then: 'Do not average down on the headline. Re-read, then decide.',
          },
        ],
      },
      network: {
        title: 'NVDA · qualitative demand chain',
        headline: 'Polarity from IR + Friday cash. No composite score.',
        nodes: [
          {id: 'labs', label: 'GPU demand', polarity: 'confirmed' as const, x: 0.08, y: 0.22},
          {id: 'demand', label: 'AI factory build', polarity: 'confirmed' as const, x: 0.3, y: 0.22, evidence: 'Q3 guide $108B ±2%'},
          {id: 'oil', label: 'Oil settle', polarity: 'concern' as const, x: 0.5, y: 0.22, evidence: 'WTI $100.30'},
          {id: 'financing', label: 'Third-party capital', polarity: 'concern' as const, x: 0.3, y: 0.78},
          {id: 'nvda', label: 'NVDA', polarity: 'neutral' as const, x: 0.62, y: 0.5},
          {id: 'sox', label: 'SOX Friday', polarity: 'confirmed' as const, x: 0.82, y: 0.18, evidence: '+2.78%'},
          {id: 'margins', label: 'GM guide 74%', polarity: 'inference' as const, x: 0.82, y: 0.5},
          {id: 'rates', label: '10-year 5.00%', polarity: 'concern' as const, x: 0.82, y: 0.82, evidence: 'AP Friday session'},
          {id: 'valuation', label: 'Friday close', polarity: 'inference' as const, x: 0.94, y: 0.5},
        ],
        edges: [
          {from: 'labs', to: 'demand'},
          {from: 'demand', to: 'nvda'},
          {from: 'oil', to: 'rates'},
          {from: 'sox', to: 'nvda'},
          {from: 'financing', to: 'nvda', label: 'exposure'},
          {from: 'nvda', to: 'margins'},
          {from: 'rates', to: 'valuation'},
          {from: 'margins', to: 'valuation'},
        ],
      },
    },
    {
      ticker: 'AAPL',
      chapterTitle: 'AAPL · hold the recent purchase',
      rating: 'HOLD',
      tone: 'long' as const,
      price: aaplClose,
      dayPct: aaplDayPct,
      holdNote: 'Friday close $336.13. You just bought it. Do not add.',
      catalyst: {
        headline: 'Mac mini / Studio in stores Sep 22 (Apple shop: Available starting 9.22).',
        steps: [
          'Local-AI Macs dated Sep 22',
          'That is a product calendar, not a quarter beat',
          'Do not double the line on a store date',
        ],
        note: 'Store date is sourced. A Sunday mark is not a reason to add AAPL.',
      },
      action: {
        headline: 'HOLD the position.',
        body: 'Do not add AAPL this weekend. Next contribution should diversify, not stack the same name.',
      },
    },
    {
      ticker: 'VOO',
      chapterTitle: 'VOO · still the simple core',
      rating: 'CORE / ADD AFTER MONDAY TAPE',
      tone: 'long' as const,
      price: vooClose,
      dayPct: vooDayPct,
      metrics: [{label: 'Friday close', value: `$${vooClose.toFixed(2)} +${vooDayPct}%`}],
      copy: {
        headline: 'Best simple core. New core money waits for Monday cash, then simplifies here.',
        body: 'Do not sell. Do not split the next contribution with VTI. Do not add on a Sunday.',
      },
    },
    {
      ticker: 'VTI',
      chapterTitle: 'VTI · excellent, overlapping',
      rating: 'HOLD',
      tone: 'long' as const,
      price: vtiClose,
      dayPct: vtiDayPct,
      metrics: [{label: 'Friday close', value: `$${vtiClose.toFixed(2)} +${vtiDayPct}%`}],
      copy: {
        headline: 'Excellent. Mega-caps still dominate, so the top looks like VOO.',
        body: 'Do not sell. The overlap with VOO is the issue — not the fund quality.',
      },
    },
    {
      ticker: 'VUG',
      chapterTitle: 'VUG · growth sleeve, already owned elsewhere',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      price: vugClose,
      dayPct: vugDayPct,
      metrics: [{label: 'Friday close', value: `$${vugClose.toFixed(2)} +${vugDayPct}%`}],
      copy: {
        headline: 'You already own NVDA and AAPL directly.',
        body: 'HOLD existing. No priority additions. Holding YTD vs S&P unread this sitting — omitted, not faked.',
      },
    },
    {
      ticker: 'MGK',
      chapterTitle: 'MGK · same stack, tighter',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      price: mgkClose,
      dayPct: mgkDayPct,
      metrics: [{label: 'Friday close', value: `$${mgkClose.toFixed(2)} +${mgkDayPct}%`}],
      copy: {
        body: 'More mega-cap than VUG. You already own the names. HOLD. Stop feeding it. Not a sell call — tax lots unread.',
      },
    },
    {
      ticker: 'GDV',
      chapterTitle: 'GDV · a different job',
      rating: 'HOLD · INCOME / DIVERSIFIER',
      tone: 'long' as const,
      price: gdvClose,
      dayPct: gdvDayPct,
      metrics: [{label: 'Friday market', value: `$${gdvClose.toFixed(2)} ${gdvDayPct}%`}],
      copy: {
        body: 'Closed-end income/value. NAV unread this sitting — omitted, not faked. When growth gets punched, this sleeve is supposed to look different. Not Next-NVDA.',
      },
    },
  ],
  nextNvda: [],
  unknowns: [
    {
      id: 'weights',
      area: 'book' as const,
      question: 'What is each line’s weight in the book?',
      whyItMatters: 'Concentration stays qualitative until weights exist.',
      neededToKnow: 'Sourced account weights. Do not estimate from prices.',
      status: 'unknown' as const,
    },
    {
      id: 'treasury-par-friday',
      area: 'US' as const,
      question: 'What is the official Treasury par 10-year for 2026-09-18?',
      whyItMatters:
        'AP said the yield climbed to 5.00%. FRED DGS10 last official is 4.94% on 09/17. Next FRED release is Mon Sep 21. A session quote is not the par row.',
      neededToKnow: 'Treasury TextView / H.15 / FRED DGS10 row dated 09/18.',
      status: 'partial' as const,
    },
    {
      id: 'holding-ytd',
      area: 'book' as const,
      question: 'What is each line’s YTD versus the S&P?',
      whyItMatters: 'S&P YTD +11.8% is sourced (AP). Name YTD unread — a copied August figure would be a lie.',
      neededToKnow: 'Sourced YTD prints for NVDA, AAPL, VOO, VTI, VUG, MGK, GDV.',
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
      whyItMatters: 'One Friday day-change is a count. A decorative 0–100 would be a lie.',
      neededToKnow: 'A named formula and inputs — or omit the score field.',
      status: 'unknown' as const,
    },
  ],
  scenarios: [],
  capitalPlan: {
    existingPortfolio: 'HOLD — sell nothing this weekend.',
    freshCapital: 'No add on a Sunday. New core money simplifies into VOO after Monday cash.',
    bestAdd: 'VOO — after Monday tape, not this weekend',
    highestUpsideWatch: 'none named',
    biggestRisk:
      'Mega-cap growth overlap across NVDA, AAPL, MGK, VUG, VOO, VTI — plus a 10-year at 5% on the AP Friday tape after a Fed hike and a BoJ hike the same week',
    nextTrigger: 'Monday Sep 21 — U.S. / CA cash + official Friday 10-year. Mac mini / Studio Tue Sep 22. BoJ call effective Thu Sep 24.',
    ifThen: [
      {
        tone: 'long' as const,
        if: 'Monday cash holds without a chip crash',
        then: 'HOLD names. New core money can go to VOO.',
      },
      {
        tone: 'watch' as const,
        if: 'Chips gap up Monday after Friday’s SOX bid',
        then: 'HOLD. Do not chase Friday’s NVDA close.',
      },
      {
        tone: 'caution' as const,
        if: 'Official 10-year stays at 5% and growth gives back Friday',
        then: 'Do not buy the dip next week. Wait for a second tape.',
      },
      {
        tone: 'short' as const,
        if: 'SEP 4.1% year-end path starts hitting the overlap harder',
        then: 'Do not average into NVDA/MGK/VUG on the headline.',
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
      body: `AP Friday: 10-year climbed to ${tenYear.toFixed(2)}%. Official par row unread until Monday. FOMC hiked 12–0. BoJ hiked 7–2. Long rates still compress the exact overweight.`,
    },
    {
      n: '03',
      title: 'Oil into inflation into the Fed',
      body: 'WTI settled $100.30 (−1.58%) — still above $100. The Fed statement still says inflation remains elevated.',
    },
  ],
  close: {
    kicker: 'DIAGNOSTIC',
    headline: 'Friday’s mixed close is a book mark. Sunday is not a buy ticket.',
    body: 'Same seven lines. Same overlap. Sell nothing this weekend. Do not add NVDA because SOX bid into Friday. If fresh capital arrives after Monday cash, it still wants VOO first.',
    pills: [
      {tone: 'watch' as const, label: 'HOLD THIS WEEKEND'},
      {tone: 'caution' as const, label: 'NO ADD ON A SUNDAY'},
      {tone: 'long' as const, label: 'VOO AFTER MONDAY TAPE'},
    ],
    followThrough: [
      {
        tone: 'watch' as const,
        if: 'Chips bid and the book still looks expensive versus VOO',
        then: 'Keep the Next-NVDA sleeve empty.',
      },
      {
        tone: 'caution' as const,
        if: 'Official 10-year stays through 5% and growth leaks Monday',
        then: 'More VOO / cash. Not a sourced sell of the existing lines.',
      },
      {
        tone: 'long' as const,
        if: 'Evens or a filing names a non-book scout',
        then: 'That is when the opportunity board gets a row.',
      },
    ],
  },
  tickerTape: [
    `SPX ${spxClose.toLocaleString('en-US')} +${spxDayPct}% FRI`,
    `SPX YTD +${spxYtdPct}% AP`,
    `NASDAQ +${nasdaqDayPct}% FRI`,
    `10Y ${tenYear.toFixed(2)}% AP SESSION`,
    `FOMC 3.75-4.00% 12-0`,
    `BOJ 1.25% 7-2`,
    `NVDA $${nvdaClose.toFixed(2)} +${nvdaDayPct}%`,
    `AAPL $${aaplClose.toFixed(2)} ${aaplDayPct}%`,
    `VOO $${vooClose.toFixed(2)} +${vooDayPct}%`,
    `NIKKEI +${nikkeiDayPct}% FRI`,
    `FTSE ${ftseDayPct}% FRI`,
    `TSX ${tsxClose.toLocaleString('en-US')} ${tsxDayPct}% FRI`,
    `CAD 1.4002 / USD BOC`,
    `WTI $${wti.toFixed(2)} BRENT $${brent.toFixed(2)}`,
    `MAC MINI / STUDIO TUE`,
    `SELL NOTHING THIS WEEKEND`,
  ],
};

export const episode: DailyReport = parseDailyReport(raw);
