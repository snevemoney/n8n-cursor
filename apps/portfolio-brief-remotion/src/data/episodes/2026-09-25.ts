import {vsSpxSpread} from '../compute';
import {parseDailyReport, type DailyReport} from '../schema';

const nvdaClose = 224.58;
const nvdaDayPct = -0.41;
const nvdaYtd = 20.7;
const nvdaY1 = 27.21;
const aaplClose = 335.92;
const aaplDayPct = -0.33;
const aaplYtd = 23.9;
const aaplY1 = 33.63;
const vooClose = 706.99;
const vooDayPct = -0.09;
const vooYtd = 12.73;
const vtiClose = 378.08;
const vtiDayPct = -0.04;
const vtiYtd = 12.77;
const vugClose = 90.45;
const vugDayPct = 0.2;
const vugYtd = 11.27;
const mgkClose = 92.99;
const mgkDayPct = 0.3;
const mgkYtd = 12.52;
const gdvClose = 28.78;
const gdvDayPct = -0.21;
const gdvYtd = 8.57;
const spxClose = 7704.13;
const spxDayPct = -0.02;
const spxYtdPct = 12.5;
const spxYtdYahoo = 12.54;
const nasdaqClose = 26939.37;
const nasdaqDayPct = 0.01;
const dowClose = 51349.98;
const dowDayPct = -0.3;
const russellClose = 2835.57;
const russellDayPct = -0.1;
const soxClose = 12492.54;
const soxDayPct = -0.33;
const tenYearOfficial = 4.96;
const nikkei = 66364.2;
const nikkeiDayPct = 1.3;
const hangSeng = 24510.09;
const hangSengDayPct = -1.01;
const asx = 8665.01;
const asxDayPct = -0.43;
const sensex = 73849.06;
const sensexDayPct = 0.36;
const ftseSession = 10702.93;
const daxSession = 25441.85;
const cacSession = 8086.84;
const tsxClose = 35706.46;
const tsxPoints = -44.97;
const cadOfficial = 1.4136;
const wtiNov = 94.61;
const goldDec = 4298;
const nvdaQ2Rev = 96.2;
const nvdaDcRev = 89.0;
const nvdaQ3Guide = 108.0;

