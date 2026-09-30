import {parseDailyReport, type DailyReport} from '../schema';

const nvdaClose = 210.96;
const nvdaDayPct = -3.36;
const aaplClose = 333.08;
const aaplDayPct = 0.24;
const vooClose = 699.3;
const vooDayPct = -0.46;
const vtiClose = 374.68;
const vtiDayPct = -0.43;
const vugClose = 87.71;
const vugDayPct = -0.35;
const mgkClose = 89.61;
const mgkDayPct = -0.32;
const gdvClose = 29.4;
const gdvDayPct = -0.51;
const spxClose = 7619.98;
const spxDayPct = -0.48;
const nasdaqClose = 26186.41;
const nasdaqDayPct = -0.56;
const tenYear = 4.98;
const nikkei = 64082.36;
const nikkeiDayPct = 0.93;
const topix = 4057.06;
const topixDayPct = -0.03;
const hangSeng = 24667.24;
const hangSengDayPct = -1.0;
const tsxClose = 35702.53;
const tsxDayPct = 0.01;
const wti = 101.39;
const wtiDayPct = 1.34;
const brent = 105.68;
const brentDayPct = 1.02;
const nvdaQ2Rev = 96.2;
const nvdaDcRev = 89.0;
const nvdaQ3Guide = 108.0;

