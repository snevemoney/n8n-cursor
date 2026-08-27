import {vsSpxSpread} from '../compute';
import {parseDailyReport, type DailyReport} from '../schema';

/** Yahoo Finance quote pages, fetched ~09:07 America/Toronto 2026-08-27. Cash = Wed 26 close. */
const nvdaCash = 209.66;
const nvdaCashDayPct = -1.59;
const nvdaPremarket = 222.96;
const nvdaPremarketPct = 6.34;
const nvdaYtd = 12.56;
const nvdaSpxYtd = 12.13;
const nvdaBeta = 2.21;
const aaplCash = 313.45;
const aaplCashDayPct = 1.15;
const aaplPremarket = 310.28;
const aaplPremarketPct = -1.01;
const aaplYtd = 15.61;
const aaplSpxYtd = 12.13;
const aaplOneYear = 37.2;
const spxClose = 7675.7;
const spxDayPct = -0.02;
const spxYtdPct = 12.13;
const nasdaqClose = 26130.2;
const nasdaqDayPct = -0.08;
const dowClose = 53463.88;
const dowDayPct = -0.21;
const tenYearWed = 4.664;
const tenYearThuAm = 4.67;
const vooYtd = 12.95;
const vtiYtd = 13.48;
const vugYtd = 7.73;
const mgkYtd = 7.9;
const gdvYtd = 9.72;
const tsxClose = 36813.65;
const tsxDayPct = -0.39;
const cadUsd = 0.72067;

