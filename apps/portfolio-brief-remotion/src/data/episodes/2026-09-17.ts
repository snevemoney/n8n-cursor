import {parseDailyReport, type DailyReport} from '../schema';

const nvdaClose = 213.9;
const nvdaDayPct = 0.82;
const aaplClose = 332.41;
const aaplDayPct = 0.32;
const vooClose = 693.24;
const vooDayPct = -0.43;
const vtiClose = 371.26;
const vtiDayPct = -0.42;
const vugClose = 87.06;
const vugDayPct = 0;
const mgkClose = 89.11;
const mgkDayPct = 0.07;
const gdvClose = 29.01;
const gdvDayPct = -0.07;
const spxClose = 7551.81;
const spxDayPct = -0.45;
const spxYtdPct = 10.3;
const nasdaqClose = 25978.42;
const nasdaqDayPct = -0.01;
const tenYear = 5.01;
const nikkei = 64136.25;
const nikkeiDayPct = 0.33;
const topix = 4094.19;
const topixDayPct = 0.8;
const hangSeng = 24604.29;
const hangSengDayPct = -0.44;
const shanghai = 3875.6;
const shanghaiDayPct = -0.41;
const ftse = 10688.47;
const ftseDayPct = 0.28;
const dax = 25537.75;
const daxDayPct = 0.53;
const cac = 8140.59;
const cacDayPct = 0.62;
const tsxClose = 35491.27;
const tsxDayPct = -0.26;
const wti = 102.43;
const wtiDayPct = -3.21;
const brent = 105.83;
const brentDayPct = -2.69;
const nvdaQ2Rev = 96.2;
const nvdaDcRev = 89.0;
const nvdaQ3Guide = 108.0;

