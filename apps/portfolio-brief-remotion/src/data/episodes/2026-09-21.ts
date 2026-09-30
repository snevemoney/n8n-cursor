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
const tenYearSession = 5.0;
const tenYearOfficial = 4.94;
const nikkei = 65018.95;
const nikkeiDayPct = 1.38;
const topix = 4091.14;
const topixDayPct = -0.07;
const hangSeng = 25042;
const hangSengDayPct = 1.2;
const shanghai = 3949;
const shanghaiDayPct = 0.97;
const kospi = 7007;
const kospiDayPct = 1.65;
const ftse = 10747;
const ftseDayPct = 0.83;
const dax = 25576;
const daxDayPct = 1.08;
const cac = 8142;
const cacDayPct = 0.96;
const tsxClose = 35804.86;
const tsxDayPct = -0.2;
const wtiSession = 98.15;
const wtiDayPct = -2.14;
const brentSession = 101.69;
const brentDayPct = -2.08;
const nvdaQ2Rev = 96.2;
const nvdaDcRev = 89.0;
const nvdaQ3Guide = 108.0;

const raw = {
  meta: {
    date: '2026-09-21',
    dateLabel: 'SEP 21, 2026',
    title: 'Daily Wealth Intelligence',
    thesis:
      'Monday Asia is a new print. Tokyo is shut. The book is still Friday’s seven U.S. mega-cap growth lines. A Hang Seng bid is not an add into the U.S. open.',
    thesisLead: 'Asia printed. The book did not.',
    thesisAccent: 'Do not add into the open.',
    catalyst:
      'U.S. and TSX cash open in minutes. Official Friday 10-year still unread. Mac mini / Studio stores tomorrow.',
    kicker:
      'Monday 9:00 America/Toronto. Tokyo closed for Respect for the Aged Day. HK and Shanghai closed. Europe is still in session. U.S. and CA cash are still Friday.',
    universe: ['AAPL', 'NVDA', 'VOO', 'VTI', 'VUG', 'MGK', 'GDV'],
  },
  market: {
    spxClose,
    spxDayPct,
    spxYtdPct,
    nasdaqDayPct,
    tenYearYield: tenYearSession,
    note: 'Last U.S. cash Friday: S&P 7,650.50 +0.17%. Nasdaq 26,522.55 +0.40%. AP: 10-year climbed to 5.00%. Official FRED DGS10 still 4.94% on 09/17. NVDA last cash $222.27 +1.34%.',
    nextCalendar: {
      label: 'U.S. / CA cash open',
      detail: 'First North American session after Friday. Mac mini / Studio stores Tue Sep 22. BoJ call effective Thu Sep 24. Official Friday 10-year still due (FRED next release Sep 21).',
    },
  },
  markets: {
    global: {
      indices: [
        {
          label: 'Nikkei 225',
          value: nikkei.toLocaleString('en-US'),
          dayPct: nikkeiDayPct,
          note: 'Tokyo closed Mon Sep 21 — Respect for the Aged Day. Last cash Friday 65,018.95 +1.38% (FRED NIKKEI225). Next FRED row Sep 24.',
        },
        {
          label: 'TOPIX',
          value: topix.toLocaleString('en-US'),
          dayPct: topixDayPct,
          note: 'Friday Tokyo. No Monday cash. Broad tape lagged Nikkei on Friday.',
        },
        {
          label: 'Hang Seng',
          value: hangSeng.toLocaleString('en-US'),
          dayPct: hangSengDayPct,
          note: 'Monday close 25,042 +291 / +1.2% (RTHK). Through 25,000. Summit week, not a book ticker.',
        },
        {
          label: 'Shanghai Composite',
          value: shanghai.toLocaleString('en-US'),
          dayPct: shanghaiDayPct,
          note: 'Monday close 3,949 +0.97% (RTHK). Shenzhen Component 13,730 +0.65%.',
        },
        {
          label: 'Kospi',
          value: kospi.toLocaleString('en-US'),
          dayPct: kospiDayPct,
          note: 'Monday close 7,007 +113 / +1.65% (RTHK). Chip-led. Not a holding.',
        },
        {
          label: 'FTSE 100',
          value: ftse.toLocaleString('en-US'),
          dayPct: ftseDayPct,
          note: 'Monday session approaching midday ~10,747 +0.83% (MarketScreener 05:12 ET). Not a London close.',
        },
        {
          label: 'DAX 40',
          value: dax.toLocaleString('en-US'),
          dayPct: daxDayPct,
          note: 'Monday session ~25,576 +1.08% (MarketScreener 05:12 ET). Not a Frankfurt close.',
        },
        {
          label: 'CAC 40',
          value: cac.toLocaleString('en-US'),
          dayPct: cacDayPct,
          note: 'Monday session ~8,142 +0.96% (MarketScreener 05:12 ET). Not a Paris close.',
        },
      ],
      commodities: [
        {
          label: 'WTI',
          value: `$${wtiSession.toFixed(2)}`,
          dayPct: wtiDayPct,
          note: 'Monday session $98.15 −2.14% at 04:34 GMT (Economy Middle East / Reuters). Below $100. NYMEX Monday settle unread at 9:00 ET.',
        },
        {
          label: 'Brent',
          value: `$${brentSession.toFixed(2)}`,
          dayPct: brentDayPct,
          note: 'Monday session $101.69 −$2.16 / −2.08% at 04:34 GMT (Economy Middle East / Reuters). Friday settle was $103.87.',
        },
      ],
      rates: [
        {
          label: 'U.S. 10-year',
          value: `${tenYearSession.toFixed(2)}% AP session`,
          note: `AP Friday session: climbed to ${tenYearSession.toFixed(2)}%. Official FRED DGS10 still ${tenYearOfficial.toFixed(2)}% on 09/17. H.15 current page still dated Sep 18. Friday par unread at this wake.`,
        },
        {label: 'Fed funds', value: '3.75–4.00%', note: 'FOMC 12–0 hike Sep 16, effective Sep 17. SEP median funds 4.1% YE 2026.'},
        {label: 'BoJ overnight call', value: 'around 1.25%', note: 'BoJ PDF 7–2. Effective Sep 24. Complementary deposit 1.25%. Tokyo cash shut until after Silver Week.'},
      ],
      note: 'Monday GLOBAL: HK / Shanghai / Seoul closed. Tokyo holiday. Europe still in session. Oil is a morning print, not a NYMEX settle. USD/JPY unread this sitting — omitted.',
    },
    us: {
      indices: [
        {
          label: 'S&P 500',
          value: spxClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: spxDayPct,
          note: 'Friday cash. Monday cash unread — NYSE opens 09:30 ET.',
        },
        {label: 'Nasdaq', value: nasdaqClose.toLocaleString('en-US'), dayPct: nasdaqDayPct, note: 'Friday (Reuters). Monday unread.'},
        {label: 'Dow', value: '51,682.64', dayPct: -0.18, note: 'Friday (AP / Reuters). Monday unread.'},
        {label: 'Russell 2000', value: '2,860.40', dayPct: -0.5, note: 'Friday (AP). Monday unread.'},
      ],
      sectors: [
        {label: 'Philadelphia Semiconductor', dayPct: 2.78, note: 'Friday SOX (prior tape / Gate). Monday SOX unread — omitted as a live print.'},
        {label: 'Energy', note: 'WTI session below $100. Sector level unread — omitted.'},
      ],
      breadth:
        'Friday: NYSE decliners led. Nasdaq 1,973 up / 2,810 down (1.42-to-1). S&P 5 new highs / 30 new lows. Nasdaq 45 new highs / 162 new lows (Reuters). Monday breadth unread.',
      yields: [
        {
          label: 'U.S. 10-year',
          value: `${tenYearSession.toFixed(2)}% AP session / ${tenYearOfficial.toFixed(2)}% FRED 09/17`,
          note: 'Official Friday par still unread at 9:00 ET. FRED next release Sep 21 (afternoon H.15).',
        },
      ],
      note: 'U.S. cash still Friday. AP YTD: S&P +11.8%. Do not invent a pre-open. Week was mixed: S&P −0.1%, Nasdaq +0.7%, Dow −1.7% (AP Friday wrap).',
    },
    ca: {
      indices: [
        {
          label: 'S&P/TSX Composite',
          value: tsxClose.toLocaleString('en-US'),
          dayPct: tsxDayPct,
          note: 'Friday close 35,804.86 −69.58 / −0.2% (Reuters). Monday TSX unread — opens 09:30 ET.',
        },
      ],
      cadUsd: '1.4002 CAD per USD (BoC Valet FXUSDCAD daily average 2026-09-18). Monday average not posted yet.',
      note: 'Friday cash. Monday TSX closed until 09:30 ET. BoC overnight still 2.25% from the last hold.',
    },
    calendar: {
      items: [
        {
          when: 'Monday 09:30 ET',
          where: 'US' as const,
          label: 'U.S. / CA cash open',
          why: 'First North American session after Friday. Official Friday 10-year still unread at this wake. Do not add into the open.',
        },
        {
          when: 'Tuesday Sep 22',
          where: 'US' as const,
          label: 'Mac mini / Mac Studio in stores',
          why: 'Apple shop: available starting 9.22. Local-AI Macs. Still inference, not a quarter print. 512GB Studio later — late October.',
        },
        {
          when: 'Wed–Fri this week',
          where: 'GLOBAL' as const,
          label: 'Xi–Trump summit window',
          why: 'RTHK: talks after He–Bessent Sunday. HK bid is not a book ticker. Do not invent a trade from the headline.',
        },
        {
          when: 'Thursday Sep 24',
          where: 'GLOBAL' as const,
          label: 'BoJ overnight call effective',
          why: 'Already voted 7–2 around 1.25% (BoJ PDF). Effective date, not a new vote. Tokyo cash also returns after Silver Week.',
        },
        {
          when: 'Oct 1',
          where: 'US' as const,
          label: 'NVIDIA dividend',
          why: 'SEC / IR: $0.25 payable Oct 1 (record Sep 10). Cash event, not a thesis change.',
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
      rating: 'HOLD — no add into the open',
      tone: 'watch' as const,
      role: 'Highest-beta AI line',
      whatMatters:
        'Last cash Friday $222.27 +1.34%. Q3 guide still $108.0B ±2%. Seoul chips bid. That is not a sourced add before U.S. cash.',
    },
    {
      ticker: 'AAPL',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Recent purchase',
      whatMatters: 'Friday $336.13 −0.26%. Mac mini / Studio stores Tue Sep 22. Do not double the line on a store date.',
    },
    {
      ticker: 'VOO',
      rating: 'CORE / ADD after Monday U.S. cash',
      tone: 'long' as const,
      role: 'Best simple core',
      whatMatters: 'Friday $701.78 +0.11%. New core money still simplifies here — after the U.S. tape, not into the open.',
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
      'Monday Asia chips and a Hang Seng bid do not change the overlap. Several Wealthsimple lines will still move together when U.S. cash opens. That is structure, not a sell ticket. It is also not an add ticket.',
    factorStack: ['NVDA', 'AAPL', 'MGK', 'VUG', 'VOO', 'VTI'],
    factorLabel: 'U.S. mega-cap / growth',
    overlapNote: 'same ecosystem',
  },
  names: [
    {
      ticker: 'NVDA',
      chapterTitle: 'NVDA · last cash is Friday. The guide did not change.',
      rating: 'HOLD — NO ADD INTO THE OPEN',
      tone: 'watch' as const,
      price: nvdaClose,
      dayPct: nvdaDayPct,
      holdNote: 'Friday close $222.27. A Seoul chip bid while Tokyo is shut is not an add.',
      streak: [1.34],
      streakHeadline: 'One sourced Friday day-change. Monday U.S. cash unread.',
      streakNote: 'Friday $222.27 +1.34%. One cell only. No pre-open invented.',
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
        note: 'Guide is NVIDIA IR / SEC Aug 26. Street whisper for the next print is unread. Do not draw a fake zone.',
        range: {metric: 'Q3 revenue guide', unit: 'B', guide: nvdaQ3Guide, low: 105.84, high: 110.16},
      },
      narrative: {
        leftTitle: 'THE FEAR',
        leftHeadline: 'Long rates still tax this book. Official Friday 10-year is unread.',
        leftBody:
          'FOMC 12–0 to 3.75–4.00% is still the U.S. setting. AP Friday session 5.00%. Last official FRED print is 4.94% on Thursday. WTI session is under $100 — that is a morning print, not a new Fed statement.',
        rightTitle: 'THE COUNTER',
        rightHeadline: 'The last earnings print was not a miss. Asia chips bid without Tokyo.',
        rightBody:
          'Q2 $96.2B, data center $89.0B, GM 75.0%. Q3 guide $108.0B ±2%, no China data-center compute in the outlook. Kospi +1.65%. Relative strength is not a buy ticket before U.S. cash.',
      },
      interpretation: {
        chips: [
          {label: 'CONFIRMED', tone: 'long' as const, text: 'Q2 demand and Q3 guide are still the IR / SEC tape.'},
          {label: 'CONFIRMED', tone: 'watch' as const, text: 'Friday NVDA $222.27 +1.34%. Monday U.S. cash unread at 9:00 ET.'},
          {
            label: 'INFERENCE',
            tone: 'caution' as const,
            text: 'Chasing a Hang Seng / Kospi bid into the U.S. open is a timing bet we do not have to take.',
          },
        ],
        note: 'No composite score. One Friday day-change is a count, not a 73/100.',
      },
      actionMatrix: {
        headline: 'HOLD the line. Do not add into the open.',
        rows: [
          {
            tone: 'long' as const,
            if: 'Monday U.S. cash holds without a chip crash',
            then: 'Still HOLD NVDA. New core money waits, then VOO.',
          },
          {
            tone: 'watch' as const,
            if: 'Chips gap up after Friday SOX and Monday Kospi',
            then: 'HOLD. Friday close is not a sourced add.',
          },
          {
            tone: 'caution' as const,
            if: 'Official 10-year prints near 5% and NVDA gives back Friday',
            then: 'Do not automatically buy the dip',
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
        headline: 'Polarity from IR + Friday cash + Monday Asia. No composite score.',
        nodes: [
          {id: 'labs', label: 'GPU demand', polarity: 'confirmed' as const, x: 0.08, y: 0.22},
          {id: 'demand', label: 'AI factory build', polarity: 'confirmed' as const, x: 0.3, y: 0.22, evidence: 'Q3 guide $108B ±2%'},
          {id: 'oil', label: 'WTI session', polarity: 'inference' as const, x: 0.5, y: 0.22, evidence: '$98.15 04:34 GMT'},
          {id: 'financing', label: 'Third-party capital', polarity: 'concern' as const, x: 0.3, y: 0.78},
          {id: 'nvda', label: 'NVDA', polarity: 'neutral' as const, x: 0.62, y: 0.5},
          {id: 'kospi', label: 'Kospi Mon', polarity: 'confirmed' as const, x: 0.82, y: 0.18, evidence: '+1.65%'},
          {id: 'margins', label: 'GM guide 74%', polarity: 'inference' as const, x: 0.82, y: 0.5},
          {id: 'rates', label: '10-year 5.00%', polarity: 'concern' as const, x: 0.82, y: 0.82, evidence: 'AP Friday session'},
          {id: 'valuation', label: 'Friday close', polarity: 'inference' as const, x: 0.94, y: 0.5},
        ],
        edges: [
          {from: 'labs', to: 'demand'},
          {from: 'demand', to: 'nvda'},
          {from: 'oil', to: 'rates'},
          {from: 'kospi', to: 'nvda'},
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
      holdNote: 'Friday close $336.13. You just bought it. Store date tomorrow is not an add.',
      catalyst: {
        headline: 'Mac mini / Studio in stores Sep 22 (Apple shop: Available starting 9.22).',
        steps: [
          'Local-AI Macs dated Sep 22',
          'That is a product calendar, not a quarter beat',
          '512GB Studio is late October, not tomorrow',
          'Do not double the line on a store date',
        ],
        note: 'Store date is sourced. A Monday Asia bid is not a reason to add AAPL.',
      },
      action: {
        headline: 'HOLD the position.',
        body: 'Do not add AAPL into the open. Next contribution should diversify, not stack the same name.',
      },
    },
    {
      ticker: 'VOO',
      chapterTitle: 'VOO · still the simple core',
      rating: 'CORE / ADD AFTER MONDAY U.S. CASH',
      tone: 'long' as const,
      price: vooClose,
      dayPct: vooDayPct,
      metrics: [{label: 'Friday close', value: `$${vooClose.toFixed(2)} +${vooDayPct}%`}],
      copy: {
        headline: 'Best simple core. New core money waits for the U.S. tape, then simplifies here.',
        body: 'Do not sell. Do not split the next contribution with VTI. Do not add in the pre-open.',
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
        'AP said the yield climbed to 5.00%. FRED DGS10 last official is 4.94% on 09/17. H.15 current page is still the Sep 18 release. A session quote is not the Friday par row.',
      neededToKnow: 'Treasury TextView / H.15 / FRED DGS10 row dated 09/18.',
      status: 'partial' as const,
    },
    {
      id: 'monday-na-cash',
      area: 'US' as const,
      question: 'Where did U.S. and TSX cash print on Monday?',
      whyItMatters: 'This wake is 09:00 ET. NYSE / TSX open 09:30. Asia is not a North American close.',
      neededToKnow: 'Sourced Monday cash closes after the session — not a pre-open.',
      status: 'unknown' as const,
    },
    {
      id: 'holding-ytd',
      area: 'book' as const,
      question: 'What is each line’s YTD versus the S&P?',
      whyItMatters: 'S&P YTD +11.8% is sourced (AP Friday). Name YTD unread — a copied August figure would be a lie.',
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
  ],
  scenarios: [],
  capitalPlan: {
    existingPortfolio: 'HOLD — sell nothing into the open.',
    freshCapital: 'No add before Monday U.S. cash. New core money simplifies into VOO after the tape, not in the pre-open.',
    bestAdd: 'VOO — after Monday U.S. cash, not this open',
    highestUpsideWatch: 'none named',
    biggestRisk:
      'Mega-cap growth overlap across NVDA, AAPL, MGK, VUG, VOO, VTI — plus a 10-year at 5% on the AP Friday tape after a Fed hike and a BoJ hike the same week',
    nextTrigger:
      'Monday 09:30 ET — U.S. / CA cash. Official Friday 10-year still due. Mac mini / Studio Tue Sep 22. BoJ call effective Thu Sep 24.',
    ifThen: [
      {
        tone: 'long' as const,
        if: 'Monday U.S. cash holds without a chip crash',
        then: 'HOLD names. New core money can go to VOO.',
      },
      {
        tone: 'watch' as const,
        if: 'Chips gap up after Friday SOX and Monday Kospi',
        then: 'HOLD. Do not chase Friday’s NVDA close.',
      },
      {
        tone: 'caution' as const,
        if: 'Official 10-year stays near 5% and growth gives back Friday',
        then: 'Do not buy the dip. Wait for a second tape.',
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
      body: `AP Friday: 10-year climbed to ${tenYearSession.toFixed(2)}%. Official Friday par unread at 9:00 ET. FOMC hiked 12–0. BoJ hiked 7–2. Long rates still compress the exact overweight.`,
    },
    {
      n: '03',
      title: 'Oil into inflation into the Fed',
      body: 'WTI Monday session $98.15 (−2.14%) at 04:34 GMT — under $100, not a NYMEX settle. The Fed statement still says inflation remains elevated.',
    },
  ],
  close: {
    kicker: 'DIAGNOSTIC',
    headline: 'Asia printed. The book is still Friday. Do not add into the open.',
    body: 'Same seven lines. Same overlap. Tokyo is shut. HK and Seoul are not a Wealthsimple ticket. Sell nothing. If fresh capital arrives after Monday U.S. cash, it still wants VOO first.',
    pills: [
      {tone: 'watch' as const, label: 'HOLD INTO THE OPEN'},
      {tone: 'caution' as const, label: 'NO ADD IN THE PRE-OPEN'},
      {tone: 'long' as const, label: 'VOO AFTER U.S. CASH'},
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
    `10Y ${tenYearSession.toFixed(2)}% AP SESSION`,
    `FRED 10Y ${tenYearOfficial.toFixed(2)}% 09/17`,
    `FOMC 3.75-4.00% 12-0`,
    `BOJ 1.25% 7-2`,
    `NVDA $${nvdaClose.toFixed(2)} +${nvdaDayPct}% FRI`,
    `AAPL $${aaplClose.toFixed(2)} ${aaplDayPct}% FRI`,
    `VOO $${vooClose.toFixed(2)} +${vooDayPct}% FRI`,
    `HSI ${hangSeng.toLocaleString('en-US')} +${hangSengDayPct}% MON`,
    `SHCOMP +${shanghaiDayPct}% MON`,
    `KOSPI +${kospiDayPct}% MON`,
    `NIKKEI CLOSED MON`,
    `FTSE SESSION +${ftseDayPct}%`,
    `TSX ${tsxClose.toLocaleString('en-US')} ${tsxDayPct}% FRI`,
    `CAD 1.4002 / USD BOC FRI`,
    `WTI $${wtiSession.toFixed(2)} SESSION`,
    `MAC MINI / STUDIO TUE`,
    `SELL NOTHING INTO THE OPEN`,
  ],
};

export const episode: DailyReport = parseDailyReport(raw);