const raw = {
  meta: {
    date: '2026-09-15',
    dateLabel: 'SEP 15, 2026',
    title: 'Daily Wealth Intelligence',
    thesis:
      'The book still owns the same U.S. mega-cap growth stack. Monday’s tape was rates, oil, and an AI-pace scare — not a new holding.',
    thesisLead: 'Same book. Different tape.',
    thesisAccent: 'Rates and chips, not a new name.',
    catalyst: 'FOMC two-day meeting. Statement Wednesday 2 p.m. ET.',
    kicker: 'US cash is Monday. Tuesday cash is not open yet.',
    universe: ['AAPL', 'NVDA', 'VOO', 'VTI', 'VUG', 'MGK', 'GDV'],
  },
  market: {
    spxClose,
    spxDayPct,
    nasdaqDayPct,
    tenYearYield: tenYear,
    note: 'Monday cash: S&P 7,619.98 −0.48%. 10-year tagged 5% then closed 4.98%. NVDA −3.36% was the heaviest S&P weight (AP). Pre-market is not a close.',
    nextCalendar: {
      label: 'FOMC statement Wednesday',
      detail: 'Sep 15–16 meeting with SEP. Street expects a hike. Do not add into the print.',
    },
  },
  markets: {
    global: {
      indices: [
        {label: 'Nikkei 225', value: nikkei.toLocaleString('en-US'), dayPct: nikkeiDayPct, note: 'Tuesday Tokyo (Kyodo)'},
        {label: 'TOPIX', value: topix.toLocaleString('en-US'), dayPct: topixDayPct, note: 'Tuesday Tokyo (Kyodo)'},
        {label: 'Hang Seng', value: hangSeng.toLocaleString('en-US'), dayPct: hangSengDayPct, note: 'Tuesday close'},
      ],
      fx: [{label: 'USD/JPY', value: '154.80', note: 'Tokyo noon (Kyodo); not a New York close'}],
      commodities: [
        {label: 'WTI Oct', value: `$${wti.toFixed(2)}`, dayPct: wtiDayPct, note: 'Monday settle'},
        {label: 'Brent Nov', value: `$${brent.toFixed(2)}`, dayPct: brentDayPct, note: 'Monday settle (AP)'},
      ],
      rates: [{label: 'U.S. 10-year', value: `${tenYear}%`, note: 'Monday. Tagged 5.00% then pulled back (AP).'}],
      note: 'Tuesday Europe close unread — London still open at this wake. Shanghai official close unread.',
    },
    us: {
      indices: [
        {label: 'S&P 500', value: spxClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}), dayPct: spxDayPct},
        {label: 'Nasdaq', value: nasdaqClose.toLocaleString('en-US'), dayPct: nasdaqDayPct},
      ],
      sectors: [{label: 'NVDA in the S&P', note: 'AP: heaviest weight on Monday’s tape, −3.4%.'}],
      yields: [{label: 'U.S. 10-year', value: `${tenYear}%`}],
      note: 'Monday cash. Tuesday US cash not open at 9:17 ET. Software bounced; chips did not.',
    },
    ca: {
      indices: [{label: 'S&P/TSX Composite', value: tsxClose.toLocaleString('en-US'), dayPct: tsxDayPct, note: 'Monday close (Reuters/CP)'}],
      cadUsd: '1.3915 CAD per USD (Reuters Monday; 71.86 U.S. cents). Tuesday Valet unread.',
      note: 'StatCan August CPI already out Monday: +3.0% y/y, still above the 2% target.',
    },
    calendar: {
      items: [
        {
          when: 'Tue–Wed',
          where: 'US' as const,
          label: 'FOMC + SEP',
          why: 'Two-day meeting. Statement Wednesday 2 p.m. ET. Street expects a hike.',
        },
        {
          when: 'Friday',
          where: 'US' as const,
          label: 'iPhone 18 Pro availability',
          why: 'Apple newsroom: Friday Sep 18 in Canada and the U.S. AAPL catalyst, not a buy ticket.',
        },
        {
          when: 'Tuesday Sep 22',
          where: 'US' as const,
          label: 'Mac mini / Mac Studio in stores',
          why: 'Apple newsroom dated availability for the local-AI Macs. Still inference, not a quarter print.',
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
      rating: 'HOLD — no add into FOMC',
      tone: 'watch' as const,
      role: 'Highest-beta AI line',
      whatMatters: 'Monday −3.36%. Q3 guide already on tape. Do not buy the dip into Wednesday.',
    },
    {
      ticker: 'AAPL',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Recent purchase',
      whatMatters: 'Monday +0.24%. iPhone 18 Pro Friday. Do not add the same name this week.',
    },
    {
      ticker: 'VOO',
      rating: 'CORE / ADD after the statement',
      tone: 'long' as const,
      role: 'Best simple core',
      whatMatters: 'Monday −0.46%. New core money still simplifies here — after Wednesday, not before.',
    },
    {
      ticker: 'VTI',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Broad US',
      whatMatters: 'Monday −0.43%. Excellent fund. Still overlaps VOO.',
      overlapWith: ['VOO'],
    },
    {
      ticker: 'VUG',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Growth sleeve',
      whatMatters: 'Monday −0.35%. You already own the individual winners.',
      overlapWith: ['NVDA', 'AAPL', 'VOO', 'MGK'],
    },
    {
      ticker: 'MGK',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Mega-cap growth',
      whatMatters: 'Monday −0.32%. Same stack, more concentrated.',
      overlapWith: ['NVDA', 'AAPL', 'VUG', 'VOO'],
    },
    {
      ticker: 'GDV',
      rating: 'HOLD — income / diversifier',
      tone: 'long' as const,
      role: 'Income sleeve',
      whatMatters: 'Monday market $29.40. Different job. NAV as-of Sep 14 unread.',
    },
  ],
  portfolio: {
    concentrationThesis: 'VOO + VTI + VUG + MGK + AAPL + NVDA still buy the same companies.',
    concentrationBody:
      'Monday’s chip selloff is why several Wealthsimple lines can turn red together. That is structure, not a sell ticket.',
    factorStack: ['NVDA', 'AAPL', 'MGK', 'VUG', 'VOO', 'VTI'],
    factorLabel: 'U.S. mega-cap / growth',
    overlapNote: 'same ecosystem',
  },
  names: [
    {
      ticker: 'NVDA',
      chapterTitle: 'NVDA · earnings are done. FOMC is the next print.',
      rating: 'HOLD — NO ADD INTO FOMC',
      tone: 'watch' as const,
      price: nvdaClose,
      dayPct: nvdaDayPct,
      holdNote: 'Monday close. StockAnalysis pre-market 9:18 ET $212.70 is not a close. No buy before Wednesday.',
      streak: [1.8, 0.84, -2.01, -0.91, -2.26, -0.03, -3.36],
      streakHeadline: 'Five red sessions in the last seven.',
      streakNote: 'Window is Sep 3–14 closes. Not a 21-day grid. Not a 0–100 score.',
      fundamentals: [
        {label: 'Q2 FY27 revenue', value: `$${nvdaQ2Rev.toFixed(1)}B  +106% y/y`},
        {label: 'Q2 data center', value: `$${nvdaDcRev.toFixed(1)}B  +117% y/y`},
        {label: 'Q2 GAAP GM / EPS', value: '75.0%  /  $2.46'},
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
        leftHeadline: 'AI labs asked for a slower build. 10-year tagged 5%.',
        leftBody:
          'AP: Anthropic’s CEO called for a deliberate global slowdown. Altman delayed an OpenAI listing into next year. SoftBank fell hard in Tokyo Monday. Financing platforms still target $500B+ of third-party AI infrastructure capital (NVIDIA IR).',
        rightTitle: 'THE COUNTER',
        rightHeadline: 'The last earnings print was not a miss.',
        rightBody:
          'Q2 $96.2B, data center $89.0B, GM 75.0%. Q3 guide $108.0B ±2%, no China data-center compute in the outlook. Vera Rubin in full production (IR). That is last month’s filing. It does not make Monday’s close a buy.',
      },
      interpretation: {
        chips: [
          {label: 'CONFIRMED', tone: 'long' as const, text: 'Q2 demand and Q3 guide are on the IR tape.'},
          {label: 'CONFIRMED', tone: 'watch' as const, text: 'Monday’s move was rates + oil + an AI-pace headline, not a new 10-Q.'},
          {
            label: 'INFERENCE',
            tone: 'caution' as const,
            text: 'Buying the dip into a SEP FOMC is a timing bet we do not have to take.',
          },
        ],
        note: 'No composite score. Five red days in seven is a count, not a 73/100.',
      },
      actionMatrix: {
        headline: 'HOLD the line. Do not add into Wednesday.',
        rows: [
          {
            tone: 'long' as const,
            if: 'Statement is a hike and 10-year backs off without a chip crash',
            then: 'Still HOLD NVDA. New core money waits, then VOO.',
          },
          {
            tone: 'watch' as const,
            if: 'Normal hike, chips bounce in the first hour',
            then: 'HOLD. Bounce is not a sourced add.',
          },
          {
            tone: 'caution' as const,
            if: '10-year holds 5%+ and NVDA keeps selling',
            then: 'Do not automatically buy the dip this week',
          },
          {
            tone: 'short' as const,
            if: 'Guide/China/ROI headlines worsen after the presser',
            then: 'Do not average down into the event. Re-read, then decide.',
          },
        ],
      },
      network: {
        title: 'NVDA · qualitative demand chain',
        headline: 'Polarity from IR + Monday tape. No composite score.',
        nodes: [
          {id: 'labs', label: 'Frontier labs / OpenAI delay', polarity: 'concern' as const, x: 0.08, y: 0.22, evidence: 'Altman: listing next year'},
          {id: 'demand', label: 'GPU demand', polarity: 'confirmed' as const, x: 0.3, y: 0.22},
          {id: 'spend', label: 'AI factory build', polarity: 'confirmed' as const, x: 0.5, y: 0.22, evidence: 'Vera Rubin in production'},
          {id: 'financing', label: 'Third-party capital', polarity: 'concern' as const, x: 0.3, y: 0.78, evidence: '$500B+ platforms (IR)'},
          {id: 'nvda', label: 'NVDA', polarity: 'neutral' as const, x: 0.62, y: 0.5},
          {id: 'china', label: 'China DC compute', polarity: 'concern' as const, x: 0.82, y: 0.18, evidence: 'Not in Q3 outlook'},
          {id: 'margins', label: 'GM guide 74%', polarity: 'inference' as const, x: 0.82, y: 0.5},
          {id: 'rates', label: '10-year ~5%', polarity: 'concern' as const, x: 0.82, y: 0.82, evidence: 'Tagged 5.00% Monday'},
          {id: 'valuation', label: 'Monday close', polarity: 'inference' as const, x: 0.94, y: 0.5},
        ],
        edges: [
          {from: 'labs', to: 'demand'},
          {from: 'demand', to: 'spend'},
          {from: 'spend', to: 'nvda'},
          {from: 'financing', to: 'nvda', label: 'exposure'},
          {from: 'nvda', to: 'china'},
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
      holdNote: 'Monday close $333.08. Pre-market is not a close. You just bought it. Do not add again this week.',
      streak: [1.0, -2.51, -1.17, -0.28, 3.56, 1.75, 0.24],
      streakHeadline: 'Last seven sessions: a bounce, then a quiet Monday.',
      streakNote: 'Window is Sep 3–14 closes. Not a YTD path.',
      catalyst: {
        headline: 'iPhone 18 Pro Friday Sep 18. Mac mini / Studio in stores Sep 22.',
        steps: [
          'Phone availability this Friday (newsroom)',
          'Local-AI Macs dated Sep 22',
          'That is a product calendar, not a quarter beat',
        ],
        note: 'Canada is on the Sep 18 list. Still not a reason to double the line before FOMC.',
      },
      action: {
        headline: 'HOLD the position.',
        body: 'Do not add AAPL this week. Next contribution should diversify, not stack the same name.',
      },
    },
    {
      ticker: 'VOO',
      chapterTitle: 'VOO · still the simple core',
      rating: 'CORE / ADD AFTER THE STATEMENT',
      tone: 'long' as const,
      price: vooClose,
      dayPct: vooDayPct,
      metrics: [{label: 'Monday close', value: `$${vooClose.toFixed(2)}  ${vooDayPct}%`}],
      copy: {
        headline: 'Best simple core. New core money waits for Wednesday, then simplifies here.',
        body: 'Do not sell. Do not split the next contribution with VTI. Do not add before the FOMC statement.',
      },
    },
    {
      ticker: 'VTI',
      chapterTitle: 'VTI · excellent, overlapping',
      rating: 'HOLD',
      tone: 'long' as const,
      price: vtiClose,
      dayPct: vtiDayPct,
      metrics: [{label: 'Monday close', value: `$${vtiClose.toFixed(2)}  ${vtiDayPct}%`}],
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
      metrics: [{label: 'Monday close', value: `$${vugClose.toFixed(2)}  ${vugDayPct}%`}],
      copy: {
        headline: 'You already own NVDA and AAPL directly.',
        body: 'HOLD existing. No priority additions. YTD vs S&P unread this sitting — omitted, not faked.',
      },
    },
    {
      ticker: 'MGK',
      chapterTitle: 'MGK · same stack, tighter',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      price: mgkClose,
      dayPct: mgkDayPct,
      metrics: [{label: 'Monday close', value: `$${mgkClose.toFixed(2)}  ${mgkDayPct}%`}],
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
      metrics: [{label: 'Monday market', value: `$${gdvClose.toFixed(2)}  ${gdvDayPct}%`}],
      copy: {
        body: 'Closed-end income/value. Last sourced NAV snapshot is Sep 2 ($33.78, −11.52% discount) — too stale to print as today. When growth gets punched, this sleeve is supposed to look different. Not Next-NVDA.',
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
      id: 'us-cash-tuesday',
      area: 'US' as const,
      question: 'Where does Tuesday US cash close?',
      whyItMatters: 'This wake is 9:17 ET. Monday is the last cash print. Pre-market is not a close.',
      neededToKnow: 'Tuesday 4 p.m. ET index and name closes.',
      status: 'unknown' as const,
    },
    {
      id: 'europe-close',
      area: 'GLOBAL' as const,
      question: 'Where did STOXX / FTSE / DAX close Tuesday?',
      whyItMatters: 'London is still open at this wake. An open print is not a close.',
      neededToKnow: 'Official Europe closes after the London cash close.',
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
      whyItMatters: 'Five red of seven is a count. A decorative 0–100 would be a lie.',
      neededToKnow: 'A named formula and inputs — or omit the score field.',
      status: 'unknown' as const,
    },
  ],
  scenarios: [],
  capitalPlan: {
    existingPortfolio: 'HOLD — sell nothing this morning.',
    freshCapital: 'No add into FOMC. After the Wednesday statement, new core money simplifies into VOO.',
    bestAdd: 'VOO — after the statement, not before',
    highestUpsideWatch: 'none named',
    biggestRisk: 'Mega-cap growth overlap across NVDA, AAPL, MGK, VUG, VOO, VTI — plus a 10-year that just tagged 5%',
    nextTrigger: 'Wednesday 2 p.m. ET — FOMC statement + SEP',
    ifThen: [
      {
        tone: 'long' as const,
        if: 'Hike prints and 10-year backs off without a chip crash',
        then: 'HOLD names. New core money can go to VOO.',
      },
      {
        tone: 'watch' as const,
        if: 'Statement matches the hike the street already priced',
        then: 'HOLD. Do not chase the first bounce in NVDA.',
      },
      {
        tone: 'caution' as const,
        if: '10-year holds 5%+ and growth keeps selling',
        then: 'Do not buy the dip this week. Wait for a second tape.',
      },
      {
        tone: 'short' as const,
        if: 'Dots or the presser reprice a longer hike path',
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
      body: `The 10-year tagged 5.00% Monday and closed ${tenYear}%. Long rates compress the exact overweight.`,
    },
    {
      n: '03',
      title: 'AI pace vs AI spend',
      body: 'Lab CEOs asked for a slower build. NVIDIA’s last guide still assumes a full-steam factory. Those can both be true for a while — until capex budgets blink.',
    },
  ],
  close: {
    kicker: 'DIAGNOSTIC',
    headline: 'Wednesday’s Fed print is a book event, not an NVDA-only event.',
    body: 'Same seven lines. Same overlap. Sell nothing this morning. Do not add NVDA or AAPL into the statement. If fresh capital arrives after 2 p.m. Wednesday, it still wants VOO first.',
    pills: [
      {tone: 'watch' as const, label: 'HOLD THIS MORNING'},
      {tone: 'caution' as const, label: 'NO ADD INTO FOMC'},
      {tone: 'long' as const, label: 'VOO AFTER THE STATEMENT'},
    ],
    followThrough: [
      {
        tone: 'watch' as const,
        if: 'Chips bounce and the book still looks expensive versus VOO',
        then: 'Keep the Next-NVDA sleeve empty.',
      },
      {
        tone: 'caution' as const,
        if: '10-year stays at 5% and growth keeps leaking',
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
    `SPX  ${spxClose.toLocaleString('en-US')}  ${spxDayPct}%  MON`,
    `NASDAQ  ${nasdaqDayPct}%  MON`,
    `10Y  ${tenYear}%  TAGGED 5%`,
    `NVDA  $${nvdaClose.toFixed(2)}  ${nvdaDayPct}%`,
    `AAPL  $${aaplClose.toFixed(2)}  +${aaplDayPct}%`,
    `VOO  $${vooClose.toFixed(2)}  ${vooDayPct}%`,
    `NIKKEI  +${nikkeiDayPct}%  TUE`,
    `HSI  ${hangSengDayPct}%  TUE`,
    `TSX  ${tsxClose.toLocaleString('en-US')}  +${tsxDayPct}%  MON`,
    `CAD  1.3915 / USD  MON`,
    `WTI  $${wti.toFixed(2)}  BRENT  $${brent.toFixed(2)}`,
    `FOMC  WED 2PM ET`,
    `IPHONE 18 PRO  FRI`,
    `SELL NOTHING THIS MORNING`,
  ],
};

export const episode: DailyReport = parseDailyReport(raw);