const raw = {
  meta: {
    date: '2026-09-17',
    dateLabel: 'SEP 17, 2026',
    title: 'Daily Wealth Intelligence',
    thesis:
      'The Fed hiked. The book is still the same seven U.S. mega-cap growth lines. A green NVDA close is not an add ticket.',
    thesisLead: 'The hike is in. Same book.',
    thesisAccent: 'A green chip close is not an add.',
    catalyst: 'FOMC already printed 12–0: funds rate 3.75–4.00%. Next is today’s U.S. open, not a new holding.',
    kicker: 'US and CA cash are Wednesday. Thursday Asia is in. Thursday U.S. cash is not open at 9:06 ET.',
    universe: ['AAPL', 'NVDA', 'VOO', 'VTI', 'VUG', 'MGK', 'GDV'],
  },
  market: {
    spxClose,
    spxDayPct,
    spxYtdPct,
    nasdaqDayPct,
    tenYearYield: tenYear,
    note: 'Wednesday cash after the hike: S&P 7,551.81 −0.45%. Nasdaq 25,978.42 −0.01%. Treasury par 10-year 5.01%. NVDA closed $213.90 +0.82%.',
    nextCalendar: {
      label: 'U.S. cash open 9:30 ET',
      detail: 'FOMC is done. Do not treat the first hour as a sourced add. iPhone 18 Pro is Friday.',
    },
  },
  markets: {
    global: {
      indices: [
        {label: 'Nikkei 225', value: nikkei.toLocaleString('en-US'), dayPct: nikkeiDayPct, note: 'Thursday Tokyo (Nikkei)'},
        {label: 'TOPIX', value: topix.toLocaleString('en-US'), dayPct: topixDayPct, note: 'Thursday Tokyo (Nikkei)'},
        {label: 'Hang Seng', value: hangSeng.toLocaleString('en-US'), dayPct: hangSengDayPct, note: 'Thursday close (Minkabu / MarketWatch). HK followed the Fed hike the same day.'},
        {label: 'Shanghai Composite', value: shanghai.toLocaleString('en-US'), dayPct: shanghaiDayPct, note: 'Thursday official close (Zaikei / Minkabu)'},
        {label: 'FTSE 100', value: ftse.toLocaleString('en-US'), dayPct: ftseDayPct, note: 'Wednesday London (AJ Bell / Anadolu). Thursday Europe still open at this wake.'},
        {label: 'DAX 40', value: dax.toLocaleString('en-US'), dayPct: daxDayPct, note: 'Wednesday Frankfurt (Anadolu)'},
        {label: 'CAC 40', value: cac.toLocaleString('en-US'), dayPct: cacDayPct, note: 'Wednesday Paris (Anadolu)'},
      ],
      commodities: [
        {label: 'WTI Oct', value: `$${wti.toFixed(2)}`, dayPct: wtiDayPct, note: 'Wednesday settle (Newsquawk / FinancialJuice)'},
        {label: 'Brent Nov', value: `$${brent.toFixed(2)}`, dayPct: brentDayPct, note: 'Wednesday settle −$2.92 (Newsquawk)'},
      ],
      rates: [
        {label: 'U.S. 10-year', value: `${tenYear.toFixed(2)}%`, note: 'Treasury par yield 09/16'},
        {label: 'Fed funds', value: '3.75–4.00%', note: 'FOMC 12–0 hike, effective Sep 17 (Fed statement + implementation note)'},
        {label: 'Bank Rate', value: '3.75%', note: 'BoE held 6–3. Published 17 Sep. Meeting ended 16 Sep.'},
      ],
      note: 'Thursday Europe cash not closed at 9:06 ET. BoJ result is Friday (Nikkei).',
    },
    us: {
      indices: [
        {
          label: 'S&P 500',
          value: spxClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: spxDayPct,
        },
        {label: 'Nasdaq', value: nasdaqClose.toLocaleString('en-US'), dayPct: nasdaqDayPct},
        {label: 'Dow', value: '51,461.90', dayPct: -1.21, note: 'Wednesday (AP / The Core Quant)'},
        {label: 'Russell 2000', value: '2,858.81', dayPct: -0.4, note: 'Wednesday (AP)'},
      ],
      sectors: [
        {label: 'Banks (KBE)', dayPct: -2, note: 'Wednesday (The Core Quant). Worst day since February.'},
        {label: 'Industrials', note: 'Wednesday: led session gains (Motley Fool). Level unread.'},
        {label: 'Energy', note: 'Wednesday: lagged as oil settled lower (Motley Fool).'},
      ],
      yields: [{label: 'U.S. 10-year', value: `${tenYear.toFixed(2)}%`, note: 'Treasury par 09/16'}],
      note: 'Wednesday cash. Thursday U.S. cash not open at 9:06 ET. YTD S&P +10.3%, Nasdaq +11.8% (AP). FOMC 12–0: funds 3.75–4.00%. SEP median funds rate 4.1% at year-end 2026 (June was 3.8%).',
    },
    ca: {
      indices: [
        {
          label: 'S&P/TSX Composite',
          value: tsxClose.toLocaleString('en-US'),
          dayPct: tsxDayPct,
          note: 'Wednesday close (Reuters / MarketScreener). −90.8 points. Lowest close since July 31.',
        },
      ],
      cadUsd: '1.3947 CAD per USD (BoC Valet daily average 2026-09-16). Reuters late spot 1.3990 is not the Valet print.',
      note: 'Wednesday cash. TSX not open at this wake. StatCan August CPI already on the tape: +3.0% y/y.',
    },
    calendar: {
      items: [
        {
          when: 'This morning',
          where: 'GLOBAL' as const,
          label: 'Bank of England hold',
          why: 'Official: Bank Rate 3.75%, vote 6–3. Next decision 5 Nov. Not our print to trade.',
        },
        {
          when: 'Today 9:30 ET',
          where: 'US' as const,
          label: 'U.S. cash open',
          why: 'First session after the hike. Do not add into the open.',
        },
        {
          when: 'Friday',
          where: 'US' as const,
          label: 'iPhone 18 Pro availability',
          why: 'Apple newsroom: Friday Sep 18 in Canada and the U.S. AAPL catalyst, not a buy ticket.',
        },
        {
          when: 'Friday',
          where: 'GLOBAL' as const,
          label: 'Bank of Japan',
          why: 'Nikkei: result due 18 Sep. Unread until it prints.',
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
      rating: 'HOLD — no add on the hike close',
      tone: 'watch' as const,
      role: 'Highest-beta AI line',
      whatMatters: 'Wednesday $213.90 +0.82% into a 12–0 hike. Q3 guide already on tape. Green is not an add.',
    },
    {
      ticker: 'AAPL',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Recent purchase',
      whatMatters: 'Wednesday $332.41 +0.32%. iPhone 18 Pro Friday. Do not add the same name this week.',
    },
    {
      ticker: 'VOO',
      rating: 'CORE / ADD after a second tape',
      tone: 'long' as const,
      role: 'Best simple core',
      whatMatters: 'Wednesday $693.24 −0.43%. New core money still simplifies here — not in the first hour.',
    },
    {
      ticker: 'VTI',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Broad US',
      whatMatters: 'Wednesday $371.26 −0.42%. Excellent fund. Still overlaps VOO.',
      overlapWith: ['VOO'],
    },
    {
      ticker: 'VUG',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Growth sleeve',
      whatMatters: 'Wednesday unchanged $87.06. You already own the individual winners.',
      overlapWith: ['NVDA', 'AAPL', 'VOO', 'MGK'],
    },
    {
      ticker: 'MGK',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Mega-cap growth',
      whatMatters: 'Wednesday $89.11 +0.07%. Same stack, more concentrated.',
      overlapWith: ['NVDA', 'AAPL', 'VUG', 'VOO'],
    },
    {
      ticker: 'GDV',
      rating: 'HOLD — income / diversifier',
      tone: 'long' as const,
      role: 'Income sleeve',
      whatMatters: 'Wednesday market $29.01. Different job. NAV unread this sitting.',
    },
  ],
  portfolio: {
    concentrationThesis: 'VOO + VTI + VUG + MGK + AAPL + NVDA still buy the same companies.',
    concentrationBody:
      'Wednesday’s hike-and-5% 10-year tape is why several Wealthsimple lines can turn together. That is structure, not a sell ticket.',
    factorStack: ['NVDA', 'AAPL', 'MGK', 'VUG', 'VOO', 'VTI'],
    factorLabel: 'U.S. mega-cap / growth',
    overlapNote: 'same ecosystem',
  },
  names: [
    {
      ticker: 'NVDA',
      chapterTitle: 'NVDA · the hike closed. The guide did not change.',
      rating: 'HOLD — NO ADD ON THE HIKE CLOSE',
      tone: 'watch' as const,
      price: nvdaClose,
      dayPct: nvdaDayPct,
      holdNote: 'Wednesday close $213.90. A green print into a 12–0 hike is not an add.',
      streak: [0.57, 0.82],
      streakHeadline: 'Two green sessions into the hike. Not a 21-day grid.',
      streakNote: 'StatMuse closes Sep 14–16: $210.96 → $212.17 → $213.90. Two day-changes only. Not a 0–100 score.',
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
        leftHeadline: 'Fed hiked. 10-year 5.01%. Long rates still tax this book.',
        leftBody:
          'FOMC 12–0 to 3.75–4.00%. Statement: inflation remains elevated; action is for a timelier return to 2%. SEP median funds rate 4.1% at year-end 2026. That is another hike in the dots, not a pause.',
        rightTitle: 'THE COUNTER',
        rightHeadline: 'The last earnings print was not a miss. Wednesday NVDA closed green.',
        rightBody:
          'Q2 $96.2B, data center $89.0B, GM 75.0%. Q3 guide $108.0B ±2%, no China data-center compute in the outlook. Nasdaq barely moved (−0.01%) while the Dow fell 1.21%. Relative strength is not a buy ticket.',
      },
      interpretation: {
        chips: [
          {label: 'CONFIRMED', tone: 'long' as const, text: 'Q2 demand and Q3 guide are still the IR tape.'},
          {label: 'CONFIRMED', tone: 'watch' as const, text: 'Fed hiked 12–0. Treasury par 10-year 5.01%.'},
          {
            label: 'INFERENCE',
            tone: 'caution' as const,
            text: 'Buying the green close the morning after a hike is a timing bet we do not have to take.',
          },
        ],
        note: 'No composite score. Two green days is a count, not a 73/100.',
      },
      actionMatrix: {
        headline: 'HOLD the line. Do not add into the open.',
        rows: [
          {
            tone: 'long' as const,
            if: '10-year backs off without a chip crash',
            then: 'Still HOLD NVDA. New core money waits, then VOO.',
          },
          {
            tone: 'watch' as const,
            if: 'Chips bounce in the first hour',
            then: 'HOLD. Bounce is not a sourced add.',
          },
          {
            tone: 'caution' as const,
            if: '10-year holds 5%+ and NVDA gives back Wednesday',
            then: 'Do not automatically buy the dip this week',
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
        headline: 'Polarity from IR + Wednesday tape. No composite score.',
        nodes: [
          {id: 'labs', label: 'GPU demand', polarity: 'confirmed' as const, x: 0.08, y: 0.22},
          {id: 'demand', label: 'AI factory build', polarity: 'confirmed' as const, x: 0.3, y: 0.22, evidence: 'Q3 guide $108B ±2%'},
          {id: 'oil', label: 'Oil settle', polarity: 'concern' as const, x: 0.5, y: 0.22, evidence: 'WTI $102.43'},
          {id: 'financing', label: 'Third-party capital', polarity: 'concern' as const, x: 0.3, y: 0.78},
          {id: 'nvda', label: 'NVDA', polarity: 'neutral' as const, x: 0.62, y: 0.5},
          {id: 'fed', label: 'FOMC hike', polarity: 'concern' as const, x: 0.82, y: 0.18, evidence: '3.75–4.00% 12–0'},
          {id: 'margins', label: 'GM guide 74%', polarity: 'inference' as const, x: 0.82, y: 0.5},
          {id: 'rates', label: '10-year 5.01%', polarity: 'concern' as const, x: 0.82, y: 0.82, evidence: 'Treasury par 09/16'},
          {id: 'valuation', label: 'Wednesday close', polarity: 'inference' as const, x: 0.94, y: 0.5},
        ],
        edges: [
          {from: 'labs', to: 'demand'},
          {from: 'demand', to: 'nvda'},
          {from: 'oil', to: 'rates'},
          {from: 'fed', to: 'rates'},
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
      holdNote: 'Wednesday close $332.41. You just bought it. Do not add again this week.',
      catalyst: {
        headline: 'iPhone 18 Pro Friday Sep 18. Mac mini / Studio in stores Sep 22.',
        steps: [
          'Phone availability this Friday (Apple newsroom)',
          'Local-AI Macs dated Sep 22',
          'That is a product calendar, not a quarter beat',
        ],
        note: 'Canada is on the Sep 18 list. Still not a reason to double the line the morning after a hike.',
      },
      action: {
        headline: 'HOLD the position.',
        body: 'Do not add AAPL this week. Next contribution should diversify, not stack the same name.',
      },
    },
    {
      ticker: 'VOO',
      chapterTitle: 'VOO · still the simple core',
      rating: 'CORE / ADD AFTER A SECOND TAPE',
      tone: 'long' as const,
      price: vooClose,
      dayPct: vooDayPct,
      metrics: [{label: 'Wednesday close', value: `$${vooClose.toFixed(2)}  ${vooDayPct}%`}],
      copy: {
        headline: 'Best simple core. New core money waits for a second tape, then simplifies here.',
        body: 'Do not sell. Do not split the next contribution with VTI. Do not add in the first hour after the hike.',
      },
    },
    {
      ticker: 'VTI',
      chapterTitle: 'VTI · excellent, overlapping',
      rating: 'HOLD',
      tone: 'long' as const,
      price: vtiClose,
      dayPct: vtiDayPct,
      metrics: [{label: 'Wednesday close', value: `$${vtiClose.toFixed(2)}  ${vtiDayPct}%`}],
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
      metrics: [{label: 'Wednesday close', value: `$${vugClose.toFixed(2)}  unchanged`}],
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
      metrics: [{label: 'Wednesday close', value: `$${mgkClose.toFixed(2)}  +${mgkDayPct}%`}],
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
      metrics: [{label: 'Wednesday market', value: `$${gdvClose.toFixed(2)}  ${gdvDayPct}%`}],
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
      id: 'us-cash-thursday',
      area: 'US' as const,
      question: 'Where does Thursday U.S. cash close?',
      whyItMatters: 'This wake is 9:06 ET. Wednesday is the last cash print. An open print is not a close.',
      neededToKnow: 'Thursday 4 p.m. ET index and name closes.',
      status: 'unknown' as const,
    },
    {
      id: 'europe-thursday',
      area: 'GLOBAL' as const,
      question: 'Where did Thursday London / Frankfurt / Paris cash close?',
      whyItMatters: 'BoE printed this morning. Europe was still open at this wake. Wednesday closes are not today’s close.',
      neededToKnow: 'Thursday official index closes after London 16:30.',
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
      whyItMatters: 'Two green days is a count. A decorative 0–100 would be a lie.',
      neededToKnow: 'A named formula and inputs — or omit the score field.',
      status: 'unknown' as const,
    },
  ],
  scenarios: [],
  capitalPlan: {
    existingPortfolio: 'HOLD — sell nothing this morning.',
    freshCapital: 'No add into the first hour after the hike. New core money simplifies into VOO after a second tape.',
    bestAdd: 'VOO — after a second tape, not at the open',
    highestUpsideWatch: 'none named',
    biggestRisk: 'Mega-cap growth overlap across NVDA, AAPL, MGK, VUG, VOO, VTI — plus a 10-year at 5.01% after a 12–0 hike',
    nextTrigger: 'Today 9:30 ET — first U.S. cash after FOMC. Then Friday iPhone 18 Pro / BoJ.',
    ifThen: [
      {
        tone: 'long' as const,
        if: '10-year backs off without a chip crash',
        then: 'HOLD names. New core money can go to VOO.',
      },
      {
        tone: 'watch' as const,
        if: 'Chips bounce in the first hour',
        then: 'HOLD. Do not chase Wednesday’s NVDA close.',
      },
      {
        tone: 'caution' as const,
        if: '10-year holds 5%+ and growth gives back Wednesday',
        then: 'Do not buy the dip this week. Wait for a second tape.',
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
      body: `Treasury par 10-year closed ${tenYear.toFixed(2)}% Wednesday. FOMC hiked 12–0. Long rates compress the exact overweight.`,
    },
    {
      n: '03',
      title: 'Oil into inflation into the Fed',
      body: 'WTI settled $102.43 (−3.21%) — a giveback, not a cleared risk. The statement still says inflation remains elevated.',
    },
  ],
  close: {
    kicker: 'DIAGNOSTIC',
    headline: 'Yesterday’s Fed print is a book event. Today’s open is not a buy ticket.',
    body: 'Same seven lines. Same overlap. Sell nothing this morning. Do not add NVDA because it closed green into the hike. If fresh capital arrives after a second tape, it still wants VOO first.',
    pills: [
      {tone: 'watch' as const, label: 'HOLD THIS MORNING'},
      {tone: 'caution' as const, label: 'NO ADD AT THE OPEN'},
      {tone: 'long' as const, label: 'VOO AFTER A SECOND TAPE'},
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
    `SPX  ${spxClose.toLocaleString('en-US')}  ${spxDayPct}%  WED`,
    `NASDAQ  ${nasdaqDayPct}%  WED`,
    `SPX YTD  +${spxYtdPct}%`,
    `10Y  ${tenYear.toFixed(2)}%  TREASURY PAR`,
    `FOMC  3.75-4.00%  12-0`,
    `NVDA  $${nvdaClose.toFixed(2)}  +${nvdaDayPct}%`,
    `AAPL  $${aaplClose.toFixed(2)}  +${aaplDayPct}%`,
    `VOO  $${vooClose.toFixed(2)}  ${vooDayPct}%`,
    `NIKKEI  +${nikkeiDayPct}%  THU`,
    `HSI  ${hangSengDayPct}%  THU`,
    `FTSE  +${ftseDayPct}%  WED`,
    `TSX  ${tsxClose.toLocaleString('en-US')}  ${tsxDayPct}%  WED`,
    `CAD  1.3947 / USD  BOC`,
    `WTI  $${wti.toFixed(2)}  BRENT  $${brent.toFixed(2)}`,
    `BOE  HOLD  3.75%  6-3`,
    `IPHONE 18 PRO  FRI`,
    `SELL NOTHING THIS MORNING`,
  ],
};

export const episode: DailyReport = parseDailyReport(raw);
