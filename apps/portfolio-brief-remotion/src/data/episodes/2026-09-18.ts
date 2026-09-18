import {parseDailyReport, type DailyReport} from '../schema';

const nvdaClose = 219.34;
const nvdaDayPct = 2.54;
const aaplClose = 337.0;
const aaplDayPct = 1.38;
const vooClose = 701.03;
const vooDayPct = 1.12;
const vtiClose = 375.34;
const vtiDayPct = 1.1;
const vugClose = 88.43;
const vugDayPct = 1.57;
const mgkClose = 90.57;
const mgkDayPct = 1.64;
const gdvClose = 29.07;
const gdvDayPct = 0.21;
const spxClose = 7637.76;
const spxDayPct = 1.14;
const nasdaqClose = 26418.3;
const nasdaqDayPct = 1.69;
const tenYear = 4.94;
const nikkei = 65018.95;
const nikkeiDayPct = 1.38;
const topix = 4091.14;
const topixDayPct = -0.07;
const hangSeng = 24750.78;
const hangSengDayPct = 0.6;
const shanghai = 3911.87;
const shanghaiDayPct = 0.94;
const ftse = 10816.14;
const ftseDayPct = 1.19;
const dax = 25716.71;
const daxDayPct = 0.7;
const cac = 8186.93;
const cacDayPct = 0.57;
const tsxClose = 35874.26;
const tsxDayPct = 1.08;
const wti = 101.91;
const wtiDayPct = -0.5;
const brent = 104.82;
const brentDayPct = -0.95;
const nvdaQ2Rev = 96.2;
const nvdaDcRev = 89.0;
const nvdaQ3Guide = 108.0;

