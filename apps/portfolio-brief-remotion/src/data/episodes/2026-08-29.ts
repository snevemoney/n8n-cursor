import {vsSpxSpread} from '../compute';
import {parseDailyReport, type DailyReport} from '../schema';

/** Yahoo quote / world-indices / holdings + NVIDIA IR + Fed Warsh remarks. Fetched ~09:05 America/Toronto 2026-08-29 (Saturday). Cash = Fri 28 close. No Saturday session. */
const nvdaClose = 217.55;
const nvdaDayPct = -4.57;
const nvdaYtd = 16.79;
const nvdaSpxYtd = 12.65;
const nvdaBeta = 2.21;
const aaplClose = 319.7;
const aaplDayPct = 1.63;
const aaplYtd = 17.92;
const aaplSpxYtd = 12.65;
const aaplOneYear = 37.98;
const aaplSixMonth = 21.02;
const aaplOneMonth = -5.99;
const spxClose = 7711.76;
const spxDayPct = -0.25;
const spxYtdPct = 12.65;
const nasdaqClose = 26402.42;
const nasdaqDayPct = -0.52;
const dowClose = 53560.0;
const dowDayPct = -0.02;
const tenYear = 4.72;
const vooClose = 707.24;
const vooDayPct = -0.21;
const vooYtd = 13.71;
const vtiClose = 379.36;
const vtiDayPct = -0.33;
const vtiYtd = 14.22;
const vugClose = 88.54;
const vugDayPct = -0.4;
const vugYtd = 9.58;
const mgkClose = 90.12;
const mgkDayPct = -0.4;
const mgkYtd = 9.81;
const gdvClose = 30.3;
const gdvDayPct = -0.1;
const gdvYtd = 13.72;
const gdvYield = 5.93;
const tsxClose = 36553.92;
const tsxDayPct = -0.76;
const tsxVenture = 989.16;
const tsxVentureDayPct = -1.49;
const cadUsd = 0.7194;

