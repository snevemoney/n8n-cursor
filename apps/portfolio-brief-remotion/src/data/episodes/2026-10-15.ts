import {vsSpxSpread} from '../compute';
import {parseDailyReport, type DailyReport} from '../schema';

const nvdaYtd = 18.94;
const nvdaSpxYtd = 12.76;
const aaplYtd = 26.5;
const aaplSpxYtd = 12.76;
const nvdaClose = 221.3;
const nvdaDayPct = -3.16;
const aaplClose = 342.96;
const aaplDayPct = 0.5;
const spxClose = 7718.94;
const spxDayPct = -1.11;
const spxYtdPct = 12.76;
const nasdaqDayPct = -1.88;
const tenYear = 5.19;

const raw = {
  meta: {
    date: '2026-10-15',
    dateLabel: 'OCT 15, 2026',
    title: 'Daily Wealth Intelligence',
    thesis:
      'Wednesday’s hotter CPI and a chip selloff hit the same mega-cap growth stack the book already owns. NVDA is the pain line. AAPL held up. Do not add before today’s cash tape.',
    thesisLead: 'The book is the same stack.',
    thesisAccent: 'Chips took the hit. Do not add before the tape.',
    catalyst: 'Thursday US/CA cash not open yet. Sit with Wednesday’s CPI + chip dump. Next named: GTC Berlin Oct 21, FOMC Oct 27–28, NVDA call Nov 17.',
    kicker: 'Thursday 9:00 · cash not open',
    universe: ['AAPL', 'NVDA', 'VOO', 'VTI', 'VUG', 'MGK', 'GDV'],
  },
  market: {
    spxClose,
    spxDayPct,
    spxYtdPct,
    nasdaqDayPct,
    tenYearYield: tenYear,
    note: 'Wednesday US cash: hotter September CPI, then chips sold off. 10-year CMT finished 5.19% after a morning spike. Thursday Asia closed weak. Europe still open — no Europe close.',
    nextCalendar: {
      label: 'GTC Berlin · FOMC · NVDA Nov 17',
      detail: 'NVIDIA GTC Berlin Oct 21. FOMC Oct 27–28. NVDA Q3 call named Nov 17 on the Aug 26 IR call. Apple IR date unread this wake.',
    },
  },
  markets: {
    global: {
      indices: [
        {label: 'Nikkei 225', value: '64,425.95', dayPct: -4.9, note: 'Thursday close (JIJI; −3,318.34)'},
        {label: 'TOPIX', value: '3,999.34', dayPct: -2.38, note: 'Thursday close (JIJI; −97.44)'},
        {label: 'Hang Seng', value: '24,062.72', dayPct: -1.03, note: 'Thursday close (Yahoo)'},
        {label: 'Shanghai Composite', value: '3,707.48', dayPct: -1.59, note: 'Thursday close (Yahoo)'},
        {label: 'KOSPI', value: '5,554.22', dayPct: -7.57, note: 'Thursday close (LiveWorldMarket / cngold)'},
      ],
      commodities: [
        {label: 'WTI', value: '$95.12', note: 'Wednesday (Western Producer); Thursday futures not used as settle'},
        {label: 'Brent', value: '$106.04', note: 'Wednesday (Western Producer); Thursday futures not used as settle'},
      ],
      note: 'Thursday Asia closed before this 9:00 ET wake. Europe still open — no Europe close. Oil is Wednesday settle, not Thursday futures.',
    },
    us: {
      indices: [
        {label: 'S&P 500', value: '7,718.94', dayPct: -1.11, note: 'Wednesday close (Yahoo / AP)'},
        {label: 'Nasdaq', value: '26,692.87', dayPct: -1.88, note: 'Wednesday close (Yahoo / AP)'},
        {label: 'Dow', value: '51,621.48', dayPct: -0.09, note: 'Wednesday close (Yahoo / AP)'},
        {label: 'Russell 2000', value: '2,729.53', dayPct: -1.93, note: 'Wednesday close (Yahoo)'},
      ],
      sectors: [{label: 'PHLX Semiconductor', dayPct: -4.3, note: 'WSJ Wednesday'}],
      yields: [
        {label: 'U.S. 10-year CMT', value: '5.19%', note: 'Official Treasury Wednesday 10/14 (CSV); Tuesday was 5.21%'},
        {label: 'U.S. 2-year CMT', value: '4.82%', note: 'Official Treasury Wednesday 10/14'},
      ],
      note: 'BLS: September CPI-U +0.6% m/m, +3.7% y/y. Core +0.3% m/m, +2.6% y/y. Gasoline +9.1% m/m drove more than half the monthly rise. US/CA cash not open at this 9:00 ET wake.',
    },
    ca: {
      indices: [
        {label: 'S&P/TSX Composite', value: '35,584.46', dayPct: -1.11, note: 'Wednesday (TSX daily report)'},
        {label: 'S&P/TSX 60', value: '2,108.35', dayPct: -0.83, note: 'Wednesday (TSX daily report)'},
        {label: 'S&P/TSX Venture', value: '830.33', dayPct: -3.55, note: 'Wednesday (TSX daily report)'},
      ],
      cadUsd: '1.4263',
      sectors: [
        {label: 'Materials', note: 'Largest TSX Composite detractor Wednesday (TSX daily report)'},
        {label: 'Information Technology', note: 'Second-largest TSX Composite detractor Wednesday'},
      ],
      note: 'BoC daily average USD 1.4263 on Oct 14 (published by 16:30 ET). Thursday Toronto cash not open yet.',
    },
    calendar: {
      items: [
        {
          when: 'Thursday open',
          where: 'US' as const,
          label: 'US cash 9:30 ET',
          why: 'This wake is 9:00 ET. Wednesday CPI + chips is the last cash tape. Do not add before today’s print.',
        },
        {
          when: 'Oct 21',
          where: 'GLOBAL' as const,
          label: 'NVIDIA GTC Berlin',
          why: 'NVIDIA events calendar: GTC Berlin Oct 21–23. Named on the Aug 26 IR call.',
        },
        {
          when: 'Oct 27–28',
          where: 'US' as const,
          label: 'FOMC',
          why: 'Fed calendar. Next named policy meeting after Wednesday’s hotter CPI.',
        },
        {
          when: 'Nov 17',
          where: 'US' as const,
          label: 'NVIDIA Q3 FY27 call',
          why: 'Named on the Aug 26 IR call. Guide still $108.0B ±2%, GM 74.0% ±50 bp, no China DC compute in the outlook.',
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
      rating: 'HOLD — critical watch',
      tone: 'watch' as const,
      role: 'Pain line after CPI / chips',
      whatMatters: 'Wednesday −3.16%. Five red days in the last seven. IR guide unchanged. No add.',
      ytd: nvdaYtd,
    },
    {
      ticker: 'AAPL',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Held up on the chip day',
      whatMatters: 'Wednesday +0.50% while NVDA sold off. Still beating S&P YTD. Do not add.',
      ytd: aaplYtd,
    },
    {
      ticker: 'VOO',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      role: 'Best simple core',
      whatMatters: 'Best simple core. New money still simplifies here after the tape, not before.',
      ytd: 11.98,
    },
    {
      ticker: 'VTI',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Broad US',
      whatMatters: 'Excellent fund. Still overlaps VOO at the top.',
      ytd: 11.55,
      overlapWith: ['VOO'],
    },
    {
      ticker: 'VUG',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Growth sleeve',
      whatMatters: 'Growth sleeve lagging S&P YTD. Wednesday −2.05%. You already own the individual winners.',
      ytd: 10.53,
      overlapWith: ['NVDA', 'AAPL', 'VOO', 'MGK'],
    },
    {
      ticker: 'MGK',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Mega-cap growth',
      whatMatters: 'Even more mega-cap overlap. Wednesday −2.08%. Stop feeding it.',
      ytd: 11.72,
      overlapWith: ['NVDA', 'AAPL', 'VUG', 'VOO'],
    },
    {
      ticker: 'GDV',
      rating: 'HOLD — income / diversifier',
      tone: 'long' as const,
      role: 'Income sleeve',
      whatMatters: 'Different job. Gabelli NAV YTD +6.54% as of Oct 14. Discount −13.18%.',
      ytd: 6.54,
    },
  ],
  portfolio: {
    concentrationThesis: 'VOO + VTI + VUG + MGK + AAPL + NVDA still buy the same U.S. mega-cap growth names.',
    concentrationBody:
      'Wednesday showed it. Chips and mega-cap growth went red together. Several Wealthsimple lines will look worse than a 1.1% S&P day. That is overlap, not a new thesis.',
    factorStack: ['NVDA', 'AAPL', 'MGK', 'VUG', 'VOO', 'VTI'],
    factorLabel: 'U.S. mega-cap / growth',
    overlapNote: 'same ecosystem',
  },
  names: [
    {
      ticker: 'NVDA',
      chapterTitle: 'NVDA · the pain line after CPI',
      rating: 'CRITICAL WATCH',
      tone: 'watch' as const,
      price: nvdaClose,
      dayPct: nvdaDayPct,
      holdNote: 'No buying before today’s US cash tape. Guide unchanged from Aug 26.',
      streak: [0.14, -0.74, -2.94, -0.52, -1.29, 0.97, -3.16],
      streakHeadline: 'Five red days in the last seven. Not a collapse. An ugly cluster.',
      streakNote:
        'Yahoo daily closes Oct 6–14. Wednesday −3.16% on hotter CPI and a semiconductor dump. Momentum is a penalty. The Aug 26 IR tape is unchanged.',
      fundamentals: [
        {label: 'Q2 FY27 revenue', value: '$96.2B  +106% y/y'},
        {label: 'Q2 Data Center', value: '$89.0B  +117% y/y'},
        {label: 'Q2 GAAP / non-GAAP GM', value: '75.0%  /  75.0%'},
        {label: 'Q3 revenue guide', value: '$108.0B  ±2%'},
        {label: 'Q3 GM guide', value: '74.0%  ±50 bp'},
        {label: 'China DC compute', value: 'Not in the outlook'},
      ],
      vsSpx: {
        headline: 'Still ahead of the S&P YTD — and still the extra-volatility line.',
        bars: [
          {label: 'NVDA YTD', pct: nvdaYtd, tone: 'nvda' as const},
          {label: 'S&P YTD', pct: nvdaSpxYtd, tone: 'muted' as const},
        ],
        note: `Spread: ${vsSpxSpread(nvdaYtd, nvdaSpxYtd) >= 0 ? '+' : ''}${vsSpxSpread(nvdaYtd, nvdaSpxYtd).toFixed(1)} points (NVDA YTD − S&P YTD). Yahoo YTD. No beta sourced this wake.`,
      },
      consensus: {
        rows: [
          {label: 'Q3 revenue guide', value: '$108.0B ±2%'},
          {label: 'Q3 GM guide', value: '74.0% ±50 bp'},
          {label: 'Q2 revenue (actual)', value: '$96.2B'},
          {label: 'Street / whisper', value: 'UNKNOWN this wake'},
        ],
        note: 'Company guide from the Aug 26 IR release. No street consensus or whisper sourced today. Do not draw a whisper zone.',
        range: {metric: 'Q3 revenue guide', unit: 'B', guide: 108.0, low: 105.84, high: 110.16},
      },
      narrative: {
        leftTitle: 'THE FEAR',
        leftHeadline: '“Hot CPI + high long rates + AI funding stress.”',
        leftBody:
          'BLS September CPI +0.6% m/m and +3.7% y/y. Official 10-year CMT 5.19% Wednesday after a morning spike. WSJ: SOX −4.3%. JIJI: Nikkei −4.90% Thursday on AI-related selling after U.S. chip weakness.',
        rightTitle: 'THE COUNTER',
        rightHeadline: 'Aug 26 IR is unchanged. Demand language still large. Guide still $108.0B ±2%.',
        rightBody:
          'Q2 $96.2B. Data Center $89.0B. Vera Rubin in production at named clouds. Third-party compute financing platforms targeting over $500B over time, subject to definitive agreements. No China DC compute in the Q3 outlook.',
      },
      interpretation: {
        chips: [
          {label: 'CONFIRMED', tone: 'long' as const, text: 'Q2 print and Q3 guide still sit on the Aug 26 IR page.'},
          {
            label: 'CONFIRMED',
            tone: 'watch' as const,
            text: 'Wednesday price action was a chip dump on hotter CPI — five red days in seven.',
          },
          {
            label: 'INFERENCE',
            tone: 'caution' as const,
            text: 'High long rates plus funding stress is the debate under the book. That is not a new ticker.',
          },
        ],
        note: 'HOLD. No add before today’s cash tape. Next named NVDA events are GTC Berlin Oct 21 and the Nov 17 call.',
      },
      actionMatrix: {
        headline: 'This morning: HOLD. No add before the US cash open.',
        rows: [
          {
            tone: 'long' as const,
            if: 'Today’s tape holds and the Aug 26 guide is still the live number into GTC / Nov 17',
            then: 'HOLD the line. New core money still goes to VOO, not more NVDA.',
          },
          {
            tone: 'watch' as const,
            if: 'Normal Wednesday follow-through — chips weak, rest of book mixed',
            then: 'HOLD. Do not average down on overlap.',
          },
          {
            tone: 'caution' as const,
            if: 'Guide, margins, or China-DC language changes, or funding stress hits the IR tape',
            then: 'Do not automatically buy the dip',
          },
          {
            tone: 'short' as const,
            if: 'Demand deterioration plus a ~10%+ break from this week’s cluster',
            then: 'Consider reducing exposure — Evens only',
          },
        ],
      },
      network: {
        title: 'NVDA · qualitative demand chain',
        headline: 'Polarity from IR + Wednesday tape — no composite score.',
        nodes: [
          {id: 'labs', label: 'Frontier labs / clouds', polarity: 'confirmed' as const, x: 0.08, y: 0.22},
          {id: 'demand', label: 'GPU demand', polarity: 'confirmed' as const, x: 0.3, y: 0.22},
          {id: 'spend', label: 'AI factory buildout', polarity: 'confirmed' as const, x: 0.5, y: 0.22, evidence: 'Q3 guide $108.0B ±2%'},
          {id: 'financing', label: 'Third-party compute capital', polarity: 'concern' as const, x: 0.3, y: 0.78, evidence: '>$500B platforms, subject to agreements'},
          {id: 'cpi', label: 'CPI / 10-year', polarity: 'concern' as const, x: 0.08, y: 0.78, evidence: 'CPI 3.7% y/y · CMT 5.19%'},
          {id: 'nvda', label: 'NVDA', polarity: 'neutral' as const, x: 0.62, y: 0.5},
          {id: 'china', label: 'China DC compute', polarity: 'concern' as const, x: 0.82, y: 0.18, evidence: 'Not in outlook'},
          {id: 'margins', label: 'Q3 GM guide', polarity: 'confirmed' as const, x: 0.82, y: 0.5, evidence: '74.0% ±50 bp'},
          {id: 'eps', label: 'Nov 17 call', polarity: 'inference' as const, x: 0.82, y: 0.82},
        ],
        edges: [
          {from: 'labs', to: 'demand'},
          {from: 'demand', to: 'spend'},
          {from: 'spend', to: 'nvda'},
          {from: 'financing', to: 'nvda', label: 'funding'},
          {from: 'cpi', to: 'financing', label: 'rates'},
          {from: 'nvda', to: 'china'},
          {from: 'nvda', to: 'margins'},
          {from: 'margins', to: 'eps'},
        ],
      },
    },
    {
      ticker: 'AAPL',
      chapterTitle: 'AAPL · held up on the chip day',
      rating: 'HOLD',
      tone: 'long' as const,
      price: aaplClose,
      dayPct: aaplDayPct,
      streak: [0.22, 0.91, 1.11, -1.11, 1.29, 0.09, 0.5],
      streakHeadline: 'Six green sessions in the last seven. Different tape from NVDA.',
      streakNote: 'Yahoo daily closes Oct 6–14. Wednesday +0.50% while NVDA −3.16%.',
      returns: {
        headline: 'Beating the S&P YTD. Wednesday it did not follow the chip dump.',
        bars: [
          {label: 'YTD', pct: aaplYtd, tone: 'long' as const},
          {label: 'S&P YTD', pct: aaplSpxYtd, tone: 'muted' as const},
        ],
        panelTitle: 'WEDNESDAY',
        panelBody: '+0.50% vs NVDA −3.16%',
        note: `Spread vs S&P YTD: ${vsSpxSpread(aaplYtd, aaplSpxYtd) >= 0 ? '+' : ''}${vsSpxSpread(aaplYtd, aaplSpxYtd).toFixed(1)} points. Yahoo YTD.`,
      },
      action: {
        headline: 'HOLD the position.',
        body: 'Do not add this morning. You already own it, and VUG/MGK already stack more of the same mega-caps. Next contribution should diversify.',
      },
    },
    {
      ticker: 'VOO',
      chapterTitle: 'VOO · still the simple core',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      price: 707.43,
      dayPct: -1.09,
      metrics: [
        {label: 'Wednesday', value: '$707.43  −1.09%'},
        {label: 'Yahoo YTD', value: '+11.98%'},
      ],
      copy: {
        headline: 'Best simple core. New core money still simplifies here — after the tape, not before.',
        body: 'Wednesday tracked the S&P. Do not sell. Stop splitting every future contribution with VTI.',
      },
    },
    {
      ticker: 'VTI',
      chapterTitle: 'VTI · excellent, overlapping',
      rating: 'HOLD',
      tone: 'long' as const,
      price: 376.88,
      dayPct: -1.16,
      metrics: [
        {label: 'Wednesday', value: '$376.88  −1.16%'},
        {label: 'Yahoo YTD', value: '+11.55%'},
      ],
      copy: {
        headline: 'Excellent. The top still looks like VOO.',
        body: 'Do not sell. The overlap with VOO is the issue — not the fund quality.',
      },
    },
    {
      ticker: 'VUG',
      chapterTitle: 'VUG · growth sleeve, lagging',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      price: 89.87,
      dayPct: -2.05,
      returns: {
        headline: 'Growth label, weaker YTD than the S&P — and you already own NVDA and AAPL.',
        bars: [
          {label: 'VUG YTD', pct: 10.53, tone: 'watch' as const},
          {label: 'S&P YTD', pct: spxYtdPct, tone: 'long' as const},
        ],
        note: 'Wednesday −2.05%. HOLD existing. No priority add.',
      },
    },
    {
      ticker: 'MGK',
      chapterTitle: 'MGK · same issue, more concentrated',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      price: 92.23,
      dayPct: -2.08,
      metrics: [
        {label: 'Wednesday', value: '$92.23  −2.08%'},
        {label: 'Yahoo YTD', value: '+11.72%'},
      ],
      copy: {
        body: 'You already own NVDA and AAPL directly. HOLD. Stop feeding it. Not a sell call — tax and account mechanics are not reconstructed from this screen.',
      },
    },
    {
      ticker: 'GDV',
      chapterTitle: 'GDV · a different job',
      rating: 'HOLD · INCOME / DIVERSIFIER',
      tone: 'long' as const,
      price: 28.25,
      dayPct: -0.88,
      metrics: [
        {label: 'NAV', value: '$32.54'},
        {label: 'Market', value: '$28.25'},
        {label: 'Discount', value: '−13.18%'},
        {label: 'YTD (Gabelli)', value: '+6.54%'},
      ],
      copy: {
        body: 'Gabelli as of Oct 14: NAV $32.54, market $28.25, discount −13.18%, YTD +6.54% (NAV total return). Closed-end income/value. When chips get punched, this sleeve is supposed to look different. Not “Next NVDA.”',
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
      id: 'aapl-ir-date',
      area: 'name' as const,
      ticker: 'AAPL',
      question: 'Has Apple IR named the next earnings date?',
      whyItMatters: 'Press lists Nov 2. Apple newsroom/IR pages were unread or 404 this wake. We will not use the press date.',
      neededToKnow: 'Apple IR or newsroom page that names the call.',
      status: 'unknown' as const,
    },
    {
      id: 'europe-close',
      area: 'GLOBAL' as const,
      question: 'Where did Europe close Thursday?',
      whyItMatters: 'This 9:00 ET wake is during the London session. A Thursday Europe close would be a fake print.',
      neededToKnow: 'Wait for the Europe cash close, or omit the lane — this episode omits it.',
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
      question: 'What is a composite NVDA score this morning?',
      whyItMatters: 'No 0–100 exists in the IR release or the tape. A decorative score would be a lie.',
      neededToKnow: 'A named formula and inputs — or omit the score field.',
      status: 'unknown' as const,
    },
  ],
  scenarios: [],
  capitalPlan: {
    existingPortfolio: 'HOLD — sell nothing this morning.',
    freshCapital: 'No add before today’s US cash tape. New core money still simplifies into VOO after the session, not more NVDA/AAPL/VUG/MGK.',
    bestAdd: 'VOO',
    highestUpsideWatch: 'none named',
    biggestRisk: 'Mega-cap growth overlap across NVDA, AAPL, MGK, VUG, VOO, VTI — Wednesday showed the cluster.',
    nextTrigger: 'Today’s US cash open, then GTC Berlin Oct 21, FOMC Oct 27–28, NVDA Nov 17',
    ifThen: [
      {
        tone: 'watch' as const,
        if: 'Wednesday follow-through — chips weak, rest mixed',
        then: 'HOLD. Do not average down on overlap.',
      },
      {
        tone: 'long' as const,
        if: 'Tape holds and you have C$ to put to work after the session',
        then: 'VOO is still the simple core add — not more NVDA.',
      },
      {
        tone: 'caution' as const,
        if: 'IR guide / margins / China-DC language changes, or funding stress hits the names you already own',
        then: 'Do not automatically buy the dip',
      },
      {
        tone: 'short' as const,
        if: 'Demand deterioration plus a ~10%+ break from this week’s NVDA cluster',
        then: 'Consider reducing exposure — Evens only',
      },
    ],
  },
  risks: [
    {
      n: '01',
      title: 'Growth-factor concentration',
      body: 'NVDA + AAPL + MGK + VUG + VOO + VTI repeatedly own the same mega-cap ecosystem. Wednesday’s chip dump is that cluster, not a new fact.',
    },
    {
      n: '02',
      title: 'Interest rates + CPI',
      body: 'Official 10-year CMT 5.19% Wednesday. BLS September CPI +3.7% y/y, core +2.6%. High long rates still compress long-duration growth — the exact overweight.',
    },
    {
      n: '03',
      title: 'AI funding / ROI',
      body: 'The debate is whether profits justify hundreds of billions of infrastructure, and whether third-party compute capital stays cheap. That sits under NVDA and most of the indirect book.',
    },
  ],
  close: {
    kicker: 'DIAGNOSTIC',
    headline: 'Wednesday was a cluster day, not a new book.',
    body: 'Hotter CPI. Chips sold off. NVDA is the pain line. AAPL held up. GDV is still the other job. Sit through today’s cash open. Sell nothing. Do not add overlap. VOO remains the simple core if money goes in after the tape. Next named dates: GTC Berlin Oct 21, FOMC Oct 27–28, NVDA Nov 17.',
    pills: [
      {tone: 'watch' as const, label: 'HOLD THIS MORNING'},
      {tone: 'caution' as const, label: 'NO PRE-OPEN ADD'},
      {tone: 'long' as const, label: 'VOO STILL THE CORE'},
    ],
    followThrough: [
      {
        tone: 'watch' as const,
        if: 'NVDA remains the ugly line and the rest of the book is mixed',
        then: 'HOLD. Do not invent a Next-NVDA.',
      },
      {
        tone: 'caution' as const,
        if: 'AI funding stress shows up in the names you already own',
        then: 'More VOO / cash / non-AI quality — Evens decides.',
      },
      {
        tone: 'long' as const,
        if: 'An asymmetric candidate is named by Evens or a filing',
        then: 'That is when the Next-NVDA sleeve gets a ticker.',
      },
    ],
  },
  tickerTape: [
    `SPX ${spxClose.toLocaleString('en-US')}  ${spxDayPct}%`,
    `SPX YTD  +${spxYtdPct}%`,
    `NASDAQ  ${nasdaqDayPct}%`,
    `NVDA  $${nvdaClose.toFixed(2)}  ${nvdaDayPct}%`,
    `AAPL  $${aaplClose.toFixed(2)}  +${aaplDayPct}%`,
    `10Y CMT  ${tenYear}%`,
    `CPI  +0.6% m/m  +3.7% y/y`,
    `NIKKEI  −4.90%`,
    `TSX  −1.11%`,
    `HOLD THIS MORNING`,
  ],
};

export const episode: DailyReport = parseDailyReport(raw);
