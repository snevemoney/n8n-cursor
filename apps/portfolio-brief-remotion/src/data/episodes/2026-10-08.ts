import {vsSpxSpread} from '../compute';
import {parseDailyReport, type DailyReport} from '../schema';

const nvdaYtd = 27.63;
const nvdaSpxYtd = 13.97;
const aaplYtd = 24.18;
const aaplSpxYtd = 13.97;
const nvdaClose = 237.47;
const nvdaDayPct = -0.74;
const nvdaBeta = 2.22;
const aaplClose = 336.67;
const aaplDayPct = 0.91;
const spxClose = 7801.77;
const spxDayPct = -0.22;
const spxYtdPct = 13.97;
const nasdaqClose = 27538.69;
const nasdaqDayPct = -0.22;
const tenYear = 5.28;
const vooYtd = 15.2;
const vtiYtd = 15.08;
const vugYtd = 13.59;
const mgkYtd = 14.89;
const gdvYtd = 6.69;

const raw = {
  meta: {
    date: '2026-10-08',
    dateLabel: 'OCT 8, 2026',
    title: 'Daily Wealth Intelligence',
    thesis:
      'The record streak ended. The 10-year printed 5.365% — highest since 2002 — and official CMT is 5.28%. The book is the same seven lines. Still one U.S. mega-cap growth bet, now against a higher long rate.',
    thesisLead: 'The record streak ended.',
    thesisAccent: 'The 10-year is the story.',
    catalyst: 'Today: $22B 30-year auction + jobless claims. Next named: CPI Oct 14, FOMC Oct 27–28, Nvidia Nov 17.',
    kicker: 'Last US / CA cash is Wednesday. This 9:00 wake is before the US open.',
    universe: ['AAPL', 'NVDA', 'VOO', 'VTI', 'VUG', 'MGK', 'GDV'],
  },
  market: {
    spxClose,
    spxDayPct,
    spxYtdPct,
    nasdaqDayPct,
    tenYearYield: tenYear,
    note: 'Wednesday US cash: S&P and Nasdaq slipped 0.22% from Tuesday’s records. Official 10-year CMT 5.28% after a 5.365% session high. US cash not open yet at this wake.',
    nextCalendar: {
      label: '30-year auction today · CPI Oct 14 · FOMC Oct 27–28 · NVDA Nov 17',
      detail: 'Treasury sells $22B of 30-year bonds today. BLS CPI 8:30 ET Oct 14. Nvidia Q3 call named on the August 26 IR call.',
    },
  },
  markets: {
    global: {
      indices: [
        {label: 'Nikkei 225', value: '69,042.11', dayPct: -1.42, note: 'JIJI close Oct 8'},
        {label: 'TOPIX', value: '4,091.46', dayPct: -1.51, note: 'JIJI close Oct 8'},
        {label: 'Hang Seng', value: '23,785.79', dayPct: -1.4, note: 'Oct 8 close (wire recap)'},
        {label: 'Shanghai Composite', value: '3,811.90', dayPct: -0.8, note: 'Oct 8 close after the Oct 1–7 holiday'},
      ],
      commodities: [
        {label: 'Brent', value: '$105.33', dayPct: 5.1, note: 'Intraday ~1115 GMT Oct 8 — not a settle'},
        {label: 'WTI', value: '$92.74', dayPct: 5.1, note: 'Intraday ~1115 GMT Oct 8 — not a settle'},
      ],
      note: 'Tokyo, Hong Kong, and Shanghai are closed for Thursday. Europe is still open — no Europe close. Oil is a morning print, not Wednesday’s settle.',
    },
    us: {
      indices: [
        {
          label: 'S&P 500',
          value: spxClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: spxDayPct,
          note: 'Yahoo close Wednesday Oct 7. YTD +13.97%. Tuesday record was 7,818.93.',
        },
        {
          label: 'Nasdaq',
          value: nasdaqClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: nasdaqDayPct,
          note: 'Yahoo close Wednesday Oct 7.',
        },
        {
          label: 'Russell 2000',
          value: '2,793.21',
          dayPct: -1.31,
          note: 'Wednesday close. Small caps took the yield hit harder.',
        },
      ],
      sectors: [
        {label: 'Health care', note: 'Only sector with a meaningful Wednesday gain (wire recap).'},
        {label: 'Industrials / materials / real estate', note: 'Hardest Wednesday losses as long yields rose.'},
      ],
      breadth: 'Nasdaq Wednesday: 1,427 up / 3,251 down (Reuters). Decliners 2.28-to-1.',
      yields: [
        {label: 'U.S. 10-year CMT', value: `${tenYear}%`, note: 'Treasury CSV Oct 7. Session high 5.365% (highest since April 2002).'},
        {label: 'U.S. 2-year', value: '4.77%', note: 'At the stock close Wednesday (wire). Curve steepened.'},
      ],
      note: 'Last completed US cash session is Wednesday. This wake is before 9:30 ET. Fed September minutes: most officials expect another hike by year-end, no date named.',
    },
    ca: {
      indices: [
        {label: 'S&P/TSX Composite', value: '35,041.86', dayPct: -1.7, note: 'TSX daily report Oct 7'},
        {label: 'S&P/TSX 60', value: '2,064.92', dayPct: -1.63, note: 'TSX daily report Oct 7'},
        {label: 'S&P/TSX Venture', value: '877.17', dayPct: -1.45, note: 'TSX daily report Oct 7'},
      ],
      cadUsd: '1 USD = 1.4259 CAD (DJ / Tullett 5 p.m. ET Oct 7)',
      sectors: [
        {label: 'Financials', note: 'Largest Wednesday drag on the TSX composite (TSX daily report).'},
        {label: 'Materials / energy', note: 'Miners and energy also red Wednesday as gold and oil faded into the close.'},
      ],
      note: 'Last completed CA cash session is Wednesday. US/CA cash not open yet at this wake. BoC noon series for Oct 7 unread here.',
    },
    calendar: {
      items: [
        {
          when: 'Thursday Oct 8',
          where: 'US' as const,
          label: '$22B 30-year Treasury auction',
          why: 'Named after Wednesday’s $39B 10-year sale cleared at 5.300%. A weak long-bond sale can keep the 10-year bidless.',
        },
        {
          when: 'Thursday Oct 8',
          where: 'US' as const,
          label: 'Initial jobless claims',
          why: 'Weekly labor print. Not CPI. Do not treat it as the inflation read.',
        },
        {
          when: 'Wednesday Oct 14',
          where: 'US' as const,
          label: 'CPI (September)',
          why: 'BLS schedule: 8:30 AM. Next named inflation print.',
        },
        {
          when: 'Tue–Wed Oct 27–28',
          where: 'US' as const,
          label: 'FOMC meeting',
          why: 'Fed 2026 calendar. Next named policy dates.',
        },
        {
          when: 'Tuesday Nov 17',
          where: 'US' as const,
          label: 'Nvidia Q3 FY27 call',
          why: 'Named on the August 26 IR call. Last IR print is still Q2.',
        },
        {
          when: 'Wednesday Oct 21',
          where: 'GLOBAL' as const,
          label: 'Nvidia GTC Berlin keynote',
          why: 'Named on the August 26 IR call. Not an earnings print.',
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
      rating: 'HOLD — watch',
      tone: 'watch' as const,
      role: 'Highest single-name event risk',
      whatMatters: 'Wednesday −0.74%. Last IR is Aug 26. Next named call Nov 17.',
      ytd: nvdaYtd,
    },
    {
      ticker: 'AAPL',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Second single name',
      whatMatters: 'Wednesday +0.91% while the index slipped. Still beating the S&P YTD. IR date unread here.',
      ytd: aaplYtd,
    },
    {
      ticker: 'VOO',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      role: 'Best simple core',
      whatMatters: 'Best simple core. New core money still simplifies here.',
      ytd: vooYtd,
    },
    {
      ticker: 'VTI',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Broad US',
      whatMatters: 'Excellent fund. Still overlaps VOO at the top.',
      ytd: vtiYtd,
      overlapWith: ['VOO'],
    },
    {
      ticker: 'VUG',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Growth sleeve',
      whatMatters: 'Growth sleeve. Trailing YTD still a touch behind the S&P.',
      ytd: vugYtd,
      overlapWith: ['NVDA', 'AAPL', 'VOO', 'MGK'],
    },
    {
      ticker: 'MGK',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Mega-cap growth',
      whatMatters: 'Same mega-cap stack, tighter. You already own NVDA and AAPL.',
      ytd: mgkYtd,
      overlapWith: ['NVDA', 'AAPL', 'VUG', 'VOO'],
    },
    {
      ticker: 'GDV',
      rating: 'HOLD — income / diversifier',
      tone: 'long' as const,
      role: 'Income sleeve',
      whatMatters: 'Different job. Market −0.63% Wednesday. Gabelli NAV $32.47 / discount −12.87%.',
      ytd: gdvYtd,
    },
  ],
  portfolio: {
    concentrationThesis: 'VOO + VTI + VUG + MGK + AAPL + NVDA still buy the same U.S. mega-cap growth names.',
    concentrationBody:
      'Wednesday’s yield spike is the test of that stack. When mega-cap growth gets hit, several Wealthsimple lines can go red together. Weights are still unknown.',
    factorStack: ['NVDA', 'AAPL', 'MGK', 'VUG', 'VOO', 'VTI'],
    factorLabel: 'U.S. mega-cap / growth',
    overlapNote: 'same ecosystem',
  },
  names: [
    {
      ticker: 'NVDA',
      chapterTitle: 'NVDA · last IR is still August 26',
      rating: 'HOLD — WATCH',
      tone: 'watch' as const,
      price: nvdaClose,
      dayPct: nvdaDayPct,
      holdNote: 'No add off a yield spike. Next named call is November 17.',
      fundamentals: [
        {label: 'Market cap', value: '$5.73T'},
        {label: 'TTM revenue', value: '$303.0B'},
        {label: 'TTM net income', value: '$192.9B'},
        {label: 'TTM EPS', value: '$7.91'},
        {label: 'P/E (TTM)', value: '30.0×'},
        {label: 'Beta', value: String(nvdaBeta)},
      ],
      vsSpx: {
        headline: 'YTD spread is real. A 5.28% 10-year is the cost of that extra return.',
        bars: [
          {label: 'NVDA YTD', pct: nvdaYtd, tone: 'nvda' as const},
          {label: 'S&P YTD', pct: nvdaSpxYtd, tone: 'muted' as const},
        ],
        note: `Spread: ${vsSpxSpread(nvdaYtd, nvdaSpxYtd) >= 0 ? '+' : ''}${vsSpxSpread(nvdaYtd, nvdaSpxYtd).toFixed(1)} points (NVDA YTD − S&P YTD). Beta: ${nvdaBeta}. Yahoo trailing totals as of Oct 7.`,
      },
      consensus: {
        rows: [
          {label: 'Q2 FY27 revenue (print)', value: '$96.2B'},
          {label: 'Q3 FY27 revenue (guide)', value: '$108.0B ±2%'},
          {label: 'Q3 GM (guide)', value: '74.0% ±50 bp'},
          {label: 'China DC compute in outlook', value: 'none assumed'},
        ],
        note: 'August 26 NVIDIA IR. No newer company print this wake. Street whisper unread.',
        range: {metric: 'Q3 FY27 revenue guide', unit: 'B', guide: 108.0, low: 105.84, high: 110.16},
      },
      narrative: {
        leftTitle: 'THE FEAR',
        leftHeadline: 'The 10-year just printed a 2002 high. Duration is the tax.',
        leftBody:
          'Official 10-year CMT is 5.28%. Session high 5.365%. August 26 IR: third-party financing platforms targeting $500B+ of AI infrastructure over time. Outlook assumes no China data-center compute.',
        rightTitle: 'THE COUNTER',
        rightHeadline: 'The last company print still showed a very large demand machine.',
        rightBody:
          'Q2 revenue $96.2B. Q3 guide $108.0B ±2%. Vera Rubin said to be in full production. That is the last IR, not a new quarter.',
      },
      interpretation: {
        chips: [
          {label: 'CONFIRMED', tone: 'long' as const, text: 'August 26 IR still shows a large AI compute print and a $108B ±2% Q3 guide.'},
          {
            label: 'CONFIRMED',
            tone: 'watch' as const,
            text: 'Company outlook assumes no China data-center compute. Financing platforms were named on that call.',
          },
          {
            label: 'INFERENCE',
            tone: 'caution' as const,
            text: 'A 5.28% 10-year — after a 5.365% print — taxes a long-duration growth book. Wednesday’s dip does not retire that.',
          },
        ],
        note: 'No composite NVDA score. Next company tape is the November 17 call.',
      },
      actionMatrix: {
        headline: 'HOLD the line. Do not size a new buy off Wednesday’s yield spike.',
        rows: [
          {
            tone: 'long' as const,
            if: 'November 17 confirms demand and the guide holds up',
            then: 'Re-read the add case. Do not pre-buy it.',
          },
          {
            tone: 'watch' as const,
            if: 'Normal print, guide intact, rates stay high',
            then: 'HOLD. Fresh core money still goes to VOO.',
          },
          {
            tone: 'caution' as const,
            if: 'Guide or margins break, or financing fears get louder',
            then: 'Do not automatically buy the dip.',
          },
          {
            tone: 'short' as const,
            if: 'Demand looks weaker and the factor breaks',
            then: 'Consider reducing the overlap. Evens decides.',
          },
        ],
      },
      network: {
        title: 'NVDA · qualitative demand chain',
        headline: 'Polarity from the last IR — no composite score.',
        nodes: [
          {id: 'labs', label: 'Frontier labs / CSPs', polarity: 'confirmed' as const, x: 0.08, y: 0.22},
          {id: 'demand', label: 'GPU demand', polarity: 'confirmed' as const, x: 0.3, y: 0.22},
          {id: 'spend', label: 'AI infrastructure spend', polarity: 'confirmed' as const, x: 0.5, y: 0.22, evidence: 'Q3 guide $108B ±2%'},
          {id: 'financing', label: 'Third-party financing', polarity: 'concern' as const, x: 0.3, y: 0.78, evidence: '$500B+ platforms named'},
          {id: 'nvda', label: 'NVDA', polarity: 'neutral' as const, x: 0.62, y: 0.5},
          {id: 'china', label: 'China DC compute', polarity: 'concern' as const, x: 0.5, y: 0.78, evidence: 'None in outlook'},
          {id: 'rates', label: '10-year 5.28%', polarity: 'concern' as const, x: 0.08, y: 0.78, evidence: 'CMT Oct 7; high 5.365%'},
          {id: 'margins', label: 'Margins', polarity: 'confirmed' as const, x: 0.82, y: 0.5, evidence: 'Q3 GM 74% ±50 bp'},
          {id: 'eps', label: 'EPS / guide', polarity: 'inference' as const, x: 0.82, y: 0.82},
          {id: 'valuation', label: 'Valuation', polarity: 'inference' as const, x: 0.94, y: 0.5},
        ],
        edges: [
          {from: 'labs', to: 'demand'},
          {from: 'demand', to: 'spend'},
          {from: 'spend', to: 'nvda'},
          {from: 'financing', to: 'nvda', label: 'exposure'},
          {from: 'china', to: 'nvda', label: 'omitted'},
          {from: 'rates', to: 'valuation', label: 'duration'},
          {from: 'nvda', to: 'margins'},
          {from: 'margins', to: 'eps'},
          {from: 'eps', to: 'valuation'},
        ],
      },
    },
    {
      ticker: 'AAPL',
      chapterTitle: 'AAPL · still beating the index YTD',
      rating: 'HOLD',
      tone: 'long' as const,
      price: aaplClose,
      dayPct: aaplDayPct,
      returns: {
        headline: 'Beating the S&P YTD. Wednesday it rose while the index slipped. Do not double the name today.',
        bars: [
          {label: 'YTD', pct: aaplYtd, tone: 'long' as const},
          {label: 'S&P YTD', pct: aaplSpxYtd, tone: 'muted' as const},
          {label: '1 year', pct: 31.75, tone: 'gold' as const},
        ],
        note: `Spread vs S&P YTD: ${vsSpxSpread(aaplYtd, aaplSpxYtd) >= 0 ? '+' : ''}${vsSpxSpread(aaplYtd, aaplSpxYtd).toFixed(1)} points. Yahoo trailing totals as of Oct 7. 6-month unread.`,
      },
      action: {
        headline: 'HOLD the position.',
        body: 'Do not add the same name because it was green on a red tape. Next contribution should diversify. Apple IR earnings date was unread on the IR page this wake.',
      },
    },
    {
      ticker: 'VOO',
      chapterTitle: 'VOO · the foundation is not the problem',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      metrics: [
        {label: 'Close', value: '$714.34'},
        {label: 'Wednesday', value: '−0.26%'},
        {label: 'YTD tot ret', value: '+15.20%'},
      ],
      copy: {
        headline: 'Best simple core. New core money simplifies here.',
        body: 'Yahoo close Wednesday $714.34. Trailing YTD total return +15.20% as of Oct 6. Do not sell. Stop splitting every future contribution with VTI.',
      },
    },
    {
      ticker: 'VTI',
      chapterTitle: 'VTI · excellent, overlapping',
      rating: 'HOLD',
      tone: 'long' as const,
      metrics: [
        {label: 'Close', value: '$381.03'},
        {label: 'Wednesday', value: '−0.39%'},
        {label: 'YTD tot ret', value: '+15.08%'},
      ],
      copy: {
        headline: 'Excellent. Mega-caps still dominate, so the top looks like VOO.',
        body: 'Yahoo close Wednesday $381.03. Trailing YTD +15.08% as of Oct 6. Do not sell. The overlap with VOO is the issue — not the fund quality.',
      },
    },
    {
      ticker: 'VUG',
      chapterTitle: 'VUG · growth sleeve, still a touch behind',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      returns: {
        headline: 'You already own the individual winners. This sleeve does not need more cash today.',
        bars: [
          {label: 'VUG YTD', pct: vugYtd, tone: 'watch' as const},
          {label: 'S&P YTD', pct: spxYtdPct, tone: 'long' as const},
          {label: 'VUG 1-year', pct: 15.22, tone: 'muted' as const},
        ],
        note: 'Yahoo close Wednesday $92.42 (−0.24%). Trailing YTD +13.59% and 1-year +15.22% as of Oct 5. HOLD existing. No priority add.',
      },
    },
    {
      ticker: 'MGK',
      chapterTitle: 'MGK · same issue, even more concentrated',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      metrics: [
        {label: 'Close', value: '$94.92'},
        {label: 'Wednesday', value: '−0.20%'},
        {label: 'YTD tot ret', value: '+14.89%'},
        {label: '1 year', value: '+17.59%'},
      ],
      copy: {
        body: 'Yahoo close Wednesday $94.92. Trailing YTD +14.89% as of Oct 5 — slightly ahead of the S&P, still the same mega-cap stack you already own as NVDA and AAPL. HOLD. Stop feeding it.',
      },
    },
    {
      ticker: 'GDV',
      chapterTitle: 'GDV · a completely different job',
      rating: 'HOLD · INCOME / DIVERSIFIER',
      tone: 'long' as const,
      metrics: [
        {label: 'Market', value: '$28.29'},
        {label: 'Wednesday', value: '−0.63%'},
        {label: 'NAV', value: '$32.47'},
        {label: 'Discount', value: '−12.87%'},
        {label: 'YTD (NAV tot ret)', value: '+6.69%'},
      ],
      copy: {
        body: 'Closed-end income. Gabelli market $28.29 / NAV $32.47 / discount −12.87% as of Oct 7. YTD NAV total return +6.69%. Different job from the growth stack. Not a growth engine. Not “Next NVDA.”',
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
      id: 'next-nvda',
      area: 'opportunity' as const,
      question: 'Is there a named Next-NVDA or non-book scout?',
      whyItMatters: 'The sleeve and opportunity board stay empty until a name is sourced.',
      neededToKnow: 'Evens or a filing names a ticker that is not already in the book.',
      status: 'unknown' as const,
    },
    {
      id: 'europe-close',
      area: 'GLOBAL' as const,
      question: 'Where did Europe close?',
      whyItMatters: 'This 9:00 ET wake is during the European session. A close would be a lie.',
      neededToKnow: 'A sourced STOXX / DAX / FTSE close after those cash sessions end.',
      status: 'unknown' as const,
    },
    {
      id: 'aapl-ir-date',
      area: 'name' as const,
      ticker: 'AAPL',
      question: 'What date did Apple IR name for the next print?',
      whyItMatters: 'Press lists November 2. The IR homepage was unread here, so that date stays off the calendar.',
      neededToKnow: 'A live Apple IR / press-release page that names the call.',
      status: 'unknown' as const,
    },
    {
      id: 'boc-noon',
      area: 'CA' as const,
      question: 'What is the Bank of Canada noon USD/CAD for October 7?',
      whyItMatters: 'The DJ 5 p.m. print is a market quote. The official noon series is the Canadian reference.',
      neededToKnow: 'BoC valet / daily FX table for 2026-10-07.',
      status: 'unknown' as const,
    },
  ],
  scenarios: [],
  capitalPlan: {
    existingPortfolio: 'HOLD — sell nothing this morning.',
    freshCapital: 'New core money simplifies into VOO. Do not add NVDA or AAPL off Wednesday’s yield spike.',
    bestAdd: 'VOO',
    highestUpsideWatch: 'none named',
    biggestRisk: 'Mega-cap growth overlap across NVDA, AAPL, MGK, VUG, VOO, VTI — plus a 5.28% 10-year after a 5.365% print',
    nextTrigger: '30-year auction today · CPI October 14 · FOMC October 27–28 · Nvidia November 17',
    ifThen: [
      {
        tone: 'long' as const,
        if: 'November 17 confirms demand and the guide holds',
        then: 'Re-read the NVDA add case. Do not pre-buy it.',
      },
      {
        tone: 'watch' as const,
        if: 'Today’s 30-year sale or CPI / FOMC keep long rates elevated',
        then: 'HOLD the book. Fresh money still prefers VOO over another growth sleeve.',
      },
      {
        tone: 'caution' as const,
        if: 'Guide or margins break, or financing fears get louder',
        then: 'Do not automatically buy the dip.',
      },
      {
        tone: 'short' as const,
        if: 'The mega-cap factor breaks and the book is too heavy',
        then: 'Consider reducing overlap. Evens decides. No trade from this desk.',
      },
    ],
  },
  risks: [
    {
      n: '01',
      title: 'Growth-factor concentration',
      body: 'NVDA + AAPL + MGK + VUG + VOO + VTI still own the same mega-cap ecosystem. Weights unread.',
    },
    {
      n: '02',
      title: 'Interest rates',
      body: `Official 10-year CMT is ${tenYear}% (Treasury Oct 7) after a 5.365% session high — highest since April 2002. That is the tax on a long-duration growth overweight.`,
    },
    {
      n: '03',
      title: 'AI ROI and financing',
      body: 'August 26 IR named $500B+ third-party financing platforms and assumed no China data-center compute. The debate is still “will profits pay for the buildout?”',
    },
  ],
  close: {
    kicker: 'DIAGNOSTIC',
    headline: 'Wednesday’s yield print is the book’s real overnight.',
    body: 'Same seven lines. Same mega-cap stack. Asia gave more back Thursday. Sell nothing. If cash arrives, VOO is still the simple add. Next named reads: today’s long-bond sale, CPI, FOMC, Nvidia.',
    pills: [
      {tone: 'watch' as const, label: 'HOLD THIS MORNING'},
      {tone: 'long' as const, label: 'VOO FOR NEW CORE'},
      {tone: 'caution' as const, label: 'NO YIELD-SPIKE ADD'},
    ],
    followThrough: [
      {
        tone: 'watch' as const,
        if: 'US cash opens and the 10-year stays bidless',
        then: 'Read the open. Do not invent a midday print in this file.',
      },
      {
        tone: 'caution' as const,
        if: 'AI demand looks weaker on November 17',
        then: 'More VOO / cash / non-AI quality. Evens decides.',
      },
      {
        tone: 'long' as const,
        if: 'An asymmetric candidate is named',
        then: 'That is when the Next-NVDA sleeve gets a ticker. Empty until then.',
      },
    ],
  },
  tickerTape: [
    `SPX ${spxClose.toLocaleString('en-US')} ${spxDayPct}% WED`,
    `SPX YTD +${spxYtdPct}%`,
    `NASDAQ ${nasdaqClose.toLocaleString('en-US')} ${nasdaqDayPct}%`,
    `NVDA $${nvdaClose.toFixed(2)} ${nvdaDayPct}%`,
    `AAPL $${aaplClose.toFixed(2)} +${aaplDayPct}%`,
    `10Y ${tenYear}% CMT · HIGH 5.365%`,
    `TSX 35,041.86 −1.70%`,
    `NIKKEI 69,042.11 −1.42%`,
    `VOO CORE / ADD`,
    `SELL NOTHING THIS MORNING`,
  ],
};

export const episode: DailyReport = parseDailyReport(raw);
