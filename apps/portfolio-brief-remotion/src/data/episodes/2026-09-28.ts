import {vsSpxSpread} from '../compute';
import {parseDailyReport, type DailyReport} from '../schema';

/** US / CA last cash: Friday 25 Sep 2026 (Yahoo / AP). Asia Monday 28 Sep closed. Europe Monday is session, not a close. */
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
const nikkei = 65877.62;
const nikkeiDayPct = -0.73;
const hangSeng = 24642.51;
const hangSengDayPct = 0.54;
const asx = 8679.7;
const asxDayPct = 0.17;
const shanghai = 3823.62;
const shanghaiDayPct = -1.67;
const kospi = 6889.74;
const kospiDayPct = -2.7;
const ftseSession = 10739.88;
const ftseSessionPct = 0.42;
const daxSession = 25485.84;
const daxSessionPct = 0.3;
const tsxClose = 35800.89;
const tsxPoints = 94.43;
const tsxDayPct = 0.26;
const tsxV = 920.47;
const cadOfficial = 1.4145;
const wtiFri = 92.41;
const wtiFriPct = -2.33;
const wtiMon = 94.11;
const wtiMonPct = 1.84;
const goldFri = 4321.2;
const goldFriPct = 0.54;
const goldMon = 4187.0;
const goldMonPct = -3.11;
const fred10yThu = 5.18;
const nvdaQ2Rev = 96.2;
const nvdaDcRev = 89.0;
const nvdaQ3Guide = 108.0;