const raw = {
  meta: {
    date: '2026-09-25',
    dateLabel: 'SEP 25, 2026',
    title: 'Daily Wealth Intelligence',
    thesis:
      'Thursday U.S. cash was a choppy flat tape. The S&P and Nasdaq finished where they started. The book did not get a new reason to add. Do not add into Friday’s open.',
    thesisLead: 'Thursday cash was a choppy flat tape.',
    thesisAccent: 'Do not add into the open.',
    catalyst:
      'U.S. and TSX cash open in minutes. Official Wednesday and Thursday 10-year still unread. China, Korea, and Taiwan are on Mid-Autumn holiday.',
    kicker:
      'Friday 9:14 America/Toronto. Last North American cash is Thursday. Tokyo and Hong Kong closed. Shanghai, Seoul, and Taipei holiday. Europe is in session.',
    universe: ['AAPL', 'NVDA', 'VOO', 'VTI', 'VUG', 'MGK', 'GDV'],
  },
  market: {
    spxClose,
    spxDayPct,
    spxYtdPct,
    nasdaqDayPct,
    tenYearYield: tenYearOfficial,
    note: 'Thursday U.S. cash: S&P 7,704.13 −1.90 / −0.02% (AP / Yahoo). Nasdaq 26,939.37 +3.34 / +0.01% (AP). Official FRED DGS10 last is 4.96% on 09/22. NVDA Thursday $224.58 −0.41%.',
    nextCalendar: {
      label: 'U.S. / CA cash open',
      detail: 'Friday cash unread — NYSE / TSX open 09:30 ET. Mid-Autumn holiday in China, Korea, and Taiwan.',
    },
  },
  markets: {
    global: {
      indices: [
        {
          label: 'Nikkei 225',
          value: nikkei.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: nikkeiDayPct,
          note: 'Friday close 66,364.20 +850.21 / +1.30% (Jiji / Sankei / Zaikei). Fifth green session. TOPIX 4,128.59 +1.31%. First Tokyo cash after Silver Week.',
        },
        {
          label: 'Hang Seng',
          value: hangSeng.toLocaleString('en-US'),
          dayPct: hangSengDayPct,
          note: 'Friday close 24,510.09 −251.04 / −1.01% (Minkabu / iFeng / The Standard). Hang Seng Tech −1.13% to 4,311.78. Not a book ticker.',
        },
        {
          label: 'Shanghai Composite',
          note: 'Friday cash shut — Mid-Autumn Festival (Minkabu / The Standard). Thursday close unread this sitting — omitted, not faked.',
        },
        {
          label: 'Kospi',
          note: 'Friday cash shut — Mid-Autumn / Chuseok (Minkabu). Last Wednesday cash was 7,080.92 on the prior tape. Not re-sourced as a Friday print.',
        },
        {
          label: 'S&P/ASX 200',
          value: asx.toLocaleString('en-US'),
          dayPct: asxDayPct,
          note: 'Friday 8,665.01 −37.01 / −0.43% (Minkabu, Tokyo 18:08). Not a book ticker.',
        },
        {
          label: 'Sensex',
          value: sensex.toLocaleString('en-US'),
          dayPct: sensexDayPct,
          note: 'Friday 73,849.06 +268.52 / +0.36% (Minkabu, Tokyo 18:08 — after Mumbai cash). Not a holding.',
        },
        {
          label: 'FTSE 100',
          value: ftseSession.toLocaleString('en-US'),
          note: 'Friday session ~10,702.93 +0.21% at 14:00 GMT+1 (Yahoo). Market open. Not a London close. Prior close 10,679.99.',
        },
        {
          label: 'DAX 40',
          value: daxSession.toLocaleString('en-US'),
          note: 'Friday session ~25,441.85 +0.69% at 15:01 GMT+2 (Yahoo). Market open. Not a Frankfurt close. Prior close 25,266.53.',
        },
        {
          label: 'CAC 40',
          value: cacSession.toLocaleString('en-US'),
          note: 'Friday session ~8,086.84 +0.07% at 15:00 GMT+2 (Yahoo). Market open. Not a Paris close. Prior close 8,081.43.',
        },
      ],
      commodities: [
        {
          label: 'WTI November',
          value: `$${wtiNov.toFixed(2)} Thu contract`,
          note: 'Thursday November crude $94.61 +$2.45 (Canadian Press / BNN). That is the contract print they published — not labeled a NYMEX settle here.',
        },
        {
          label: 'Brent',
          note: 'Thursday Brent settle unread this sitting — omitted, not faked. Tuesday settle $99.25 is prior tape, not today.',
        },
        {
          label: 'Gold December',
          value: `$${goldDec.toLocaleString('en-US')} Thu contract`,
          note: 'Thursday December gold $4,298.00 −$20.40 (Canadian Press / BNN).',
        },
      ],
      rates: [
        {
          label: 'U.S. 10-year',
          value: `${tenYearOfficial.toFixed(2)}% FRED 09/22`,
          note: `Official FRED DGS10 last is ${tenYearOfficial.toFixed(2)}% on 09/22 (updated Sep 23). Official Wednesday and Thursday par unread at this wake. AP Thursday: yields rose by the close. Session stories of 5.11–5.12% are not H.15.`,
        },
      ],
      note: 'Friday GLOBAL: Tokyo and Hong Kong closed. Shanghai, Seoul, and Taipei holiday. Europe still in session. Brent Thursday settle omitted. USD/JPY unread — omitted.',
    },
    us: {
      indices: [
        {
          label: 'S&P 500',
          value: spxClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: spxDayPct,
          note: 'Thursday cash (AP / Yahoo). −1.90 / −0.02%. AP YTD +12.5%. Yahoo range 7,662.57–7,719.01. Friday cash unread — NYSE opens 09:30 ET.',
        },
        {
          label: 'Nasdaq',
          value: nasdaqClose.toLocaleString('en-US'),
          dayPct: nasdaqDayPct,
          note: 'Thursday +3.34 / +0.01% (AP). AP week +1.6%. AP year +15.9%. Friday unread.',
        },
        {
          label: 'Dow',
          value: dowClose.toLocaleString('en-US'),
          dayPct: dowDayPct,
          note: 'Thursday −161.61 / −0.3% (AP). Friday unread.',
        },
        {
          label: 'Russell 2000',
          value: russellClose.toLocaleString('en-US'),
          dayPct: russellDayPct,
          note: 'Thursday −3.09 / −0.1% (AP). Friday unread.',
        },
      ],
      sectors: [
        {
          label: 'Philadelphia Semiconductor',
          value: soxClose.toLocaleString('en-US'),
          dayPct: soxDayPct,
          note: 'Thursday Yahoo cash 12,492.54 −41.74 / −0.33%. FRED NASDAQSX settle 12,312.37 is a different print — not mixed into this row.',
        },
        {
          label: 'Energy',
          note: 'Thursday November crude $94.61 +$2.45 (Canadian Press). Brent settle unread. Sector level unread — omitted.',
        },
      ],
      breadth: 'Thursday breadth unread this sitting — omitted, not faked. Friday breadth unread.',
      yields: [
        {
          label: 'U.S. 10-year',
          value: `${tenYearOfficial.toFixed(2)}% FRED 09/22`,
          note: 'Official Wednesday and Thursday par still unread at 9:14 ET. AP Thursday: yields rose by the close.',
        },
      ],
      note: 'Thursday U.S. cash. AP: stocks whipped through reversals and finished roughly where they started. Bond-market pressure after the S&P sat near its high earlier this week. Do not invent a Friday pre-open as cash.',
    },
    ca: {
      indices: [
        {
          label: 'S&P/TSX Composite',
          value: tsxClose.toLocaleString('en-US'),
          note: `Thursday close 35,706.46 ${tsxPoints} points (Canadian Press / BNN). Day percent not printed on that recap — not invented. Friday TSX unread — opens 09:30 ET.`,
        },
        {
          label: 'TSX Venture',
          value: '913.91',
          note: 'Thursday −10.82 / −1.2% (Baystreet). Not a book ticker.',
        },
      ],
      cadUsd: `${cadOfficial} CAD per USD (BoC Valet FXUSDCAD daily average 2026-09-24). Canadian Press session 70.74 U.S. cents matches that average. Wednesday official was 1.4096.`,
      note: 'Thursday cash. Friday TSX closed until 09:30 ET. Official Thursday CAD is 1.4136.',
    },
    calendar: {
      items: [
        {
          when: 'Friday 09:30 ET',
          where: 'US' as const,
          label: 'U.S. / CA cash open',
          why: 'Friday North American cash unread at this wake. Thursday was a choppy flat S&P / Nasdaq. Do not add into the open.',
        },
        {
          when: 'Friday',
          where: 'GLOBAL' as const,
          label: 'Mid-Autumn holiday — CN / KR / TW',
          why: 'Shanghai, Kospi, and Taiwan cash shut (Minkabu / The Standard). Hong Kong traded with thin volume. Not a book ticker.',
        },
        {
          when: 'Sep 30',
          where: 'US' as const,
          label: 'ADP + final Q2 GDP cluster',
          why: 'Dated on the Schaeffers / ad-hoc calendar. Dates only. Do not invent a print.',
        },
        {
          when: 'Oct 1',
          where: 'US' as const,
          label: 'NVIDIA dividend',
          why: 'IR: $0.25 payable Oct 1 (record Sep 10). Cash event, not a thesis change.',
        },
        {
          when: 'Oct 29 / Nov 17',
          where: 'US' as const,
          label: 'AAPL then NVDA earnings dates',
          why: 'Yahoo dated AAPL Oct 29 and NVDA Nov 17. Dates only. Q3 NVDA guide still $108.0B ±2%.',
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
        'Thursday cash $224.58 −0.41%. Q3 guide still $108.0B ±2%. SOX −0.33% (Yahoo). That is not a sourced add before Friday U.S. cash.',
      ytd: nvdaYtd,
    },
    {
      ticker: 'AAPL',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Recent purchase',
      whatMatters:
        'Thursday $335.92 −0.33%. Still beating the S&P YTD. Mac mini / Studio launched Sep 22. Store date is not an add.',
      ytd: aaplYtd,
    },
    {
      ticker: 'VOO',
      rating: 'CORE / ADD AFTER FRIDAY U.S. CASH',
      tone: 'long' as const,
      role: 'Best simple core',
      whatMatters: 'Thursday $706.99 −0.09%. New core money still simplifies here — after the tape, not in the pre-open.',
      ytd: vooYtd,
    },
    {
      ticker: 'VTI',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Broad US',
      whatMatters: 'Thursday $378.08 −0.04%. Excellent. Still overlaps VOO at the top.',
      ytd: vtiYtd,
      overlapWith: ['VOO'],
    },
    {
      ticker: 'VUG',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Growth sleeve',
      whatMatters: 'Thursday $90.45 +0.20%. Trailing S&P YTD. You already own NVDA and AAPL directly.',
      ytd: vugYtd,
      overlapWith: ['NVDA', 'AAPL', 'VOO', 'MGK'],
    },
    {
      ticker: 'MGK',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Mega-cap growth',
      whatMatters: 'Thursday $92.99 +0.30%. Same stack, tighter. Do not feed it on a flat Nasdaq.',
      ytd: mgkYtd,
      overlapWith: ['NVDA', 'AAPL', 'VUG', 'VOO'],
    },
    {
      ticker: 'GDV',
      rating: 'HOLD — income / diversifier',
      tone: 'long' as const,
      role: 'Income sleeve',
      whatMatters: 'Thursday $28.78 −0.21%. Different job. Yahoo YTD +8.57%. NAV unread this sitting — omitted.',
      ytd: gdvYtd,
    },
  ],
  portfolio: {
    concentrationThesis: 'VOO + VTI + VUG + MGK + AAPL + NVDA keep buying the same companies.',
    concentrationBody:
      'Thursday’s flat S&P / Nasdaq and SOX −0.33% still light the same Wealthsimple lines. That is the overlap, not a new thesis.',
    factorStack: ['NVDA', 'AAPL', 'MGK', 'VUG', 'VOO', 'VTI'],
    factorLabel: 'U.S. mega-cap / growth',
    overlapNote: 'same ecosystem',
  },
  names: [
    {
      ticker: 'NVDA',
      chapterTitle: 'NVDA · Thursday’s print is not an add',
      rating: 'HOLD — NO ADD INTO THE OPEN',
      tone: 'watch' as const,
      price: nvdaClose,
      dayPct: nvdaDayPct,
      holdNote: 'Thursday close $224.58. Q3 guide still $108.0B ±2%. Do not chase a flat Nasdaq into Friday’s open.',
      streak: [-1.47, -0.41],
      streakHeadline: 'Two sourced sessions this sitting. Wednesday −1.47% to $225.51. Thursday −0.41% to $224.58. Not a collapse. Not an add signal.',
      streakNote: 'BestStocks Wednesday close + Yahoo Thursday close. Do not invent a longer grid.',
      fundamentals: [
        {label: 'Q2 revenue', value: `$${nvdaQ2Rev.toFixed(1)}B  +106% y/y`},
        {label: 'Data Center', value: `$${nvdaDcRev.toFixed(1)}B  +117% y/y`},
        {label: 'Q3 guide', value: `$${nvdaQ3Guide.toFixed(1)}B ±2%`},
        {label: 'Q3 GM guide', value: '74.0% ±50 bp'},
        {label: '1-year', value: `+${nvdaY1.toFixed(2)}% (Yahoo as of 9/24)`},
        {label: 'Dividend', value: '$0.25  pay Oct 1'},
      ],
      vsSpx: {
        headline: 'Beating the S&P YTD is not a reason to add before Friday cash.',
        bars: [
          {label: 'NVDA YTD', pct: nvdaYtd, tone: 'nvda' as const},
          {label: 'S&P YTD', pct: spxYtdYahoo, tone: 'muted' as const},
        ],
        note: `Spread: ${vsSpxSpread(nvdaYtd, spxYtdYahoo) >= 0 ? '+' : ''}${vsSpxSpread(nvdaYtd, spxYtdYahoo).toFixed(2)} points (NVDA YTD − S&P YTD, Yahoo as of 9/24). Two YTD scalars only — no invented daily path.`,
      },
      consensus: {
        rows: [
          {label: 'Q3 revenue guide', value: '$108.0B ±2%'},
          {label: 'Q3 GM guide', value: '74.0% ±50 bp'},
          {label: 'China DC compute in guide', value: 'none assumed'},
        ],
        note: 'IR / SEC from the Aug 26 print. Unchanged this sitting. Whisper unread — omitted.',
        range: {metric: 'Q3 revenue guide', unit: 'B', guide: nvdaQ3Guide, low: 105.84, high: 110.16},
      },
      narrative: {
        leftTitle: 'THE TAPE',
        leftHeadline: 'Thursday SOX −0.33% (Yahoo). NVDA −0.41%. Nasdaq flat.',
        leftBody:
          'Yahoo: NVDA $224.58 on 76.4M shares. Premarket 9:15 ET was $225.71 +0.50% — session, not cash. That is a chip session, not a new NVDA filing.',
        rightTitle: 'THE HOLD',
        rightHeadline: 'Q3 guide is still $108.0B ±2%. No China DC compute in the outlook.',
        rightBody:
          'IR: $96.2B Q2 / $89.0B Data Center. Next dated print is Nov 17 (Yahoo). A Thursday close is not a sourced add.',
      },
      interpretation: {
        chips: [
          {label: 'CONFIRMED', tone: 'long' as const, text: 'Q3 guide still $108.0B ±2% (NVIDIA IR).'},
          {
            label: 'CONFIRMED',
            tone: 'watch' as const,
            text: 'Thursday cash $224.58 −0.41% on a flat Nasdaq / SOX −0.33% (Yahoo).',
          },
          {
            label: 'INFERENCE',
            tone: 'caution' as const,
            text: 'Two red NVDA sessions after the mid-week chip bid are not a reason to stack more mega-cap growth.',
          },
        ],
        note: 'No composite score. Missing inputs stay UNKNOWN.',
      },
      actionMatrix: {
        headline: 'HOLD. No add into Friday’s open.',
        rows: [
          {
            tone: 'long' as const,
            if: 'Friday U.S. cash holds Thursday without a chip crash',
            then: 'HOLD. New core money can go to VOO after the tape.',
          },
          {
            tone: 'watch' as const,
            if: 'Chips gap after two red NVDA sessions',
            then: 'HOLD. Do not chase Thursday’s NVDA close.',
          },
          {
            tone: 'caution' as const,
            if: 'Official 10-year prints near or above 5% and NVDA gives back more',
            then: 'Do not automatically buy the dip',
          },
          {
            tone: 'short' as const,
            if: 'The overlap reprices harder while the S&P stays flat',
            then: 'Do not average down on the headline. Re-read, then decide.',
          },
        ],
      },
      network: {
        title: 'NVDA · qualitative demand chain',
        headline: 'Polarity from IR + Thursday cash + Friday Asia. No composite score.',
        nodes: [
          {id: 'labs', label: 'GPU demand', polarity: 'confirmed' as const, x: 0.08, y: 0.22},
          {
            id: 'demand',
            label: 'AI factory build',
            polarity: 'confirmed' as const,
            x: 0.3,
            y: 0.22,
            evidence: 'Q3 guide $108B ±2%',
          },
          {
            id: 'oil',
            label: 'WTI Nov contract',
            polarity: 'inference' as const,
            x: 0.5,
            y: 0.22,
            evidence: '$94.61 +$2.45',
          },
          {id: 'financing', label: 'Third-party capital', polarity: 'concern' as const, x: 0.3, y: 0.78},
          {id: 'nvda', label: 'NVDA', polarity: 'neutral' as const, x: 0.62, y: 0.5},
          {id: 'sox', label: 'SOX Thu', polarity: 'confirmed' as const, x: 0.82, y: 0.18, evidence: '−0.33% Yahoo'},
          {id: 'margins', label: 'GM guide 74%', polarity: 'inference' as const, x: 0.82, y: 0.5},
          {
            id: 'rates',
            label: '10-year 4.96%',
            polarity: 'concern' as const,
            x: 0.82,
            y: 0.82,
            evidence: 'FRED 09/22',
          },
          {id: 'valuation', label: 'Thursday close', polarity: 'inference' as const, x: 0.94, y: 0.5},
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
      chapterTitle: 'AAPL · the store date is still not an add',
      rating: 'HOLD',
      tone: 'long' as const,
      price: aaplClose,
      dayPct: aaplDayPct,
      holdNote: 'Thursday close $335.92. You just bought it. Mac mini / Studio launched Sep 22. Not an add.',
      returns: {
        headline: 'Beating the S&P YTD. Three sourced bars only — no invented 6-month path.',
        bars: [
          {label: 'YTD', pct: aaplYtd, tone: 'long' as const},
          {label: 'S&P YTD', pct: spxYtdYahoo, tone: 'muted' as const},
          {label: '1 year', pct: aaplY1, tone: 'gold' as const},
        ],
        note: `Spread vs S&P YTD: ${vsSpxSpread(aaplYtd, spxYtdYahoo) >= 0 ? '+' : ''}${vsSpxSpread(aaplYtd, spxYtdYahoo).toFixed(2)} points (Yahoo as of 9/24).`,
      },
      catalyst: {
        headline: 'Mac mini / Studio launched Sep 22 (prior tape: Apple Newsroom / MacRumors).',
        steps: [
          'Local-AI Macs dated Sep 22',
          'That is a product calendar, not a quarter beat',
          'Next dated earnings: Oct 29 (Yahoo)',
          'Thursday close $335.92 is not an add',
        ],
        note: 'Store date is sourced. A Thursday flat Nasdaq is not a reason to add AAPL.',
      },
      action: {
        headline: 'HOLD the position.',
        body: 'Do not add AAPL into the open. Next contribution should diversify, not stack the same name.',
      },
    },
    {
      ticker: 'VOO',
      chapterTitle: 'VOO · still the simple core',
      rating: 'CORE / ADD AFTER FRIDAY U.S. CASH',
      tone: 'long' as const,
      price: vooClose,
      dayPct: vooDayPct,
      metrics: [
        {label: 'Thursday close', value: `$${vooClose.toFixed(2)} ${vooDayPct}%`},
        {label: 'YTD', value: `+${vooYtd.toFixed(2)}% (Yahoo price as of 9/24)`},
      ],
      copy: {
        headline: 'Best simple core. New core money waits for the U.S. tape, then simplifies here.',
        body: 'Thursday $706.99 −0.09%. 52-week high on the Yahoo page is $716.39. Do not sell. Do not split the next contribution with VTI. Do not add in the pre-open.',
      },
    },
    {
      ticker: 'VTI',
      chapterTitle: 'VTI · excellent, overlapping',
      rating: 'HOLD',
      tone: 'long' as const,
      price: vtiClose,
      dayPct: vtiDayPct,
      metrics: [
        {label: 'Thursday close', value: `$${vtiClose.toFixed(2)} ${vtiDayPct}%`},
        {label: 'YTD', value: `+${vtiYtd.toFixed(2)}% (Yahoo as of 9/24)`},
      ],
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
      returns: {
        headline: 'Despite the growth label, VUG is still behind the S&P YTD — and you already own the individual winners.',
        bars: [
          {label: 'VUG YTD', pct: vugYtd, tone: 'watch' as const},
          {label: 'S&P YTD', pct: spxYtdYahoo, tone: 'long' as const},
        ],
        note: 'Yahoo YTD Daily Total Return as of 9/23. Two scalars only. Action: HOLD existing. No priority additions.',
      },
    },
    {
      ticker: 'MGK',
      chapterTitle: 'MGK · same stack, tighter',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      price: mgkClose,
      dayPct: mgkDayPct,
      metrics: [
        {label: 'Thursday close', value: `$${mgkClose.toFixed(2)} +${mgkDayPct}%`},
        {label: 'YTD', value: `+${mgkYtd.toFixed(2)}% (Yahoo as of 9/23)`},
      ],
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
      metrics: [
        {label: 'Thursday market', value: `$${gdvClose.toFixed(2)} ${gdvDayPct}%`},
        {label: 'YTD', value: `+${gdvYtd.toFixed(2)}% (Yahoo as of 9/24)`},
        {label: 'Fwd dist.', value: '6.25% (Yahoo)'},
      ],
      copy: {
        body: 'Closed-end income/value. NAV unread this sitting — omitted, not faked. Ex-div dated Oct 16 (Yahoo). When growth gets punched, this sleeve is supposed to look different. Not Next-NVDA.',
      },
    },
  ],
  nextNvda: [],
  unknowns: [
    {
      id: 'weights',
      area: 'book' as const,
      question: 'What is each line’s weight in the book?',
      whyItMatters: 'Concentration stays qualitative until weights exist. We cannot size how much mega-cap.',
      neededToKnow: 'Sourced account weights. Do not estimate from prices.',
      status: 'unknown' as const,
    },
    {
      id: 'wed-thu-10y',
      area: 'US' as const,
      question: 'What is the official Wednesday and Thursday 10-year par?',
      whyItMatters: 'Growth-duration risk sits under NVDA, VUG, and MGK. A session story of 5.11% is not H.15.',
      neededToKnow: 'FRED DGS10 observations dated 2026-09-23 and 2026-09-24.',
      status: 'unknown' as const,
    },
    {
      id: 'brent-settle',
      area: 'GLOBAL' as const,
      question: 'What did Brent settle Thursday?',
      whyItMatters: 'Oil is the other duration / energy read. We have a November WTI contract print, not Brent.',
      neededToKnow: 'One ICE / wire Thursday Brent settle from a single official or wire page.',
      status: 'unknown' as const,
    },
    {
      id: 'fri-na-cash',
      area: 'US' as const,
      question: 'Where do U.S. and TSX cash print Friday?',
      whyItMatters: 'This wake is 9:14 ET. North American cash is still unread.',
      neededToKnow: 'NYSE / TSX closes after 09:30 ET open — or a later official recap.',
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
    freshCapital: 'No add into Friday’s open. New core money simplifies into VOO after U.S. cash.',
    bestAdd: 'VOO',
    highestUpsideWatch: 'none named',
    biggestRisk: 'Mega-cap growth overlap across NVDA, AAPL, MGK, VUG, VOO, VTI',
    nextTrigger: 'Friday — U.S. / CA cash open 09:30 ET',
    ifThen: [
      {
        tone: 'long' as const,
        if: 'Friday U.S. cash holds Thursday without a chip crash',
        then: 'HOLD. New core money can go to VOO after the tape.',
      },
      {
        tone: 'watch' as const,
        if: 'Chips gap after two red NVDA sessions',
        then: 'HOLD. Do not chase Thursday’s NVDA close.',
      },
      {
        tone: 'caution' as const,
        if: 'Official 10-year prints near or above 5% and NVDA gives back more',
        then: 'Do not automatically buy the dip',
      },
      {
        tone: 'short' as const,
        if: 'The overlap reprices harder while the S&P stays flat',
        then: 'Do not average down on the headline. Re-read, then decide.',
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
      body: `Official 10-year last is ${tenYearOfficial}% on 09/22. Wednesday and Thursday par unread. AP: yields rose Thursday. High long rates compress long-duration growth — the exact overweight.`,
    },
    {
      n: '03',
      title: 'AI ROI',
      body: 'The debate is still whether profits justify hundreds of billions of annual infrastructure. That sits under NVDA and most of the indirect book.',
    },
  ],
  close: {
    kicker: 'DIAGNOSTIC',
    headline: 'Thursday was a choppy flat tape, not a new thesis.',
    body: 'The S&P and Nasdaq finished where they started. The book did not get a new reason to add. After Friday cash: numbers first — then a HOLD / ADD-VOO / stay-put for the next contribution.',
    pills: [
      {tone: 'watch' as const, label: 'HOLD THIS MORNING'},
      {tone: 'caution' as const, label: 'NO ADD INTO THE OPEN'},
      {tone: 'long' as const, label: 'VOO AFTER THE TAPE'},
    ],
    followThrough: [
      {
        tone: 'watch' as const,
        if: 'Friday cash holds Thursday and NVDA is still unattractive to add',
        then: 'Keep new money in VOO. Do not invent a scout.',
      },
      {
        tone: 'caution' as const,
        if: 'Chips give back more while the official 10-year stays near or above 5%',
        then: 'More VOO / cash / non-AI quality. Still no dip-buy on a headline.',
      },
      {
        tone: 'long' as const,
        if: 'An asymmetric candidate is named by Evens or a filing',
        then: 'That is when the Next-NVDA sleeve gets a name.',
      },
    ],
  },
  tickerTape: [
    `SPX ${spxClose.toLocaleString('en-US')}  ${spxDayPct}%`,
    `SPX YTD  +${spxYtdPct}%`,
    `NASDAQ  ${nasdaqClose.toLocaleString('en-US')}  +${nasdaqDayPct}%`,
    `NVDA  $${nvdaClose.toFixed(2)}  ${nvdaDayPct}%`,
    `AAPL  $${aaplClose.toFixed(2)}  ${aaplDayPct}%`,
    `SOX  ${soxDayPct}%`,
    `10Y  ${tenYearOfficial}% FRED 09/22`,
    `TSX  ${tsxClose.toLocaleString('en-US')}  ${tsxPoints} PTS`,
    `NIKKEI  +${nikkeiDayPct}%`,
    `HSI  ${hangSengDayPct}%`,
    `VOO CORE / AFTER CASH`,
    `SELL NOTHING THIS MORNING`,
  ],
};

export const episode: DailyReport = parseDailyReport(raw);
