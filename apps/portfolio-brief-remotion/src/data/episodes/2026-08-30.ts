import {vsSpxSpread} from '../compute';
import {parseDailyReport, type DailyReport} from '../schema';

// Sourced Sunday 2026-08-30 America/Toronto. Cash closed. Last prints = Fri Aug 28.
// IR: investor.nvidia.com Q2 FY27 (Aug 26). Quotes: Yahoo NVDA/AAPL/VOO/VTI/VUG/MGK/GDV,
// ^GSPC, ^TNX, ^GSPTSE, world-indices. BLS Sep schedule. Do not treat as live Monday.

const nvdaYtd = 16.79;
const nvdaSpxYtd = 12.65;
const aaplYtd = 17.92;
const aaplSpxYtd = 12.65;
const nvdaClose = 217.55;
const nvdaDayPct = -4.57;
const nvdaBeta = 2.21;
const aaplClose = 319.7;
const aaplDayPct = 1.63;
const spxClose = 7711.76;
const spxDayPct = -0.25;
const spxYtdPct = 12.65;
const nasdaqDayPct = -0.52;
const tenYear = 4.72;
const vooYtd = 13.71;
const vtiYtd = 13.15;
const vugYtd = 9.58;
const mgkYtd = 9.81;
const gdvYtd = 13.72;

