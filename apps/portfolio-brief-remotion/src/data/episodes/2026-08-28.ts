import {vsSpxSpread} from '../compute';
import {parseDailyReport, type DailyReport} from '../schema';

/** Yahoo quote / world-indices / history + NVIDIA IR + BEA. Fetched ~09:05–09:10 America/Toronto 2026-08-28. Cash = Thu 27 close unless labeled. */
const nvdaClose = 227.98;
const nvdaDayPct = 8.74;
const nvdaPremarket = 228.28;
const nvdaPremarketPct = 0.13;
const nvdaYtd = 22.39;
const nvdaSpxYtd = 12.94;
const nvdaBeta = 2.21;
const aaplClose = 314.58;
const aaplDayPct = 0.36;
const aaplPremarket = 315.86;
const aaplPremarketPct = 0.41;
const aaplYtd = 16.03;
const aaplSpxYtd = 12.94;
const aaplOneYear = 36.99;
const aaplSixMonth = 19.08;
const aaplOneMonth = -6.63;
const spxClose = 7730.99;
const spxDayPct = 0.72;
const spxYtdPct = 12.94;
const nasdaqClose = 26541.35;
const nasdaqDayPct = 1.57;
const dowClose = 53569.44;
const dowDayPct = 0.2;
const tenYearThu = 4.672;
const tenYearFriAm = 4.682;
const vooClose = 708.75;
const vooDayPct = 0.65;
const vooYtd = 12.19;
const vtiClose = 380.63;
const vtiDayPct = 0.63;
const vtiYtd = 12.66;
const vugClose = 88.9;
const vugDayPct = 1.7;
const vugYtd = 9.33;
const mgkClose = 90.48;
const mgkDayPct = 1.83;
const mgkYtd = 7.83;
const gdvClose = 30.33;
const gdvDayPct = -0.46;
const gdvYtd = 9.22;
const gdvYield = 5.93;
const tsxClose = 36834.25;
const tsxDayPct = 0.06;
const tsxYtd = 15.59;
const tsxVenture = 1004.09;
const tsxVentureDayPct = 0.13;
const cadUsd = 0.7218;

