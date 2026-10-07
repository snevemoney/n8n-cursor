import {vsSpxSpread} from '../compute';
import {parseDailyReport, type DailyReport} from '../schema';

const nvdaYtd = 28.58;
const nvdaSpxYtd = 14.22;
const aaplYtd = 23.06;
const aaplSpxYtd = 14.22;
const nvdaClose = 239.24;
const nvdaDayPct = 0.14;
const nvdaBeta = 2.22;
const aaplClose = 333.63;
const aaplDayPct = 0.22;
const spxClose = 7818.93;
const spxDayPct = 0.58;
const spxYtdPct = 14.22;
const nasdaqClose = 27599.89;
const nasdaqDayPct = 0.45;
const tenYear = 5.27;
const vooYtd = 14.58;
const vtiYtd = 14.5;
const vugYtd = 13.59;
const mgkYtd = 14.89;
const gdvYtd = 7.4;

const raw = {
  meta: {
    date: '2026-10-07',
    dateLabel: 'OCT 7, 2026',
    title: 'Daily Wealth Intelligence',
    thesis:
      'Tuesday’s US cash made another record. The 10-year eased to 5.27% and is still high. The book is the same seven lines — still one U.S. mega-cap growth bet.',
    thesisLead: 'Another US record.',
    thesisAccent: 'The book is still one growth bet.',
    catalyst: 'Next named US prints: CPI October 14, FOMC October 27–28, Nvidia November 17.',
    kicker: 'Last US / CA cash is Tuesday. This 9:03 wake is before the US open.',
    universe: ['AAPL', 'NVDA', 'VOO', 'VTI', 'VUG', 'MGK', 'GDV'],
  },
  market: {
    spxClose,
    spxDayPct,
    spxYtdPct,
    nasdaqDayPct,
    tenYearYield: tenYear,
    note: 'Tuesday US cash: S&P and Nasdaq records. Official 10-year CMT 5.27% after Monday’s 5.31%. US cash not open yet at this wake.',
    nextCalendar: {
      label: 'CPI Oct 14 · FOMC Oct 27–28 · NVDA Nov 17',
      detail: 'BLS CPI 8:30 ET. Fed meeting dates. Nvidia Q3 call named on the August 26 IR call.',
    },
  },
  markets: {
    global: {
      indices: [
        {label: 'Nikkei 225', value: '70,035.71', dayPct: -0.92, note: 'JIJI close Oct 7'},
        {label: 'TOPIX', value: '4,154.11', dayPct: -0.7, note: 'JIJI close Oct 7'},
        {label: 'Hang Seng', value: '24,130.50', dayPct: -0.62, note: 'Yahoo close Oct 7'},
      ],
      note: 'Tokyo and Hong Kong are closed for Wednesday. Mainland China is shut through Oct 7 (SSE holiday notice); last Shanghai print unread this wake. Europe is still open — no Europe close.',
    },
    us: {
      indices: [
        {
          label: 'S&P 500',
          value: spxClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: spxDayPct,
          note: 'Yahoo close Tuesday Oct 6. YTD +14.22%.',
        },
        {
          label: 'Nasdaq',
          value: nasdaqClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: nasdaqDayPct,
          note: 'Yahoo close Tuesday Oct 6. Chart YTD +18.75%.',
        },
      ],
      yields: [{label: 'U.S. 10-year CMT', value: `${tenYear}%`, note: 'Treasury CSV Oct 6. Monday was 5.31%.'}],
      note: 'Last completed US cash session is Tuesday. This wake is before 9:30 ET.',
    },
    ca: {
      indices: [
        {label: 'S&P/TSX Composite', value: '35,649.51', dayPct: 0.37, note: 'TSX daily report + Morningstar/DJ Oct 6'},
        {label: 'S&P/TSX Venture', value: '890.12', dayPct: 1.31, note: 'TSX daily report Oct 6'},
      ],
      cadUsd: '1 USD = 1.4226 CAD (BoC daily Oct 6)',
      note: 'Last completed CA cash session is Tuesday. US/CA cash not open yet at this wake.',
    },
    calendar: {
      items: [
        {
          when: 'Wednesday Oct 7',
          where: 'US' as const,
          label: 'FOMC minutes (Sept 15–16)',
          why: 'Fed rule: minutes three weeks after the decision. September meeting is on the 2026 calendar.',
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
          when: 'Thursday Oct 8',
          where: 'GLOBAL' as const,
          label: 'Shanghai / Shenzhen reopen',
          why: 'SSE holiday notice: closed Oct 1–7. No mainland print this wake.',
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
      whatMatters: 'Tuesday +0.14%. Last IR is Aug 26. Next named call Nov 17.',
      ytd: nvdaYtd,
    },
    {
      ticker: 'AAPL',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Second single name',
      whatMatters: 'Tuesday +0.22%. Still beating the S&P YTD. IR date unread here.',
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
      whatMatters: 'Different job. Market +0.35% Tuesday. NAV unread.',
      ytd: gdvYtd,
    },
  ],
  portfolio: {
    concentrationThesis: 'VOO + VTI + VUG + MGK + AAPL + NVDA still buy the same U.S. mega-cap growth names.',
    concentrationBody:
      'Tuesday’s record was a cap-weighted tape. When that factor turns, several Wealthsimple lines can go red together. Weights are still unknown.',
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
      holdNote: 'No add off a Tuesday record. Next named call is November 17.',
      fundamentals: [
        {label: 'Market cap', value: '$5.78T'},
        {label: 'TTM revenue', value: '$303.0B'},
        {label: 'TTM net income', value: '$192.9B'},
        {label: 'TTM EPS', value: '$7.91'},
        {label: 'P/E (TTM)', value: '30.3×'},
        {label: 'Beta', value: String(nvdaBeta)},
      ],
      vsSpx: {
        headline: 'YTD spread is real. The extra volatility is still the cost.',
        bars: [
          {label: 'NVDA YTD', pct: nvdaYtd, tone: 'nvda' as const},
          {label: 'S&P YTD', pct: nvdaSpxYtd, tone: 'muted' as const},
        ],
        note: `Spread: ${vsSpxSpread(nvdaYtd, nvdaSpxYtd) >= 0 ? '+' : ''}${vsSpxSpread(nvdaYtd, nvdaSpxYtd).toFixed(1)} points (NVDA YTD − S&P YTD). Beta: ${nvdaBeta}. Yahoo trailing totals as of Oct 6.`,
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
        leftHeadline: 'Long rates are still high, and Nvidia is more tied to customer financing.',
        leftBody:
          'Official 10-year CMT is 5.27% after Monday’s 5.31%. August 26 IR: third-party financing platforms targeting $500B+ of AI infrastructure over time. Outlook assumes no China data-center compute.',
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
            text: 'A 5.27% 10-year still taxes a long-duration growth book. Tuesday’s record does not retire that.',
          },
        ],
        note: 'No composite NVDA score. Next company tape is the November 17 call.',
      },
      actionMatrix: {
        headline: 'HOLD the line. Do not size a new buy off Tuesday’s close.',
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
        headline: 'Beating the S&P YTD. One-year is still strong. Do not double the name today.',
        bars: [
          {label: 'YTD', pct: aaplYtd, tone: 'long' as const},
          {label: 'S&P YTD', pct: aaplSpxYtd, tone: 'muted' as const},
          {label: '1 year', pct: 30.45, tone: 'gold' as const},
          {label: '6 months', pct: 28.88, tone: 'aapl' as const},
          {label: '1 month', pct: 4.27, tone: 'long' as const},
        ],
        note: `Spread vs S&P YTD: ${vsSpxSpread(aaplYtd, aaplSpxYtd) >= 0 ? '+' : ''}${vsSpxSpread(aaplYtd, aaplSpxYtd).toFixed(1)} points. Yahoo trailing totals as of Oct 6. 3-month unread.`,
      },
      action: {
        headline: 'HOLD the position.',
        body: 'Do not add the same name on a record tape. Next contribution should diversify. Apple IR earnings date was unread on the IR page this wake.',
      },
    },
    {
      ticker: 'VOO',
      chapterTitle: 'VOO · the foundation is not the problem',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      metrics: [
        {label: 'Close', value: '$716.20'},
        {label: 'Tuesday', value: '+0.54%'},
        {label: 'YTD tot ret', value: '+14.58%'},
      ],
      copy: {
        headline: 'Best simple core. New core money simplifies here.',
        body: 'Yahoo close Tuesday $716.20. Trailing YTD total return +14.58% as of Oct 5. Do not sell. Stop splitting every future contribution with VTI.',
      },
    },
    {
      ticker: 'VTI',
      chapterTitle: 'VTI · excellent, overlapping',
      rating: 'HOLD',
      tone: 'long' as const,
      metrics: [
        {label: 'Close', value: '$382.54'},
        {label: 'Tuesday', value: '+0.51%'},
        {label: 'YTD tot ret', value: '+14.50%'},
      ],
      copy: {
        headline: 'Excellent. Mega-caps still dominate, so the top looks like VOO.',
        body: 'Yahoo close Tuesday $382.54. Trailing YTD +14.50% as of Oct 5. Do not sell. The overlap with VOO is the issue — not the fund quality.',
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
        note: 'Yahoo close Tuesday $92.64 (+0.63%). Trailing YTD +13.59% and 1-year +15.22% as of Oct 5. HOLD existing. No priority add.',
      },
    },
    {
      ticker: 'MGK',
      chapterTitle: 'MGK · same issue, even more concentrated',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      metrics: [
        {label: 'Close', value: '$95.11'},
        {label: 'Tuesday', value: '+0.55%'},
        {label: 'YTD tot ret', value: '+14.89%'},
        {label: '1 year', value: '+17.59%'},
      ],
      copy: {
        body: 'Yahoo close Tuesday $95.11. Trailing YTD +14.89% as of Oct 5 — slightly ahead of the S&P, still the same mega-cap stack you already own as NVDA and AAPL. HOLD. Stop feeding it.',
      },
    },
    {
      ticker: 'GDV',
      chapterTitle: 'GDV · a completely different job',
      rating: 'HOLD · INCOME / DIVERSIFIER',
      tone: 'long' as const,
      metrics: [
        {label: 'Market', value: '$28.47'},
        {label: 'Tuesday', value: '+0.35%'},
        {label: 'YTD tot ret', value: '+7.40%'},
        {label: 'Fwd yield', value: '6.32%'},
      ],
      copy: {
        body: 'Closed-end income. Yahoo market $28.47. Trailing YTD +7.40% as of Oct 6. Forward dividend/yield 6.32%. NAV unread (Gabelli page not used). Not a growth engine. Not “Next NVDA.”',
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
      whyItMatters: 'This 9:03 ET wake is during the European session. A close would be a lie.',
      neededToKnow: 'A sourced STOXX / DAX / FTSE close after those cash sessions end.',
      status: 'unknown' as const,
    },
    {
      id: 'aapl-ir-date',
      area: 'name' as const,
      ticker: 'AAPL',
      question: 'What date did Apple IR name for the next print?',
      whyItMatters: 'Press and Yahoo list November 2. The IR page was unread here, so that date stays off the calendar.',
      neededToKnow: 'A live Apple IR / press-release page that names the call.',
      status: 'unknown' as const,
    },
    {
      id: 'gdv-nav',
      area: 'name' as const,
      ticker: 'GDV',
      question: 'What is GDV’s latest NAV and discount?',
      whyItMatters: 'Market price is not NAV. The income sleeve needs the Gabelli snapshot.',
      neededToKnow: 'A sourced Gabelli / CEF NAV print. Do not invent a discount.',
      status: 'unknown' as const,
    },
  ],
  scenarios: [],
  capitalPlan: {
    existingPortfolio: 'HOLD — sell nothing this morning.',
    freshCapital: 'New core money simplifies into VOO. Do not add NVDA or AAPL off Tuesday’s record.',
    bestAdd: 'VOO',
    highestUpsideWatch: 'none named',
    biggestRisk: 'Mega-cap growth overlap across NVDA, AAPL, MGK, VUG, VOO, VTI — plus a 5.27% 10-year',
    nextTrigger: 'CPI October 14 · FOMC October 27–28 · Nvidia November 17',
    ifThen: [
      {
        tone: 'long' as const,
        if: 'November 17 confirms demand and the guide holds',
        then: 'Re-read the NVDA add case. Do not pre-buy it.',
      },
      {
        tone: 'watch' as const,
        if: 'CPI / FOMC keep long rates elevated',
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
      body: `Official 10-year CMT is ${tenYear}% (Treasury Oct 6). That is four hundredths below Monday and still high for a long-duration growth overweight.`,
    },
    {
      n: '03',
      title: 'AI ROI and financing',
      body: 'August 26 IR named $500B+ third-party financing platforms and assumed no China data-center compute. The debate is still “will profits pay for the buildout?”',
    },
  ],
  close: {
    kicker: 'DIAGNOSTIC',
    headline: 'Tuesday’s record does not change the book’s job.',
    body: 'Same seven lines. Same mega-cap stack. Asia gave a little back overnight. Sell nothing. If cash arrives, VOO is still the simple add. Next named reads: CPI, FOMC, Nvidia.',
    pills: [
      {tone: 'watch' as const, label: 'HOLD THIS MORNING'},
      {tone: 'long' as const, label: 'VOO FOR NEW CORE'},
      {tone: 'caution' as const, label: 'NO RECORD-TAPE ADD'},
    ],
    followThrough: [
      {
        tone: 'watch' as const,
        if: 'US cash opens and the record fades',
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
    `SPX ${spxClose.toLocaleString('en-US')}  +${spxDayPct}%  TUE`,
    `SPX YTD  +${spxYtdPct}%`,
    `NASDAQ  ${nasdaqClose.toLocaleString('en-US')}  +${nasdaqDayPct}%`,
    `NVDA  $${nvdaClose.toFixed(2)}  +${nvdaDayPct}%`,
    `AAPL  $${aaplClose.toFixed(2)}  +${aaplDayPct}%`,
    `10Y  ${tenYear}%  CMT`,
    `TSX  35,649.51  +0.37%`,
    `NIKKEI  70,035.71  −0.92%`,
    `VOO CORE / ADD`,
    `SELL NOTHING THIS MORNING`,
  ],
};

export const episode: DailyReport = parseDailyReport(raw);
