import {vsSpxSpread} from '../compute';
import {parseDailyReport, type DailyReport} from '../schema';

/** Tuesday 2026-09-01 cash. Wednesday 2026-09-02 America/Toronto is pre-open / pre-BoC at write. */
const nvdaClose = 217.44;
const nvdaDayPct = -1.39;
const nvdaYtd = 16.73;
const nvdaSpxYtd = 11.48;
const nvdaBeta = 2.21;
const aaplClose = 325.13;
const aaplDayPct = 2.61;
const aaplYtd = 19.92;
const aaplSpxYtd = 11.48;
const vooYtd = 13.09;
const vtiYtd = 13.48;
const vugYtd = 8.77;
const mgkYtd = 9.1;
const gdvYtd = 12.29;
const spxClose = 7631.47;
const spxDayPct = -0.71;
const spxYtdPct = 11.48;
const nasdaqClose = 26099.77;
const nasdaqDayPct = -1.03;
const tenYear = 4.8;
const tsxClose = 35825.73;
const tsxDayPct = -1.23;

const raw = {
  meta: {
    date: '2026-09-02',
    dateLabel: 'SEP 02, 2026',
    title: 'Daily Wealth Intelligence',
    thesis:
      'JOLTS was little changed. Tuesday sold growth on oil and a 4.80% 10-year. The book is still the same U.S. mega-cap stack. AAPL bounced on Ternus day one. NVDA did not.',
    thesisLead: 'JOLTS is in.',
    thesisAccent: 'The book is still concentrated.',
    catalyst: 'Bank of Canada 09:45 ET this morning. Last official hold is 2.25% (July 15). Today’s print is not out at write.',
    kicker: 'Wednesday open · Tuesday cash',
    universe: ['AAPL', 'NVDA', 'VOO', 'VTI', 'VUG', 'MGK', 'GDV'],
  },
  market: {
    spxClose,
    spxDayPct,
    spxYtdPct,
    nasdaqDayPct,
    tenYearYield: tenYear,
    note: 'Tuesday cash: S&P 7,631.47 (−0.71%). Nasdaq 26,099.77 (−1.03%). 10-year ~4.80% (TNX previous close 4.796; AP 4.79%). Oil closed above $90. Wednesday pre-market is not a close.',
    nextCalendar: {
      label: 'BoC 09:45 ET · jobs Fri',
      detail: 'Bank of Canada rate today 09:45 ET. Employment Situation (August) Fri Sep 4 8:30 ET. Apple event Wed Sep 9.',
    },
  },
  markets: {
    global: {
      indices: [
        {label: 'Nikkei 225', value: '64,325.64', dayPct: -2.85, note: 'Yahoo related-list, this sitting'},
        {label: 'Hang Seng', value: '25,311.21', dayPct: -0.07},
        {label: 'Shanghai Composite', value: '3,941.39', dayPct: -0.97},
        {label: 'DAX', value: '25,860.83', dayPct: -0.42, note: 'Wednesday morning live on the related list — not a Europe close'},
        {label: 'FTSE 100', value: '10,756.32', dayPct: -0.31, note: 'Wednesday morning live'},
        {label: 'CAC 40', value: '8,294.16', dayPct: -0.09, note: 'Wednesday morning live'},
        {label: 'EURO STOXX 50', value: '6,363.52', dayPct: -0.09, note: 'Wednesday morning live'},
        {label: 'S&P/ASX 200', value: '8,978.40', dayPct: -0.97},
        {label: 'KOSPI', value: '6,562.72', dayPct: -3.99},
        {label: 'Taiwan TAIEX', value: '46,164.72', dayPct: -1.67},
      ],
      commodities: [
        {
          label: 'WTI crude (CL=F)',
          note: 'AP: U.S. oil closed above $90 Tuesday. Yahoo live ~$89.89 (−0.37%) at 8:52 AM EDT Wednesday — not a Tuesday settlement.',
        },
      ],
      fx: [{label: 'CAD/USD', value: '0.7185', dayPct: -0.12, note: 'Yahoo live 14:03 GMT+1 Wednesday. Tuesday previous close 0.7194.'}],
      rates: [{label: 'U.S. 10-year (Tue cash)', value: `${tenYear}%`}],
      note: 'World prints from the Yahoo TSX / TNX related-index list this sitting. Europe rows are morning live. Asia rows are the same list.',
    },
    us: {
      indices: [
        {
          label: 'S&P 500',
          value: spxClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: spxDayPct,
        },
        {
          label: 'Nasdaq',
          value: nasdaqClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: nasdaqDayPct,
        },
        {label: 'Dow', value: '52,766.88', dayPct: -0.79},
        {label: 'Russell 2000', value: '2,920.13', dayPct: -1.23},
      ],
      sectors: [
        {
          label: 'Energy vs mega-cap growth',
          note: 'AP: oil + yields hit stocks. Swingfolio: AAPL +2.61% was the exception among the largest tech names; NVDA −1.39%, AMZN −1.87%.',
        },
      ],
      yields: [
        {label: 'U.S. 10-year', value: `${tenYear}%`, note: 'TNX previous close 4.796. AP 4.79%.'},
        {label: 'VIX (Tue, Swingfolio)', value: '16.34', dayPct: 9.52, note: 'Yahoo related-list live 16.21 (−0.80%) Wednesday morning — not used as the close.'},
      ],
      note: 'AP Tuesday close. S&P YTD +11.48% (Yahoo trailing as of Sep 1; AP +11.5%). Nasdaq YTD +12.3% (AP). JOLTS (July): openings little changed at 7.3 million (BLS USDL-26-1432; table 7,271k). June revised down 177k to 7.2 million.',
    },
    ca: {
      indices: [
        {
          label: 'S&P/TSX Composite',
          value: tsxClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: tsxDayPct,
        },
        {label: 'S&P/TSX Venture', value: '956.66', dayPct: -2.63},
      ],
      cadUsd:
        '0.7185 live Wednesday 14:03 GMT+1 (Yahoo CADUSD=X, −0.12%). Tuesday previous close 0.7194. Not a Wednesday TSX close.',
      note: 'TSX Tuesday cash 35,825.73 (−1.23%). Venture 956.66 (−2.63%). BoC last official overnight target 2.25% on July 15. Sep 2 09:45 ET is not printed at write.',
    },
    calendar: {
      items: [
        {
          when: 'Wed Sep 2 · 09:45 ET',
          where: 'CA' as const,
          label: 'Bank of Canada rate',
          why: 'Official 2026 announcement calendar. Overnight target last held at 2.25% on July 15. This morning’s decision is not out at write (~09:01 ET).',
        },
        {
          when: 'Fri Sep 4 · 8:30 ET',
          where: 'US' as const,
          label: 'Employment Situation (August)',
          why: 'BLS September schedule. Next U.S. jobs print after Tuesday JOLTS.',
        },
        {
          when: 'Mon Sep 7',
          where: 'US' as const,
          label: 'Labor Day',
          why: 'U.S. markets closed.',
        },
        {
          when: 'Wed Sep 9',
          where: 'US' as const,
          label: 'Apple event',
          why: 'CNBC / AFP: first public week for CEO John Ternus. Cook is executive chairman.',
        },
        {
          when: 'Tue Sep 29 · 10:00 ET',
          where: 'US' as const,
          label: 'JOLTS (August)',
          why: 'BLS USDL-26-1432 next release date.',
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
      role: 'Largest event already printed',
      whatMatters: 'Q2 $96.2B / Q3 guide $108.0B ±2%, no China DC compute. Tuesday cash −1.39%.',
      ytd: nvdaYtd,
      overlapWith: ['AAPL', 'VUG', 'MGK', 'VOO', 'VTI'],
    },
    {
      ticker: 'AAPL',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Recent purchase',
      whatMatters: 'Tuesday +2.61% on Ternus day one. Still beating the S&P YTD. Do not add into the bounce.',
      ytd: aaplYtd,
    },
    {
      ticker: 'VOO',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      role: 'Best simple core',
      whatMatters: 'Tracks the S&P. New core money still simplifies here.',
      ytd: vooYtd,
    },
    {
      ticker: 'VTI',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Broad US',
      whatMatters: 'Excellent fund. Top 10 is still NVDA + AAPL + the same mega-caps (Yahoo holdings).',
      ytd: vtiYtd,
      overlapWith: ['VOO', 'NVDA', 'AAPL'],
    },
    {
      ticker: 'VUG',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Growth sleeve',
      whatMatters: 'Growth label, still lagging the S&P YTD. NVDA + AAPL are ~25% of the fund (Yahoo).',
      ytd: vugYtd,
      overlapWith: ['NVDA', 'AAPL', 'VOO', 'MGK'],
    },
    {
      ticker: 'MGK',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Mega-cap growth',
      whatMatters: 'Same mega-cap stack, even tighter.',
      ytd: mgkYtd,
      overlapWith: ['NVDA', 'AAPL', 'VUG', 'VOO'],
    },
    {
      ticker: 'GDV',
      rating: 'HOLD — income / diversifier',
      tone: 'long' as const,
      role: 'Income sleeve',
      whatMatters: 'Different job. Forward distribution ~6.02%. Not a growth engine.',
      ytd: gdvYtd,
    },
  ],
  portfolio: {
    concentrationThesis: 'VOO + VTI + VUG + MGK + AAPL + NVDA still buy the same companies.',
    concentrationBody:
      'Tuesday showed the split: AAPL bounced, NVDA and the growth sleeves did not. Several Wealthsimple lines still move together when oil and the 10-year jump.',
    factorStack: ['NVDA', 'AAPL', 'MGK', 'VUG', 'VOO', 'VTI'],
    factorLabel: 'U.S. mega-cap / growth',
    overlapNote: 'same ecosystem',
  },
  names: [
    {
      ticker: 'NVDA',
      chapterTitle: 'NVDA · the print is in. Tuesday faded it again.',
      rating: 'HOLD — POST-PRINT WATCH',
      tone: 'watch' as const,
      price: nvdaClose,
      dayPct: nvdaDayPct,
      holdNote: 'No add into BoC / Friday jobs / a 4.80% 10-year. Wednesday pre-market ~$217.88 (+0.20%) is not a close.',
      streak: [-2.91, 2.19, -1.59, 8.74, -4.58, 1.48, -1.39],
      streakHeadline: 'Seven sessions around the print. Four red. One huge green day. Then a fade, a bounce, another fade.',
      streakNote:
        'Yahoo daily closes Aug 24–Sep 1: −2.91, +2.19, −1.59, +8.74 (Aug 27, first cash after the Aug 26 report), −4.58, +1.48, −1.39. Momentum formula counts red days only.',
      fundamentals: [
        {label: 'Market cap', value: '$5.251T'},
        {label: 'Q2 FY27 revenue', value: '$96.2B  +18% q/q  +106% y/y'},
        {label: 'Q2 data center', value: '$89.0B  +117% y/y'},
        {label: 'Q2 gross margin', value: '75.0% GAAP and non-GAAP'},
        {label: 'Q2 EPS', value: '$2.46 GAAP  /  $2.22 non-GAAP'},
        {label: 'Q3 revenue guide', value: '$108.0B ±2%  ·  no China DC compute'},
        {label: 'Q3 GM guide', value: '74.0% ±50 bps'},
        {label: 'TTM revenue / NI / EPS', value: '$303.0B  /  $192.9B  /  $7.91'},
        {label: 'P/E (TTM)  ·  Beta', value: `27.49×  ·  ${nvdaBeta}`},
      ],
      vsSpx: {
        headline: 'Still ahead of the S&P YTD — with a 2.2 beta and another red session.',
        bars: [
          {label: 'NVDA YTD', pct: nvdaYtd, tone: 'nvda' as const},
          {label: 'S&P YTD', pct: nvdaSpxYtd, tone: 'muted' as const},
        ],
        note: `Spread: ${vsSpxSpread(nvdaYtd, nvdaSpxYtd) >= 0 ? '+' : ''}${vsSpxSpread(nvdaYtd, nvdaSpxYtd).toFixed(2)} points (NVDA YTD − S&P YTD). Yahoo trailing as of Sep 1. Beta: ${nvdaBeta}.`,
      },
      consensus: {
        rows: [
          {label: 'Q2 revenue (printed)', value: '$96.2B'},
          {label: 'Q3 revenue guide', value: '$108.0B ±2%'},
          {label: 'Q3 GM guide', value: '74.0% ±50 bps'},
          {label: 'China DC compute in guide', value: 'none assumed'},
          {label: 'Next earnings date', value: 'Nov 17, 2026 (Yahoo)'},
          {label: 'Street whisper', value: 'UNKNOWN'},
        ],
        note: 'NVIDIA IR Aug 26. Guide band is the company’s ±2%. No sourced whisper — do not draw a zone.',
        range: {metric: 'Q3 revenue guide', unit: 'B', guide: 108.0, low: 105.84, high: 110.16},
      },
      narrative: {
        leftTitle: 'THE FEAR',
        leftHeadline: 'Cash keeps fading a large print. Oil and the 10-year are not helping.',
        leftBody:
          'Aug 27 close $227.98 after the report. Aug 28 $217.55 (−4.58%). Aug 31 $220.78 (+1.48%). Sep 1 $217.44 (−1.39%). Guide assumes zero China data-center compute. Gross-margin guide 74.0% is below the 75.0% print.',
        rightTitle: 'THE COUNTER',
        rightHeadline: 'The company printed $96.2B and pointed at $108B.',
        rightBody:
          'Data center $89.0B. Sequential revenue +18%. Next report is mid-November. The debate is still whether customers keep spending — not whether last quarter happened.',
      },
      interpretation: {
        chips: [
          {label: 'CONFIRMED', tone: 'long' as const, text: 'Q2 revenue $96.2B. Data center $89.0B. Guide $108.0B ±2%.'},
          {
            label: 'CONFIRMED',
            tone: 'watch' as const,
            text: 'Outlook excludes China data-center compute. Q3 margin guide 74.0% ±50 bps.',
          },
          {
            label: 'INFERENCE',
            tone: 'caution' as const,
            text: 'A 2.2-beta name plus a 4.80% 10-year and $90 oil is not a quiet sleeve.',
          },
        ],
        note: 'No composite score. Formulas: red-day count from the seven-print streak. Whisper UNKNOWN.',
      },
      actionMatrix: {
        headline: 'This morning: HOLD. Do not add into BoC.',
        rows: [
          {
            tone: 'watch' as const,
            if: 'BoC / Friday jobs keep the 10-year bid and NVDA stays choppy',
            then: 'HOLD. Fresh core money still goes to VOO.',
          },
          {
            tone: 'long' as const,
            if: 'Labor prints stay cool and the 10-year backs off with the $108B guide intact',
            then: 'Still HOLD first. Adding is a later sitting, not a pre-data click.',
          },
          {
            tone: 'caution' as const,
            if: 'Guide quality gets questioned or China-exclusion risk widens',
            then: 'Do not automatically buy the dip.',
          },
          {
            tone: 'short' as const,
            if: 'Demand talk turns into a cut and the name drops hard again',
            then: 'Consider reducing. That is not this morning’s tape.',
          },
        ],
      },
      network: {
        title: 'NVDA · after the Aug 26 print',
        headline: 'Nodes from the IR release. Equal size. No fake weights.',
        nodes: [
          {id: 'print', label: 'Q2 $96.2B', polarity: 'confirmed' as const, x: 0.08, y: 0.22, evidence: '+106% y/y'},
          {id: 'dc', label: 'Data center $89.0B', polarity: 'confirmed' as const, x: 0.3, y: 0.22, evidence: '+117% y/y'},
          {id: 'guide', label: 'Q3 guide $108B', polarity: 'confirmed' as const, x: 0.52, y: 0.22, evidence: '±2%'},
          {id: 'china', label: 'China DC compute', polarity: 'concern' as const, x: 0.3, y: 0.78, evidence: 'none in outlook'},
          {id: 'nvda', label: 'NVDA', polarity: 'neutral' as const, x: 0.62, y: 0.5},
          {id: 'gm', label: 'GM 75% → 74% guide', polarity: 'inference' as const, x: 0.82, y: 0.22},
          {id: 'rates', label: '10-year 4.80%', polarity: 'concern' as const, x: 0.82, y: 0.5, evidence: 'Tue cash'},
          {id: 'oil', label: 'Oil above $90', polarity: 'concern' as const, x: 0.82, y: 0.82, evidence: 'AP Tuesday'},
        ],
        edges: [
          {from: 'print', to: 'dc'},
          {from: 'dc', to: 'guide'},
          {from: 'guide', to: 'nvda'},
          {from: 'china', to: 'guide', label: 'excluded'},
          {from: 'nvda', to: 'gm'},
          {from: 'nvda', to: 'rates'},
          {from: 'rates', to: 'oil'},
        ],
      },
    },
    {
      ticker: 'AAPL',
      chapterTitle: 'AAPL · Ternus day one. Still the recent purchase.',
      rating: 'HOLD',
      tone: 'long' as const,
      price: aaplClose,
      dayPct: aaplDayPct,
      holdNote: 'Do not add into Tuesday’s bounce. You just bought it. Next contribution should diversify.',
      returns: {
        headline: 'Beating the S&P YTD. Tuesday was the exception among large tech.',
        bars: [
          {label: 'YTD', pct: aaplYtd, tone: 'long' as const},
          {label: 'S&P YTD', pct: aaplSpxYtd, tone: 'muted' as const},
          {label: '1 year', pct: 40.58, tone: 'gold' as const},
        ],
        panelTitle: 'CEO + NEXT EVENT',
        panelBody: 'John Ternus day one (Sep 1). Cook is executive chairman. Apple event Sep 9. Next earnings Oct 29 (Yahoo).',
        note: `Spread vs S&P YTD: ${vsSpxSpread(aaplYtd, aaplSpxYtd) >= 0 ? '+' : ''}${vsSpxSpread(aaplYtd, aaplSpxYtd).toFixed(2)} points. Yahoo trailing as of Sep 1. 1-year +40.58%.`,
      },
      catalyst: {
        headline: 'Ternus took over as CEO on Sep 1. Cook stays as executive chairman.',
        steps: [
          'April announcement named the handover date',
          'Tuesday was day one',
          'Sep 9 event is the first public week',
          'AI / hardware story is still unproven in the quarter',
        ],
        note: 'CNBC / AFP / Motley Fool Sep 1. Apple.com newsroom body was not readable this sitting. Not a new buy signal.',
      },
      action: {
        headline: 'HOLD the position.',
        body: 'Tuesday close $325.13 (+2.61%). Do not double the same name with the next C$ contribution.',
      },
    },
    {
      ticker: 'VOO',
      chapterTitle: 'VOO · the foundation is not the problem',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      metrics: [
        {label: 'Tuesday close', value: '$700.28  −0.65%'},
        {label: 'YTD', value: '+13.09%'},
      ],
      copy: {
        headline: 'Best simple core. New core money simplifies here.',
        body: 'Tuesday moved with the S&P. Do not sell. Stop splitting every future contribution with VTI.',
      },
    },
    {
      ticker: 'VTI',
      chapterTitle: 'VTI · excellent, overlapping',
      rating: 'HOLD',
      tone: 'long' as const,
      metrics: [
        {label: 'Tuesday close', value: '$375.17  −0.79%'},
        {label: 'YTD', value: '+13.48%'},
        {label: 'Top line', value: 'NVDA 6.40% · AAPL 6.29% (Yahoo)'},
      ],
      copy: {
        headline: 'Excellent. Mega-caps still dominate, so the top looks like VOO.',
        body: 'Do not sell. The overlap with VOO is the issue — not the fund quality.',
      },
    },
    {
      ticker: 'VUG',
      chapterTitle: 'VUG · growth label, still behind the index',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      returns: {
        headline: 'You already own the individual winners. This sleeve is not the add.',
        bars: [
          {label: 'VUG YTD', pct: vugYtd, tone: 'watch' as const},
          {label: 'S&P YTD', pct: spxYtdPct, tone: 'long' as const},
          {label: 'VUG 1-year', pct: 15.94, tone: 'muted' as const},
        ],
        note: 'Yahoo YTD Daily Total Return +8.77% / 1-year +15.94% as of Aug 31. Tuesday close $87.37 (−0.99%). HOLD existing. No priority additions.',
      },
    },
    {
      ticker: 'MGK',
      chapterTitle: 'MGK · same issue, tighter mega-cap',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      metrics: [
        {label: 'Tuesday close', value: '$89.04  −0.96%'},
        {label: 'YTD', value: '+9.10%'},
      ],
      copy: {
        body: 'Weaker than the broad market this year. You already own NVDA and AAPL directly. HOLD. Stop feeding it. Not a sell call — tax and account weights are not on this tape.',
      },
    },
    {
      ticker: 'GDV',
      chapterTitle: 'GDV · a completely different job',
      rating: 'HOLD · INCOME / DIVERSIFIER',
      tone: 'long' as const,
      metrics: [
        {label: 'Market', value: '$29.92  −0.80%'},
        {label: 'YTD', value: '+12.29%'},
        {label: 'Fwd dist.', value: '~6.02%'},
      ],
      copy: {
        body: 'Closed-end income/value. Tuesday market $29.92. Fresh NAV / discount not read this sitting. When AI/growth gets punched, this sleeve is supposed to look different. Not “Next NVDA.”',
      },
    },
  ],
  nextNvda: [],
  unknowns: [
    {
      id: 'boc-print',
      area: 'CA' as const,
      question: 'What did the Bank of Canada actually do at 09:45 ET?',
      whyItMatters: 'C$ contributions and CAD-USD sit under this print. Last official target is 2.25% (July 15). A guess is not a print.',
      neededToKnow: 'The Bank of Canada Sep 2 press release after 09:45 ET.',
      status: 'unknown' as const,
    },
    {
      id: 'weights',
      area: 'book' as const,
      question: 'What is each line’s weight in the book?',
      whyItMatters: 'Concentration stays a line-count until weights exist. We cannot size how much mega-cap.',
      neededToKnow: 'Sourced account weights. Do not estimate from prices.',
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
      id: 'nvda-whisper',
      area: 'name' as const,
      ticker: 'NVDA',
      question: 'Is there a sourced street whisper above the $108.0B ±2% guide?',
      whyItMatters: 'Expectation-risk stays UNKNOWN without a whisper. The board will not draw a fake zone.',
      neededToKnow: 'A named street / whisper figure — not an LLM guess.',
      status: 'unknown' as const,
    },
    {
      id: 'gdv-nav',
      area: 'name' as const,
      ticker: 'GDV',
      question: 'What is the current GDV NAV and discount?',
      whyItMatters: 'Market $29.92 is not NAV. The Aug 25 tape had a July 31 NAV snapshot that is now stale.',
      neededToKnow: 'A dated CEF NAV / discount from the fund page or a quote that prints NAV.',
      status: 'unknown' as const,
    },
  ],
  scenarios: [],
  capitalPlan: {
    existingPortfolio: 'HOLD — sell nothing this morning.',
    freshCapital: 'No add into BoC or Friday jobs. New core money simplifies into VOO.',
    bestAdd: 'VOO',
    highestUpsideWatch: 'none named',
    biggestRisk: 'Mega-cap growth overlap across NVDA, AAPL, MGK, VUG, VOO, VTI — now plus $90 oil and a 4.80% 10-year',
    nextTrigger: 'Wednesday — Bank of Canada 09:45 ET. Friday — Employment Situation.',
    ifThen: [
      {
        tone: 'watch' as const,
        if: 'BoC holds and Friday jobs keep the 10-year bid',
        then: 'HOLD. Fresh core money still goes to VOO.',
      },
      {
        tone: 'long' as const,
        if: 'Yields back off and the $108B NVDA guide stays intact',
        then: 'Still HOLD first. Adding is a later sitting.',
      },
      {
        tone: 'caution' as const,
        if: 'Oil stays bid and the 10-year holds 4.80%+',
        then: 'Do not chase NVDA or double AAPL into the Ternus bounce.',
      },
      {
        tone: 'short' as const,
        if: 'Demand talk turns into a cut and NVDA drops hard again',
        then: 'Consider reducing. That is not this morning’s tape.',
      },
    ],
  },
  risks: [
    {
      n: '01',
      title: 'Growth-factor concentration',
      body: 'NVDA + AAPL + MGK + VUG + VOO + VTI repeatedly own the same mega-cap ecosystem. VUG’s top two lines are NVDA and AAPL.',
    },
    {
      n: '02',
      title: 'Interest rates and oil',
      body: 'The 10-year is around 4.80%. AP: U.S. oil closed above $90 Tuesday. That combination compresses long-duration growth — the exact overweight.',
    },
    {
      n: '03',
      title: 'AI ROI + China exclusion',
      body: 'NVDA’s $108B guide assumes zero China data-center compute. The debate is still whether profits justify the infrastructure bill.',
    },
  ],
  close: {
    kicker: 'DIAGNOSTIC',
    headline: 'JOLTS did not change the book. Oil and the 10-year did the damage.',
    body: 'Openings were little changed at 7.3 million. Tuesday sold growth anyway. After BoC and Friday jobs: numbers first, then a BUY / HOLD / REDUCE for the next C$ contribution. Do not trade this sitting.',
    pills: [
      {tone: 'watch' as const, label: 'HOLD THIS MORNING'},
      {tone: 'caution' as const, label: 'NO ADD INTO BOC'},
      {tone: 'long' as const, label: 'CORE MONEY → VOO'},
    ],
    followThrough: [
      {
        tone: 'watch' as const,
        if: 'NVDA confirms demand but the stock is unattractive',
        then: 'Look downstream / upstream for better risk-reward. No name is sourced yet.',
      },
      {
        tone: 'caution' as const,
        if: 'Oil and the 10-year stay bid',
        then: 'More VOO / cash / non-AI quality. Do not chase AAPL’s bounce.',
      },
      {
        tone: 'long' as const,
        if: 'An asymmetric candidate lines up',
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
    `TSX  ${tsxClose.toLocaleString('en-US')}  ${tsxDayPct}%`,
    `JOLTS JUL  7.3M LITTLE CHANGED`,
    `BOC  09:45 ET  NOT PRINTED`,
    `VOO CORE / ADD`,
    `SELL NOTHING THIS MORNING`,
  ],
};

export const episode: DailyReport = parseDailyReport(raw);
