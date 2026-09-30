import {vsSpxSpread} from '../compute';
import {parseDailyReport, type DailyReport} from '../schema';

/** Yahoo chart last cash Friday 25 Sep 2026. YTD = last / year-end 2025 close − 1. */
const nvdaClose = 225.07;
const nvdaDayPct = 0.22;
const nvdaYtd = 20.68;
const aaplClose = 341.07;
const aaplDayPct = 1.53;
const aaplYtd = 25.46;
const vooClose = 710.79;
const vooDayPct = 0.54;
const vooYtd = 13.34;
const vtiClose = 379.77;
const vtiDayPct = 0.45;
const vtiYtd = 13.27;
const vugClose = 90.94;
const vugDayPct = 0.54;
const vugYtd = 11.84;
const mgkClose = 93.37;
const mgkDayPct = 0.41;
const mgkYtd = 13.1;
const gdvClose = 28.95;
const gdvDayPct = 0.59;
const gdvYtd = 4.25;
const spxClose = 7743.41;
const spxDayPct = 0.51;
const spxYtdPct = 13.1;
const spxYtdYahoo = 13.12;
const nasdaqClose = 27068.72;
const nasdaqDayPct = 0.48;
const dowClose = 51828.62;
const dowDayPct = 0.93;
const russellClose = 2837.55;
const russellDayPct = 0.1;
const soxClose = 12668.93;
const soxDayPct = 1.41;
const nikkei = 66364.2;
const nikkeiDayPct = 1.3;
const topix = 4128.59;
const hangSeng = 24510.09;
const hangSengDayPct = -1.01;
const asx = 8665.0;
const asxDayPct = -0.43;
const ftse = 10695.25;
const ftseDayPct = 0.14;
const dax = 25408.64;
const daxDayPct = 0.56;
const tsxClose = 35800.89;
const tsxPoints = 94.43;
const tsxDayPct = 0.26;
const tsxV = 920.47;
const cadOfficial = 1.4145;
const wtiNov = 92.41;
const wtiDayPct = -2.33;
const brent = 97.44;
const brentDayPct = -2.77;
const goldDec = 4321.2;
const goldDayPct = 0.54;
const nvdaQ2Rev = 96.2;
const nvdaDcRev = 89.0;
const nvdaQ3Guide = 108.0;