const raw = {
  meta: {
    date: '2026-09-28',
    dateLabel: 'SEP 28, 2026',
    title: 'Daily Wealth Intelligence',
    thesis:
      'Monday morning. Asia has closed. U.S. and Canada cash are still Friday. The book is the same seven U.S. growth lines. This is a first-cash read, not a ticket.',
    thesisLead: 'Asia printed. U.S. cash has not.',
    thesisAccent: 'This is a first-cash read, not a ticket.',
    catalyst:
      'NYSE / TSX open at 9:30 ET. Tuesday is JOLTS. Wednesday is BEA PCE and the Q2 GDP third estimate.',
    kicker:
      'Monday 09:07 America/Toronto. Asia Monday is closed. NYSE and TSX have not opened. Last U.S. / CA cash is Friday 25 September.',
    universe: ['AAPL', 'NVDA', 'VOO', 'VTI', 'VUG', 'MGK', 'GDV'],
  },
  market: {
    spxClose,
    spxDayPct,
    spxYtdPct,
    nasdaqDayPct,
    note: 'Last U.S. cash is Friday (AP / Yahoo): S&P 7,743.41 +39.28 / +0.51%. Nasdaq 27,068.72 +129.34 / +0.48%. AP week: S&P +1.2%, Nasdaq +2.1%. AP S&P YTD +13.1%. Official FRED Friday 10-year is still unpublished — last FRED DGS10 is Thursday 5.18.',
    nextCalendar: {
      label: 'Open + Tuesday JOLTS + Wednesday PCE / GDP',
      detail:
        'NYSE / TSX open 9:30 ET. BLS Tuesday 10:00 ET: August JOLTS. BEA Wednesday 8:30 ET: August personal income and outlays, plus Q2 GDP third estimate. BLS Friday Oct 2: September employment situation.',
    },
  },
  markets: {
    global: {
      indices: [
        {
          label: 'Nikkei 225',
          value: nikkei.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: nikkeiDayPct,
          note: 'Monday official close 65,877.62 −486.58 / −0.73% (AP / JRJ / Yahoo). Friday was 66,364.20 +1.30%.',
        },
        {
          label: 'Hang Seng',
          value: hangSeng.toLocaleString('en-US'),
          dayPct: hangSengDayPct,
          note: 'Monday close 24,642.51 +132.42 / +0.54% (HK Standard / JRJ / Yahoo). Hang Seng Tech 4,296 −0.37% (HK Standard).',
        },
        {
          label: 'Shanghai Composite',
          value: shanghai.toLocaleString('en-US'),
          dayPct: shanghaiDayPct,
          note: 'Monday close 3,823.62 −64.75 / −1.67% (AP / JRJ / Yahoo).',
        },
        {
          label: 'S&P/ASX 200',
          value: asx.toLocaleString('en-US'),
          dayPct: asxDayPct,
          note: 'Monday close 8,679.70 +0.2% (AP); Yahoo +0.17%. Not a book ticker.',
        },
        {
          label: 'KOSPI',
          value: kospi.toLocaleString('en-US'),
          dayPct: kospiDayPct,
          note: 'Monday 6,889.74 −2.7% (AP). Not a holding.',
        },
        {
          label: 'FTSE 100',
          value: ftseSession.toLocaleString('en-US'),
          dayPct: ftseSessionPct,
          note: 'Monday Yahoo session 10,739.88 +0.42% at ~09:07 ET. London has not closed. Not a Friday close and not a holding.',
        },
        {
          label: 'DAX 40',
          value: daxSession.toLocaleString('en-US'),
          dayPct: daxSessionPct,
          note: 'Monday Yahoo session 25,485.84 +0.30% at ~09:07 ET. Xetra has not closed. Friday close was 25,408.64 +0.56%.',
        },
      ],
      commodities: [
        {
          label: 'WTI',
          value: `$${wtiMon.toFixed(2)}`,
          dayPct: wtiMonPct,
          note: `Monday Yahoo CL=F ${wtiMon.toFixed(2)} +${wtiMonPct}% from Friday ${wtiFri.toFixed(2)} (${wtiFriPct}%). Futures session — not a U.S. cash print.`,
        },
        {
          label: 'Brent',
          value: '$98.82',
          note: 'Monday Yahoo BZ=F 98.82. Friday print used yesterday was 97.44 — front-month series not mixed into one day %. AP Friday: Brent dropped below $98.',
        },
        {
          label: 'Gold',
          value: `$${goldMon.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
          dayPct: goldMonPct,
          note: `Monday Yahoo GC=F ${goldMon.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} −3.11%. Friday was ${goldFri.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} +${goldFriPct}%. Futures session.`,
        },
      ],
      rates: [
        {
          label: 'U.S. 10-year',
          value: `${fred10yThu.toFixed(2)}%`,
          note: 'Official FRED DGS10 last observation is Thursday 24 Sep at 5.18. Friday 25 Sep is unpublished. Yahoo ^TNX Monday session 5.215 at ~09:07 ET — not FRED.',
        },
      ],
      fx: [
        {
          label: 'USD/CAD',
          value: cadOfficial.toFixed(4),
          note: 'BoC Valet FXUSDCAD daily average 1.4145 on 2026-09-25. Monday Valet unread. Yahoo CAD=X 1.4167 live at 09:07 ET — not the official average.',
        },
      ],
      note: 'Monday GLOBAL: Asia closed. Europe is a live session, not a close. U.S. cash has not printed. TOPIX / Sensex unread — omitted.',
    },
    us: {
      indices: [
        {
          label: 'S&P 500',
          value: spxClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: spxDayPct,
          note: 'Friday cash (AP / Yahoo) 7,743.41 +39.28 / +0.51%. AP week +1.2%. AP year +13.1%. Yahoo YTD +13.12%. Monday cash unread — open is 9:30 ET.',
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
          note: 'Friday Yahoo ^SOX 12,668.93 +1.41%. Monday cash unread.',
        },
        {
          label: 'Energy',
          note: `Friday WTI ${wtiFri.toFixed(2)} ${wtiFriPct}% (Yahoo). Monday futures ${wtiMon.toFixed(2)} +${wtiMonPct}%. Sector index unread — omitted.`,
        },
      ],
      breadth: 'Friday breadth unread. Monday cash has not printed — omitted, not faked.',
      yields: [
        {
          label: 'U.S. 10-year',
          value: `${fred10yThu.toFixed(2)}%`,
          note: 'FRED DGS10 Thursday 5.18. Friday observation unpublished. Yahoo Monday session 5.215 is not the official print. AP Friday: the 10-year briefly jumped near the highest since 2007 before oil pulled back.',
        },
      ],
      note: 'Friday U.S. cash is still the last print. AP: oil cooldown helped the first winning week in three. Reuters: Microsoft and other AI names lifted Friday; high oil and a yield surge sat under the week. Premarket is not cash — omitted from the boards.',
    },
    ca: {
      indices: [
        {
          label: 'S&P/TSX Composite',
          value: tsxClose.toLocaleString('en-US'),
          dayPct: tsxDayPct,
          note: `Friday close 35,800.89 +${tsxPoints} / +${tsxDayPct}% (Baystreet / Morningstar). Week −5.76 points / −0.02%. Monday TSX has not opened.`,
        },
        {
          label: 'TSX Venture',
          value: tsxV.toLocaleString('en-US'),
          note: 'Friday 920.47 +6.56 points (Baystreet). Week −2.6 points / −0.28%.',
        },
      ],
      cadUsd: `BoC 1.4145 CAD per USD (2026-09-25 Valet). Monday Valet unread. Yahoo CAD=X 1.4167 live — not official.`,
      sectors: [
        {
          label: 'Financials',
          note: 'Baystreet: financials +1% Friday. National Bank +1.4% after a buyback plan. Monday unread.',
        },
        {
          label: 'Energy',
          note: 'Baystreet: energy −1% Friday as oil pulled back. Not a book sleeve.',
        },
      ],
      note: 'Friday TSX cash. Monday TSX opens with NYSE. Contribution currency is still C$. Official FX is still Friday BoC 1.4145.',
    },
    calendar: {
      items: [
        {
          when: 'Today 9:30 ET',
          where: 'US' as const,
          label: 'First cash after Friday close',
          why: 'NYSE opens. Friday’s S&P 7,743.41 is the last print until then.',
        },
        {
          when: 'Today 9:30 ET',
          where: 'CA' as const,
          label: 'TSX open',
          why: 'Friday TSX 35,800.89. C$ contribution waits for a live session.',
        },
        {
          when: 'Tuesday 10:00 ET',
          where: 'US' as const,
          label: 'JOLTS (August)',
          why: 'BLS schedule: Job Openings and Labor Turnover Survey for August 2026 on 29 September.',
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
          why: 'BLS September calendar: Employment Situation for September 2026.',
        },
        {
          when: 'Late October',
          where: 'US' as const,
          label: 'Apple Q4 date unannounced',
          why: 'Apple IR / earnings-call page read this sitting does not date Q4 FY2026. Street calendars guess Oct 29. Last confirmed call is July 30.',
        },
        {
          when: 'Nov 17 (Aug 26 call)',
          where: 'US' as const,
          label: 'Nvidia Q3 (named on Aug 26 call)',
          why: 'Aug 26 IR transcript: Q3 FY27 call scheduled for November 17. IR events page blocked this sitting. No dated invite press release re-read.',
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
      rating: 'HOLD — last IR is Aug 26',
      tone: 'watch' as const,
      role: 'AI compute line',
      whatMatters: 'Friday $225.07 +0.22%. Aug 26 call named Nov 17. Monday cash unread.',
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
      'A Monday Asia fade does not change the book. When mega-cap growth is hit, several lines move together. Weights are still unknown, so the stack stays qualitative.',
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
      holdNote: 'Friday cash $225.07 +0.22% (Yahoo). No pre-open add. Premarket is not cash.',
      streak: [2.54, 1.34, 2.3, 0.66, -1.47, -0.41, 0.22],
      streakHeadline: 'Seven sessions. Two red days, then a quiet Friday. Monday unread.',
      streakNote: 'Yahoo daily closes Sep 17–25. Monday cash has not printed.',
      fundamentals: [
        {label: 'Q2 FY27 revenue', value: `$${nvdaQ2Rev.toFixed(1)}B  +106% y/y`},
        {label: 'Q2 data center', value: `$${nvdaDcRev.toFixed(1)}B  +117% y/y`},
        {label: 'Q2 GAAP EPS', value: '$2.46'},
        {label: 'Q2 GAAP / non-GAAP GM', value: '75.0% / 75.0%'},
        {label: 'Q3 revenue guide', value: `$${nvdaQ3Guide.toFixed(1)}B ±2%`},
      ],
      vsSpx: {
        headline: 'Beating the S&P YTD. Friday was a quiet +0.22%. Monday cash unread.',
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
        note: 'NVIDIA IR Aug 26. Q2 revenue $96.2B, +18% q/q, +106% y/y. Gross margin 75.0%. Outlook assumes no China data-center compute. Aug 26 call named Nov 17; IR events page blocked this sitting.',
        range: {metric: 'Q3 revenue guide', unit: 'B', guide: nvdaQ3Guide, low: 105.84, high: 110.16},
      },
      narrative: {
        leftTitle: 'THE RATE',
        leftHeadline: 'Official 10-year is still Thursday’s 5.18%.',
        leftBody:
          'FRED DGS10 Friday is unpublished. Yahoo Monday session 5.215 is not FRED. AP Friday: the 10-year briefly jumped near the highest since 2007. That is the rate that compresses this growth book.',
        rightTitle: 'THE PRINT',
        rightHeadline: 'August 26 IR is still the last official number.',
        rightBody: `Revenue $${nvdaQ2Rev.toFixed(1)}B. Data center $${nvdaDcRev.toFixed(1)}B. Q3 guide $${nvdaQ3Guide.toFixed(1)}B ±2%, margin 74% ±50 bp. Friday’s +0.22% is not a new filing. Monday cash has not printed.`,
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
            text: 'A 5.18% official 10-year and a mega-cap stack can both be true. Asia’s Monday fade is not a U.S. ticket.',
          },
        ],
        note: 'Customer-financing size from the August brief was not re-read this sitting. Omitted, not repeated.',
      },
      actionMatrix: {
        headline: 'Morning: HOLD. No pre-open ticket.',
        rows: [
          {
            tone: 'watch' as const,
            if: 'Monday cash opens near Friday’s $225',
            then: 'HOLD. Wait for a live print before treating the open as the story.',
          },
          {
            tone: 'long' as const,
            if: 'Wednesday PCE cools and the 10-year backs off',
            then: 'Still HOLD the line. Do not chase a one-day SOX bounce.',
          },
          {
            tone: 'caution' as const,
            if: 'Yields push back through last week’s highs',
            then: 'Do not automatically buy the dip in the same growth stack.',
          },
          {
            tone: 'short' as const,
            if: 'A new IR print weakens guide or margin',
            then: 'That is a later sitting. Nothing this morning changes the last filing.',
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
          {id: 'asia', label: 'Nikkei Mon −0.73%', polarity: 'concern' as const, x: 0.82, y: 0.22},
          {id: 'rates', label: 'FRED 10y 5.18 Thu', polarity: 'concern' as const, x: 0.82, y: 0.78},
          {id: 'next', label: 'Mon cash unread', polarity: 'inference' as const, x: 0.94, y: 0.5},
        ],
        edges: [
          {from: 'dc', to: 'rev'},
          {from: 'rev', to: 'guide'},
          {from: 'guide', to: 'nvda'},
          {from: 'margin', to: 'nvda', label: 'guide down'},
          {from: 'asia', to: 'nvda', label: 'overnight'},
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
      holdNote: 'Friday cash $341.07 +5.15 / +1.53% (Yahoo). You already own it. Do not double it before the open.',
      streak: [1.38, -0.26, 0.85, 0.23, -0.8, -0.33, 1.53],
      streakHeadline: 'Seven sessions. Friday was the clean bounce. Monday unread.',
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
          'Last confirmed call: July 30 (Apple newsroom)',
          'Street calendars guess Oct 29 — not an IR date',
        ],
        note: 'Do not treat Oct 29 as official until Apple’s newsroom dates it.',
      },
      action: {
        headline: 'HOLD the position.',
        body: 'Do not add before the open. The next contribution should diversify, not double the same name.',
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
      id: 'fred-10y-fri',
      area: 'US' as const,
      question: 'What did official FRED DGS10 print on Friday 25 Sep?',
      whyItMatters: 'Last official observation is Thursday 5.18. The 10-year is the rate that sits under this growth book.',
      neededToKnow: 'FRED DGS10 observation for 2026-09-25.',
      status: 'unknown' as const,
    },
    {
      id: 'us-mon-cash',
      area: 'US' as const,
      question: 'Where did NYSE cash print after 9:30 ET?',
      whyItMatters: 'This sitting is 09:07 ET. Premarket is not cash. Friday 7,743.41 is still the last official S&P.',
      neededToKnow: 'A sourced regular-session print after the open.',
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
    existingPortfolio: 'HOLD — sell nothing before the open.',
    freshCapital: 'No pre-open ticket. When a session exists, new core money still simplifies into VOO.',
    bestAdd: 'VOO',
    highestUpsideWatch: 'none named',
    biggestRisk:
      'Mega-cap growth overlap across NVDA, AAPL, MGK, VUG, VOO, VTI — plus a 5.18% official 10-year (Thursday FRED) with Friday unpublished.',
    nextTrigger: 'Monday 9:30 ET cash, then Tuesday JOLTS, then Wednesday PCE / Q2 GDP third estimate',
    ifThen: [
      {
        tone: 'watch' as const,
        if: 'Monday opens near Friday’s closes',
        then: 'HOLD the book. Do not add on the first print.',
      },
      {
        tone: 'long' as const,
        if: 'Wednesday PCE cools and yields ease',
        then: 'Still HOLD. Fresh core money, if any, goes to VOO — not another growth clone.',
      },
      {
        tone: 'caution' as const,
        if: 'Yields push back through last week’s highs',
        then: 'Do not automatically buy the dip in NVDA / VUG / MGK.',
      },
      {
        tone: 'short' as const,
        if: 'A new IR print weakens NVDA guide or margin',
        then: 'Re-read the book then. This morning has no new filing.',
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
      body: 'Official FRED 10-year is Thursday 5.18. Friday unpublished. AP Friday: the 10-year briefly jumped near a 19-year high. High long rates compress long-duration growth — the exact overweight.',
    },
    {
      n: '03',
      title: 'AI ROI / margin guide',
      body: 'NVIDIA IR still shows huge demand ($96.2B / $89.0B DC) and a Q3 margin guide of 74% ±50 bp, down from 75.0%. That sits under NVDA and most of the indirect book.',
    },
  ],
  close: {
    kicker: 'FIRST CASH',
    headline: 'Monday morning does not create a ticket.',
    body: 'Asia closed mixed-to-soft. U.S. and Canada cash are still Friday. The book is still the same seven lines. Watch the 9:30 open, then Tuesday JOLTS, then Wednesday PCE. Publish and trades stay Evens.',
    pills: [
      {tone: 'watch' as const, label: 'HOLD INTO OPEN'},
      {tone: 'caution' as const, label: 'NO PRE-OPEN BUY'},
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
        if: 'Yields gap higher into the open',
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
    `SPX ${spxClose.toLocaleString('en-US')}  +${spxDayPct}% FRI`,
    `SPX YTD  +${spxYtdPct}%`,
    `NASDAQ  +${nasdaqDayPct}% FRI`,
    `NVDA  $${nvdaClose.toFixed(2)}  +${nvdaDayPct}% FRI`,
    `AAPL  $${aaplClose.toFixed(2)}  +${aaplDayPct}% FRI`,
    `NIKKEI  ${nikkei.toLocaleString('en-US')}  ${nikkeiDayPct}% MON`,
    `HSI  ${hangSeng.toLocaleString('en-US')}  +${hangSengDayPct}% MON`,
    `TSX  ${tsxClose.toLocaleString('en-US')}  +${tsxDayPct}% FRI`,
    `CAD  ${cadOfficial} (BoC Fri)`,
    `WTI  $${wtiMon.toFixed(2)}  +${wtiMonPct}% MON FUT`,
    `FRED 10Y  ${fred10yThu}% THU`,
    `PCE  WEDNESDAY`,
    `HOLD INTO OPEN`,
    `SELL NOTHING`,
  ],
};

export const episode: DailyReport = parseDailyReport(raw);