const raw = {
  meta: {
    date: '2026-09-18',
    dateLabel: 'SEP 18, 2026',
    title: 'Daily Wealth Intelligence',
    thesis:
      'BoJ hiked. Thursday U.S. cash bounced. The book is still the same seven U.S. mega-cap growth lines. A green chip session is not an add ticket.',
    thesisLead: 'BoJ hiked. Same book.',
    thesisAccent: 'A chip bounce is not an add.',
    catalyst:
      'BoJ 7–2: overnight call around 1.25% from Sep 24. iPhone 18 Pro is in stores today. Next is the U.S. open, not a new holding.',
    kicker:
      'Friday Asia cash is in. US and CA cash are Thursday. Friday U.S. cash is not open at 9:03 ET.',
    universe: ['AAPL', 'NVDA', 'VOO', 'VTI', 'VUG', 'MGK', 'GDV'],
  },
  market: {
    spxClose,
    spxDayPct,
    nasdaqDayPct,
    tenYearYield: tenYear,
    note: 'Thursday cash after the hike: S&P 7,637.76 +1.14%. Nasdaq 26,418.30 +1.69%. Treasury par 10-year 4.94%. NVDA closed $219.34 +2.54%.',
    nextCalendar: {
      label: 'U.S. cash open 9:30 ET',
      detail: 'BoJ already printed. iPhone 18 Pro is in stores. Do not treat the first hour as a sourced add.',
    },
  },
  markets: {
    global: {
      indices: [
        {label: 'Nikkei 225', value: nikkei.toLocaleString('en-US'), dayPct: nikkeiDayPct, note: 'Friday Tokyo (Nikkei). Third up day. Reclaimed 65,000.'},
        {label: 'TOPIX', value: topix.toLocaleString('en-US'), dayPct: topixDayPct, note: 'Friday Tokyo (Nikkei). Broad tape down while Nikkei rose.'},
        {label: 'Hang Seng', value: hangSeng.toLocaleString('en-US'), dayPct: hangSengDayPct, note: 'Friday close (RTHK / cngold). Tech index +2.2% unread as a holding.'},
        {label: 'Shanghai Composite', value: shanghai.toLocaleString('en-US'), dayPct: shanghaiDayPct, note: 'Friday close (National Times / cngold)'},
        {label: 'FTSE 100', value: ftse.toLocaleString('en-US'), dayPct: ftseDayPct, note: 'Thursday London (cngold / MarketScreener). Friday Europe still open at this wake.'},
        {label: 'DAX 40', value: dax.toLocaleString('en-US'), dayPct: daxDayPct, note: 'Thursday Frankfurt (cngold)'},
        {label: 'CAC 40', value: cac.toLocaleString('en-US'), dayPct: cacDayPct, note: 'Thursday Paris (cngold)'},
      ],
      fx: [{label: 'USD/JPY', value: '157.45', note: 'Around 0810 GMT Friday (National Times). Yen softer after the 7–2 hike.'}],
      commodities: [
        {label: 'WTI Oct', value: `$${wti.toFixed(2)}`, dayPct: wtiDayPct, note: 'Thursday settle (Dow Jones / MarketScreener)'},
        {label: 'Brent Nov', value: `$${brent.toFixed(2)}`, dayPct: brentDayPct, note: 'Thursday settle −$1.01 (Dow Jones / FinancialJuice)'},
      ],
      rates: [
        {label: 'U.S. 10-year', value: `${tenYear.toFixed(2)}%`, note: 'Treasury par yield 09/17'},
        {label: 'Fed funds', value: '3.75–4.00%', note: 'FOMC 12–0 hike, effective Sep 17'},
        {label: 'BoJ overnight call', value: 'around 1.25%', note: 'BoJ 7–2. Effective Sep 24. Complementary deposit 1.25%.'},
        {label: 'Bank Rate', value: '3.75%', note: 'BoE held 6–3 on 16–17 Sep. Next 5 Nov.'},
      ],
      note: 'Friday Europe cash not closed at 9:03 ET. Thursday Europe is the last cash print.',
    },
    us: {
      indices: [
        {
          label: 'S&P 500',
          value: spxClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: spxDayPct,
        },
        {label: 'Nasdaq', value: nasdaqClose.toLocaleString('en-US'), dayPct: nasdaqDayPct},
        {label: 'Dow', value: '51,778.04', dayPct: 0.61, note: 'Thursday (WSJ / CNN)'},
        {label: 'Russell 2000', value: '2,874.63', dayPct: 0.55, note: 'Thursday (The Edge)'},
      ],
      sectors: [
        {label: 'Technology', note: 'Thursday: led S&P sector percentage gains (Reuters). Level unread.'},
        {label: 'Financials', note: 'Thursday: one of two S&P sectors lower (Reuters). Level unread.'},
        {label: 'Consumer staples', note: 'Thursday: the other S&P sector lower (Reuters). Level unread.'},
      ],
      breadth: 'Nasdaq Thursday: 3,274 up / 1,483 down (2.21-to-1). S&P 12 new highs / 20 new lows (Reuters).',
      yields: [{label: 'U.S. 10-year', value: `${tenYear.toFixed(2)}%`, note: 'Treasury par 09/17. 2-year 4.67%.'}],
      note: 'Thursday cash. Friday U.S. cash not open at 9:03 ET. S&P YTD unread this sitting — omitted, not faked. SEP median funds 4.1% YE 2026 still on the Wednesday dots.',
    },
    ca: {
      indices: [
        {
          label: 'S&P/TSX Composite',
          value: tsxClose.toLocaleString('en-US'),
          dayPct: tsxDayPct,
          note: 'Thursday close 35,874.26 +382.99 (Reuters / MarketScreener). Biggest gain since Sep 3. YTD +13.12% (MarketScreener).',
        },
      ],
      cadUsd: '1.3988 CAD per USD (BoC Valet daily average 2026-09-17). Reuters late spot 1.3985 is not the Valet print.',
      note: 'Thursday cash. TSX not open at this wake. BoC overnight still 2.25% from the last hold. Next decision Oct 28 (Reuters).',
    },
    calendar: {
      items: [
        {
          when: 'This morning',
          where: 'GLOBAL' as const,
          label: 'Bank of Japan hike',
          why: 'Official: overnight call around 1.25%, vote 7–2. Effective Sep 24. Not our print to trade.',
        },
        {
          when: 'Today',
          where: 'US' as const,
          label: 'iPhone 18 Pro in stores',
          why: 'Launch day in Canada and the U.S. AAPL catalyst, not a buy ticket.',
        },
        {
          when: 'Today 9:30 ET',
          where: 'US' as const,
          label: 'U.S. cash open',
          why: 'First Friday session after the Fed hike and the BoJ print. Do not add into the open.',
        },
        {
          when: 'Tuesday Sep 22',
          where: 'US' as const,
          label: 'Mac mini / Mac Studio in stores',
          why: 'Apple newsroom dated availability for the local-AI Macs. Still inference, not a quarter print.',
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
      rating: 'HOLD — no add on the bounce',
      tone: 'watch' as const,
      role: 'Highest-beta AI line',
      whatMatters: 'Thursday $219.34 +2.54% after Wednesday’s hike. Q3 guide already on tape. Green is not an add.',
    },
    {
      ticker: 'AAPL',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Recent purchase',
      whatMatters: 'Thursday $337.00 +1.38%. iPhone 18 Pro in stores today. Do not add the same name this week.',
    },
    {
      ticker: 'VOO',
      rating: 'CORE / ADD after a second tape',
      tone: 'long' as const,
      role: 'Best simple core',
      whatMatters: 'Thursday $701.03 +1.12%. New core money still simplifies here — not in the first hour.',
    },
    {
      ticker: 'VTI',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Broad US',
      whatMatters: 'Thursday $375.34 +1.10%. Excellent fund. Still overlaps VOO.',
      overlapWith: ['VOO'],
    },
    {
      ticker: 'VUG',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Growth sleeve',
      whatMatters: 'Thursday $88.43 +1.57%. You already own the individual winners.',
      overlapWith: ['NVDA', 'AAPL', 'VOO', 'MGK'],
    },
    {
      ticker: 'MGK',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Mega-cap growth',
      whatMatters: 'Thursday $90.57 +1.64%. Same stack, more concentrated.',
      overlapWith: ['NVDA', 'AAPL', 'VUG', 'VOO'],
    },
    {
      ticker: 'GDV',
      rating: 'HOLD — income / diversifier',
      tone: 'long' as const,
      role: 'Income sleeve',
      whatMatters: 'Thursday market $29.07 +0.21%. Different job. NAV unread this sitting.',
    },
  ],
  portfolio: {
    concentrationThesis: 'VOO + VTI + VUG + MGK + AAPL + NVDA still buy the same companies.',
    concentrationBody:
      'Thursday’s chip bounce and Friday’s Nikkei 65,000 print move several Wealthsimple lines together. That is structure, not a sell ticket.',
    factorStack: ['NVDA', 'AAPL', 'MGK', 'VUG', 'VOO', 'VTI'],
    factorLabel: 'U.S. mega-cap / growth',
    overlapNote: 'same ecosystem',
  },
  names: [
    {
      ticker: 'NVDA',
      chapterTitle: 'NVDA · Thursday bounced. The guide did not change.',
      rating: 'HOLD — NO ADD ON THE BOUNCE',
      tone: 'watch' as const,
      price: nvdaClose,
      dayPct: nvdaDayPct,
      holdNote: 'Thursday close $219.34. A 2.5% bounce the day after a 12–0 hike is not an add.',
      streak: [0.82, 2.54],
      streakHeadline: 'Two sourced day-changes: Wednesday +0.82%, Thursday +2.54%. Not a 21-day grid.',
      streakNote: 'Closes Sep 16–17: $213.90 → $219.34. Two cells only. Not a 0–100 score.',
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
        leftHeadline: 'Fed hiked. 10-year still 4.94%. Long rates still tax this book.',
        leftBody:
          'FOMC 12–0 to 3.75–4.00% is still the U.S. setting. Treasury par 10-year backed off 7 bp to 4.94% Thursday — under 5%, not cheap money. SEP median funds 4.1% at year-end 2026. BoJ hiked 7–2 the same morning.',
        rightTitle: 'THE COUNTER',
        rightHeadline: 'The last earnings print was not a miss. Thursday NVDA closed +2.54%.',
        rightBody:
          'Q2 $96.2B, data center $89.0B, GM 75.0%. Q3 guide $108.0B ±2%, no China data-center compute in the outlook. Nasdaq +1.69% on Thursday. Relative strength is not a buy ticket.',
      },
      interpretation: {
        chips: [
          {label: 'CONFIRMED', tone: 'long' as const, text: 'Q2 demand and Q3 guide are still the IR tape.'},
          {label: 'CONFIRMED', tone: 'watch' as const, text: 'BoJ hiked 7–2 to ~1.25%. Treasury par 10-year 4.94%.'},
          {
            label: 'INFERENCE',
            tone: 'caution' as const,
            text: 'Buying Thursday’s bounce into Friday’s open is a timing bet we do not have to take.',
          },
        ],
        note: 'No composite score. Two day-changes is a count, not a 73/100.',
      },
      actionMatrix: {
        headline: 'HOLD the line. Do not add into the open.',
        rows: [
          {
            tone: 'long' as const,
            if: '10-year stays under 5% without a chip crash',
            then: 'Still HOLD NVDA. New core money waits, then VOO.',
          },
          {
            tone: 'watch' as const,
            if: 'Chips extend Thursday in the first hour',
            then: 'HOLD. Bounce is not a sourced add.',
          },
          {
            tone: 'caution' as const,
            if: '10-year reclaims 5% and NVDA gives back Thursday',
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
        headline: 'Polarity from IR + Thursday tape + Friday BoJ. No composite score.',
        nodes: [
          {id: 'labs', label: 'GPU demand', polarity: 'confirmed' as const, x: 0.08, y: 0.22},
          {id: 'demand', label: 'AI factory build', polarity: 'confirmed' as const, x: 0.3, y: 0.22, evidence: 'Q3 guide $108B ±2%'},
          {id: 'oil', label: 'Oil settle', polarity: 'concern' as const, x: 0.5, y: 0.22, evidence: 'WTI $101.91'},
          {id: 'financing', label: 'Third-party capital', polarity: 'concern' as const, x: 0.3, y: 0.78},
          {id: 'nvda', label: 'NVDA', polarity: 'neutral' as const, x: 0.62, y: 0.5},
          {id: 'boj', label: 'BoJ hike 7–2', polarity: 'concern' as const, x: 0.82, y: 0.18, evidence: 'call ~1.25%'},
          {id: 'margins', label: 'GM guide 74%', polarity: 'inference' as const, x: 0.82, y: 0.5},
          {id: 'rates', label: '10-year 4.94%', polarity: 'concern' as const, x: 0.82, y: 0.82, evidence: 'Treasury par 09/17'},
          {id: 'valuation', label: 'Thursday close', polarity: 'inference' as const, x: 0.94, y: 0.5},
        ],
        edges: [
          {from: 'labs', to: 'demand'},
          {from: 'demand', to: 'nvda'},
          {from: 'oil', to: 'rates'},
          {from: 'boj', to: 'rates'},
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
      holdNote: 'Thursday close $337.00. You just bought it. Do not add on launch day.',
      catalyst: {
        headline: 'iPhone 18 Pro in stores today. Mac mini / Studio in stores Sep 22.',
        steps: [
          'Phone launch day (Canada and U.S.)',
          'Local-AI Macs dated Sep 22 (Apple newsroom)',
          'That is a product calendar, not a quarter beat',
        ],
        note: 'Stores and pickup exist. Online ship windows into October are a demand note, not a reason to double the line.',
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
      metrics: [{label: 'Thursday close', value: `$${vooClose.toFixed(2)} +${vooDayPct}%`}],
      copy: {
        headline: 'Best simple core. New core money waits for a second tape, then simplifies here.',
        body: 'Do not sell. Do not split the next contribution with VTI. Do not add in the first hour.',
      },
    },
    {
      ticker: 'VTI',
      chapterTitle: 'VTI · excellent, overlapping',
      rating: 'HOLD',
      tone: 'long' as const,
      price: vtiClose,
      dayPct: vtiDayPct,
      metrics: [{label: 'Thursday close', value: `$${vtiClose.toFixed(2)} +${vtiDayPct}%`}],
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
      metrics: [{label: 'Thursday close', value: `$${vugClose.toFixed(2)} +${vugDayPct}%`}],
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
      metrics: [{label: 'Thursday close', value: `$${mgkClose.toFixed(2)} +${mgkDayPct}%`}],
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
      metrics: [{label: 'Thursday market', value: `$${gdvClose.toFixed(2)} +${gdvDayPct}%`}],
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
      id: 'us-cash-friday',
      area: 'US' as const,
      question: 'Where does Friday U.S. cash close?',
      whyItMatters: 'This wake is 9:03 ET. Thursday is the last cash print. An open print is not a close.',
      neededToKnow: 'Friday 4 p.m. ET index and name closes.',
      status: 'unknown' as const,
    },
    {
      id: 'europe-friday',
      area: 'GLOBAL' as const,
      question: 'Where did Friday London / Frankfurt / Paris cash close?',
      whyItMatters: 'BoJ printed this morning. Europe was still open at this wake. Thursday closes are not today’s close.',
      neededToKnow: 'Friday official index closes after London 16:30.',
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
      whyItMatters: 'Two day-changes is a count. A decorative 0–100 would be a lie.',
      neededToKnow: 'A named formula and inputs — or omit the score field.',
      status: 'unknown' as const,
    },
  ],
  scenarios: [],
  capitalPlan: {
    existingPortfolio: 'HOLD — sell nothing this morning.',
    freshCapital: 'No add into the first hour. New core money simplifies into VOO after a second tape.',
    bestAdd: 'VOO — after a second tape, not at the open',
    highestUpsideWatch: 'none named',
    biggestRisk:
      'Mega-cap growth overlap across NVDA, AAPL, MGK, VUG, VOO, VTI — plus a 10-year at 4.94% after a Fed hike and a BoJ hike the same week',
    nextTrigger: 'Today 9:30 ET — Friday U.S. cash. iPhone 18 Pro is already in stores. Mac mini / Studio Tue Sep 22.',
    ifThen: [
      {
        tone: 'long' as const,
        if: '10-year stays under 5% without a chip crash',
        then: 'HOLD names. New core money can go to VOO.',
      },
      {
        tone: 'watch' as const,
        if: 'Chips extend Thursday in the first hour',
        then: 'HOLD. Do not chase Thursday’s NVDA close.',
      },
      {
        tone: 'caution' as const,
        if: '10-year reclaims 5% and growth gives back Thursday',
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
      body: `Treasury par 10-year closed ${tenYear.toFixed(2)}% Thursday. FOMC hiked 12–0. BoJ hiked 7–2. Long rates still compress the exact overweight.`,
    },
    {
      n: '03',
      title: 'Oil into inflation into the Fed',
      body: 'WTI settled $101.91 (−0.5%) — a second down day, still above $100. The Fed statement still says inflation remains elevated.',
    },
  ],
  close: {
    kicker: 'DIAGNOSTIC',
    headline: 'This morning’s BoJ print is a world-tape event. Today’s open is not a buy ticket.',
    body: 'Same seven lines. Same overlap. Sell nothing this morning. Do not add NVDA because it bounced after the hike. If fresh capital arrives after a second tape, it still wants VOO first.',
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
        if: '10-year goes back through 5% and growth leaks',
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
    `SPX ${spxClose.toLocaleString('en-US')} +${spxDayPct}% THU`,
    `NASDAQ +${nasdaqDayPct}% THU`,
    `10Y ${tenYear.toFixed(2)}% TREASURY PAR`,
    `FOMC 3.75-4.00% 12-0`,
    `BOJ 1.25% 7-2`,
    `NVDA $${nvdaClose.toFixed(2)} +${nvdaDayPct}%`,
    `AAPL $${aaplClose.toFixed(2)} +${aaplDayPct}%`,
    `VOO $${vooClose.toFixed(2)} +${vooDayPct}%`,
    `NIKKEI +${nikkeiDayPct}% FRI`,
    `HSI +${hangSengDayPct}% FRI`,
    `FTSE +${ftseDayPct}% THU`,
    `TSX ${tsxClose.toLocaleString('en-US')} +${tsxDayPct}% THU`,
    `CAD 1.3988 / USD BOC`,
    `WTI $${wti.toFixed(2)} BRENT $${brent.toFixed(2)}`,
    `IPHONE 18 PRO STORES TODAY`,
    `SELL NOTHING THIS MORNING`,
  ],
};

export const episode: DailyReport = parseDailyReport(raw);