const raw = {
  meta: {
    date: '2026-08-28',
    dateLabel: 'AUG 28, 2026',
    title: 'Daily Wealth Intelligence',
    thesis:
      'Thursday cash paid Nvidia’s $108B guide. The book is still the same concentrated U.S. mega-cap stack. Today is Warsh, not another print. HOLD. Do not chase yesterday’s gap.',
    thesisLead: 'Thursday cash already paid the guide.',
    thesisAccent: 'The book is still the same concentrated stack.',
    catalyst: 'Fed Chair Warsh Jackson Hole remarks. Friday U.S. cash just opening.',
    kicker: 'Friday morning · post-gap',
    universe: ['AAPL', 'NVDA', 'VOO', 'VTI', 'VUG', 'MGK', 'GDV'],
  },
  market: {
    spxClose,
    spxDayPct,
    spxYtdPct,
    nasdaqDayPct,
    tenYearYield: tenYearFriAm,
    note: 'Thursday cash: S&P +0.72%, Nasdaq +1.57% after Nvidia +8.74%. Friday 10-year ~4.682% on Yahoo ^TNX (market open). Session just opening — live Friday cash omitted.',
    nextCalendar: {
      label: 'Warsh Jackson Hole remarks',
      detail: 'Yahoo / Reuters: Fed Chair Kevin Warsh speaks Friday. Next PCE is Sept 30 (BEA).',
    },
  },
  markets: {
    global: {
      indices: [
        {label: 'Nikkei 225', value: '66,405.56', dayPct: 0.41, note: 'Yahoo world indices · Friday session'},
        {label: 'Hang Seng', value: '25,584.79', dayPct: 0.07, note: 'Yahoo world indices · Friday session'},
        {label: 'Shanghai Composite', value: '3,952.18', dayPct: -0.11, note: 'Yahoo world indices · Friday session'},
        {label: 'KOSPI', value: '6,788.88', dayPct: -1.79, note: 'Yahoo world indices · Friday session'},
        {label: 'TSEC / TWII', value: '46,331.45', dayPct: 0.77, note: 'Yahoo world indices · Friday session'},
        {label: 'S&P/ASX 200', value: '9,092.30', dayPct: 0.6, note: 'Yahoo world indices · Friday session'},
        {label: 'FTSE 100', value: '10,810.72', dayPct: 0.17, note: 'Yahoo world indices · Friday Europe'},
        {label: 'DAX', value: '26,543.27', dayPct: 0.67, note: 'Yahoo world indices · Friday Europe'},
        {label: 'CAC 40', value: '8,406.99', dayPct: 1.05, note: 'Yahoo world indices · Friday Europe'},
        {label: 'EURO STOXX 50', value: '6,478.29', dayPct: 0.83, note: 'Yahoo world indices · Friday Europe'},
      ],
      fx: [
        {label: 'CAD-USD', value: cadUsd.toFixed(4), note: 'Yahoo CADUSD=X · Friday ~14:06 GMT+1'},
        {label: 'US Dollar Index', value: '99.19', dayPct: 0.03, note: 'Yahoo DX-Y.NYB'},
      ],
      note: 'Asia already printed Friday. Europe was on the Yahoo index page this morning. Oil not read this sitting — omitted.',
    },
    us: {
      indices: [
        {
          label: 'S&P 500',
          value: spxClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: spxDayPct,
          note: 'Thursday cash · Yahoo ^GSPC',
        },
        {
          label: 'Nasdaq Composite',
          value: nasdaqClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: nasdaqDayPct,
          note: 'Thursday cash · Yahoo ^IXIC',
        },
        {
          label: 'Dow Jones',
          value: dowClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: dowDayPct,
          note: 'Thursday cash · Yahoo / Reuters',
        },
        {
          label: 'Russell 2000',
          value: '3,014.34',
          dayPct: 0.28,
          note: 'Thursday cash · Yahoo ^RUT',
        },
      ],
      breadth:
        'Reuters Thursday wrap: NYSE decliners slightly ahead (1.02-to-1). Nasdaq advancers 1.11-to-1. Yahoo NYSE Composite −0.38% vs Nasdaq +1.57%.',
      yields: [
        {label: 'U.S. 10-year (Thu close)', value: `${tenYearThu}%`, note: 'Yahoo ^TNX previous close 4.6720'},
        {label: 'U.S. 10-year (Fri ~07:51 CDT)', value: `${tenYearFriAm}%`, note: 'Yahoo ^TNX 4.6820, market open'},
        {label: 'CBOE VIX', value: '14.44', dayPct: -0.48, note: 'Yahoo ^VIX · Thursday'},
      ],
      note: 'July PCE (BEA, Aug 26): +0.2% m/m headline and core; +3.7% y/y headline; core +3.3% y/y. Thursday cash priced the Nvidia guide. Friday live cash omitted — open was in progress.',
    },
    ca: {
      indices: [
        {
          label: 'S&P/TSX Composite',
          value: tsxClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: tsxDayPct,
          note: `Thursday cash · Yahoo ^GSPTSE. Chart YTD +${tsxYtd}%.`,
        },
        {
          label: 'TSX Venture',
          value: tsxVenture.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: tsxVentureDayPct,
          note: 'Yahoo ^SPCDNX · from CADUSD people-also-watch / TSX page',
        },
      ],
      cadUsd: 'C$1 → US$0.7218 (Fri morning Yahoo). USD/CAD 1.3852.',
      note: 'TSX barely up Thursday while Nasdaq ripped. Contribution is in C$. Canada–U.S. tariff headlines sit on the Yahoo TSX page; not reconstructed into a sector tape.',
    },
    calendar: {
      items: [
        {
          when: 'Friday',
          where: 'US' as const,
          label: 'Warsh Jackson Hole remarks',
          why: 'Yahoo / Reuters: first Jackson Hole address from Fed Chair Kevin Warsh. This is today’s event, not another Nvidia print.',
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
      rating: 'HOLD — gap already paid',
      tone: 'watch' as const,
      role: 'Post-print, post-gap',
      whatMatters: 'Thursday cash +8.74% to $227.98. Guide was $108B ±2%. Do not chase Friday premarket.',
      ytd: nvdaYtd,
    },
    {
      ticker: 'AAPL',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Recent purchase',
      whatMatters: 'Thursday cash +0.36%. Still beating S&P YTD. Do not add because NVDA ripped.',
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
      whatMatters: 'Chart YTD still lags the S&P. Yahoo look-through: NVDA 12.81% + AAPL 12.59%.',
      ytd: vugYtd,
      overlapWith: ['NVDA', 'AAPL', 'VOO', 'MGK'],
    },
    {
      ticker: 'MGK',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Mega-cap growth',
      whatMatters: 'Even more overlap. Holdings page not re-read this sitting. YTD is Yahoo daily total return as of Aug 26.',
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
      'Yahoo look-through this morning: NVDA and AAPL are 7.55% and 7.04% of VOO, 6.40% and 6.29% of VTI, 12.81% and 12.59% of VUG. Thursday’s NVDA +8.74% marked several lines at once. Book weights are still unknown.',
    factorStack: ['NVDA', 'AAPL', 'MGK', 'VUG', 'VOO', 'VTI'],
    factorLabel: 'U.S. mega-cap / growth',
    overlapNote: 'same two names, stacked',
  },
  names: [
    {
      ticker: 'NVDA',
      chapterTitle: 'NVDA · Thursday paid the guide',
      rating: 'HOLD — DO NOT CHASE',
      tone: 'watch' as const,
      price: nvdaClose,
      dayPct: nvdaDayPct,
      holdNote: `Thursday cash $${nvdaClose.toFixed(2)} (+${nvdaDayPct}%). Yahoo premarket ~09:05 ET $${nvdaPremarket.toFixed(2)} (+${nvdaPremarketPct}%). Friday cash not used.`,
      streak: [-0.99, -0.33, -0.98, -2.91, 2.19, -1.59, 8.74],
      streakHeadline: 'Five red cells in seven sessions. Thursday’s +8.74% is one green print, not a new grid.',
      streakNote:
        'Yahoo history closes Aug 19–27: −0.99, −0.33, −0.98, −2.91, +2.19, −1.59, +8.74. Premarket is not a cash cell.',
      fundamentals: [
        {label: 'Q2 revenue', value: '$96.2B +18% q/q +106% y/y'},
        {label: 'Q2 data center', value: '$89.0B +117% y/y'},
        {label: 'Q2 GAAP / non-GAAP EPS', value: '$2.46 / $2.22'},
        {label: 'Q2 gross margin', value: '75.0%'},
        {label: 'Q3 guide', value: '$108.0B ±2% · GM 74.0% ±50 bps'},
        {label: 'Market cap / beta', value: `$5.51T / ${nvdaBeta}`},
        {label: 'TTM revenue / EPS', value: '$303.0B / $7.91'},
      ],
      vsSpx: {
        headline: 'YTD now well above the S&P after Thursday. The extra volatility is still there.',
        bars: [
          {label: 'NVDA YTD', pct: nvdaYtd, tone: 'nvda' as const},
          {label: 'S&P YTD', pct: nvdaSpxYtd, tone: 'muted' as const},
        ],
        note: `Spread: ${vsSpxSpread(nvdaYtd, nvdaSpxYtd) >= 0 ? '+' : ''}${vsSpxSpread(nvdaYtd, nvdaSpxYtd).toFixed(2)} points (NVDA YTD − S&P YTD). Yahoo trailing YTD as of Aug 27. Beta ${nvdaBeta}.`,
      },
      consensus: {
        rows: [
          {label: 'Q2 printed revenue', value: '$96.2B'},
          {label: 'Q2 printed non-GAAP EPS', value: '$2.22'},
          {label: 'Q3 revenue guide', value: '$108.0B ±2%'},
          {label: 'Q3 gross-margin guide', value: '74.0% ±50 bps'},
          {label: 'China in the guide', value: 'None — no Data Center compute assumed'},
        ],
        note: 'NVIDIA IR Aug 26. Thursday cash +8.74% (Yahoo) is the first full session on that guide. Margin guide still 74.0% ±50 bps. Whisper zone still UNKNOWN. Options band not re-read.',
        range: {metric: 'Q3 revenue guide', unit: 'B', guide: 108.0, low: 105.84, high: 110.16},
      },
      narrative: {
        leftTitle: 'THE CASH SESSION',
        leftHeadline: 'The market paid the $108B guide on Thursday.',
        leftBody:
          'NVIDIA IR: $96.2B revenue, $89.0B data center, 75.0% gross margin, Q3 guide $108.0B ±2%. Yahoo: NVDA $227.98 +8.74% on Aug 27. Reuters: that print lifted Nasdaq +1.57%.',
        rightTitle: 'THE CATCH',
        rightHeadline: 'China is still zero in the guide. Margins are still guided down. The gap is already in the price.',
        rightBody:
          'No Data Center compute from China in the outlook. Q3 margin 74.0% ±50 bps, not another 75% print. Friday premarket was only +0.13% on Yahoo. That is digestion, not a second thesis.',
      },
      interpretation: {
        chips: [
          {label: 'CONFIRMED', tone: 'long' as const, text: 'Q2 revenue, data center, and EPS printed. Q3 guide midpoint is $108B.'},
          {label: 'CONFIRMED', tone: 'watch' as const, text: 'Thursday cash +8.74% already paid that guide.'},
          {
            label: 'CONFIRMED',
            tone: 'caution' as const,
            text: 'Gross-margin guide stays 74.0% ±50 bps. China compute assumed at zero.',
          },
          {
            label: 'INFERENCE',
            tone: 'watch' as const,
            text: 'The old “ADD Thursday” row wanted ~75% margins on the way out. That condition did not print. The gap is not a plan.',
          },
        ],
        note: 'Beat-and-raise is real. Automatic add after an 8.7% cash day is not. Book weights are still unknown.',
      },
      actionMatrix: {
        headline: 'This morning: HOLD. Do not buy yesterday’s gap.',
        rows: [
          {
            tone: 'long' as const,
            if: 'Cash stays calm after Warsh and the book still needs NVDA exposure',
            then: 'Still not an automatic add. Size only after weights exist.',
          },
          {
            tone: 'watch' as const,
            if: 'Friday opens flat-to-green and then fades',
            then: 'HOLD. That is digestion of Thursday, not a new thesis.',
          },
          {
            tone: 'caution' as const,
            if: 'Warsh / 10-year / China headlines turn the gap red',
            then: 'Do not automatically buy the dip. Re-read the guide.',
          },
          {
            tone: 'short' as const,
            if: 'Demand language or the $108B guide is walked back',
            then: 'Consider reducing. That is not this morning’s tape.',
          },
        ],
      },
      network: {
        title: 'NVDA · what the IR said, what cash did',
        headline: 'Polarity from the Aug 26 newsroom note plus Thursday Yahoo cash — no composite score.',
        nodes: [
          {id: 'labs', label: 'Frontier labs / open models', polarity: 'confirmed' as const, x: 0.08, y: 0.22},
          {id: 'demand', label: 'GPU demand', polarity: 'confirmed' as const, x: 0.3, y: 0.22},
          {id: 'rubin', label: 'Vera Rubin production', polarity: 'confirmed' as const, x: 0.5, y: 0.22, evidence: 'Full production'},
          {id: 'financing', label: 'Third-party capital', polarity: 'concern' as const, x: 0.3, y: 0.78, evidence: '$500B subject to agreements'},
          {id: 'nvda', label: 'NVDA', polarity: 'neutral' as const, x: 0.62, y: 0.5},
          {id: 'china', label: 'China DC compute', polarity: 'concern' as const, x: 0.5, y: 0.78, evidence: 'Zero in Q3 guide'},
          {id: 'margins', label: 'Q3 margin guide', polarity: 'concern' as const, x: 0.82, y: 0.5, evidence: '74.0% ±50 bps'},
          {id: 'guide', label: 'Q3 revenue guide', polarity: 'confirmed' as const, x: 0.82, y: 0.18, evidence: '$108B ±2%'},
          {id: 'valuation', label: 'Thursday cash', polarity: 'inference' as const, x: 0.94, y: 0.5, evidence: '+8.74% Yahoo'},
        ],
        edges: [
          {from: 'labs', to: 'demand'},
          {from: 'demand', to: 'nvda'},
          {from: 'rubin', to: 'nvda'},
          {from: 'financing', to: 'nvda', label: 'exposure'},
          {from: 'china', to: 'guide', label: 'excluded'},
          {from: 'nvda', to: 'guide'},
          {from: 'nvda', to: 'margins'},
          {from: 'guide', to: 'valuation'},
          {from: 'margins', to: 'valuation'},
        ],
      },
    },
    {
      ticker: 'AAPL',
      chapterTitle: 'AAPL · still a hold, not today’s add',
      rating: 'HOLD',
      tone: 'long' as const,
      price: aaplClose,
      dayPct: aaplDayPct,
      holdNote: `Thursday cash $${aaplClose.toFixed(2)} (+${aaplDayPct}%). Yahoo premarket ~09:05 ET $${aaplPremarket.toFixed(2)} (+${aaplPremarketPct}%).`,
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
        panelBody: '52-week high $344.57. Thursday cash $314.58.',
        note: `Spread vs S&P YTD: ${vsSpxSpread(aaplYtd, aaplSpxYtd) >= 0 ? '+' : ''}${vsSpxSpread(aaplYtd, aaplSpxYtd).toFixed(2)} points. Yahoo trailing returns as of Aug 27. 3-month bar omitted — not on the quote page.`,
      },
      catalyst: {
        headline: 'Next sourced date is Oct 29 earnings. A Sept 9 hardware event was not read from Apple IR.',
        steps: [
          'You already own the shares',
          'NVDA’s Thursday gap is not an AAPL add signal',
          'Next contribution should diversify',
        ],
        note: 'No new Apple IR 8-K read this sitting. Do not invent a Mac / foldable revenue number.',
      },
      action: {
        headline: 'HOLD the position.',
        body: 'Do not add AAPL because NVDA ripped Thursday. You just bought it. New core money still goes to VOO.',
      },
    },
    {
      ticker: 'VOO',
      chapterTitle: 'VOO · still the simple core',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      metrics: [
        {label: 'Thu cash', value: `$${vooClose.toFixed(2)} +${vooDayPct}%`},
        {label: 'Chart YTD', value: `+${vooYtd}%`},
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
        {label: 'Thu cash', value: `$${vtiClose.toFixed(2)} +${vtiDayPct}%`},
        {label: 'Chart YTD', value: `+${vtiYtd}%`},
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
        note: `Yahoo chart YTD as of Aug 27 close. Daily total return as of Aug 26 was +7.74% — not mixed into the bar. Thursday cash $${vugClose.toFixed(2)} (+${vugDayPct}%).`,
      },
    },
    {
      ticker: 'MGK',
      chapterTitle: 'MGK · same issue, even more concentrated',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      metrics: [
        {label: 'Thu cash', value: `$${mgkClose.toFixed(2)} +${mgkDayPct}%`},
        {label: 'YTD DTR (Aug 26)', value: `+${mgkYtd}%`},
      ],
      copy: {
        body: 'Yahoo daily total return +7.83% as of Aug 26 — still behind the S&P. Holdings page failed this sitting, so look-through weights are omitted. You already own NVDA and AAPL directly. HOLD. Stop feeding it.',
      },
    },
    {
      ticker: 'GDV',
      chapterTitle: 'GDV · a completely different job',
      rating: 'HOLD · INCOME / DIVERSIFIER',
      tone: 'long' as const,
      metrics: [
        {label: 'Thu market', value: `$${gdvClose.toFixed(2)}`},
        {label: 'Day', value: `${gdvDayPct}%`},
        {label: 'Chart YTD', value: `+${gdvYtd}%`},
        {label: 'Fwd yield', value: `~${gdvYield}%`},
      ],
      copy: {
        body: `Closed-end income/value. Yahoo market $${gdvClose.toFixed(2)}. Forward dividend & yield $1.80 (${gdvYield}%). Performance YTD +13.83% as of Aug 27 includes distributions — not used as the bar. NAV / discount not read. Not a growth engine. Not “Next NVDA.”`,
      },
    },
  ],
  nextNvda: [],
  unknowns: [
    {
      id: 'weights',
      area: 'book' as const,
      question: 'What is each line’s weight in the book?',
      whyItMatters: 'Concentration stays a line-count until weights exist. We cannot size how much mega-cap moved Thursday.',
      neededToKnow: 'Sourced account weights. Do not estimate from prices.',
      status: 'unknown' as const,
    },
    {
      id: 'gdv-nav',
      area: 'name' as const,
      ticker: 'GDV',
      question: 'What is GDV’s current NAV and discount?',
      whyItMatters: 'Market $30.33 is not NAV. The income sleeve’s cheapness is unread.',
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
      whyItMatters: 'Expectation-risk and the options scene stay UNKNOWN. Thursday’s 8.74% is a cash print, not an implied band.',
      neededToKnow: 'A sourced whisper and a live options straddle. Do not reuse the Aug 25 ±5.4% band.',
      status: 'unknown' as const,
    },
    {
      id: 'fri-cash',
      area: 'US' as const,
      question: 'Where does Friday U.S. cash actually print after Warsh?',
      whyItMatters: 'This brief used Thursday closes plus a few premarket ticks. Live Friday cash was still opening.',
      neededToKnow: 'Yahoo / index closes after the Friday session. Do not invent a live path.',
      status: 'partial' as const,
    },
  ],
  scenarios: [],
  capitalPlan: {
    existingPortfolio: 'HOLD — sell nothing this morning.',
    freshCapital: 'Do not chase Thursday’s NVDA gap. New core money simplifies into VOO.',
    bestAdd: 'VOO',
    highestUpsideWatch: 'none named',
    biggestRisk: 'Mega-cap growth overlap across NVDA, AAPL, MGK, VUG, VOO, VTI — now after an 8.7% NVDA cash day',
    nextTrigger: 'Friday — Warsh Jackson Hole remarks',
    ifThen: [
      {
        tone: 'long' as const,
        if: 'Cash stays calm after Warsh and the book still needs NVDA exposure',
        then: 'Still not an automatic add. Size only after weights exist.',
      },
      {
        tone: 'watch' as const,
        if: 'Friday opens flat-to-green and then fades',
        then: 'HOLD. That is digestion of Thursday, not a new thesis.',
      },
      {
        tone: 'caution' as const,
        if: 'Warsh / 10-year / China headlines turn the gap red',
        then: 'Do not automatically buy the dip. Re-read the guide.',
      },
      {
        tone: 'short' as const,
        if: 'Demand language or the $108B guide is walked back',
        then: 'Consider reducing. That is not this morning’s tape.',
      },
    ],
  },
  risks: [
    {
      n: '01',
      title: 'Growth-factor concentration',
      body: 'NVDA + AAPL + MGK + VUG + VOO + VTI repeatedly own the same mega-cap ecosystem. Thursday’s NVDA print moved several lines at once.',
    },
    {
      n: '02',
      title: 'Interest rates + Warsh',
      body: `The 10-year is ~${tenYearFriAm}% this morning (Yahoo ^TNX). July PCE is still +3.7% y/y headline / +3.3% core (BEA). High long rates compress the exact overweight.`,
    },
    {
      n: '03',
      title: 'Guide quality after the gap',
      body: 'The $108B midpoint is now in the price. China is assumed at zero. Q3 margins are guided to 74.0%. A walk-back would hit more than one line.',
    },
  ],
  close: {
    kicker: 'DIAGNOSTIC',
    headline: 'The print is behind you. The stack is not.',
    body: 'Thursday cash paid the guide. Today is Warsh, not another Nvidia event. HOLD. New core money still goes to VOO. Do not add AAPL or NVDA on yesterday’s gap. Next-NVDA stays empty until a name is sourced.',
    pills: [
      {tone: 'watch' as const, label: 'HOLD THIS MORNING'},
      {tone: 'caution' as const, label: 'DO NOT CHASE THE GAP'},
      {tone: 'long' as const, label: 'VOO FOR NEW CORE'},
    ],
    followThrough: [
      {
        tone: 'watch' as const,
        if: 'NVDA confirmed demand and the stock already ran',
        then: 'Look downstream / upstream only if a filing names a ticker. Empty scout is correct.',
      },
      {
        tone: 'caution' as const,
        if: 'Warsh or the 10-year turns growth red',
        then: 'More VOO / cash / non-AI quality. Not an automatic dip-buy.',
      },
      {
        tone: 'long' as const,
        if: 'An asymmetric candidate is named',
        then: 'That is when the Next-NVDA sleeve gets capital.',
      },
    ],
  },
  tickerTape: [
    `SPX ${spxClose.toLocaleString('en-US')}  +${spxDayPct}%`,
    `SPX YTD  +${spxYtdPct}%`,
    `NASDAQ  +${nasdaqDayPct}%`,
    `NVDA  $${nvdaClose.toFixed(2)}  +${nvdaDayPct}%`,
    `AAPL  $${aaplClose.toFixed(2)}  +${aaplDayPct}%`,
    `10Y  ${tenYearFriAm}%`,
    `TSX  ${tsxClose.toLocaleString('en-US')}  +${tsxDayPct}%`,
    `CADUSD  ${cadUsd}`,
    `PCE  +3.7% / CORE +3.3%`,
    `WARSH  FRIDAY`,
    `VOO CORE / ADD`,
    `SELL NOTHING THIS MORNING`,
  ],
};

export const episode: DailyReport = parseDailyReport(raw);
