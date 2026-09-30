import {parseDailyReport, type DailyReport} from '../schema';

const nvdaClose = 212.17;
const nvdaDayPct = 0.57;
const aaplClose = 331.34;
const aaplDayPct = -0.52;
const vooClose = 696.2;
const vooDayPct = -0.44;
const vtiClose = 372.84;
const vtiDayPct = -0.49;
const vugClose = 87.06;
const vugDayPct = -0.74;
const mgkClose = 89.05;
const mgkDayPct = -0.62;
const gdvClose = 29.18;
const gdvDayPct = -0.75;
const spxClose = 7585.73;
const spxDayPct = -0.45;
const spxYtdPct = 10.8;
const nasdaqClose = 25981.57;
const nasdaqDayPct = -0.78;
const tenYear = 5.0;
const nikkei = 63923;
const nikkeiDayPct = 0.69;
const topix = 4061.72;
const topixDayPct = 0.61;
const hangSeng = 24713.78;
const hangSengDayPct = 0.19;
const ftse = 10658.13;
const ftseDayPct = -0.4;
const tsxClose = 35582.07;
const tsxDayPct = -0.34;
const wti = 105.83;
const wtiDayPct = 4.38;
const brent = 108.75;
const brentDayPct = 2.9;
const nvdaQ2Rev = 96.2;
const nvdaDcRev = 89.0;
const nvdaQ3Guide = 108.0;