const raw = {
  meta: {
    date: '2026-08-27',
    dateLabel: 'AUG 27, 2026',
    title: 'Daily Wealth Intelligence',
    thesis:
      'Nvidia cleared the demand bar. The book is still the same concentrated U.S. mega-cap bet. Premarket is already paying the $108B guide. Do not chase the first hour.',
    thesisLead: 'The print cleared the demand bar.',
    thesisAccent: 'The book is still the same concentrated bet.',
    catalyst: 'First U.S. cash session after Nvidia Q2. Jackson Hole starts today.',
    kicker: 'Thursday morning · post-print',
    universe: ['AAPL', 'NVDA', 'VOO', 'VTI', 'VUG', 'MGK', 'GDV'],
  },
  market: {
    spxClose,
    spxDayPct,
    spxYtdPct,
    nasdaqDayPct,
    tenYearYield: tenYearWed,
    note: 'Wednesday cash was flat after a slightly hot July PCE. Nvidia reports after the bell. Thursday premarket: NVDA +6.3% on Yahoo; 10-year ~4.67%.',
    nextCalendar: {
      label: 'U.S. cash open + Jackson Hole',
      detail: 'First regular session after the Nvidia print. Symposium starts today; Warsh remarks Friday (Yahoo).',
    },
  },
  markets: {
    global: {
      indices: [
        {label: 'Nikkei 225', value: '66,131.98', dayPct: -0.2, note: 'Yahoo · Thursday session'},
        {label: 'Hang Seng', value: '25,565.74', dayPct: -0.34, note: 'Yahoo · Thursday session'},
        {label: 'Shanghai Composite', value: '3,956.57', dayPct: 1.13, note: 'Yahoo · Thursday session'},
        {label: 'KOSPI', value: '6,912.37', dayPct: 1.53, note: 'Yahoo · Thursday session'},
        {label: 'S&P/ASX 200', value: '9,038.20', dayPct: -0.98, note: 'Yahoo · Thursday session'},
        {label: 'FTSE 100', value: '10,827.30', dayPct: -0.47, note: 'Yahoo · Thursday Europe live ~09:07 ET'},
        {label: 'DAX', value: '26,345.95', dayPct: 0.23, note: 'Yahoo · Thursday Europe live ~09:07 ET'},
      ],
      fx: [{label: 'CAD-USD', value: cadUsd.toFixed(5), note: '0.72067 · CP24 72.07¢ U.S. Wednesday'}],
      note: 'Asia already printed Thursday. Europe was mid-session on the Yahoo index page. Oil not read this sitting — omitted.',
    },
    us: {
      indices: [
        {
          label: 'S&P 500',
          value: spxClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: spxDayPct,
          note: 'Wednesday cash · Yahoo / CNBC',
        },
        {
          label: 'Nasdaq Composite',
          value: nasdaqClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: nasdaqDayPct,
        },
        {
          label: 'Dow Jones',
          value: dowClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: dowDayPct,
        },
      ],
      yields: [
        {label: 'U.S. 10-year (Wed close)', value: `${tenYearWed}%`, note: 'Yahoo ^TNX previous close'},
        {label: 'U.S. 10-year (Thu ~08:52 ET)', value: `${tenYearThuAm}%`, note: 'Yahoo ^TNX 4.6700, market open'},
      ],
      note: 'July PCE: +0.2% m/m headline and core; core +3.3% y/y (BEA). Headline ~3.7% y/y vs ~3.6% expected (Investopedia). Wednesday cash barely moved.',
    },
    ca: {
      indices: [
        {
          label: 'S&P/TSX Composite',
          value: tsxClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: tsxDayPct,
          note: 'Wednesday cash · Yahoo / Reuters / CP24',
        },
        {label: 'TSX Venture', value: '1,002.77', dayPct: -0.81, note: 'MarketScreener Wednesday'},
      ],
      cadUsd: 'C$1 → US$0.72067 (Wed). CP24: 72.07¢ U.S. vs 72.26¢ Tuesday.',
      note: 'TSX gave back a record Tuesday close. Metals and Canada–U.S. trade tension in the Reuters wrap. Contribution is in C$.',
    },
    calendar: {
      items: [
        {
          when: 'Thursday 09:30 ET',
          where: 'US' as const,
          label: 'First cash session after Nvidia Q2',
          why: 'Premarket is already +6.3% on Yahoo. The cash open is the first real print of the guide.',
        },
        {
          when: 'Thursday',
          where: 'US' as const,
          label: 'Jackson Hole symposium starts',
          why: 'Yahoo: symposium opens today. Warsh remarks are Friday, not this morning.',
        },
        {
          when: 'Friday',
          where: 'US' as const,
          label: 'Warsh Jackson Hole remarks',
          why: 'Yahoo morning brief: Fed Chair Kevin Warsh remarks Friday. Do not treat Thursday as the speech.',
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
      rating: 'HOLD — do not chase the gap',
      tone: 'watch' as const,
      role: 'Post-print, still the event',
      whatMatters: 'Q2 beat + $108B ±2% guide. Premarket already paying it. Cash has not opened.',
      ytd: nvdaYtd,
    },
    {
      ticker: 'AAPL',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Recent purchase',
      whatMatters: 'Wednesday cash +1.15%. Premarket softer. Still beating S&P YTD. Do not add on an NVDA gap.',
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
      whatMatters: 'YTD still lags the S&P. Yahoo look-through: NVDA 12.81% + AAPL 12.59%.',
      ytd: vugYtd,
      overlapWith: ['NVDA', 'AAPL', 'VOO', 'MGK'],
    },
    {
      ticker: 'MGK',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Mega-cap growth',
      whatMatters: 'Even more overlap. Yahoo look-through: NVDA 13.53% + AAPL 13.20%.',
      ytd: mgkYtd,
      overlapWith: ['NVDA', 'AAPL', 'VUG', 'VOO'],
    },
    {
      ticker: 'GDV',
      rating: 'HOLD — income / diversifier',
      tone: 'long' as const,
      role: 'Income sleeve',
      whatMatters: 'Different job. Yahoo market $30.47, forward yield 5.91%. NAV / discount not read today.',
      ytd: gdvYtd,
    },
  ],
  portfolio: {
    concentrationThesis: 'VOO + VTI + VUG + MGK + AAPL + NVDA still buy the same companies.',
    concentrationBody:
      'Yahoo look-through this morning: NVDA and AAPL are 7.55% and 7.04% of VOO, 12.81% and 12.59% of VUG, 13.53% and 13.20% of MGK. A premarket NVDA bounce marks several lines at once. Weights in the book are still unknown.',
    factorStack: ['NVDA', 'AAPL', 'MGK', 'VUG', 'VOO', 'VTI'],
    factorLabel: 'U.S. mega-cap / growth',
    overlapNote: 'same two names, stacked',
  },
  names: [
    {
      ticker: 'NVDA',
      chapterTitle: 'NVDA · the print cleared; the gap is not a plan',
      rating: 'HOLD — DO NOT CHASE',
      tone: 'watch' as const,
      price: nvdaCash,
      dayPct: nvdaCashDayPct,
      holdNote: `Wednesday cash $${nvdaCash.toFixed(2)} (${nvdaCashDayPct}%). Yahoo premarket ~09:07 ET $${nvdaPremarket.toFixed(2)} (+${nvdaPremarketPct}%). Cash has not opened.`,
      streak: [-2.34, -0.99, -0.33, -0.98, -2.91, 1.74, -1.59],
      streakHeadline: 'Tuesday snapped a red cluster. Wednesday faded into the print.',
      streakNote:
        'Last seven cash sessions from the prior tape plus Wednesday’s Yahoo −1.59%. Premarket is not a cash cell.',
      fundamentals: [
        {label: 'Q2 revenue', value: '$96.2B  +18% q/q  +106% y/y'},
        {label: 'Q2 data center', value: '$89.0B  +117% y/y'},
        {label: 'Q2 GAAP / non-GAAP EPS', value: '$2.46  /  $2.22'},
        {label: 'Q2 gross margin', value: '75.0%'},
        {label: 'Q3 guide', value: '$108.0B ±2%  ·  GM 74.0% ±50 bps'},
        {label: 'Market cap / beta', value: `$5.08T  /  ${nvdaBeta}`},
      ],
      vsSpx: {
        headline: 'YTD is only a hair above the S&P. The extra volatility is still there.',
        bars: [
          {label: 'NVDA YTD', pct: nvdaYtd, tone: 'nvda' as const},
          {label: 'S&P YTD', pct: nvdaSpxYtd, tone: 'muted' as const},
        ],
        note: `Spread: ${vsSpxSpread(nvdaYtd, nvdaSpxYtd) >= 0 ? '+' : ''}${vsSpxSpread(nvdaYtd, nvdaSpxYtd).toFixed(2)} points (NVDA YTD − S&P YTD). Yahoo trailing YTD as of Aug 26. Beta ${nvdaBeta}.`,
      },
      consensus: {
        rows: [
          {label: 'Q2 printed revenue', value: '$96.2B'},
          {label: 'Q2 printed non-GAAP EPS', value: '$2.22'},
          {label: 'Q3 revenue guide', value: '$108.0B ±2%'},
          {label: 'Q3 gross-margin guide', value: '74.0% ±50 bps'},
          {label: 'China in the guide', value: 'None — no Data Center compute assumed'},
        ],
        note: 'NVIDIA IR / newsroom Aug 26. Prior brief wanted ~$92.2B this quarter and ~$104.2B next. The print and the $108B midpoint cleared that. Margin guide steps down from the 75.0% print. Whisper zone still UNKNOWN.',
        range: {metric: 'Q3 revenue guide', unit: 'B', guide: 108.0, low: 105.8, high: 110.2},
      },
      narrative: {
        leftTitle: 'THE PRINT',
        leftHeadline: 'Demand is not the broken story this morning.',
        leftBody:
          'NVIDIA IR: $96.2B revenue, $89.0B data center, 75.0% gross margin. Huang: “AI has reached its inflection point.” Vera Rubin in full production. Q3 guide $108.0B ±2%.',
        rightTitle: 'THE CATCH',
        rightHeadline: 'The guide leaves China out. Margins are guided down. Premarket already paid.',
        rightBody:
          'No Data Center compute from China in the outlook. Q3 margin 74.0% ±50 bps, not another 75% print. Third-party financing platforms “over $500B… subject to definitive agreements.” Premarket +6.3% is already past the old 5.4% options band from the prior tape.',
      },
      interpretation: {
        chips: [
          {label: 'CONFIRMED', tone: 'long' as const, text: 'Q2 revenue, data center, and EPS printed above the prior brief.'},
          {label: 'CONFIRMED', tone: 'watch' as const, text: 'Q3 guide midpoint is $108B. China compute is assumed at zero.'},
          {
            label: 'CONFIRMED',
            tone: 'caution' as const,
            text: 'Gross-margin guide steps to 74.0% ±50 bps from a 75.0% print.',
          },
          {
            label: 'INFERENCE',
            tone: 'watch' as const,
            text: 'The Tuesday action matrix “ADD Thursday” needed ~75% margins on the way out. That condition did not print.',
          },
        ],
        note: 'Beat-and-raise is real. Automatic add on the gap is not. Cash has not opened. Book weights are still unknown.',
      },
      actionMatrix: {
        headline: 'This morning: HOLD. Do not buy the premarket gap.',
        rows: [
          {
            tone: 'long' as const,
            if: 'Cash holds a calm bid after the open and the book still needs NVDA exposure',
            then: 'Still not an automatic add. Size only after weights exist.',
          },
          {
            tone: 'watch' as const,
            if: 'Cash opens near the premarket +6% and then fades',
            then: 'HOLD. That is digestion, not a new thesis.',
          },
          {
            tone: 'caution' as const,
            if: 'China / margin / financing headlines turn the gap red',
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
        title: 'NVDA · what the IR actually said',
        headline: 'Polarity from the Aug 26 newsroom note — no composite score.',
        nodes: [
          {id: 'labs', label: 'Frontier labs / open models', polarity: 'confirmed' as const, x: 0.08, y: 0.22},
          {id: 'demand', label: 'GPU demand', polarity: 'confirmed' as const, x: 0.3, y: 0.22},
          {id: 'rubin', label: 'Vera Rubin production', polarity: 'confirmed' as const, x: 0.5, y: 0.22, evidence: 'Full production'},
          {id: 'financing', label: 'Third-party capital', polarity: 'concern' as const, x: 0.3, y: 0.78, evidence: '$500B subject to agreements'},
          {id: 'nvda', label: 'NVDA', polarity: 'neutral' as const, x: 0.62, y: 0.5},
          {id: 'china', label: 'China DC compute', polarity: 'concern' as const, x: 0.5, y: 0.78, evidence: 'Zero in Q3 guide'},
          {id: 'margins', label: 'Q3 margin guide', polarity: 'concern' as const, x: 0.82, y: 0.5, evidence: '74.0% ±50 bps'},
          {id: 'guide', label: 'Q3 revenue guide', polarity: 'confirmed' as const, x: 0.82, y: 0.18, evidence: '$108B ±2%'},
          {id: 'valuation', label: 'Premarket gap', polarity: 'inference' as const, x: 0.94, y: 0.5, evidence: '+6.3% Yahoo'},
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
      price: aaplCash,
      dayPct: aaplCashDayPct,
      holdNote: `Wednesday cash $${aaplCash.toFixed(2)} (+${aaplCashDayPct}%). Yahoo premarket ~09:07 ET $${aaplPremarket.toFixed(2)} (${aaplPremarketPct}%).`,
      returns: {
        headline: 'Still beating the S&P YTD. One-year still strong. Short windows not re-read today.',
        bars: [
          {label: 'YTD', pct: aaplYtd, tone: 'long' as const},
          {label: 'S&P YTD', pct: aaplSpxYtd, tone: 'muted' as const},
          {label: '1 year', pct: aaplOneYear, tone: 'gold' as const},
        ],
        panelTitle: 'JULY HIGH (SOURCED)',
        panelBody: 'MacroTrends: July 28 close high $339.79. Wednesday cash $313.45.',
        note: `Spread vs S&P YTD: ${vsSpxSpread(aaplYtd, aaplSpxYtd) >= 0 ? '+' : ''}${vsSpxSpread(aaplYtd, aaplSpxYtd).toFixed(2)} points. Yahoo trailing returns as of Aug 26. 6-month / 3-month / 1-month bars omitted — not re-read.`,
      },
      catalyst: {
        headline: 'Yahoo Scout flagged a Sept 9 hardware event. That is not an IR filing. Treat as unverified.',
        steps: [
          'You already own the shares',
          'NVDA gap is not an AAPL add signal',
          'Next contribution should diversify',
        ],
        note: 'No new Apple IR 8-K read this sitting. Do not invent a Mac / foldable revenue number.',
      },
      action: {
        headline: 'HOLD the position.',
        body: 'Do not add AAPL because NVDA reported. You just bought it. New core money still goes to VOO.',
      },
    },
    {
      ticker: 'VOO',
      chapterTitle: 'VOO · still the simple core',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      metrics: [
        {label: 'Wed cash', value: '$704.20  +0.03%'},
        {label: 'Premarket', value: '$706.32  +0.30%'},
        {label: 'YTD DTR', value: '+12.95%'},
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
        {label: 'Wed cash', value: '$378.23  +0.02%'},
        {label: 'Premarket', value: '$379.26  +0.27%'},
        {label: 'YTD DTR', value: '+13.48%'},
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
          {label: 'VUG YTD DTR', pct: vugYtd, tone: 'watch' as const},
          {label: 'S&P YTD', pct: spxYtdPct, tone: 'long' as const},
        ],
        note: 'Yahoo YTD daily total return 7.73% vs S&P 12.13%. Premarket $88.20 (+0.92%) — NVDA-heavy. HOLD existing. No priority add.',
      },
    },
    {
      ticker: 'MGK',
      chapterTitle: 'MGK · same issue, more concentrated',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      metrics: [
        {label: 'Wed cash', value: '$88.85  −0.07%'},
        {label: 'Premarket', value: '$89.98  +1.26%'},
        {label: 'YTD DTR', value: '+7.90%'},
      ],
      copy: {
        body: 'Yahoo: NVDA 13.53% and AAPL 13.20% of the fund. YTD still behind the S&P. HOLD. Stop feeding it. Not a sell call — tax and account mechanics were not reconstructed.',
      },
    },
    {
      ticker: 'GDV',
      chapterTitle: 'GDV · a different job',
      rating: 'HOLD · INCOME / DIVERSIFIER',
      tone: 'long' as const,
      metrics: [
        {label: 'Market', value: '$30.47'},
        {label: 'Wed day', value: '−0.39%'},
        {label: 'Fwd yield', value: '5.91%'},
        {label: 'YTD', value: '+9.72%'},
      ],
      copy: {
        body: 'Yahoo market close $30.47. Forward dividend/yield $1.80 (5.91%). $0.15 cash dividend, ex-date Sep 16. NAV and discount were not on the quote page this sitting — omitted. Not Next-NVDA.',
      },
    },
  ],
  nextNvda: [],
  unknowns: [
    {
      id: 'weights',
      area: 'book' as const,
      question: 'What is each line’s weight in the book?',
      whyItMatters: 'Without weights we cannot size how much of Thursday’s C$ contribution is already mega-cap.',
      neededToKnow: 'Sourced account weights. Do not estimate from prices.',
      status: 'unknown' as const,
    },
    {
      id: 'cash-open',
      area: 'name' as const,
      ticker: 'NVDA',
      question: 'Where does NVDA cash actually open versus the +6.3% premarket?',
      whyItMatters: 'Premarket is not the official print. The first hour can fade a guide that is already paid.',
      neededToKnow: 'Yahoo / Nasdaq cash open after 09:30 ET.',
      status: 'unknown' as const,
    },
    {
      id: 'gdv-nav',
      area: 'name' as const,
      ticker: 'GDV',
      question: 'What is today’s GDV NAV and discount?',
      whyItMatters: 'The income sleeve is supposed to look different. Discount is the useful number. We only have the market price.',
      neededToKnow: 'Gabelli / CEF page NAV print for Aug 26 or 27.',
      status: 'unknown' as const,
    },
    {
      id: 'next-nvda',
      area: 'opportunity' as const,
      question: 'Is there a named Next-NVDA or non-book scout?',
      whyItMatters: 'CRM and CRWD moved after the bell in news wraps. That is not a named sleeve. Empty radar stays empty.',
      neededToKnow: 'Evens or a filing names a ticker that is not already in the book.',
      status: 'unknown' as const,
    },
    {
      id: 'hf-deal',
      area: 'name' as const,
      ticker: 'NVDA',
      question: 'Did Nvidia agree to buy Hugging Face for $12.9B?',
      whyItMatters: 'Yahoo Scout showed it. It is not in the IR Q2 release we read. Do not treat it as confirmed.',
      neededToKnow: 'NVIDIA IR / 8-K, or omit.',
      status: 'unknown' as const,
    },
  ],
  scenarios: [],
  capitalPlan: {
    existingPortfolio: 'HOLD — sell nothing on the gap.',
    freshCapital: 'Do not chase NVDA in the first hour. New core money still simplifies into VOO.',
    bestAdd: 'VOO',
    highestUpsideWatch: 'none named',
    biggestRisk: 'Same mega-cap stack. Premarket NVDA +6.3% marks VUG / MGK / VOO / VTI at once. Weights still unknown.',
    nextTrigger: 'Thursday 09:30 ET cash open. Warsh remarks Friday — not this morning.',
    ifThen: [
      {
        tone: 'watch' as const,
        if: 'Cash opens near the premarket gap and holds',
        then: 'HOLD. The print is already in the price. Do not add NVDA because it went up.',
      },
      {
        tone: 'long' as const,
        if: 'You still have C$250–C$800 to put to work and want the simple core',
        then: 'VOO. Not a second AAPL ticket. Not MGK. Not VUG.',
      },
      {
        tone: 'caution' as const,
        if: 'The gap fades on China / 74% margin / financing headlines',
        then: 'Do not automatically buy the dip. Re-read the guide first.',
      },
      {
        tone: 'short' as const,
        if: 'The $108B guide or demand language is walked back',
        then: 'Consider reducing. That is not on this morning’s IR note.',
      },
    ],
  },
  risks: [
    {
      n: '01',
      title: 'Growth-factor concentration',
      body: 'NVDA + AAPL + MGK + VUG + VOO + VTI still own the same two names at the top. A Thursday NVDA move is a book move.',
    },
    {
      n: '02',
      title: 'Guide already paid',
      body: 'Yahoo premarket +6.3% is already past the prior tape’s 5.4% implied move. Buying the first hour is buying the celebration.',
    },
    {
      n: '03',
      title: 'Margins and China',
      body: 'IR guided 74.0% ±50 bps and assumed zero China Data Center compute. Those two lines can reprice the gap without killing the demand story.',
    },
  ],
  close: {
    kicker: 'POST-PRINT',
    headline: 'The demand question got an answer. The add question did not.',
    body: 'Q2 printed. The $108B guide is real. The 75% outgoing-margin condition from Tuesday’s matrix did not print. Premarket already paid. HOLD the book. If you contribute today, VOO. Watch the cash open. Warsh is Friday.',
    pills: [
      {tone: 'watch' as const, label: 'HOLD THE GAP'},
      {tone: 'caution' as const, label: 'NO FIRST-HOUR CHASE'},
      {tone: 'long' as const, label: 'CORE = VOO'},
    ],
    followThrough: [
      {
        tone: 'watch' as const,
        if: 'Cash confirms the print and NVDA is no longer cheap',
        then: 'Keep looking downstream / upstream. No scout is named yet.',
      },
      {
        tone: 'caution' as const,
        if: 'The gap dies on margins or China',
        then: 'More VOO / cash / non-AI quality. Not an automatic dip-buy.',
      },
      {
        tone: 'long' as const,
        if: 'An asymmetric name is actually sourced',
        then: 'That is when the Next-NVDA sleeve gets a ticker. Not today.',
      },
    ],
  },
  tickerTape: [
    `SPX ${spxClose.toLocaleString('en-US')}  ${spxDayPct}%`,
    `SPX YTD  +${spxYtdPct}%`,
    `NASDAQ  ${nasdaqDayPct}%`,
    `NVDA CASH  $${nvdaCash.toFixed(2)}  ${nvdaCashDayPct}%`,
    `NVDA PRE  $${nvdaPremarket.toFixed(2)}  +${nvdaPremarketPct}%`,
    `AAPL  $${aaplCash.toFixed(2)}  +${aaplCashDayPct}%`,
    `TSX  ${tsxClose.toLocaleString('en-US')}  ${tsxDayPct}%`,
    `CAD  ${cadUsd}`,
    `10Y  ${tenYearWed}%`,
    `NVDA Q2  $96.2B`,
    `Q3 GUIDE  $108B ±2%`,
    `HOLD THE GAP`,
  ],
};

export const episode: DailyReport = parseDailyReport(raw);