const raw = {
  meta: {
    date: '2026-08-30',
    dateLabel: 'AUG 30, 2026',
    title: 'Daily Wealth Intelligence',
    thesis:
      'Markets are closed. Friday already sold Nvidia after a $108B guide and a 74% margin outlook. The book is still the same U.S. mega-cap stack.',
    thesisLead: 'Cash is closed. The print is in.',
    thesisAccent: 'The book is still the same stack.',
    catalyst: 'Monday open, then Friday September 4 jobs. No new Next-NVDA named.',
    kicker: 'Sunday — cash closed',
    universe: ['AAPL', 'NVDA', 'VOO', 'VTI', 'VUG', 'MGK', 'GDV'],
  },
  market: {
    spxClose,
    spxDayPct,
    spxYtdPct,
    nasdaqDayPct,
    tenYearYield: tenYear,
    note: 'Friday cash after Fed Chair Warsh. S&P 500 7,711.76 −0.25%. 10-year 4.72%. Nvidia −4.57% after the $108B guide.',
    nextCalendar: {
      label: 'Monday open · Sep 4 jobs',
      detail: 'U.S. and TSX closed Sunday. Next cash session is Monday Aug 31. BLS Employment Situation is Friday Sep 4.',
    },
  },
  markets: {
    global: {
      indices: [
        {label: 'Nikkei 225', value: '66,405.56', dayPct: 0.41},
        {label: 'Hang Seng', value: '25,584.79', dayPct: 0.07},
        {label: 'Shanghai Composite', value: '3,952.18', dayPct: -0.11},
        {label: 'KOSPI', value: '6,788.88', dayPct: -1.79},
        {label: 'ASX 200', value: '9,092.30', dayPct: 0.6},
        {label: 'DAX', value: '26,569.99', dayPct: 0.77},
        {label: 'FTSE 100', value: '10,824.26', dayPct: 0.29},
        {label: 'CAC 40', value: '8,401.18', dayPct: 0.98},
      ],
      note: 'Yahoo world-indices last cash Friday Aug 28. Asia and Europe are closed for the Sunday tape.',
    },
    us: {
      indices: [
        {label: 'S&P 500', value: '7,711.76', dayPct: spxDayPct},
        {label: 'Nasdaq', value: '26,402.42', dayPct: nasdaqDayPct},
        {label: 'Dow', value: '53,559.99', dayPct: -0.02},
        {label: 'Russell 2000', value: '2,972.37', dayPct: -1.39},
      ],
      yields: [{label: 'U.S. 10-year', value: `${tenYear}%`, dayPct: 1.03}],
      breadth: 'Nasdaq Friday: 1,494 up / 3,272 down (Reuters). VIX 14.43 −0.55% (Yahoo).',
      note: 'Warsh Jackson Hole Friday. Reuters: indexes lower as the inflation fight stayed in the speech. 10-year (^TNX) 4.7200.',
    },
    ca: {
      indices: [{label: 'S&P/TSX Composite', value: '36,553.92', dayPct: -0.76}],
      cadUsd: '0.7194',
      note: 'Yahoo ^GSPTSE close Friday. CADUSD=X 0.7194 −0.37% on the same quote page. BNN: TSX −280.33 to 36,553.92.',
    },
    calendar: {
      items: [
        {
          when: 'Monday Aug 31',
          where: 'US' as const,
          label: 'U.S. cash reopen',
          why: 'Sunday tape is stale. First live prints after Warsh and the Nvidia fade.',
        },
        {
          when: 'Tuesday Sep 1',
          where: 'US' as const,
          label: 'JOLTS (July)',
          why: 'BLS schedule. Labor tape before Friday payrolls.',
        },
        {
          when: 'Friday Sep 4',
          where: 'US' as const,
          label: 'Employment Situation (August)',
          why: 'BLS official. Next hard U.S. jobs print after Warsh.',
        },
        {
          when: 'Sep 15–16',
          where: 'US' as const,
          label: 'FOMC',
          why: 'Fed meeting after the jobs and CPI cluster. Not this week.',
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
      rating: 'HOLD — post-print watch',
      tone: 'watch' as const,
      role: 'Highest factor risk',
      whatMatters: 'Q2 beat + $108B Q3 guide already out; Friday sold the 74% margin outlook',
      ytd: nvdaYtd,
    },
    {
      ticker: 'AAPL',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Recent purchase',
      whatMatters: 'Friday +1.63% to $319.70; next Yahoo earnings date Oct 29',
      ytd: aaplYtd,
    },
    {
      ticker: 'VOO',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      role: 'Best simple core',
      whatMatters: 'Yahoo YTD daily total return 13.71%; still the simple core add',
      ytd: vooYtd,
    },
    {
      ticker: 'VTI',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Broad US',
      whatMatters: 'Excellent fund; top looks like VOO (NVDA 6.40%, AAPL 6.29%)',
      ytd: vtiYtd,
      overlapWith: ['VOO'],
    },
    {
      ticker: 'VUG',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Growth sleeve',
      whatMatters: 'YTD daily total return 9.58% vs S&P 12.65%; top 10 is 63.59% of assets',
      ytd: vugYtd,
      overlapWith: ['NVDA', 'AAPL', 'VOO', 'MGK'],
    },
    {
      ticker: 'MGK',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Mega-cap growth',
      whatMatters: 'YTD daily total return 9.81%; NVDA 13.53% and AAPL 13.20% of the fund',
      ytd: mgkYtd,
      overlapWith: ['NVDA', 'AAPL', 'VUG', 'VOO'],
    },
    {
      ticker: 'GDV',
      rating: 'HOLD — income / diversifier',
      tone: 'long' as const,
      role: 'Income sleeve',
      whatMatters: 'Friday $30.30; forward yield 5.94%. NAV / discount not on the quote page.',
      ytd: gdvYtd,
    },
  ],
  portfolio: {
    concentrationThesis: 'VOO + VTI + VUG + MGK + AAPL + NVDA still buy the same companies.',
    concentrationBody:
      'Vanguard pages: VOO top 10 is 37.62% of assets (NVDA 7.55%, AAPL 7.04%). VUG top 10 is 63.59%. MGK top 10 is 67.00%. When Nvidia is red, several lines move together.',
    factorStack: ['NVDA', 'AAPL', 'MGK', 'VUG', 'VOO', 'VTI'],
    factorLabel: 'U.S. mega-cap / growth',
    overlapNote: 'same ecosystem',
  },
  names: [
    {
      ticker: 'NVDA',
      chapterTitle: 'NVDA · the print is in; Friday sold the guide',
      rating: 'HOLD — POST-PRINT WATCH',
      tone: 'watch' as const,
      price: nvdaClose,
      dayPct: nvdaDayPct,
      holdNote: 'No add on a Sunday. Do not chase Friday’s −4.57% without a new filing.',
      streak: [-0.33, -0.98, -2.91, 2.19, -1.59, 8.74, -4.57],
      streakHeadline: 'Seven Yahoo sessions to Friday. Thursday +8.74% after the print. Friday −4.57%.',
      streakNote:
        'Closes Aug 20–28: 216.85 → 214.72 → 208.48 → 213.05 → 209.66 → 227.98 → 217.55. Five of seven sessions are red. That is the momentum count — not a 0–100 score.',
      fundamentals: [
        {label: 'Market cap', value: '$5.253T'},
        {label: 'Q2 FY27 revenue', value: '$96.2B  +106% y/y'},
        {label: 'Q2 data center', value: '$89.0B  +117% y/y'},
        {label: 'Q2 GAAP / non-GAAP EPS', value: '$2.46  /  $2.22'},
        {label: 'Q2 gross margin', value: '75.0% GAAP and non-GAAP'},
        {label: 'Q3 revenue guide', value: '$108.0B ±2%'},
        {label: 'Q3 GM guide', value: '74.0% ±50 bps'},
        {label: 'TTM revenue / EPS', value: '$303.0B  /  $7.92'},
        {label: 'P/E (TTM)  /  Beta', value: '27.47×  /  2.21'},
      ],
      vsSpx: {
        headline: 'YTD still ahead of the S&P. Friday showed the extra volatility you are paid almost nothing for.',
        bars: [
          {label: 'NVDA YTD', pct: nvdaYtd, tone: 'nvda' as const},
          {label: 'S&P YTD', pct: nvdaSpxYtd, tone: 'muted' as const},
        ],
        note: `Spread: ${vsSpxSpread(nvdaYtd, nvdaSpxYtd) >= 0 ? '+' : ''}${vsSpxSpread(nvdaYtd, nvdaSpxYtd).toFixed(2)} points (Yahoo trailing totals as of Aug 28). Beta: ${nvdaBeta}.`,
      },
      consensus: {
        rows: [
          {label: 'Q2 revenue printed', value: '$96.2B'},
          {label: 'Q2 GAAP / non-GAAP EPS', value: '$2.46 / $2.22'},
          {label: 'Q3 revenue guide', value: '$108.0B ±2%'},
          {label: 'Q3 GM guide', value: '74.0% ±50 bps'},
          {label: 'China DC compute in guide', value: 'none assumed'},
        ],
        note: 'NVIDIA IR Aug 26. Guide excludes Data Center compute revenue from China. Whisper zone was not published — UNKNOWN on the prediction board.',
        range: {metric: 'Q3 FY27 revenue guide', unit: 'B', guide: 108, low: 105.84, high: 110.16},
      },
      narrative: {
        leftTitle: 'THE FEAR',
        leftHeadline: '“The guide is huge. The margin is stepping down. The stock can still fall.”',
        leftBody:
          'Q3 gross-margin guide is 74.0% ±50 bps, off a 75.0% Q2 print. Friday cash −4.57% to $217.55 after Thursday’s +8.74%. IR also named third-party compute-financing platforms targeting over $500B over time, subject to definitive agreements.',
        rightTitle: 'THE COUNTER',
        rightHeadline: 'Demand is still in the filing. $96.2B printed. $108.0B guided.',
        rightBody:
          'Data Center $89.0B, +117% year over year. Vera Rubin in full production at named cloud partners. Huang: compute is revenue; demand is accelerating. Next Yahoo earnings date Nov 17 — not this week.',
      },
      interpretation: {
        chips: [
          {label: 'CONFIRMED', tone: 'long' as const, text: 'Q2 beat and a $108B Q3 guide are on the IR page.'},
          {
            label: 'CONFIRMED',
            tone: 'watch' as const,
            text: 'Margin guide 74% and no China DC compute in the outlook.',
          },
          {
            label: 'CONFIRMED',
            tone: 'caution' as const,
            text: 'Friday sold the stock anyway. Event risk is no longer “will they print.”',
          },
        ],
        note: 'The debate moved from the print to whether $108B at 74% margins is enough for a $5.25T name while the 10-year sits at 4.72%.',
      },
      actionMatrix: {
        headline: 'Sunday: HOLD. Monday: no invented dip-buy.',
        rows: [
          {
            tone: 'long' as const,
            if: 'Monday holds Friday’s close and no new filing weakens the $108B / 74% tape',
            then: 'HOLD the existing line. Fresh core money still goes to VOO.',
          },
          {
            tone: 'watch' as const,
            if: 'Monday fades Nvidia again without a new IR/SEC item',
            then: 'HOLD. Do not add size because Friday was red.',
          },
          {
            tone: 'caution' as const,
            if: 'A new filing or call cuts the guide or the margin path',
            then: 'Do not automatically buy the dip. Re-read the IR.',
          },
          {
            tone: 'short' as const,
            if: 'Demand language deteriorates and the name gaps ~10%+ from Friday $217.55',
            then: 'Consider reducing — Evens decides. Not a trade ticket.',
          },
        ],
      },
      network: {
        title: 'NVDA · qualitative demand chain',
        headline: 'Polarity from the IR and Friday cash — no composite score.',
        nodes: [
          {id: 'labs', label: 'Frontier labs / open models', polarity: 'confirmed' as const, x: 0.08, y: 0.22},
          {id: 'demand', label: 'GPU / AI factory demand', polarity: 'confirmed' as const, x: 0.3, y: 0.22},
          {id: 'spend', label: 'Cloud / DC partners', polarity: 'confirmed' as const, x: 0.5, y: 0.22, evidence: 'Vera Rubin in production'},
          {id: 'financing', label: 'Third-party compute capital', polarity: 'concern' as const, x: 0.3, y: 0.78, evidence: '>$500B platforms, subject to agreements'},
          {id: 'nvda', label: 'NVDA', polarity: 'neutral' as const, x: 0.62, y: 0.5},
          {id: 'china', label: 'China DC compute', polarity: 'concern' as const, x: 0.5, y: 0.78, evidence: 'None assumed in Q3 guide'},
          {id: 'margins', label: 'Gross margin', polarity: 'concern' as const, x: 0.82, y: 0.5, evidence: 'Q3 guide 74.0%'},
          {id: 'guide', label: 'Q3 guide $108B', polarity: 'confirmed' as const, x: 0.82, y: 0.18},
          {id: 'valuation', label: 'Valuation / 10-year', polarity: 'inference' as const, x: 0.94, y: 0.5},
        ],
        edges: [
          {from: 'labs', to: 'demand'},
          {from: 'demand', to: 'spend'},
          {from: 'spend', to: 'nvda'},
          {from: 'financing', to: 'nvda', label: 'exposure'},
          {from: 'china', to: 'guide'},
          {from: 'nvda', to: 'margins'},
          {from: 'nvda', to: 'guide'},
          {from: 'margins', to: 'valuation'},
          {from: 'guide', to: 'valuation'},
        ],
      },
      catalyst: {
        headline: 'The earnings catalyst already printed Aug 26. Next named date is Nov 17 (Yahoo).',
        steps: [
          'Q2 $96.2B and $108B guide are public',
          'Friday sold the margin step-down',
          'Monday is the first live tape',
          'Sep 4 jobs is the next hard macro print',
        ],
        note: 'Ex-dividend Sep 10, $0.25 payable Oct 1 (IR). Not a thesis.',
      },
      action: {
        headline: 'HOLD the existing Nvidia line.',
        body: 'Do not add on a closed Sunday. Do not invent a Next-NVDA because Friday was ugly.',
      },
    },
    {
      ticker: 'AAPL',
      chapterTitle: 'AAPL · Friday bid; next print October',
      rating: 'HOLD',
      tone: 'long' as const,
      price: aaplClose,
      dayPct: aaplDayPct,
      returns: {
        headline: 'Beating the S&P YTD. One-month chip is still red. You already own the name.',
        bars: [
          {label: 'YTD', pct: aaplYtd, tone: 'long' as const},
          {label: 'S&P YTD', pct: aaplSpxYtd, tone: 'muted' as const},
          {label: '1 year', pct: 37.98, tone: 'gold' as const},
          {label: '6 months', pct: 21.02, tone: 'aapl' as const},
          {label: '1 month', pct: -5.99, tone: 'short' as const},
        ],
        panelTitle: '52-WEEK RANGE',
        panelBody: 'Yahoo 52-week high $344.57. Friday close $319.70.',
        note: `Spread vs S&P YTD: ${vsSpxSpread(aaplYtd, aaplSpxYtd) >= 0 ? '+' : ''}${vsSpxSpread(aaplYtd, aaplSpxYtd).toFixed(2)} points (Yahoo trailing totals as of Aug 28).`,
      },
      catalyst: {
        headline: 'Next Yahoo earnings date Oct 29. No new Apple IR filing read this sitting.',
        steps: [
          'Friday cash $319.70 +1.63%',
          'Hold the recent purchase',
          'Do not add the same name Monday',
        ],
        note: 'Yahoo scout mentioned a CEO transition. That is not an IR confirmation here — left off the board.',
      },
      action: {
        headline: 'HOLD the position.',
        body: 'You just bought it. The next contribution should diversify, not double Apple.',
      },
    },
    {
      ticker: 'VOO',
      chapterTitle: 'VOO · the foundation is not the problem',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      price: 707.24,
      dayPct: -0.21,
      metrics: [
        {label: 'Friday', value: '$707.24  −0.21%'},
        {label: 'YTD daily TR', value: '+13.71%'},
        {label: 'Expense', value: '0.03%'},
      ],
      copy: {
        headline: 'Best simple core. New core money simplifies here.',
        body: 'Yahoo YTD daily total return 13.71% as of Aug 27. Top 10 is 37.62% — including the two names you already own. Do not sell. Stop splitting every future contribution with VTI.',
      },
    },
    {
      ticker: 'VTI',
      chapterTitle: 'VTI · excellent, overlapping',
      rating: 'HOLD',
      tone: 'long' as const,
      price: 379.36,
      dayPct: -0.33,
      metrics: [
        {label: 'Friday', value: '$379.36  −0.33%'},
        {label: 'YTD (quote chip)', value: '+13.15%'},
      ],
      copy: {
        headline: 'Excellent. Mega-caps still dominate, so the top looks like VOO.',
        body: 'Yahoo top 10 is 33.22% (NVDA 6.40%, AAPL 6.29%). Do not sell. The overlap with VOO is the issue — not the fund quality.',
      },
    },
    {
      ticker: 'VUG',
      chapterTitle: 'VUG · growth sleeve still lagging the index',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      price: 88.54,
      dayPct: -0.4,
      returns: {
        headline: 'The growth label is not beating the S&P this year — and you already own the individual winners.',
        bars: [
          {label: 'VUG YTD', pct: vugYtd, tone: 'watch' as const},
          {label: 'S&P YTD', pct: spxYtdPct, tone: 'long' as const},
          {label: 'MGK YTD', pct: mgkYtd, tone: 'muted' as const},
        ],
        note: 'Yahoo YTD daily total return 9.58% as of Aug 27. Top 10 is 63.59% of assets. HOLD existing. No priority add.',
      },
    },
    {
      ticker: 'MGK',
      chapterTitle: 'MGK · same issue, even more concentrated',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      price: 90.12,
      dayPct: -0.4,
      metrics: [
        {label: 'Friday', value: '$90.12  −0.40%'},
        {label: 'YTD daily TR', value: '+9.81%'},
        {label: 'Top 10', value: '67.00% of assets'},
      ],
      copy: {
        body: 'Weaker than the S&P YTD. You already own NVDA and AAPL directly (13.53% and 13.20% of MGK). HOLD. Stop feeding it. Not a sell call — tax and account weights are still unknown.',
      },
    },
    {
      ticker: 'GDV',
      chapterTitle: 'GDV · a different job',
      rating: 'HOLD · INCOME / DIVERSIFIER',
      tone: 'long' as const,
      price: 30.3,
      dayPct: -0.1,
      metrics: [
        {label: 'Market', value: '$30.30'},
        {label: 'Fwd yield', value: '5.94%'},
        {label: 'YTD trailing', value: '+13.72%'},
        {label: 'NAV / discount', value: 'n/a this sitting'},
      ],
      copy: {
        body: 'Closed-end income. Yahoo trailing YTD +13.72% vs S&P +12.65% as of Aug 28. Forward dividend $1.80 (5.94%). When growth is punched, this sleeve is supposed to look different. Not a growth engine. Not “Next NVDA.” NAV and discount were not on the quote page.',
      },
    },
  ],
  nextNvda: [],
  unknowns: [
    {
      id: 'weights',
      area: 'book' as const,
      question: 'What is each line’s weight in the book?',
      whyItMatters: 'Concentration stays a line-count until weights exist. We cannot size how much mega-cap.',
      neededToKnow: 'Sourced account weights. Do not estimate from prices.',
      status: 'unknown' as const,
    },
    {
      id: 'gdv-nav',
      area: 'name' as const,
      ticker: 'GDV',
      question: 'What is GDV’s latest NAV and discount?',
      whyItMatters: 'Market $30.30 is not NAV. The diversifier case uses the discount.',
      neededToKnow: 'Gabelli / CEF page NAV print. Yahoo quote did not show it.',
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
      whyItMatters: 'No 0–100 exists in the IR or the quote. A decorative score would be a lie.',
      neededToKnow: 'A named formula and inputs — or omit the score field.',
      status: 'unknown' as const,
    },
    {
      id: 'monday-asia',
      area: 'GLOBAL' as const,
      question: 'Where did Asia actually open Sunday night / Monday morning?',
      whyItMatters: 'This tape is Friday cash. A Sunday show cannot pretend Monday Asia has printed.',
      neededToKnow: 'Monday index-page prints after those sessions open.',
      status: 'unknown' as const,
    },
  ],
  scenarios: [],
  capitalPlan: {
    existingPortfolio: 'HOLD — sell nothing on a closed Sunday.',
    freshCapital: 'No Sunday ticket. New core money still simplifies into VOO when cash is open. Do not add NVDA or AAPL because Friday moved.',
    bestAdd: 'VOO',
    highestUpsideWatch: 'none named',
    biggestRisk: 'Mega-cap overlap plus a 4.72% 10-year after Warsh. Nvidia is the loudest line, not a new name.',
    nextTrigger: 'Monday Aug 31 open, then Friday Sep 4 Employment Situation',
    ifThen: [
      {
        tone: 'long' as const,
        if: 'Monday is quiet and the $108B / 74% guide still stands',
        then: 'HOLD. Fresh core → VOO.',
      },
      {
        tone: 'watch' as const,
        if: 'Nvidia fades again with no new filing',
        then: 'HOLD. Do not invent a dip-buy.',
      },
      {
        tone: 'caution' as const,
        if: 'A new IR/SEC item cuts the guide or the margin path',
        then: 'Do not automatically add. Re-read the filing.',
      },
      {
        tone: 'short' as const,
        if: 'Demand language breaks and the name gaps ~10%+ from Friday $217.55',
        then: 'Consider reducing — Evens decides.',
      },
    ],
  },
  risks: [
    {
      n: '01',
      title: 'Growth-factor concentration',
      body: 'NVDA + AAPL + MGK + VUG + VOO + VTI repeatedly own the same mega-cap ecosystem. Vanguard top-10 weights confirm it.',
    },
    {
      n: '02',
      title: 'Interest rates',
      body: `The 10-year closed Friday at ${tenYear}% (^TNX +1.03% on the day) after Warsh. High long rates compress the exact overweight.`,
    },
    {
      n: '03',
      title: 'Guide vs margin',
      body: 'NVIDIA guided $108.0B ±2% at 74.0% ±50 bps with no China DC compute. Friday sold that mix. That sits under NVDA and most of the indirect book.',
    },
  ],
  close: {
    kicker: 'SUNDAY',
    headline: 'The Nvidia report already happened. The book did not change.',
    body: 'Friday cash: S&P 7,711.76 −0.25%, Nvidia $217.55 −4.57%, Apple $319.70 +1.63%, TSX 36,553.92 −0.76%, 10-year 4.72%. Sell nothing. Add nothing until cash is open. Watch Monday, then Sep 4 jobs.',
    pills: [
      {tone: 'watch' as const, label: 'HOLD SUNDAY'},
      {tone: 'caution' as const, label: 'NO DIP-BUY'},
      {tone: 'long' as const, label: 'CORE = VOO'},
    ],
    followThrough: [
      {
        tone: 'watch' as const,
        if: 'Monday confirms Friday’s Nvidia fade with no new filing',
        then: 'Keep HOLD. Do not invent a scout name.',
      },
      {
        tone: 'caution' as const,
        if: 'Sep 4 jobs or a new IR item weakens the growth tape',
        then: 'More VOO / cash / the GDV job — still not a trade ticket.',
      },
      {
        tone: 'long' as const,
        if: 'Evens or a filing names an asymmetric ticker not in the book',
        then: 'That is when the Next-NVDA sleeve gets a name.',
      },
    ],
  },
  tickerTape: [
    `SUNDAY  CASH CLOSED`,
    `SPX  7,711.76  −0.25%`,
    `SPX YTD  +${spxYtdPct}%`,
    `NASDAQ  −${Math.abs(nasdaqDayPct)}%`,
    `NVDA  $${nvdaClose.toFixed(2)}  −4.57%`,
    `AAPL  $${aaplClose.toFixed(2)}  +1.63%`,
    `10Y  ${tenYear}%`,
    `TSX  36,553.92  −0.76%`,
    `CADUSD  0.7194`,
    `Q3 GUIDE  $108B  GM 74%`,
    `VOO CORE / ADD`,
    `NEXT-NVDA  NONE NAMED`,
  ],
};

export const episode: DailyReport = parseDailyReport(raw);