const raw = {
  meta: {
    date: '2026-09-16',
    dateLabel: 'SEP 16, 2026',
    title: 'Daily Wealth Intelligence',
    thesis:
      'The book still owns the same U.S. mega-cap growth stack. Tuesday cash was oil, a 5% 10-year, and another down day in the indexes — not a new holding.',
    thesisLead: 'Same book. FOMC afternoon.',
    thesisAccent: 'The statement is not an add ticket.',
    catalyst: 'FOMC statement today 2 p.m. ET. Do not add into the print.',
    kicker: 'US and CA cash are Tuesday. US open is 9:30 ET. Statement is 2 p.m.',
    universe: ['AAPL', 'NVDA', 'VOO', 'VTI', 'VUG', 'MGK', 'GDV'],
  },
  market: {
    spxClose,
    spxDayPct,
    spxYtdPct,
    nasdaqDayPct,
    tenYearYield: tenYear,
    note: 'Tuesday cash: S&P 7,585.73 −0.45%. Nasdaq 25,981.57 −0.78%. Treasury par 10-year 5.00%. NVDA bounced +0.57% after Monday’s −3.36%.',
    nextCalendar: {
      label: 'FOMC statement 2 p.m. ET',
      detail: 'Sep 15–16 meeting with SEP. Street has a hike priced. Do not add into the print.',
    },
  },
  markets: {
    global: {
      indices: [
        {label: 'Nikkei 225', value: nikkei.toLocaleString('en-US'), dayPct: nikkeiDayPct, note: 'Wednesday Tokyo (Kyodo/Mainichi)'},
        {label: 'TOPIX', value: topix.toLocaleString('en-US'), dayPct: topixDayPct, note: 'Wednesday Tokyo (Kyodo/Mainichi)'},
        {label: 'Hang Seng', value: hangSeng.toLocaleString('en-US'), dayPct: hangSengDayPct, note: 'Wednesday close (Futunn); AP said edged +0.1%'},
        {label: 'FTSE 100', value: ftse.toLocaleString('en-US'), dayPct: ftseDayPct, note: 'Tuesday London (AJ Bell). Wednesday Europe still open at this wake.'},
        {label: 'DAX 40', dayPct: -0.2, note: 'Tuesday (AJ Bell). Level unread — conflicting prints omitted.'},
        {label: 'CAC 40', dayPct: -0.3, note: 'Tuesday (AJ Bell). Level unread.'},
      ],
      fx: [{label: 'USD/JPY', note: 'Kyodo: dollar briefly mid-155 yen in Tokyo. Not a New York close.'}],
      commodities: [
        {label: 'WTI Oct', value: `$${wti.toFixed(2)}`, dayPct: wtiDayPct, note: 'Tuesday settle (PFL / Newsquawk)'},
        {label: 'Brent Nov', value: `$${brent.toFixed(2)}`, dayPct: brentDayPct, note: 'Tuesday settle (PFL / Newsquawk)'},
      ],
      rates: [{label: 'U.S. 10-year', value: `${tenYear.toFixed(2)}%`, note: 'Treasury par yield 09/15. Highest close in this series since 2007 (Aju Press / Straits Times).'}],
      note: 'Wednesday Shanghai official close unread. Wednesday Europe cash not closed at 9:02 ET.',
    },
    us: {
      indices: [
        {
          label: 'S&P 500',
          value: spxClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: spxDayPct,
        },
        {label: 'Nasdaq', value: nasdaqClose.toLocaleString('en-US'), dayPct: nasdaqDayPct},
        {label: 'Dow', value: '52,093.11', dayPct: -0.63, note: 'Tuesday (AP / Straits Times)'},
        {label: 'Russell 2000', value: '2,870.29', dayPct: -0.8, note: 'Tuesday (AP)'},
      ],
      sectors: [
        {label: 'Energy', dayPct: 2.3, note: 'Tuesday S&P sector (Reuters/Straits Times). Oil bounce.'},
        {label: 'Consumer discretionary', note: 'Tuesday: biggest S&P percentage loser (Reuters).'},
      ],
      breadth: 'Nasdaq decliners led 2.33-to-1 (Reuters). NYSE decliners 2.56-to-1.',
      yields: [{label: 'U.S. 10-year', value: `${tenYear.toFixed(2)}%`, note: 'Treasury par 09/15'}],
      note: 'Tuesday cash. Wednesday US cash not open at 9:02 ET. YTD S&P +10.8%, Nasdaq +11.8% (AP).',
    },
    ca: {
      indices: [
        {
          label: 'S&P/TSX Composite',
          value: tsxClose.toLocaleString('en-US'),
          dayPct: tsxDayPct,
          note: 'Tuesday close (Canadian Press). −120.46 points.',
        },
      ],
      cadUsd: '1.3917 CAD per USD (BoC Valet daily average 2026-09-15). Wednesday Valet unread.',
      sectors: [{label: 'Energy', note: 'Baystreet: energy the lone TSX gainer Tuesday (+2.8% subgroup).'}],
      note: 'Tuesday cash. TSX not open at this wake. StatCan August CPI already on the tape Monday: +3.0% y/y.',
    },
    calendar: {
      items: [
        {
          when: 'Today 2 p.m. ET',
          where: 'US' as const,
          label: 'FOMC statement + SEP',
          why: 'Two-day meeting ends. Street has a hike priced. Do not add into the print.',
        },
        {
          when: 'Today',
          where: 'US' as const,
          label: 'U.S. retail sales',
          why: 'AJ Bell Wednesday calendar. Read after, not a buy ticket.',
        },
        {
          when: 'Today',
          where: 'GLOBAL' as const,
          label: 'UK CPI',
          why: 'AJ Bell: UK inflation before the Thursday BoE decision.',
        },
        {
          when: 'Thursday',
          where: 'GLOBAL' as const,
          label: 'Bank of England',
          why: 'AJ Bell: Peel Hunt expects a hold. Market prices later hikes. Not our print.',
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
      whatMatters: 'Tuesday +0.57% after Monday −3.36%. Q3 guide already on tape. Do not buy the bounce into 2 p.m.',
    },
    {
      ticker: 'AAPL',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Recent purchase',
      whatMatters: 'Tuesday −0.52%. iPhone 18 Pro Friday. Do not add the same name this week.',
    },
    {
      ticker: 'VOO',
      rating: 'CORE / ADD after the statement',
      tone: 'long' as const,
      role: 'Best simple core',
      whatMatters: 'Tuesday −0.44%. New core money still simplifies here — after 2 p.m., not before.',
    },
    {
      ticker: 'VTI',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Broad US',
      whatMatters: 'Tuesday −0.49%. Excellent fund. Still overlaps VOO.',
      overlapWith: ['VOO'],
    },
    {
      ticker: 'VUG',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Growth sleeve',
      whatMatters: 'Tuesday −0.74%. You already own the individual winners.',
      overlapWith: ['NVDA', 'AAPL', 'VOO', 'MGK'],
    },
    {
      ticker: 'MGK',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Mega-cap growth',
      whatMatters: 'Tuesday −0.62%. Same stack, more concentrated.',
      overlapWith: ['NVDA', 'AAPL', 'VUG', 'VOO'],
    },
    {
      ticker: 'GDV',
      rating: 'HOLD — income / diversifier',
      tone: 'long' as const,
      role: 'Income sleeve',
      whatMatters: 'Tuesday market $29.18. Different job. NAV unread this sitting.',
    },
  ],
  portfolio: {
    concentrationThesis: 'VOO + VTI + VUG + MGK + AAPL + NVDA still buy the same companies.',
    concentrationBody:
      'Tuesday’s oil-and-rates tape is why several Wealthsimple lines can turn red together. That is structure, not a sell ticket.',
    factorStack: ['NVDA', 'AAPL', 'MGK', 'VUG', 'VOO', 'VTI'],
    factorLabel: 'U.S. mega-cap / growth',
    overlapNote: 'same ecosystem',
  },
  names: [
    {
      ticker: 'NVDA',
      chapterTitle: 'NVDA · earnings are done. FOMC is this afternoon.',
      rating: 'HOLD — NO ADD INTO FOMC',
      tone: 'watch' as const,
      price: nvdaClose,
      dayPct: nvdaDayPct,
      holdNote: 'Tuesday close $212.17. A bounce after Monday’s −3.36% is not an add. No buy before 2 p.m.',
      streak: [0.84, -2.01, -0.91, -2.37, -0.03, -3.36, 0.57],
      streakHeadline: 'Five red sessions in the last seven. Tuesday broke the red cluster.',
      streakNote: 'Window is Sep 4–15 closes (YCharts). Not a 21-day grid. Not a 0–100 score.',
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
        leftHeadline: 'Oil at four-month highs. 10-year closed 5%.',
        leftBody:
          'WTI $105.83 (+4.38%) after Yanbu loadings were suspended. Treasury par 10-year 5.00%. Long rates compress the exact overweight. A bounce in NVDA does not clear that.',
        rightTitle: 'THE COUNTER',
        rightHeadline: 'The last earnings print was not a miss.',
        rightBody:
          'Q2 $96.2B, data center $89.0B, GM 75.0%. Q3 guide $108.0B ±2%, no China data-center compute in the outlook. That is last month’s filing. It does not make Tuesday’s close a buy into FOMC.',
      },
      interpretation: {
        chips: [
          {label: 'CONFIRMED', tone: 'long' as const, text: 'Q2 demand and Q3 guide are on the IR tape.'},
          {label: 'CONFIRMED', tone: 'watch' as const, text: 'Tuesday’s bounce followed Monday’s chip hit. 10-year closed 5%.'},
          {
            label: 'INFERENCE',
            tone: 'caution' as const,
            text: 'Buying the bounce into a SEP FOMC is a timing bet we do not have to take.',
          },
        ],
        note: 'No composite score. Five red of seven is a count, not a 73/100.',
      },
      actionMatrix: {
        headline: 'HOLD the line. Do not add into 2 p.m.',
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
            if: 'Dots or the presser reprice a longer hike path',
            then: 'Do not average down into the event. Re-read, then decide.',
          },
        ],
      },
      network: {
        title: 'NVDA · qualitative demand chain',
        headline: 'Polarity from IR + Tuesday tape. No composite score.',
        nodes: [
          {id: 'labs', label: 'GPU demand', polarity: 'confirmed' as const, x: 0.08, y: 0.22},
          {id: 'demand', label: 'AI factory build', polarity: 'confirmed' as const, x: 0.3, y: 0.22, evidence: 'Q3 guide $108B ±2%'},
          {id: 'oil', label: 'Oil / Yanbu', polarity: 'concern' as const, x: 0.5, y: 0.22, evidence: 'WTI $105.83'},
          {id: 'financing', label: 'Third-party capital', polarity: 'concern' as const, x: 0.3, y: 0.78, evidence: '$500B+ platforms (IR)'},
          {id: 'nvda', label: 'NVDA', polarity: 'neutral' as const, x: 0.62, y: 0.5},
          {id: 'china', label: 'China DC compute', polarity: 'concern' as const, x: 0.82, y: 0.18, evidence: 'Not in Q3 outlook'},
          {id: 'margins', label: 'GM guide 74%', polarity: 'inference' as const, x: 0.82, y: 0.5},
          {id: 'rates', label: '10-year 5.00%', polarity: 'concern' as const, x: 0.82, y: 0.82, evidence: 'Treasury par 09/15'},
          {id: 'valuation', label: 'Tuesday close', polarity: 'inference' as const, x: 0.94, y: 0.5},
        ],
        edges: [
          {from: 'labs', to: 'demand'},
          {from: 'demand', to: 'nvda'},
          {from: 'oil', to: 'rates'},
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
      holdNote: 'Tuesday close $331.34. You just bought it. Do not add again this week.',
      streak: [-2.51, -1.17, -0.28, 3.56, 1.75, 0.24, -0.52],
      streakHeadline: 'Last seven sessions: a bounce, then a quiet giveback.',
      streakNote: 'Window is Sep 4–15 closes (StockAnalysis + Tuesday close). Not a YTD path.',
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
      metrics: [{label: 'Tuesday close', value: `$${vooClose.toFixed(2)}  ${vooDayPct}%`}],
      copy: {
        headline: 'Best simple core. New core money waits for 2 p.m., then simplifies here.',
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
      metrics: [{label: 'Tuesday close', value: `$${vtiClose.toFixed(2)}  ${vtiDayPct}%`}],
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
      metrics: [{label: 'Tuesday close', value: `$${vugClose.toFixed(2)}  ${vugDayPct}%`}],
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
      metrics: [{label: 'Tuesday close', value: `$${mgkClose.toFixed(2)}  ${mgkDayPct}%`}],
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
      metrics: [{label: 'Tuesday market', value: `$${gdvClose.toFixed(2)}  ${gdvDayPct}%`}],
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
      id: 'fomc-print',
      area: 'US' as const,
      question: 'What did the FOMC statement, SEP, and Warsh presser actually say?',
      whyItMatters: 'This wake is 9:02 ET. The statement is 2 p.m. A hike the street already priced is not a print we have.',
      neededToKnow: 'Fed statement + SEP table + presser, then Wednesday cash.',
      status: 'unknown' as const,
    },
    {
      id: 'us-cash-wednesday',
      area: 'US' as const,
      question: 'Where does Wednesday US cash close?',
      whyItMatters: 'Tuesday is the last cash print. An open print is not a close.',
      neededToKnow: 'Wednesday 4 p.m. ET index and name closes.',
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
    freshCapital: 'No add into FOMC. After the 2 p.m. statement, new core money simplifies into VOO.',
    bestAdd: 'VOO — after the statement, not before',
    highestUpsideWatch: 'none named',
    biggestRisk: 'Mega-cap growth overlap across NVDA, AAPL, MGK, VUG, VOO, VTI — plus a 10-year that closed 5.00%',
    nextTrigger: 'Today 2 p.m. ET — FOMC statement + SEP',
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
      body: `Treasury par 10-year closed ${tenYear.toFixed(2)}% Tuesday. Long rates compress the exact overweight.`,
    },
    {
      n: '03',
      title: 'Oil into inflation into the Fed',
      body: 'WTI $105.83 after Yanbu loadings stopped. That is the input the committee is staring at this afternoon — not a reason to size NVDA before the statement.',
    },
  ],
  close: {
    kicker: 'DIAGNOSTIC',
    headline: 'This afternoon’s Fed print is a book event, not an NVDA-only event.',
    body: 'Same seven lines. Same overlap. Sell nothing this morning. Do not add NVDA or AAPL into the statement. If fresh capital arrives after 2 p.m., it still wants VOO first.',
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
    `SPX  ${spxClose.toLocaleString('en-US')}  ${spxDayPct}%  TUE`,
    `NASDAQ  ${nasdaqDayPct}%  TUE`,
    `SPX YTD  +${spxYtdPct}%`,
    `10Y  ${tenYear.toFixed(2)}%  TREASURY PAR`,
    `NVDA  $${nvdaClose.toFixed(2)}  +${nvdaDayPct}%`,
    `AAPL  $${aaplClose.toFixed(2)}  ${aaplDayPct}%`,
    `VOO  $${vooClose.toFixed(2)}  ${vooDayPct}%`,
    `NIKKEI  +${nikkeiDayPct}%  WED`,
    `HSI  +${hangSengDayPct}%  WED`,
    `FTSE  ${ftseDayPct}%  TUE`,
    `TSX  ${tsxClose.toLocaleString('en-US')}  ${tsxDayPct}%  TUE`,
    `CAD  1.3917 / USD  BOC`,
    `WTI  $${wti.toFixed(2)}  BRENT  $${brent.toFixed(2)}`,
    `FOMC  TODAY 2PM ET`,
    `IPHONE 18 PRO  FRI`,
    `SELL NOTHING THIS MORNING`,
  ],
};

export const episode: DailyReport = parseDailyReport(raw);
