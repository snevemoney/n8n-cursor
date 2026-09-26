import {vsSpxSpread} from '../compute';
import {parseDailyReport, type DailyReport} from '../schema';

const nvdaClose = 225.07;
const nvdaDayPct = 0.22;
const nvdaYtd = 20.96;
const nvdaY1 = 26.97;
const nvdaBeta = 2.22;
const aaplClose = 341.07;
const aaplDayPct = 1.53;
const aaplYtd = 25.8;
const aaplY1 = 33.27;
const aaplM1 = 10.06;
const aaplM6 = 35.01;
const vooClose = 710.79;
const vooDayPct = 0.54;
const vooYtd = 13.43;
const vtiClose = 379.77;
const vtiDayPct = 0.45;
const vtiYtd = 13.45;
const vugClose = 90.94;
const vugDayPct = 0.54;
const vugYtd = 11.49;
const mgkClose = 93.37;
const mgkDayPct = 0.41;
const mgkYtd = 12.85;
const gdvClose = 28.95;
const gdvDayPct = 0.59;
const gdvYtd = 9.21;
const gdvYield = 6.22;
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
    date: '2026-09-26',
    dateLabel: 'SEP 26, 2026',
    title: 'Daily Wealth Intelligence',
    thesis:
      'Markets are closed Saturday. Friday cash is the last print. Stocks rose as oil pulled back. The book is still the same seven U.S. growth lines. That is a weekend read, not a trade.',
    thesisLead: 'Friday cash is the last print.',
    thesisAccent: 'This is a weekend read, not a trade.',
    catalyst:
      'Next North American cash is Monday. Wednesday is BEA PCE and the Q2 GDP third estimate. NVDA’s next dated print is November 17.',
    kicker:
      'Saturday America/Toronto. NYSE and TSX are shut. Last cash is Friday 25 September.',
    universe: ['AAPL', 'NVDA', 'VOO', 'VTI', 'VUG', 'MGK', 'GDV'],
  },
  market: {
    spxClose,
    spxDayPct,
    spxYtdPct,
    nasdaqDayPct,
    note: 'Friday U.S. cash (AP / Yahoo): S&P 7,743.41 +39.28 / +0.51%. Nasdaq 27,068.72 +129.34 / +0.48%. AP: first winning week in three (S&P +1.2%, Nasdaq +2.1%). Official FRED Friday 10-year unread this sitting.',
    nextCalendar: {
      label: 'Monday cash + Wednesday PCE / GDP',
      detail: 'NYSE / TSX reopen Monday. BEA Wednesday 8:30 ET: August personal income and outlays, plus Q2 GDP third estimate. BLS Friday Oct 2: September employment situation.',
    },
  },
  markets: {
    global: {
      indices: [
        {
          label: 'Nikkei 225',
          value: nikkei.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: nikkeiDayPct,
          note: 'Friday close 66,364.20 +850.21 / +1.30% (Yonhap Infomax / Jiji). Fifth green session. TOPIX 4,128.59 +1.31%. Not a book ticker.',
        },
        {
          label: 'TOPIX',
          value: topix.toLocaleString('en-US'),
          dayPct: 1.31,
          note: 'Friday close 4,128.59 +53.29 / +1.31% (Jiji / Yonhap Infomax).',
        },
        {
          label: 'Hang Seng',
          value: hangSeng.toLocaleString('en-US'),
          dayPct: hangSengDayPct,
          note: 'Friday close 24,510.09 −251 / −1.01% (RTHK). Hang Seng Tech 4,311 −1.1%. China Enterprises 8,165 −1.2%. Not a holding.',
        },
        {
          label: 'Shanghai Composite',
          note: 'Friday day change unread this sitting. Armenpress printed 3,888.37 with no percent. Prior wake had Mid-Autumn holiday — omitted as a close, not faked.',
        },
        {
          label: 'S&P/ASX 200',
          value: asx.toLocaleString('en-US'),
          dayPct: asxDayPct,
          note: 'Friday 8,665.00 −0.43% (Edge wrap of the Asia board). Not a book ticker.',
        },
        {
          label: 'FTSE 100',
          value: ftse.toLocaleString('en-US'),
          dayPct: ftseDayPct,
          note: 'Friday London close 10,695.25 +0.14% (Edge wrap of exchange closes). Not a holding.',
        },
        {
          label: 'DAX 40',
          value: dax.toLocaleString('en-US'),
          dayPct: daxDayPct,
          note: 'Friday Xetra close 25,408.64 +0.56% (Edge wrap of the exchange official close).',
        },
      ],
      commodities: [
        {
          label: 'WTI November',
          value: `$${wtiNov.toFixed(2)}`,
          dayPct: wtiDayPct,
          note: 'Friday Yahoo CL=F 92.41 −2.20 / −2.33% at close. Thursday last price on that page was 94.61.',
        },
        {
          label: 'Brent',
          value: `$${brent.toFixed(2)}`,
          dayPct: brentDayPct,
          note: 'Friday Yahoo BZ=F 97.44 −2.78 / −2.77% at close. AP: Brent dropped below $98 Friday.',
        },
        {
          label: 'Gold December',
          value: `$${goldDec.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
          dayPct: goldDayPct,
          note: 'Friday Yahoo GC=F 4,321.20 +23.20 / +0.54% at close. Thursday last price on that page was 4,298.00.',
        },
      ],
      rates: [
        {
          label: 'U.S. 10-year',
          note: 'Official FRED DGS10 Friday unread this sitting (page timed out). Reuters Friday last 5.196%. Edge wrap of the official par curve: 5.17% Friday vs 5.18% Thursday (−1 bp). Not mixed into one number.',
        },
      ],
      fx: [
        {
          label: 'USD/CAD',
          value: cadOfficial.toFixed(4),
          note: 'BoC Valet FXUSDCAD daily average 1.4145 on 2026-09-25 (was 1.4136 on the 24th). Reuters Friday session ~1.4152.',
        },
      ],
      note: 'Saturday GLOBAL: Friday cash only. Shanghai day change omitted. Kospi / Taiwan / Sensex unread this sitting — omitted. USD/JPY unread — omitted.',
    },
    us: {
      indices: [
        {
          label: 'S&P 500',
          value: spxClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: spxDayPct,
          note: 'Friday cash (AP / Yahoo) 7,743.41 +39.28 / +0.51%. AP week +1.2%. AP year +13.1%. Yahoo YTD +13.12%. AP: within 0.7% of last month’s high.',
        },
        {
          label: 'Nasdaq',
          value: nasdaqClose.toLocaleString('en-US'),
          dayPct: nasdaqDayPct,
          note: 'Friday 27,068.72 +129.34 / +0.48% (AP / Yahoo). AP week +2.1%. AP year +16.5%.',
        },
        {
          label: 'Dow',
          value: dowClose.toLocaleString('en-US'),
          dayPct: dowDayPct,
          note: 'Friday 51,828.62 +478.64 / +0.9% (AP). AP week +0.3%. AP year +7.8%.',
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
          note: 'Friday Yahoo ^SOX 12,668.93 +176.39 / +1.41%. Thursday close on that page 12,492.54.',
        },
        {
          label: 'Energy',
          note: 'Friday WTI November 92.41 −2.33% (Yahoo). Brent 97.44 −2.77% (Yahoo). Sector index unread — omitted.',
        },
      ],
      breadth: 'Friday breadth unread this sitting — omitted, not faked. Saturday has no cash tape.',
      yields: [
        {
          label: 'U.S. 10-year',
          note: 'FRED DGS10 Friday unread. Reuters last 5.196%. Edge wrap official par 5.17% Friday (−1 bp). AP: 10-year briefly near the highest since 2007 before oil pulled back.',
        },
      ],
      note: 'Friday U.S. cash. AP: oil cooldown helped the first winning week in three. Reuters: Microsoft and other AI names lifted the tape; high oil and a yield surge still sat under the week. Saturday cash does not exist.',
    },
    ca: {
      indices: [
        {
          label: 'S&P/TSX Composite',
          value: tsxClose.toLocaleString('en-US'),
          dayPct: tsxDayPct,
          note: `Friday close 35,800.89 +${tsxPoints} / +${tsxDayPct}% (Business Upturn / Baystreet). Week still −5.76 points / −0.02% (Baystreet).`,
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
          note: 'Baystreet: financials +1% Friday. National Bank +1.4% after a buyback plan. Trading Economics: RBC and TD +1.2%, BMO +0.8%, Scotia +1.5%, CIBC +2%.',
        },
        {
          label: 'Energy',
          note: 'Baystreet: energy −1% Friday as oil pulled back. Not a book sleeve.',
        },
      ],
      note: 'Friday TSX cash. Saturday TSX is shut. Contribution currency is still C$. Official Friday FX is BoC 1.4145, not a weekend print.',
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
          why: 'BLS scheduled Job Openings and Labor Turnover Survey for 29 September.',
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
          when: 'Oct 29',
          where: 'US' as const,
          label: 'Apple earnings (Yahoo dated)',
          why: 'Yahoo AAPL earnings date Oct 29, 2026. Not a weekend event.',
        },
        {
          when: 'Nov 17',
          where: 'US' as const,
          label: 'Nvidia earnings (Yahoo dated)',
          why: 'Yahoo NVDA earnings date Nov 17, 2026. Last IR print is the Aug 26 Q2 FY27 release.',
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
      rating: 'HOLD — next print Nov 17',
      tone: 'watch' as const,
      role: 'AI compute line',
      whatMatters: 'Friday $225.07 +0.22%. Next dated print Nov 17. Last IR is Aug 26.',
      ytd: nvdaYtd,
    },
    {
      ticker: 'AAPL',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Recent purchase',
      whatMatters: 'Friday $341.07 +1.53%. Beating S&P YTD. Earnings dated Oct 29.',
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
      holdNote: 'Friday cash $225.07 +0.22% (Yahoo). After-hours 225.00. No weekend add.',
      fundamentals: [
        {label: 'Market cap', value: '$5.435T'},
        {label: 'TTM revenue', value: '$303.0B'},
        {label: 'TTM net income', value: '$192.9B'},
        {label: 'TTM EPS', value: '$7.90'},
        {label: 'P/E', value: '28.49×'},
        {label: 'Beta', value: String(nvdaBeta)},
      ],
      vsSpx: {
        headline: 'Beating the S&P YTD. Still a 2.2-beta name. Friday was a quiet +0.22%.',
        bars: [
          {label: 'NVDA YTD', pct: nvdaYtd, tone: 'nvda' as const},
          {label: 'S&P YTD', pct: spxYtdYahoo, tone: 'muted' as const},
        ],
        note: `Spread: ${vsSpxSpread(nvdaYtd, spxYtdYahoo) >= 0 ? '+' : ''}${vsSpxSpread(nvdaYtd, spxYtdYahoo).toFixed(1)} points (NVDA YTD − S&P YTD). Yahoo 1-year +${nvdaY1}%. Beta ${nvdaBeta}.`,
      },
      consensus: {
        rows: [
          {label: 'Q2 FY27 revenue', value: `$${nvdaQ2Rev.toFixed(1)}B`},
          {label: 'Q2 data center', value: `$${nvdaDcRev.toFixed(1)}B`},
          {label: 'Q2 GAAP / non-GAAP EPS', value: '$2.46 / $2.22'},
          {label: 'Q3 revenue guide', value: `$${nvdaQ3Guide.toFixed(1)}B ±2%`},
          {label: 'Q3 margin guide', value: '74.0% ±50 bp'},
        ],
        note: 'NVIDIA IR / SEC Aug 26. Q2 revenue $96.2B, +18% q/q, +106% y/y. Gross margin 75.0%. Outlook assumes no China data-center compute. Next dated print Nov 17 (Yahoo).',
        range: {metric: 'Q3 revenue guide', unit: 'B', guide: nvdaQ3Guide, low: 105.8, high: 110.2},
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
          {label: 'CONFIRMED', tone: 'long' as const, text: 'Q2 FY27 demand was still huge: $96.2B revenue, $89.0B data center (NVIDIA / SEC).'},
          {label: 'CONFIRMED', tone: 'watch' as const, text: 'Guided Q3 margin 74% ±50 bp, down from the 75.0% Q2 print.'},
          {
            label: 'INFERENCE',
            tone: 'caution' as const,
            text: 'A 5% 10-year and a mega-cap stack can both be true. Friday’s green close does not retire the rate risk.',
          },
        ],
        note: 'Customer-financing size from the August brief was not re-read this sitting. Omitted, not repeated.',
      },
      actionMatrix: {
        headline: 'Weekend: HOLD. No Saturday ticket.',
        rows: [
          {
            tone: 'watch' as const,
            if: 'Monday cash opens near Friday’s $225',
            then: 'HOLD. Next dated print is Nov 17.',
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
            then: 'That is November. Nothing on Saturday changes that date.',
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
          {id: 'next', label: 'Nov 17 print', polarity: 'inference' as const, x: 0.94, y: 0.5},
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
      returns: {
        headline: 'Beating the S&P YTD. Friday was the book’s cleanest green print.',
        bars: [
          {label: 'YTD', pct: aaplYtd, tone: 'long' as const},
          {label: 'S&P YTD', pct: spxYtdYahoo, tone: 'muted' as const},
          {label: '1 year', pct: aaplY1, tone: 'gold' as const},
          {label: '6 months', pct: aaplM6, tone: 'aapl' as const},
          {label: '1 month', pct: aaplM1, tone: 'long' as const},
        ],
        note: `Spread vs S&P YTD: ${vsSpxSpread(aaplYtd, spxYtdYahoo) >= 0 ? '+' : ''}${vsSpxSpread(aaplYtd, spxYtdYahoo).toFixed(1)} points. Yahoo range Friday 334.53–341.67. 52-week high 345.34.`,
      },
      catalyst: {
        headline: 'Next dated event is earnings October 29 (Yahoo).',
        steps: [
          'Friday cash already printed',
          'Fiscal year-end on the Yahoo profile is September 27',
          'October 29 is the dated earnings slot',
        ],
        note: 'Yahoo “what’s happening” talked about a foldable iPhone. That is news tape, not an IR filing this sitting. Not treated as a proven revenue driver.',
      },
      action: {
        headline: 'HOLD the position.',
        body: 'Do not add on Saturday. The next contribution should still diversify, not double the same name.',
      },
    },
    {
      ticker: 'VOO',
      chapterTitle: 'VOO · the core still works',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      price: vooClose,
      dayPct: vooDayPct,
      metrics: [
        {label: 'Friday', value: `$${vooClose.toFixed(2)}  +${vooDayPct.toFixed(2)}%`},
        {label: 'YTD', value: `+${vooYtd.toFixed(2)}%`},
      ],
      copy: {
        headline: 'Best simple core. New core money still simplifies here.',
        body: 'Yahoo YTD daily total return +13.43% as printed on the quote page. Expense ratio 0.03%. Do not sell. Stop splitting every future contribution with VTI.',
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
        {label: 'Friday', value: `$${vtiClose.toFixed(2)}  +${vtiDayPct.toFixed(2)}%`},
        {label: 'YTD', value: `+${vtiYtd.toFixed(2)}%`},
      ],
      copy: {
        headline: 'Excellent. Mega-caps still dominate, so the top looks like VOO.',
        body: 'Yahoo YTD daily total return +13.45%. Do not sell. The overlap with VOO is the issue — not the fund quality.',
      },
    },
    {
      ticker: 'VUG',
      chapterTitle: 'VUG · growth sleeve still lagging the index',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      price: vugClose,
      dayPct: vugDayPct,
      returns: {
        headline: 'Friday was green. YTD is still behind the S&P — and you already own NVDA and AAPL.',
        bars: [
          {label: 'VUG YTD', pct: vugYtd, tone: 'watch' as const},
          {label: 'S&P YTD', pct: spxYtdYahoo, tone: 'long' as const},
        ],
        note: 'Yahoo YTD daily total return +11.49% as of the quote page. HOLD existing. No priority additions.',
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
        {label: 'Friday', value: `$${mgkClose.toFixed(2)}  +${mgkDayPct.toFixed(2)}%`},
        {label: 'YTD', value: `+${mgkYtd.toFixed(2)}%`},
      ],
      copy: {
        body: 'Yahoo YTD daily total return +12.85% — still a hair behind the S&P. You already own NVDA and AAPL directly. HOLD. Stop feeding it. Not a sell call — tax and account weights are unread.',
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
        {label: 'Friday', value: `$${gdvClose.toFixed(2)}  +${gdvDayPct.toFixed(2)}%`},
        {label: 'YTD total return', value: `+${gdvYtd.toFixed(2)}%`},
        {label: 'Dist. rate', value: `~${gdvYield.toFixed(2)}%`},
      ],
      copy: {
        body: 'Closed-end income/value. Yahoo forward yield 6.22%. Ex-div dated Oct 16. NAV and discount unread this sitting — omitted, not guessed. Not a growth engine. Not “Next NVDA.”',
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
      id: 'fred-10y-friday',
      area: 'US' as const,
      question: 'What is the official FRED / H.15 Friday 10-year?',
      whyItMatters: 'Reuters last 5.196% and Edge par 5.17% are not the same print. The growth book is duration-heavy.',
      neededToKnow: 'FRED DGS10 observation for 2026-09-25.',
      status: 'unknown' as const,
    },
    {
      id: 'gdv-nav',
      area: 'name' as const,
      ticker: 'GDV',
      question: 'What is Friday GDV NAV and the discount?',
      whyItMatters: 'Market $28.95 is not NAV. The income sleeve job is the discount, not the Friday tick.',
      neededToKnow: 'Gabelli / CEF page NAV for 2026-09-25.',
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
      id: 'nvda-financing',
      area: 'name' as const,
      ticker: 'NVDA',
      question: 'What is the current sourced size of customer financing / lease exposure?',
      whyItMatters: 'The August brief had a large OpenAI lease figure. It was not re-read this sitting.',
      neededToKnow: 'A current NVIDIA / customer filing. Do not repeat the old number.',
      status: 'unknown' as const,
    },
  ],
  scenarios: [],
  capitalPlan: {
    existingPortfolio: 'HOLD — sell nothing on a Saturday. Friday cash already printed.',
    freshCapital: 'No weekend ticket. If a C$ contribution waits for Monday, VOO is still the simple core add.',
    bestAdd: 'VOO',
    highestUpsideWatch: 'none named',
    biggestRisk: 'Mega-cap growth overlap across NVDA, AAPL, MGK, VUG, VOO, VTI — plus a 10-year still near a 19-year high',
    nextTrigger: 'Monday cash, then Wednesday BEA PCE + Q2 GDP third estimate',
    ifThen: [
      {
        tone: 'watch' as const,
        if: 'Monday opens near Friday’s closes',
        then: 'HOLD the seven lines. Do not invent a Saturday fill.',
      },
      {
        tone: 'long' as const,
        if: 'Wednesday PCE cools and the official 10-year backs off',
        then: 'New core money can still simplify into VOO. Do not double NVDA or AAPL.',
      },
      {
        tone: 'caution' as const,
        if: 'Yields push back through this week’s highs',
        then: 'Do not automatically add the same growth stack.',
      },
      {
        tone: 'short' as const,
        if: 'A sourced IR print weakens NVDA guide or margin before Nov 17',
        then: 'Re-read the book. That is not today’s job.',
      },
    ],
  },
  risks: [
    {
      n: '01',
      title: 'Growth-factor concentration',
      body: 'NVDA + AAPL + MGK + VUG + VOO + VTI still own the same mega-cap ecosystem. Friday’s green tape does not diversify it.',
    },
    {
      n: '02',
      title: 'Interest rates',
      body: 'The 10-year sat near a 19-year high this week. Official Friday FRED is unread. High long rates compress this exact overweight.',
    },
    {
      n: '03',
      title: 'AI ROI and the next print',
      body: 'August 26 IR is still the last official NVDA number. The next dated print is November 17. A weekend quote is not a filing.',
    },
  ],
  close: {
    kicker: 'WEEKEND',
    headline: 'Friday was a relief tape. Saturday is not a market.',
    body: 'Oil pulled back. The S&P and Nasdaq closed green. The book is unchanged. Watch Monday cash and Wednesday’s BEA print. Publish, YouTube, and any ticket stay with Evens.',
    pills: [
      {tone: 'watch' as const, label: 'HOLD THIS WEEKEND'},
      {tone: 'long' as const, label: 'VOO IF ADDING'},
      {tone: 'caution' as const, label: 'NO SATURDAY TICKET'},
    ],
    followThrough: [
      {
        tone: 'watch' as const,
        if: 'Monday cash is quiet',
        then: 'Keep the seven lines. Re-source the official 10-year.',
      },
      {
        tone: 'caution' as const,
        if: 'Wednesday PCE is hot',
        then: 'More VOO / cash / non-AI quality. Do not chase SOX.',
      },
      {
        tone: 'long' as const,
        if: 'An asymmetric name is actually sourced',
        then: 'That is when the Next-NVDA sleeve gets a ticker. Empty is correct tonight.',
      },
    ],
  },
  tickerTape: [
    `SPX ${spxClose.toLocaleString('en-US')}  +${spxDayPct}%  FRI`,
    `SPX YTD  +${spxYtdPct}%`,
    `NASDAQ  +${nasdaqDayPct}%  FRI`,
    `NVDA  $${nvdaClose.toFixed(2)}  +${nvdaDayPct}%`,
    `AAPL  $${aaplClose.toFixed(2)}  +${aaplDayPct}%`,
    `TSX  ${tsxClose.toLocaleString('en-US')}  +${tsxDayPct}%`,
    `CAD  ${cadOfficial}  BoC`,
    `WTI  $${wtiNov.toFixed(2)}  ${wtiDayPct}%`,
    `PCE + GDP  WEDNESDAY`,
    `VOO CORE / ADD`,
    `SELL NOTHING SATURDAY`,
  ],
};

export const episode: DailyReport = parseDailyReport(raw);