const raw = {
  meta: {
    date: '2026-08-29',
    dateLabel: 'AUG 29, 2026',
    title: 'Daily Wealth Intelligence',
    thesis:
      'Markets are closed. Friday cash faded Nvidia after Warsh said inflation is still above 2%. The book is the same concentrated U.S. mega-cap stack. HOLD. Next session is Monday.',
    thesisLead: 'Friday faded the Nvidia gap.',
    thesisAccent: 'The book is still the same concentrated stack.',
    catalyst: 'Weekend. Last cash is Friday after Warsh. Monday is the next U.S. and TSX session.',
    kicker: 'Saturday · markets closed',
    universe: ['AAPL', 'NVDA', 'VOO', 'VTI', 'VUG', 'MGK', 'GDV'],
  },
  market: {
    spxClose,
    spxDayPct,
    spxYtdPct,
    nasdaqDayPct,
    tenYearYield: tenYear,
    note: 'Friday cash after Warsh: S&P −0.25%, Nasdaq −0.52%, NVDA −4.57%. 10-year 4.72% (Yahoo ^TNX). Saturday session does not exist — do not invent a live path.',
    nextCalendar: {
      label: 'Monday open · Sept 15–16 FOMC',
      detail: 'Next cash session is Monday Aug 31. Reuters: Warsh raised Sept hike talk; next FOMC is Sept 15–16. Next PCE is Sept 30 (BEA).',
    },
  },
  markets: {
    global: {
      indices: [
        {label: 'Nikkei 225', value: '66,405.56', dayPct: 0.41, note: 'Yahoo world indices · Friday Asia'},
        {label: 'Hang Seng', value: '25,584.79', dayPct: 0.07, note: 'Yahoo world indices · Friday Asia'},
        {label: 'Shanghai Composite', value: '3,952.18', dayPct: -0.11, note: 'Yahoo world indices · Friday Asia'},
        {label: 'KOSPI', value: '6,788.88', dayPct: -1.79, note: 'Yahoo world indices · Friday Asia'},
        {label: 'TSEC / TWII', value: '46,331.45', dayPct: 0.77, note: 'Yahoo world indices · Friday Asia'},
        {label: 'S&P/ASX 200', value: '9,092.30', dayPct: 0.6, note: 'Yahoo world indices · Friday Asia'},
        {label: 'FTSE 100', value: '10,824.26', dayPct: 0.29, note: 'Yahoo world indices · Friday Europe close'},
        {label: 'DAX', value: '26,569.99', dayPct: 0.77, note: 'Yahoo world indices · Friday Europe close'},
        {label: 'CAC 40', value: '8,401.18', dayPct: 0.98, note: 'Yahoo world indices · Friday Europe close'},
        {label: 'EURO STOXX 50', value: '6,485.67', dayPct: 0.95, note: 'Yahoo world indices · Friday Europe close'},
      ],
      fx: [
        {label: 'CAD-USD', value: cadUsd.toFixed(4), note: 'Yahoo CADUSD=X · Saturday ~05:21 GMT+1. Friday previous close 0.7221.'},
        {label: 'US Dollar Index', value: '99.68', dayPct: -0.03, note: 'Yahoo DX-Y.NYB'},
      ],
      note: 'Asia and Europe last prints are Friday. Oil not read this sitting — omitted.',
    },
    us: {
      indices: [
        {
          label: 'S&P 500',
          value: spxClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: spxDayPct,
          note: 'Friday cash · Yahoo ^GSPC. Previous 7,730.99.',
        },
        {
          label: 'Nasdaq Composite',
          value: nasdaqClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: nasdaqDayPct,
          note: 'Friday cash · Yahoo ^IXIC. Previous 26,541.35.',
        },
        {
          label: 'Dow Jones',
          value: dowClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: dowDayPct,
          note: 'Friday cash · Yahoo ^DJI',
        },
        {
          label: 'Russell 2000',
          value: '2,972.37',
          dayPct: -1.39,
          note: 'Friday cash · Yahoo ^RUT',
        },
      ],
      yields: [
        {label: 'U.S. 10-year', value: `${tenYear}%`, note: 'Yahoo ^TNX Friday close 4.7200 (+0.048 / +1.03%). Previous 4.6720.'},
        {label: 'U.S. 30-year', value: '5.21%', note: 'Yahoo ^TYX +0.29%'},
        {label: 'CBOE VIX', value: '14.43', dayPct: -0.55, note: 'Yahoo ^VIX · Friday'},
      ],
      note: 'Warsh (Jackson Hole, Aug 28): 12-month PCE 3.7%; six-month 4.1%; “otherwise we have work to do.” Reuters: hike odds for Sept rose after the speech. July PCE (BEA, Aug 26) still +0.2% m/m headline and core. No Saturday U.S. cash.',
    },
    ca: {
      indices: [
        {
          label: 'S&P/TSX Composite',
          value: tsxClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: tsxDayPct,
          note: 'Friday cash · Yahoo ^GSPTSE. Previous 36,834.30.',
        },
        {
          label: 'TSX Venture',
          value: tsxVenture.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: tsxVentureDayPct,
          note: 'Yahoo ^SPCDNX · Friday',
        },
      ],
      cadUsd: 'C$1 → US$0.7194 (Sat morning Yahoo). Friday previous close 0.7221. USD/CAD 1.3901.',
      note: 'TSX −0.76% Friday while NVDA gave back the Thursday gap. Contribution is in C$. TSX YTD not re-read this sitting — omitted. Next TSX session Monday.',
    },
    calendar: {
      items: [
        {
          when: 'Monday Aug 31',
          where: 'US' as const,
          label: 'Next U.S. cash session',
          why: 'Saturday and Sunday are closed. First print after Warsh + the NVDA fade is Monday.',
        },
        {
          when: 'Monday Aug 31',
          where: 'CA' as const,
          label: 'Next TSX session',
          why: 'Toronto cash is also closed this weekend. C$ contribution waits for Monday.',
        },
        {
          when: 'Sept 15–16',
          where: 'US' as const,
          label: 'FOMC',
          why: 'Reuters after Warsh: markets raised the chance of a hike at this meeting. Not a decision today.',
        },
        {
          when: 'Sept 30 08:30 ET',
          where: 'US' as const,
          label: 'August PCE + BEA annual update',
          why: 'BEA: next Personal Income and Outlays. Annual NIPA update lands the same morning.',
        },
        {
          when: 'Oct 29',
          where: 'US' as const,
          label: 'Apple earnings',
          why: 'Yahoo AAPL quote: next earnings date Oct 29, 2026.',
        },
        {
          when: 'Nov 17',
          where: 'US' as const,
          label: 'Nvidia earnings',
          why: 'Yahoo NVDA quote: next earnings date Nov 17, 2026.',
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
      rating: 'HOLD — gap faded Friday',
      tone: 'watch' as const,
      role: 'Post-print, post-fade',
      whatMatters: 'Friday cash −4.57% to $217.55 after Thursday +8.74%. Guide is still $108B ±2%. Do not chase or panic-sell the weekend.',
      ytd: nvdaYtd,
    },
    {
      ticker: 'AAPL',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Recent purchase',
      whatMatters: 'Friday cash +1.63%. Still beating S&P YTD. Do not add because NVDA faded.',
      ytd: aaplYtd,
    },
    {
      ticker: 'VOO',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      role: 'Best simple core',
      whatMatters: 'New core money still simplifies here. Yahoo look-through: NVDA 7.55% + AAPL 7.04% of VOO.',
      ytd: vooYtd,
    },
    {
      ticker: 'VTI',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Broad US',
      whatMatters: 'Excellent fund. Still overlaps VOO. Yahoo look-through: NVDA 6.40% + AAPL 6.29%.',
      ytd: vtiYtd,
      overlapWith: ['VOO'],
    },
    {
      ticker: 'VUG',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Growth sleeve',
      whatMatters: 'YTD DTR still lags the S&P. Yahoo look-through: NVDA 12.81% + AAPL 12.59%.',
      ytd: vugYtd,
      overlapWith: ['NVDA', 'AAPL', 'VOO', 'MGK'],
    },
    {
      ticker: 'MGK',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Mega-cap growth',
      whatMatters: 'Even more overlap. Holdings page not re-read this sitting. YTD DTR still behind the S&P.',
      ytd: mgkYtd,
      overlapWith: ['NVDA', 'AAPL', 'VUG', 'VOO'],
    },
    {
      ticker: 'GDV',
      rating: 'HOLD — income / diversifier',
      tone: 'long' as const,
      role: 'Income sleeve',
      whatMatters: `Different job. Yahoo market $${gdvClose.toFixed(2)} (${gdvDayPct}%). Forward yield ${gdvYield}%. NAV / discount not read today.`,
      ytd: gdvYtd,
    },
  ],
  portfolio: {
    concentrationThesis: 'VOO + VTI + VUG + MGK + AAPL + NVDA still buy the same companies.',
    concentrationBody:
      'Friday’s NVDA fade is the other side of Thursday’s gap. Several Wealthsimple lines still move together. Weights are still unread, so this stays a line-count.',
    factorStack: ['NVDA', 'AAPL', 'MGK', 'VUG', 'VOO', 'VTI'],
    factorLabel: 'U.S. mega-cap / growth',
    overlapNote: 'same ecosystem',
  },
  names: [
    {
      ticker: 'NVDA',
      chapterTitle: 'NVDA · Thursday gap, Friday fade',
      rating: 'HOLD — WATCH',
      tone: 'watch' as const,
      price: nvdaClose,
      dayPct: nvdaDayPct,
      holdNote: `Friday cash $${nvdaClose.toFixed(2)} (${nvdaDayPct}%). Thursday was $227.98 (+8.74%). After-hours Fri $217.89. No Saturday cash.`,
      streak: [-0.33, -0.98, -2.91, 2.19, -1.59, 8.74, -4.57],
      streakHeadline: 'Five red of seven. Thursday’s +8.74% did not hold Friday.',
      streakNote:
        'Yahoo daily closes Aug 20–28. Red-day count is the formula. Not a 0–100 score. Do not reuse the Aug 25 pre-earnings options band.',
      fundamentals: [
        {label: 'Market cap', value: '$5.25T'},
        {label: 'Q2 FY27 revenue', value: '$96.2B  +106% y/y'},
        {label: 'Q2 data center', value: '$89.0B  +117% y/y'},
        {label: 'Q2 GAAP / non-GAAP EPS', value: '$2.46  /  $2.22'},
        {label: 'Q3 revenue guide', value: '$108.0B ±2%'},
        {label: 'Q3 GM guide', value: '74.0% ±50 bps'},
        {label: 'TTM EPS / P/E', value: '$7.55  /  28.81×'},
        {label: 'Beta', value: String(nvdaBeta)},
      ],
      vsSpx: {
        headline: 'Still ahead of the S&P YTD after Friday’s fade. That is not a buy signal.',
        bars: [
          {label: 'NVDA YTD', pct: nvdaYtd, tone: 'nvda' as const},
          {label: 'S&P YTD', pct: nvdaSpxYtd, tone: 'muted' as const},
        ],
        note: `Spread: ${vsSpxSpread(nvdaYtd, nvdaSpxYtd) >= 0 ? '+' : ''}${vsSpxSpread(nvdaYtd, nvdaSpxYtd).toFixed(2)} points (NVDA YTD − S&P YTD). Yahoo trailing as of Aug 28. Beta: ${nvdaBeta}.`,
      },
      consensus: {
        rows: [
          {label: 'Q2 FY27 revenue (IR)', value: '$96.2B'},
          {label: 'Q3 revenue guide (IR)', value: '$108.0B ±2%'},
          {label: 'Q3 GM guide (IR)', value: '74.0% ±50 bps'},
          {label: 'China DC compute in guide', value: 'None assumed'},
        ],
        note: 'NVIDIA IR Aug 26. Whisper not sourced. Do not invent a street number on top of the guide.',
        range: {metric: 'Q3 revenue guide', unit: 'B', guide: 108.0, low: 105.84, high: 110.16},
      },
      narrative: {
        leftTitle: 'THE FEAR',
        leftHeadline: 'Warsh + a higher 10-year can hit long-duration growth.',
        leftBody:
          'Friday 10-year 4.72%. Warsh: inflation still above 2%; credit markets show few signs of restraint. Third-party financing still “over $500B… subject to definitive agreements.” China DC compute is zero in the Q3 guide.',
        rightTitle: 'THE COUNTER',
        rightHeadline: 'The print and the $108B guide did not change overnight.',
        rightBody:
          'Q2 revenue $96.2B, data center $89.0B, Vera Rubin in full production. Friday’s −4.57% is digestion of Thursday’s +8.74% plus a hawkish speech — not a new IR letter.',
      },
      interpretation: {
        chips: [
          {label: 'CONFIRMED', tone: 'long' as const, text: 'IR guide is still $108.0B ±2% with no China DC compute.'},
          {
            label: 'CONFIRMED',
            tone: 'watch' as const,
            text: 'Friday cash faded Thursday’s gap after Warsh.',
          },
          {
            label: 'INFERENCE',
            tone: 'caution' as const,
            text: 'A higher 10-year plus Sept FOMC talk is the near-term tape, not a new demand print.',
          },
        ],
        note: 'HOLD. Do not buy the fade on a closed weekend. Do not sell the fade on a closed weekend.',
      },
      actionMatrix: {
        headline: 'Weekend: HOLD. Monday: still not an automatic add.',
        rows: [
          {
            tone: 'long' as const,
            if: 'Monday cash holds the $108B guide and the 10-year calms',
            then: 'Still HOLD. Size only after weights exist.',
          },
          {
            tone: 'watch' as const,
            if: 'Monday opens around Friday’s $217–218 and chops',
            then: 'HOLD. That is digestion, not a new thesis.',
          },
          {
            tone: 'caution' as const,
            if: '10-year / FOMC headlines push the fade further',
            then: 'Do not automatically buy the dip. Re-read the guide.',
          },
          {
            tone: 'short' as const,
            if: 'Demand language or the $108B guide is walked back',
            then: 'Consider reducing. That is not this weekend’s tape.',
          },
        ],
      },
      network: {
        title: 'NVDA · what the IR said, what Friday cash did',
        headline: 'Polarity from the Aug 26 IR note plus Friday Yahoo cash — no composite score.',
        nodes: [
          {id: 'labs', label: 'Frontier labs / open models', polarity: 'confirmed' as const, x: 0.08, y: 0.22},
          {id: 'demand', label: 'GPU demand', polarity: 'confirmed' as const, x: 0.3, y: 0.22},
          {id: 'rubin', label: 'Vera Rubin production', polarity: 'confirmed' as const, x: 0.5, y: 0.22, evidence: 'Full production'},
          {id: 'financing', label: 'Third-party capital', polarity: 'concern' as const, x: 0.3, y: 0.78, evidence: '$500B subject to agreements'},
          {id: 'nvda', label: 'NVDA', polarity: 'neutral' as const, x: 0.62, y: 0.5},
          {id: 'warsh', label: 'Warsh / 10-year', polarity: 'concern' as const, x: 0.5, y: 0.78, evidence: 'PCE 3.7% · 10y 4.72%'},
          {id: 'margins', label: 'Q3 margin guide', polarity: 'concern' as const, x: 0.82, y: 0.5, evidence: '74.0% ±50 bps'},
          {id: 'guide', label: 'Q3 revenue guide', polarity: 'confirmed' as const, x: 0.82, y: 0.18, evidence: '$108B ±2%'},
          {id: 'valuation', label: 'Friday cash', polarity: 'inference' as const, x: 0.94, y: 0.5, evidence: '−4.57% Yahoo'},
        ],
        edges: [
          {from: 'labs', to: 'demand'},
          {from: 'demand', to: 'nvda'},
          {from: 'rubin', to: 'nvda'},
          {from: 'financing', to: 'nvda', label: 'exposure'},
          {from: 'warsh', to: 'valuation', label: 'duration'},
          {from: 'nvda', to: 'guide'},
          {from: 'nvda', to: 'margins'},
          {from: 'guide', to: 'valuation'},
          {from: 'margins', to: 'valuation'},
        ],
      },
    },
    {
      ticker: 'AAPL',
      chapterTitle: 'AAPL · Friday bid, still a hold',
      rating: 'HOLD',
      tone: 'long' as const,
      price: aaplClose,
      dayPct: aaplDayPct,
      holdNote: `Friday cash $${aaplClose.toFixed(2)} (+${aaplDayPct}%). After-hours $319.90. You already own it.`,
      returns: {
        headline: 'Still beating the S&P YTD. One-year still strong. One-month still red.',
        bars: [
          {label: 'YTD', pct: aaplYtd, tone: 'long' as const},
          {label: 'S&P YTD', pct: aaplSpxYtd, tone: 'muted' as const},
          {label: '1 year', pct: aaplOneYear, tone: 'gold' as const},
          {label: '6 months', pct: aaplSixMonth, tone: 'aapl' as const},
          {label: '1 month', pct: aaplOneMonth, tone: 'short' as const},
        ],
        panelTitle: '52-WEEK RANGE (YAHOO)',
        panelBody: '52-week high $344.57. Friday cash $319.70.',
        note: `Spread vs S&P YTD: ${vsSpxSpread(aaplYtd, aaplSpxYtd) >= 0 ? '+' : ''}${vsSpxSpread(aaplYtd, aaplSpxYtd).toFixed(2)} points. YTD and 1-year: Yahoo trailing as of Aug 28. 6-month vs Yahoo chart previous close $264.18. 1-month vs Jul 28 close $340.08.`,
      },
      catalyst: {
        headline: 'Next sourced date is Oct 29 earnings. A September hardware event was not read from Apple IR.',
        steps: [
          'You already own the shares',
          'NVDA’s Friday fade is not an AAPL add signal',
          'Next contribution should diversify',
        ],
        note: 'No new Apple IR 8-K read this sitting. Do not invent a Mac / foldable revenue number.',
      },
      action: {
        headline: 'HOLD the position.',
        body: 'Do not add AAPL because NVDA faded Friday. You just bought it. New core money still goes to VOO.',
      },
    },
    {
      ticker: 'VOO',
      chapterTitle: 'VOO · still the simple core',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      metrics: [
        {label: 'Fri cash', value: `$${vooClose.toFixed(2)} ${vooDayPct}%`},
        {label: 'YTD DTR (Aug 27)', value: `+${vooYtd}%`},
        {label: 'Look-through', value: 'NVDA 7.55% · AAPL 7.04%'},
      ],
      copy: {
        headline: 'Best simple core. New core money simplifies here.',
        body: 'Yahoo holdings: NVDA 7.55%, AAPL 7.04%. You already own both names directly. That is overlap, not a sell. Do not split the next contribution with VTI.',
      },
    },
    {
      ticker: 'VTI',
      chapterTitle: 'VTI · excellent, overlapping',
      rating: 'HOLD',
      tone: 'long' as const,
      metrics: [
        {label: 'Fri cash', value: `$${vtiClose.toFixed(2)} ${vtiDayPct}%`},
        {label: 'YTD DTR (Aug 27)', value: `+${vtiYtd}%`},
        {label: 'Look-through', value: 'NVDA 6.40% · AAPL 6.29%'},
      ],
      copy: {
        headline: 'Excellent. The top still looks like VOO.',
        body: 'Yahoo holdings: NVDA 6.40%, AAPL 6.29%. Do not sell. Stop feeding a second core.',
      },
    },
    {
      ticker: 'VUG',
      chapterTitle: 'VUG · growth sleeve still lagging the index',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      returns: {
        headline: 'The growth label is not beating the S&P this year. You already own the two biggest names.',
        bars: [
          {label: 'VUG YTD', pct: vugYtd, tone: 'watch' as const},
          {label: 'S&P YTD', pct: spxYtdPct, tone: 'long' as const},
        ],
        note: `Yahoo YTD daily total return as of Aug 27. Friday cash $${vugClose.toFixed(2)} (${vugDayPct}%). Look-through: NVDA 12.81% + AAPL 12.59%.`,
      },
    },
    {
      ticker: 'MGK',
      chapterTitle: 'MGK · same issue, even more concentrated',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      metrics: [
        {label: 'Fri cash', value: `$${mgkClose.toFixed(2)} ${mgkDayPct}%`},
        {label: 'YTD DTR (Aug 27)', value: `+${mgkYtd}%`},
      ],
      copy: {
        body: 'Yahoo daily total return +9.81% as of Aug 27 — still behind the S&P. Holdings page not re-read, so look-through weights are omitted. You already own NVDA and AAPL directly. HOLD. Stop feeding it.',
      },
    },
    {
      ticker: 'GDV',
      chapterTitle: 'GDV · a completely different job',
      rating: 'HOLD · INCOME / DIVERSIFIER',
      tone: 'long' as const,
      metrics: [
        {label: 'Fri market', value: `$${gdvClose.toFixed(2)}`},
        {label: 'Day', value: `${gdvDayPct}%`},
        {label: 'Trailing YTD', value: `+${gdvYtd}%`},
        {label: 'Fwd yield', value: `~${gdvYield}%`},
      ],
      copy: {
        body: `Closed-end income/value. Yahoo market $${gdvClose.toFixed(2)}. Forward dividend & yield $1.80 (${gdvYield}%). Trailing YTD +13.72% as of Aug 28 includes distributions. NAV / discount not read. Not a growth engine. Not “Next NVDA.”`,
      },
    },
  ],
  nextNvda: [],
  unknowns: [
    {
      id: 'weights',
      area: 'book' as const,
      question: 'What is each line’s weight in the book?',
      whyItMatters: 'Concentration stays a line-count until weights exist. We cannot size how much Friday’s NVDA fade moved the book.',
      neededToKnow: 'Sourced account weights. Do not estimate from prices.',
      status: 'unknown' as const,
    },
    {
      id: 'gdv-nav',
      area: 'name' as const,
      ticker: 'GDV',
      question: 'What is GDV’s current NAV and discount?',
      whyItMatters: 'Market $30.30 is not NAV. The income sleeve’s cheapness is unread.',
      neededToKnow: 'A CEF connect / Gabelli NAV print from this week.',
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
      id: 'whisper-options',
      area: 'name' as const,
      ticker: 'NVDA',
      question: 'What is the whisper and the current implied-move band?',
      whyItMatters: 'Expectation-risk and the options scene stay UNKNOWN. Friday’s −4.57% is a cash print, not an implied band.',
      neededToKnow: 'A sourced whisper and a live options straddle. Do not reuse the Aug 25 ±5.4% band.',
      status: 'unknown' as const,
    },
    {
      id: 'mon-open',
      area: 'US' as const,
      question: 'Where does Monday U.S. cash actually open after the weekend digest of Warsh?',
      whyItMatters: 'This brief used Friday closes. Saturday has no session. A weekend path would be a lie.',
      neededToKnow: 'Yahoo / index opens after Monday Aug 31 cash. Do not invent a Sunday print.',
      status: 'unknown' as const,
    },
  ],
  scenarios: [],
  capitalPlan: {
    existingPortfolio: 'HOLD — sell nothing this weekend.',
    freshCapital: 'Do not chase Thursday’s gap or Friday’s fade. New core money simplifies into VOO.',
    bestAdd: 'VOO',
    highestUpsideWatch: 'none named',
    biggestRisk: 'Mega-cap growth overlap across NVDA, AAPL, MGK, VUG, VOO, VTI — now after a two-day NVDA swing and a higher 10-year',
    nextTrigger: 'Monday open · then Sept 15–16 FOMC',
    ifThen: [
      {
        tone: 'long' as const,
        if: 'Monday cash stays calm and the book still needs NVDA exposure',
        then: 'Still not an automatic add. Size only after weights exist.',
      },
      {
        tone: 'watch' as const,
        if: 'Monday opens near Friday’s $217 and chops',
        then: 'HOLD. That is digestion of the gap + Warsh, not a new thesis.',
      },
      {
        tone: 'caution' as const,
        if: '10-year / Sept FOMC headlines turn the fade into another red day',
        then: 'Do not automatically buy the dip. Re-read the $108B guide.',
      },
      {
        tone: 'short' as const,
        if: 'Demand language or the $108B guide is walked back',
        then: 'Consider reducing. That is not this weekend’s tape.',
      },
    ],
  },
  risks: [
    {
      n: '01',
      title: 'Growth-factor concentration',
      body: 'NVDA + AAPL + MGK + VUG + VOO + VTI repeatedly own the same mega-cap ecosystem. Thursday’s gap and Friday’s fade moved several lines at once.',
    },
    {
      n: '02',
      title: 'Interest rates + Warsh',
      body: `Friday 10-year 4.72%. Warsh: 12-month PCE 3.7%, six-month 4.1%, “otherwise we have work to do.” High long rates compress the exact overweight.`,
    },
    {
      n: '03',
      title: 'AI ROI + financing',
      body: 'IR still flags over $500B of third-party capital subject to agreements, and zero China DC compute in the Q3 guide. That sits under NVDA and most of the indirect book.',
    },
  ],
  close: {
    kicker: 'WEEKEND',
    headline: 'Friday already priced Warsh. Saturday cannot add a print.',
    body: 'HOLD. Next cash is Monday. After that: Sept 15–16 FOMC, then Sept 30 PCE. Do not invent a weekend trade. Publish / YouTube / orders stay Evens.',
    pills: [
      {tone: 'watch' as const, label: 'HOLD THIS WEEKEND'},
      {tone: 'caution' as const, label: 'NO CHASE / NO PANIC'},
      {tone: 'long' as const, label: 'MONDAY IS NEXT CASH'},
    ],
    followThrough: [
      {
        tone: 'watch' as const,
        if: 'Monday confirms demand but the stock is unattractive',
        then: 'Look downstream / upstream for better risk-reward — only if a name is sourced.',
      },
      {
        tone: 'caution' as const,
        if: 'AI demand looks weaker or the guide is walked back',
        then: 'More VOO / cash / non-AI quality.',
      },
      {
        tone: 'long' as const,
        if: 'An asymmetric candidate is named',
        then: 'That is when the Next-NVDA sleeve gets capital.',
      },
    ],
  },
  tickerTape: [
    `SPX ${spxClose.toLocaleString('en-US')}  ${spxDayPct}%`,
    `SPX YTD  +${spxYtdPct}%`,
    `NASDAQ  ${nasdaqDayPct}%`,
    `NVDA  $${nvdaClose.toFixed(2)}  ${nvdaDayPct}%`,
    `AAPL  $${aaplClose.toFixed(2)}  +${aaplDayPct}%`,
    `10Y  ${tenYear}%`,
    `TSX  ${tsxDayPct}%`,
    `WARSH  PCE 3.7%`,
    `NEXT CASH  MONDAY`,
    `VOO CORE / ADD`,
    `SELL NOTHING THIS WEEKEND`,
  ],
};

export const episode: DailyReport = parseDailyReport(raw);