const raw = {
  meta: {
    date: '2026-09-27',
    dateLabel: 'SEP 27, 2026',
    title: 'Daily Wealth Intelligence',
    thesis:
      'Sunday. Markets are shut. Friday cash is still the last print. The book is the same seven U.S. growth lines. This is a weekend read, not a trade.',
    thesisLead: 'Friday cash is still the last print.',
    thesisAccent: 'This is a weekend read, not a trade.',
    catalyst:
      'Next cash is Monday. Tuesday is JOLTS. Wednesday is BEA PCE and the Q2 GDP third estimate. Friday Oct 2 is the September jobs print.',
    kicker:
      'Sunday America/Toronto. NYSE and TSX are shut. Asia Monday has not opened yet. Last cash is Friday 25 September.',
    universe: ['AAPL', 'NVDA', 'VOO', 'VTI', 'VUG', 'MGK', 'GDV'],
  },
  market: {
    spxClose,
    spxDayPct,
    spxYtdPct,
    nasdaqDayPct,
    note: 'Friday U.S. cash (AP / Yahoo): S&P 7,743.41 +39.28 / +0.51%. Nasdaq 27,068.72 +129.34 / +0.48%. AP week: S&P +1.2%, Nasdaq +2.1%. AP S&P YTD +13.1%. Official FRED Friday 10-year unread this sitting.',
    nextCalendar: {
      label: 'Monday cash + Wednesday PCE / GDP',
      detail:
        'NYSE / TSX reopen Monday. BLS Tuesday 10:00 ET: August JOLTS. BEA Wednesday 8:30 ET: August personal income and outlays, plus Q2 GDP third estimate. BLS Friday Oct 2: September employment situation.',
    },
  },
  markets: {
    global: {
      indices: [
        {
          label: 'Nikkei 225',
          value: nikkei.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: nikkeiDayPct,
          note: 'Friday official close 66,364.20 +850.21 / +1.30% (Nikkei Indexes). Still Friday cash. Tokyo Monday has not printed.',
        },
        {
          label: 'TOPIX',
          value: topix.toLocaleString('en-US'),
          dayPct: 1.31,
          note: 'Friday close 4,128.59 +53.29 / +1.31% (STL.News / RTHK). Not a book ticker.',
        },
        {
          label: 'Hang Seng',
          value: hangSeng.toLocaleString('en-US'),
          dayPct: hangSengDayPct,
          note: 'Friday close 24,510.09 −251 / −1.01% (RTHK). Hang Seng Tech 4,311 −1.1%. China Enterprises 8,165 −1.2%. Not a holding.',
        },
        {
          label: 'S&P/ASX 200',
          value: asx.toLocaleString('en-US'),
          dayPct: asxDayPct,
          note: 'Friday 8,665.00 −0.43% (STL.News Asia board). Not a book ticker.',
        },
        {
          label: 'FTSE 100',
          value: ftse.toLocaleString('en-US'),
          dayPct: ftseDayPct,
          note: 'Friday London close 10,695.25 +15.26 / +0.14% (AJ Bell / Digital Look). Not a holding.',
        },
        {
          label: 'DAX 40',
          value: dax.toLocaleString('en-US'),
          dayPct: daxDayPct,
          note: 'Friday Xetra close 25,408.64 +0.56% (dpa-AFX). Week +0.4% (dpa-AFX).',
        },
      ],
      commodities: [
        {
          label: 'WTI November',
          value: `$${wtiNov.toFixed(2)}`,
          dayPct: wtiDayPct,
          note: 'Friday Yahoo CL=F 92.41 −2.33%. AP: oil cooldown helped the first winning U.S. week in three.',
        },
        {
          label: 'Brent',
          value: `$${brent.toFixed(2)}`,
          dayPct: brentDayPct,
          note: 'Friday Yahoo BZ=F 97.44 −2.77%. AP: Brent dropped below $98 Friday.',
        },
        {
          label: 'Gold December',
          value: `$${goldDec.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
          dayPct: goldDayPct,
          note: 'Friday Yahoo GC=F 4,321.20 +0.54%.',
        },
      ],
      rates: [
        {
          label: 'U.S. 10-year',
          note: 'Official FRED DGS10 Friday unread this sitting (page timed out). Market-page close 5.184% (portfolio-terminal daily table). Reuters Friday last 5.196%. Not mixed into one official number.',
        },
      ],
      fx: [
        {
          label: 'USD/CAD',
          value: cadOfficial.toFixed(4),
          note: 'BoC Valet FXUSDCAD daily average 1.4145 on 2026-09-25 (was 1.4136 on the 24th). Sunday has no new Valet print.',
        },
      ],
      note: 'Sunday GLOBAL: Friday cash only. Shanghai Friday day change unread — omitted. Kospi / Taiwan closed Friday holiday — omitted. Sensex unread — omitted.',
    },
    us: {
      indices: [
        {
          label: 'S&P 500',
          value: spxClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: spxDayPct,
          note: 'Friday cash (AP / Yahoo) 7,743.41 +39.28 / +0.51%. AP week +1.2%. AP year +13.1%. Yahoo YTD +13.12%.',
        },
        {
          label: 'Nasdaq',
          value: nasdaqClose.toLocaleString('en-US'),
          dayPct: nasdaqDayPct,
          note: 'Friday 27,068.72 +129.34 / +0.48% (AP / Yahoo). AP week +2.1%. AP year +16.5%. Yahoo YTD +16.46%.',
        },
        {
          label: 'Dow',
          value: dowClose.toLocaleString('en-US'),
          dayPct: dowDayPct,
          note: 'Friday 51,828.62 +478.64 / +0.93% (AP). AP week +0.3%. AP year +7.8%.',
        },
        {
          label: 'Russell 2000',
          value: russellClose.toLocaleString('en-US'),
          dayPct: russellDayPct,
          note: 'Friday 2,837.55 +1.98 / +0.1% (AP). AP week −0.8%. AP year +14.3%.',
        },
      ],
      sectors: [
        {
          label: 'Philadelphia Semiconductor',
          value: soxClose.toLocaleString('en-US'),
          dayPct: soxDayPct,
          note: 'Friday Yahoo ^SOX 12,668.93 +1.41%.',
        },
        {
          label: 'Energy',
          note: 'Friday WTI November 92.41 −2.33% (Yahoo). Brent 97.44 −2.77% (Yahoo). Sector index unread — omitted.',
        },
      ],
      breadth: 'Friday breadth unread this sitting — omitted, not faked. Sunday has no cash tape.',
      yields: [
        {
          label: 'U.S. 10-year',
          note: 'FRED DGS10 Friday unread. Market-page close 5.184%. Reuters last 5.196%. AP: the 10-year briefly jumped near the highest since 2007 before oil pulled back.',
        },
      ],
      note: 'Friday U.S. cash. AP: oil cooldown helped the first winning week in three. Reuters: Microsoft and other AI names lifted the tape; high oil and a yield surge still sat under the week. Sunday cash does not exist.',
    },
    ca: {
      indices: [
        {
          label: 'S&P/TSX Composite',
          value: tsxClose.toLocaleString('en-US'),
          dayPct: tsxDayPct,
          note: `Friday close 35,800.89 +${tsxPoints} / +${tsxDayPct}% (Baystreet). Week still −5.76 points / −0.02% (Baystreet).`,
        },
        {
          label: 'TSX Venture',
          value: tsxV.toLocaleString('en-US'),
          note: 'Friday 920.47 +6.56 points (Baystreet). Week −2.6 points / −0.28%.',
        },
      ],
      cadUsd: `BoC 1.4145 CAD per USD (2026-09-25 Valet). Baystreet Friday 70.70 U.S. cents.`,
      sectors: [
        {
          label: 'Financials',
          note: 'Baystreet: financials +1% Friday. National Bank +1.4% after a buyback plan.',
        },
        {
          label: 'Energy',
          note: 'Baystreet: energy −1% Friday as oil pulled back. Not a book sleeve.',
        },
      ],
      note: 'Friday TSX cash. Sunday TSX is shut. Contribution currency is still C$. Official Friday FX is BoC 1.4145, not a weekend print.',
    },
    calendar: {
      items: [
        {
          when: 'Monday',
          where: 'US' as const,
          label: 'First cash after Friday close',
          why: 'NYSE reopens. Friday’s S&P 7,743.41 is the last print until then.',
        },
        {
          when: 'Monday',
          where: 'CA' as const,
          label: 'TSX reopen',
          why: 'Friday TSX 35,800.89. C$ contribution still waits for a live session.',
        },
        {
          when: 'Tuesday 10:00 ET',
          where: 'US' as const,
          label: 'JOLTS (August)',
          why: 'BLS: Job Openings and Labor Turnover Survey for August 2026 on 29 September.',
        },
        {
          when: 'Wednesday 8:30 ET',
          where: 'US' as const,
          label: 'PCE + Q2 GDP third estimate',
          why: 'BEA: August personal income and outlays, plus Q2 2026 GDP third estimate. That is the next inflation print under this growth book.',
        },
        {
          when: 'Friday Oct 2 8:30 ET',
          where: 'US' as const,
          label: 'September employment situation',
          why: 'BLS calendar: Employment Situation for September 2026.',
        },
        {
          when: 'Late October',
          where: 'US' as const,
          label: 'Apple Q4 date unannounced',
          why: 'Apple IR / newsroom has not dated the Q4 FY2026 call. Street calendars guess Oct 29. Last confirmed call is July 30.',
        },
        {
          when: 'Nov 17 (street)',
          where: 'US' as const,
          label: 'Nvidia Q3 (street calendars)',
          why: 'Wall Street Horizon / Trefis name Nov 17 after the close. NVIDIA IR Q2 page read this sitting does not date Q3. Last IR print is Aug 26.',
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
      rating: 'HOLD — next IR unread for a dated Q3',
      tone: 'watch' as const,
      role: 'AI compute line',
      whatMatters: 'Friday $225.07 +0.22%. Last IR is Aug 26. Street calendars name Nov 17.',
      ytd: nvdaYtd,
    },
    {
      ticker: 'AAPL',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Recent purchase',
      whatMatters: 'Friday $341.07 +1.53%. Beating S&P YTD. Official Q4 date unread.',
      ytd: aaplYtd,
    },
    {
      ticker: 'VOO',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      role: 'Best simple core',
      whatMatters: 'Friday $710.79 +0.54%. Tracks the S&P. New core money still simplifies here.',
      ytd: vooYtd,
    },
    {
      ticker: 'VTI',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Broad US',
      whatMatters: 'Friday $379.77 +0.45%. Excellent fund. Still overlaps VOO.',
      ytd: vtiYtd,
      overlapWith: ['VOO'],
    },
    {
      ticker: 'VUG',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Growth sleeve',
      whatMatters: 'Friday $90.94 +0.54%. YTD still behind the S&P while you already own the winners.',
      ytd: vugYtd,
      overlapWith: ['NVDA', 'AAPL', 'VOO', 'MGK'],
    },
    {
      ticker: 'MGK',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Mega-cap growth',
      whatMatters: 'Friday $93.37 +0.41%. Same mega-cap stack, more concentrated.',
      ytd: mgkYtd,
      overlapWith: ['NVDA', 'AAPL', 'VUG', 'VOO'],
    },
    {
      ticker: 'GDV',
      rating: 'HOLD — income / diversifier',
      tone: 'long' as const,
      role: 'Income sleeve',
      whatMatters: 'Friday $28.95 +0.59%. Different job. NAV unread this sitting.',
      ytd: gdvYtd,
    },
  ],
  portfolio: {
    concentrationThesis: 'VOO + VTI + VUG + MGK + AAPL + NVDA still buy the same U.S. mega-cap growth names.',
    concentrationBody:
      'Friday’s up day does not fix that. When mega-cap growth is hit, several lines move together. Weights are still unknown, so the stack stays qualitative.',
    factorStack: ['NVDA', 'AAPL', 'MGK', 'VUG', 'VOO', 'VTI'],
    factorLabel: 'U.S. mega-cap / growth',
    overlapNote: 'same ecosystem',
  },
  names: [
    {
      ticker: 'NVDA',
      chapterTitle: 'NVDA · last IR is August 26',
      rating: 'HOLD — WATCH',
      tone: 'watch' as const,
      price: nvdaClose,
      dayPct: nvdaDayPct,
      holdNote: 'Friday cash $225.07 +0.22% (Yahoo). No weekend add.',
      streak: [2.54, 1.34, 2.3, 0.66, -1.47, -0.41, 0.22],
      streakHeadline: 'Seven sessions. Two red days, then a quiet Friday.',
      streakNote: 'Yahoo daily closes Sep 17–25. Friday +0.22% is not a new filing.',
      fundamentals: [
        {label: 'Q2 FY27 revenue', value: `$${nvdaQ2Rev.toFixed(1)}B  +106% y/y`},
        {label: 'Q2 data center', value: `$${nvdaDcRev.toFixed(1)}B  +117% y/y`},
        {label: 'Q2 GAAP EPS', value: '$2.46'},
        {label: 'Q2 GAAP / non-GAAP GM', value: '75.0% / 75.0%'},
        {label: 'Q3 revenue guide', value: `$${nvdaQ3Guide.toFixed(1)}B ±2%`},
      ],
      vsSpx: {
        headline: 'Beating the S&P YTD. Friday was a quiet +0.22%.',
        bars: [
          {label: 'NVDA YTD', pct: nvdaYtd, tone: 'nvda' as const},
          {label: 'S&P YTD', pct: spxYtdYahoo, tone: 'muted' as const},
        ],
        note: `Spread: ${vsSpxSpread(nvdaYtd, spxYtdYahoo) >= 0 ? '+' : ''}${vsSpxSpread(nvdaYtd, spxYtdYahoo).toFixed(1)} points (NVDA YTD − S&P YTD). Yahoo chart vs 2025 year-end close.`,
      },
      consensus: {
        rows: [
          {label: 'Q2 FY27 revenue', value: `$${nvdaQ2Rev.toFixed(1)}B`},
          {label: 'Q2 data center', value: `$${nvdaDcRev.toFixed(1)}B`},
          {label: 'Q2 GAAP / non-GAAP EPS', value: '$2.46 / $2.22'},
          {label: 'Q3 revenue guide', value: `$${nvdaQ3Guide.toFixed(1)}B ±2%`},
          {label: 'Q3 margin guide', value: '74.0% ±50 bp'},
        ],
        note: 'NVIDIA IR Aug 26. Q2 revenue $96.2B, +18% q/q, +106% y/y. Gross margin 75.0%. Outlook assumes no China data-center compute. Street calendars name Nov 17; IR page unread for a dated Q3 invite.',
        range: {metric: 'Q3 revenue guide', unit: 'B', guide: nvdaQ3Guide, low: 105.84, high: 110.16},
      },
      narrative: {
        leftTitle: 'THE RATE',
        leftHeadline: 'Long yields sat near a 19-year high this week.',
        leftBody:
          'AP: the 10-year briefly jumped near the highest since 2007 before oil pulled back. That is the rate that compresses long-duration growth — the exact overweight.',
        rightTitle: 'THE PRINT',
        rightHeadline: 'August 26 IR is still the last official number.',
        rightBody: `Revenue $${nvdaQ2Rev.toFixed(1)}B. Data center $${nvdaDcRev.toFixed(1)}B. Q3 guide $${nvdaQ3Guide.toFixed(1)}B ±2%, margin 74% ±50 bp. Friday’s +0.22% is not a new filing.`,
      },
      interpretation: {
        chips: [
          {
            label: 'CONFIRMED',
            tone: 'long' as const,
            text: 'Q2 FY27 demand was still huge: $96.2B revenue, $89.0B data center (NVIDIA IR).',
          },
          {
            label: 'CONFIRMED',
            tone: 'watch' as const,
            text: 'Guided Q3 margin 74% ±50 bp, down from the 75.0% Q2 print.',
          },
          {
            label: 'INFERENCE',
            tone: 'caution' as const,
            text: 'A ~5.2% 10-year and a mega-cap stack can both be true. Friday’s green close does not retire the rate risk.',
          },
        ],
        note: 'Customer-financing size from the August brief was not re-read this sitting. Omitted, not repeated.',
      },
      actionMatrix: {
        headline: 'Weekend: HOLD. No Sunday ticket.',
        rows: [
          {
            tone: 'watch' as const,
            if: 'Monday cash opens near Friday’s $225',
            then: 'HOLD. Wait for a dated IR invite before treating Nov 17 as official.',
          },
          {
            tone: 'long' as const,
            if: 'Wednesday PCE cools and the 10-year backs off',
            then: 'Still HOLD the line. Do not chase a one-day SOX bounce.',
          },
          {
            tone: 'caution' as const,
            if: 'Yields push back through this week’s highs',
            then: 'Do not automatically buy the dip in the same growth stack.',
          },
          {
            tone: 'short' as const,
            if: 'A new IR print weakens guide or margin',
            then: 'That is a later sitting. Nothing on Sunday changes the last filing.',
          },
        ],
      },
      network: {
        title: 'NVDA · last sourced IR chain',
        headline: 'Nodes from the Aug 26 release and Friday tape. No composite score.',
        nodes: [
          {id: 'dc', label: 'Data center $89.0B', polarity: 'confirmed' as const, x: 0.1, y: 0.28, evidence: 'Q2 +18% q/q'},
          {id: 'rev', label: 'Q2 revenue $96.2B', polarity: 'confirmed' as const, x: 0.32, y: 0.22, evidence: '+106% y/y'},
          {id: 'guide', label: 'Q3 guide $108B', polarity: 'confirmed' as const, x: 0.54, y: 0.22, evidence: '±2%, no China DC'},
          {id: 'margin', label: 'Margins', polarity: 'concern' as const, x: 0.32, y: 0.78, evidence: 'Q2 75% → Q3 74%'},
          {id: 'nvda', label: 'NVDA $225.07', polarity: 'neutral' as const, x: 0.62, y: 0.5},
          {id: 'sox', label: 'SOX Friday +1.41%', polarity: 'confirmed' as const, x: 0.82, y: 0.22},
          {id: 'rates', label: '10-year ~19y high', polarity: 'concern' as const, x: 0.82, y: 0.78},
          {id: 'next', label: 'Next IR unread', polarity: 'inference' as const, x: 0.94, y: 0.5},
        ],
        edges: [
          {from: 'dc', to: 'rev'},
          {from: 'rev', to: 'guide'},
          {from: 'guide', to: 'nvda'},
          {from: 'margin', to: 'nvda', label: 'guide down'},
          {from: 'nvda', to: 'sox'},
          {from: 'rates', to: 'nvda', label: 'duration'},
          {from: 'nvda', to: 'next'},
        ],
      },
    },
    {
      ticker: 'AAPL',
      chapterTitle: 'AAPL · Friday was the strong name',
      rating: 'HOLD',
      tone: 'long' as const,
      price: aaplClose,
      dayPct: aaplDayPct,
      holdNote: 'Friday cash $341.07 +5.15 / +1.53% (Yahoo). You already own it. Do not double it this weekend.',
      streak: [1.38, -0.26, 0.85, 0.23, -0.8, -0.33, 1.53],
      streakHeadline: 'Seven sessions. Friday was the clean bounce.',
      streakNote: 'Yahoo daily closes Sep 17–25.',
      returns: {
        headline: 'Beating the S&P YTD. Friday was the book’s cleanest green print.',
        bars: [
          {label: 'YTD', pct: aaplYtd, tone: 'long' as const},
          {label: 'S&P YTD', pct: spxYtdYahoo, tone: 'muted' as const},
        ],
        note: `Spread vs S&P YTD: ${vsSpxSpread(aaplYtd, spxYtdYahoo) >= 0 ? '+' : ''}${vsSpxSpread(aaplYtd, spxYtdYahoo).toFixed(1)} points. Yahoo chart vs 2025 year-end close. One-month / six-month unread this sitting — omitted.`,
      },
      catalyst: {
        headline: 'Apple has not announced a Q4 FY2026 call date.',
        steps: [
          'Friday cash already printed',
          'Last confirmed call: July 30 (Apple pattern / newsroom)',
          'Street calendars guess Oct 29 — not an IR date',
        ],
        note: 'Do not treat Oct 29 as official until Apple’s newsroom dates it.',
      },
      action: {
        headline: 'HOLD the position.',
        body: 'Do not add on a Sunday. The next contribution should diversify, not double the same name.',
      },
    },
    {
      ticker: 'VOO',
      chapterTitle: 'VOO · the foundation is not the problem',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      price: vooClose,
      dayPct: vooDayPct,
      metrics: [
        {label: 'Friday', value: `$${vooClose.toFixed(2)}  +${vooDayPct}%`},
        {label: 'YTD', value: `+${vooYtd}%`},
      ],
      copy: {
        headline: 'Best simple core. New core money simplifies here.',
        body: 'Friday $710.79 +0.54% (Yahoo). Do not sell. Stop splitting every future contribution with VTI.',
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
        {label: 'Friday', value: `$${vtiClose.toFixed(2)}  +${vtiDayPct}%`},
        {label: 'YTD', value: `+${vtiYtd}%`},
      ],
      copy: {
        headline: 'Excellent. Mega-caps still dominate, so the top looks like VOO.',
        body: 'Friday $379.77 +0.45% (Yahoo). Do not sell. The overlap with VOO is the issue — not the fund quality.',
      },
    },
    {
      ticker: 'VUG',
      chapterTitle: 'VUG · good ETF, still behind the index YTD',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      price: vugClose,
      dayPct: vugDayPct,
      returns: {
        headline: 'Despite the growth label, VUG is still behind the S&P YTD — while you already own the individual winners.',
        bars: [
          {label: 'VUG YTD', pct: vugYtd, tone: 'watch' as const},
          {label: 'S&P YTD', pct: spxYtdYahoo, tone: 'long' as const},
        ],
        note: 'Friday $90.94 +0.54% (Yahoo). HOLD existing. No priority additions.',
      },
    },
    {
      ticker: 'MGK',
      chapterTitle: 'MGK · same issue, even more concentrated',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      price: mgkClose,
      dayPct: mgkDayPct,
      metrics: [
        {label: 'Friday', value: `$${mgkClose.toFixed(2)}  +${mgkDayPct}%`},
        {label: 'YTD', value: `+${mgkYtd}%`},
      ],
      copy: {
        body: 'Friday $93.37 +0.41% (Yahoo). You already own NVDA and AAPL directly. HOLD. Stop feeding it. Not a sell call — tax and account mechanics were not reconstructed this sitting.',
      },
    },
    {
      ticker: 'GDV',
      chapterTitle: 'GDV · a completely different job',
      rating: 'HOLD · INCOME / DIVERSIFIER',
      tone: 'long' as const,
      price: gdvClose,
      dayPct: gdvDayPct,
      metrics: [
        {label: 'Friday market', value: `$${gdvClose.toFixed(2)}  +${gdvDayPct}%`},
        {label: 'YTD (Yahoo chart)', value: `+${gdvYtd}%`},
      ],
      copy: {
        body: 'Closed-end income/value. Friday $28.95 (Yahoo). NAV unread this sitting — omitted. When AI/growth gets punched, this sleeve is supposed to look different. Not a growth engine. Not “Next NVDA.”',
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
      id: 'fred-10y',
      area: 'US' as const,
      question: 'What did official FRED DGS10 print on Friday?',
      whyItMatters: 'Market pages disagree (5.184% vs Reuters 5.196%). The 10-year is the rate that sits under this growth book.',
      neededToKnow: 'FRED DGS10 observation for 2026-09-25.',
      status: 'unknown' as const,
    },
    {
      id: 'gdv-nav',
      area: 'name' as const,
      ticker: 'GDV',
      question: 'What is GDV’s latest NAV and discount?',
      whyItMatters: 'The income sleeve is the one line that should look different. Market price alone is not the fund.',
      neededToKnow: 'Gabelli / CEF page NAV dated after Friday.',
      status: 'unknown' as const,
    },
    {
      id: 'aapl-date',
      area: 'name' as const,
      ticker: 'AAPL',
      question: 'When did Apple date the Q4 FY2026 call?',
      whyItMatters: 'Street calendars guess Oct 29. Apple IR has not announced it.',
      neededToKnow: 'An Apple newsroom / IR dated invite.',
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
    existingPortfolio: 'HOLD — sell nothing on a Sunday.',
    freshCapital: 'No weekend ticket. When a session exists, new core money still simplifies into VOO.',
    bestAdd: 'VOO',
    highestUpsideWatch: 'none named',
    biggestRisk: 'Mega-cap growth overlap across NVDA, AAPL, MGK, VUG, VOO, VTI — plus a ~5.2% 10-year that was not officially printed on FRED this sitting.',
    nextTrigger: 'Monday cash, then Wednesday PCE / Q2 GDP third estimate',
    ifThen: [
      {
        tone: 'watch' as const,
        if: 'Monday opens near Friday’s closes',
        then: 'HOLD the book. Do not add before a live session.',
      },
      {
        tone: 'long' as const,
        if: 'Wednesday PCE cools and yields ease',
        then: 'Still HOLD. Fresh core money, if any, goes to VOO — not another growth clone.',
      },
      {
        tone: 'caution' as const,
        if: 'Yields push back through this week’s highs',
        then: 'Do not automatically buy the dip in NVDA / VUG / MGK.',
      },
      {
        tone: 'short' as const,
        if: 'A new IR print weakens NVDA guide or margin',
        then: 'Re-read the book then. Sunday has no new filing.',
      },
    ],
  },
  risks: [
    {
      n: '01',
      title: 'Growth-factor concentration',
      body: 'NVDA + AAPL + MGK + VUG + VOO + VTI repeatedly own the same mega-cap ecosystem. Weights are still unknown.',
    },
    {
      n: '02',
      title: 'Interest rates',
      body: 'The 10-year sat near a 19-year high this week (AP). Official FRED Friday unread. High long rates compress long-duration growth — the exact overweight.',
    },
    {
      n: '03',
      title: 'AI ROI / margin guide',
      body: 'NVIDIA IR still shows huge demand ($96.2B / $89.0B DC) and a Q3 margin guide of 74% ±50 bp, down from 75.0%. That sits under NVDA and most of the indirect book.',
    },
  ],
  close: {
    kicker: 'WEEKEND',
    headline: 'Sunday does not create a ticket.',
    body: 'Friday cash is the last print. The book is still the same seven lines. Watch Monday cash, then Wednesday’s PCE. Publish and trades stay Evens.',
    pills: [
      {tone: 'watch' as const, label: 'HOLD SUNDAY'},
      {tone: 'caution' as const, label: 'NO WEEKEND BUY'},
      {tone: 'long' as const, label: 'VOO IF NEW CORE'},
    ],
    followThrough: [
      {
        tone: 'watch' as const,
        if: 'Monday cash is quiet',
        then: 'Keep the HOLD. Wait for Wednesday PCE.',
      },
      {
        tone: 'caution' as const,
        if: 'Yields gap higher into the week',
        then: 'More VOO / cash / non-AI quality — not another MGK add.',
      },
      {
        tone: 'long' as const,
        if: 'An asymmetric candidate is named',
        then: 'That is when the Next-NVDA sleeve gets a row. None named today.',
      },
    ],
  },
  tickerTape: [
    `SPX ${spxClose.toLocaleString('en-US')}  +${spxDayPct}%`,
    `SPX YTD  +${spxYtdPct}%`,
    `NASDAQ  +${nasdaqDayPct}%`,
    `NVDA  $${nvdaClose.toFixed(2)}  +${nvdaDayPct}%`,
    `AAPL  $${aaplClose.toFixed(2)}  +${aaplDayPct}%`,
    `VOO  $${vooClose.toFixed(2)}  +${vooDayPct}%`,
    `TSX  ${tsxClose.toLocaleString('en-US')}  +${tsxDayPct}%`,
    `CAD  ${cadOfficial} (BoC Fri)`,
    `WTI  $${wtiNov.toFixed(2)}  ${wtiDayPct}%`,
    `PCE  WEDNESDAY`,
    `HOLD SUNDAY`,
    `SELL NOTHING`,
  ],
};

export const episode: DailyReport = parseDailyReport(raw);
