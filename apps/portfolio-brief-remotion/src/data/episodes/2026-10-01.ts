import {vsSpxSpread} from '../compute';
import {parseDailyReport, type DailyReport} from '../schema';

/** Last US / CA cash: Wednesday 30 Sep 2026. Asia Thursday 1 Oct: Nikkei + TOPIX. Europe Thursday session omitted. */
const nvdaClose = 228.38;
const nvdaDayPct = 0.51;
const nvdaYtd = 22.74;
const nvdaBeta = 2.22;
const aaplClose = 333.02;
const aaplDayPct = 1.1;
const aaplYtd = 22.83;
const aaplYear = 31.27;
const vooYtd = 12.99;
const vtiYtd = 12.89;
const vugYtd = 10.97;
const mgkYtd = 12.27;
const gdvYtd = 6.72;
const spxClose = 7651.54;
const spxDayPct = -0.25;
const spxYtdPct = 11.77;
const nasdaqClose = 26861.06;
const nasdaqDayPct = 0.24;
const nasdaqYtdPct = 15.6;
const dowClose = 50906.05;
const dowDayPct = -0.86;
const tenYear = 5.29;
const nikkei = 68956.72;
const nikkeiDayPct = 3.3;
const topix = 4131.98;
const topixDayPct = 0.57;
const tsxClose = 35235.87;
const tsxDayPct = -0.63;
const tsxYtdPct = 11.11;
const cadUsdDj = 1.4234;
const wtiWed = 90.64;
const goldWed = 4153.65;
const nvdaQ2Rev = 96.2;
const nvdaDcRev = 89.0;
const nvdaQ3Guide = 108.0;
const nvdaSpxYtd = spxYtdPct;
const aaplSpxYtd = spxYtdPct;
const gdpQ2 = 2.2;
const pceYy = 3.4;
const pceCoreYy = 3.0;

const raw = {
  meta: {
    date: '2026-10-01',
    dateLabel: 'OCT 1, 2026',
    title: 'Daily Wealth Intelligence',
    thesis:
      'Wednesday cash was mixed. Nasdaq finished up. The S&P and the Dow did not. The 10-year closed 5.29%. Tokyo ripped Thursday. The book is still the same seven U.S. growth lines.',
    thesisLead: 'Nasdaq up. S&P down.',
    thesisAccent: 'The 10-year is 5.29%.',
    catalyst: 'Jobs Friday 8:30 ET. Nvidia’s $0.25 dividend pays today. Next named call is November 17.',
    universe: ['AAPL', 'NVDA', 'VOO', 'VTI', 'VUG', 'MGK', 'GDV'],
  },
  market: {
    spxClose,
    spxDayPct,
    spxYtdPct,
    nasdaqDayPct,
    tenYearYield: tenYear,
    note: 'Wednesday U.S. cash mixed after a softer PCE print faded into a higher 10-year. Apple +1.10%. Nvidia +0.51%. This checkout’s registered prior tape is still Aug 25 — mid-September episodes including Sep 30 live on open PRs.',
    nextCalendar: {
      label: 'Jobs Friday · Nvidia Nov 17',
      detail: 'BLS Employment Situation Friday 8:30 ET. Nvidia $0.25 dividend pays today. Q3 call named for November 17. Apple Q4 date still unannounced on IR.',
    },
  },
  markets: {
    global: {
      indices: [
        {
          label: 'Nikkei 225',
          value: nikkei.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: nikkeiDayPct,
          note: 'Thursday close (Japan Times / Dimsum Daily)',
        },
        {
          label: 'TOPIX',
          value: topix.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: topixDayPct,
          note: 'Thursday close (Dimsum Daily)',
        },
      ],
      commodities: [
        {label: 'WTI', value: `$${wtiWed.toFixed(2)}`, note: 'Wednesday cash (Stockhouse); +$1.26. Thursday settle unread.'},
        {
          label: 'Gold',
          value: `$${goldWed.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
          note: 'Wednesday cash (Stockhouse); +$5.08',
        },
      ],
      note: 'Hang Seng and Shanghai closed Thursday for holidays. Europe Thursday is still a session at this 9:17 ET wake — omitted. ASX / Kospi unread.',
    },
    us: {
      indices: [
        {label: 'S&P 500', value: spxClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}), dayPct: spxDayPct},
        {label: 'Nasdaq', value: nasdaqClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}), dayPct: nasdaqDayPct},
        {label: 'Dow', value: dowClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}), dayPct: dowDayPct},
      ],
      yields: [
        {
          label: 'U.S. 10-year',
          value: `${tenYear}%`,
          note: 'Treasury daily par Wednesday via a wrap that cited the official table (Tue 5.26 → Wed 5.29). FRED DGS10 unread.',
        },
      ],
      note: `Wednesday close. Yahoo / AP / Reuters / Seattle Times. S&P YTD +${spxYtdPct}% (Yahoo). Nasdaq YTD +${nasdaqYtdPct}% (AP). Q2 GDP third estimate +${gdpQ2}% annualized (Reuters). August PCE +${pceYy}% / core +${pceCoreYy}%. NYSE is opening at this wake — do not treat pre-market as cash.`,
    },
    ca: {
      indices: [
        {
          label: 'S&P/TSX',
          value: tsxClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: tsxDayPct,
          note: `−224.40 points. YTD +${tsxYtdPct}% (Reuters / Dow Jones Market Data). Quiet session on Truth and Reconciliation Day.`,
        },
        {
          label: 'TSX Venture',
          value: '881.93',
          note: '−5.43 (Stockhouse). Official TSX daily PDF unread.',
        },
      ],
      cadUsd: `DJ 5pm NY USD/CAD ${cadUsdDj} (70.26 U.S. cents). BoC Valet unread.`,
      note: 'Official TSX daily report unread. BoC Valet FXUSDCAD unread this sitting.',
    },
    calendar: {
      items: [
        {
          when: 'Thursday',
          where: 'US' as const,
          label: 'Nvidia $0.25 dividend',
          why: 'Named on the August 26 IR release. Payable October 1 to holders of record September 10.',
        },
        {
          when: 'Friday 8:30 ET',
          where: 'US' as const,
          label: 'September employment report',
          why: 'BLS Employment Situation for September. Confirmed on the October schedule.',
        },
        {
          when: 'October 16',
          where: 'US' as const,
          label: 'GDV $0.15 ex-dividend',
          why: 'Yahoo lists a $0.15 cash dividend with ex-date October 16. NAV unread.',
        },
        {
          when: 'November 17',
          where: 'US' as const,
          label: 'Nvidia Q3 call',
          why: 'Named August 26. Yahoo lists Nov 17. Guide still $108.0B ±2%.',
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
      role: 'Highest factor weight in the story',
      whatMatters: 'Wednesday +0.51% to $228.38. Q3 guide still $108.0B ±2%. Dividend pays today. Next named call Nov 17.',
      ytd: nvdaYtd,
    },
    {
      ticker: 'AAPL',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Recent purchase',
      whatMatters: 'Wednesday +1.10% to $333.02 after Tuesday’s −2.66%. Q4 date still unannounced on IR.',
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
      whatMatters: 'Still lagging S&P YTD. Same mega-cap stack as NVDA and AAPL.',
      ytd: vugYtd,
      overlapWith: ['NVDA', 'AAPL', 'VOO', 'MGK'],
    },
    {
      ticker: 'MGK',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Mega-cap growth',
      whatMatters: 'Same mega-cap stack as VUG, NVDA, and AAPL.',
      ytd: mgkYtd,
      overlapWith: ['NVDA', 'AAPL', 'VUG', 'VOO'],
    },
    {
      ticker: 'GDV',
      rating: 'HOLD — income / diversifier',
      tone: 'long' as const,
      role: 'Income sleeve',
      whatMatters: 'Different job. Wednesday $28.29 −0.60%. NAV unread. Next named dividend $0.15, ex Oct 16.',
      ytd: gdvYtd,
    },
  ],
  portfolio: {
    concentrationThesis: 'VOO + VTI + VUG + MGK + AAPL + NVDA still buy the same U.S. mega-cap growth names.',
    concentrationBody:
      'Wednesday showed the split inside the same factor: Apple +1.10%, Nvidia +0.51%, Nasdaq +0.24%, S&P −0.25%. Weights still unknown, so the size of that overlap stays qualitative.',
    factorStack: ['NVDA', 'AAPL', 'MGK', 'VUG', 'VOO', 'VTI'],
    factorLabel: 'U.S. mega-cap / growth',
    overlapNote: 'same ecosystem',
  },
  names: [
    {
      ticker: 'NVDA',
      chapterTitle: 'NVDA · dividend day, not a new thesis',
      rating: 'HOLD — POST-PRINT WATCH',
      tone: 'watch' as const,
      price: nvdaClose,
      dayPct: nvdaDayPct,
      holdNote: 'No add on a 5.29% 10-year. Cash dividend pays today. Next named event is November 17.',
      fundamentals: [
        {label: 'Market cap', value: '$5.515T'},
        {label: 'Q2 FY27 revenue', value: `$${nvdaQ2Rev.toFixed(1)}B +106% y/y`},
        {label: 'Q2 data center', value: `$${nvdaDcRev.toFixed(1)}B +117% y/y`},
        {label: 'Q2 GAAP EPS', value: '$2.46'},
        {label: 'Q3 guide', value: `$${nvdaQ3Guide.toFixed(1)}B ±2%`},
        {label: 'Q3 GM guide', value: '74.0% ±50 bp'},
        {label: 'TTM EPS / P/E', value: '$7.90 / 28.91×'},
        {label: 'Beta', value: String(nvdaBeta)},
      ],
      vsSpx: {
        headline: 'Still ahead of the S&P YTD. Extra return is real. Extra volatility is the price.',
        bars: [
          {label: 'NVDA YTD', pct: nvdaYtd, tone: 'nvda' as const},
          {label: 'S&P YTD', pct: nvdaSpxYtd, tone: 'muted' as const},
        ],
        note: `Spread: ${vsSpxSpread(nvdaYtd, nvdaSpxYtd) >= 0 ? '+' : ''}${vsSpxSpread(nvdaYtd, nvdaSpxYtd).toFixed(1)} points (NVDA Yahoo trailing YTD − S&P YTD). Beta: ${nvdaBeta}. Wednesday close $228.38.`,
      },
      consensus: {
        rows: [
          {label: 'Q2 revenue (printed)', value: `$${nvdaQ2Rev.toFixed(1)}B`},
          {label: 'Q3 revenue guide', value: `$${nvdaQ3Guide.toFixed(1)}B ±2%`},
          {label: 'Q3 GM guide', value: '74.0% ±50 bp'},
          {label: 'China DC compute in guide', value: 'None assumed'},
        ],
        note: 'August 26 IR. Next named call November 17. Street whisper unread.',
        range: {metric: 'Q3 revenue guide', unit: 'B', low: 105.8, high: 110.2, guide: 108.0},
      },
      narrative: {
        leftTitle: 'THE FEAR',
        leftHeadline: 'A 5.29% 10-year reprices long-duration growth. Core PCE is still 3.0%.',
        leftBody:
          'Wednesday’s 10-year par close is 5.29% after Tuesday’s 5.26%. Wraps that cited Treasury’s table put the intra-day high near 5.30%. August PCE +3.4% headline / +3.0% core. That is the cost of capital under every growth line in the book.',
        rightTitle: 'THE COUNTER',
        rightHeadline: 'IR still guides $108.0B ±2% and says Vera Rubin is in production.',
        rightBody:
          'Q2 data center $89.0B. No China data-center compute in the Q3 outlook. Partnerships named to mobilize over $500B of third-party AI infrastructure capital, subject to definitive agreements. $0.25 cash dividend pays today.',
      },
      interpretation: {
        chips: [
          {label: 'CONFIRMED', tone: 'long' as const, text: 'Q2 printed $96.2B. Q3 guide is $108.0B ±2%.'},
          {label: 'CONFIRMED', tone: 'watch' as const, text: 'Wednesday 10-year 5.29% after August PCE 3.4% / 3.0% core.'},
          {
            label: 'INFERENCE',
            tone: 'caution' as const,
            text: 'The debate is still ROI on the buildout, not “is AI real.”',
          },
        ],
        note: 'No composite score. Missing inputs stay UNKNOWN on the prediction board.',
      },
      actionMatrix: {
        headline: 'HOLD. Dividend day is not an add day. Next named event is November 17.',
        rows: [
          {
            tone: 'watch' as const,
            if: 'Jobs Friday is orderly and the 10-year stops rising',
            then: 'HOLD. Do not chase Wednesday’s +0.51%.',
          },
          {
            tone: 'long' as const,
            if: 'Nov 17 clears the $108B guide and keeps Rubin supply in the story',
            then: 'Re-read ADD. Not before the print.',
          },
          {
            tone: 'caution' as const,
            if: 'Guide cuts or GM falls through 73.5%',
            then: 'Do not automatically buy the dip',
          },
          {
            tone: 'short' as const,
            if: 'Demand language turns and the factor stack breaks together',
            then: 'Consider reducing overlap, not just NVDA',
          },
        ],
      },
      network: {
        title: 'NVDA · qualitative demand chain',
        headline: 'Polarity from IR and Wednesday’s 10-year — no composite score.',
        nodes: [
          {id: 'labs', label: 'Frontier labs / CSPs', polarity: 'confirmed' as const, x: 0.08, y: 0.22},
          {id: 'demand', label: 'GPU demand', polarity: 'confirmed' as const, x: 0.3, y: 0.22},
          {id: 'spend', label: 'AI factory buildout', polarity: 'confirmed' as const, x: 0.5, y: 0.22, evidence: 'Q3 guide $108.0B ±2%'},
          {id: 'financing', label: 'Third-party capital', polarity: 'concern' as const, x: 0.3, y: 0.78, evidence: '>$500B named, subject to docs'},
          {id: 'nvda', label: 'NVDA', polarity: 'neutral' as const, x: 0.62, y: 0.5},
          {id: 'rates', label: '10-year / PCE', polarity: 'concern' as const, x: 0.3, y: 0.5, evidence: '5.29% · core 3.0%'},
          {id: 'supply', label: 'Vera Rubin / TSM', polarity: 'confirmed' as const, x: 0.82, y: 0.18, evidence: 'IR: full production'},
          {id: 'margins', label: 'GM guide', polarity: 'inference' as const, x: 0.82, y: 0.5, evidence: '74.0% ±50 bp'},
          {id: 'eps', label: 'Nov 17 print', polarity: 'inference' as const, x: 0.82, y: 0.82},
        ],
        edges: [
          {from: 'labs', to: 'demand'},
          {from: 'demand', to: 'spend'},
          {from: 'spend', to: 'nvda'},
          {from: 'financing', to: 'nvda', label: 'exposure'},
          {from: 'rates', to: 'nvda', label: 'discount'},
          {from: 'nvda', to: 'supply'},
          {from: 'nvda', to: 'margins'},
          {from: 'margins', to: 'eps'},
        ],
      },
    },
    {
      ticker: 'AAPL',
      chapterTitle: 'AAPL · Wednesday took back some of Tuesday',
      rating: 'HOLD',
      tone: 'long' as const,
      price: aaplClose,
      dayPct: aaplDayPct,
      returns: {
        headline: 'Still ahead of the S&P YTD. Wednesday’s bounce does not change the hold.',
        bars: [
          {label: 'YTD', pct: aaplYtd, tone: 'long' as const},
          {label: 'S&P YTD', pct: aaplSpxYtd, tone: 'muted' as const},
          {label: '1 year', pct: aaplYear, tone: 'gold' as const},
        ],
        panelTitle: 'WEDNESDAY PRINT',
        panelBody: '+1.10% to $333.02 after Tuesday’s −2.66%. 52-week high $345.34.',
        note: `Spread vs S&P YTD: ${vsSpxSpread(aaplYtd, aaplSpxYtd) >= 0 ? '+' : ''}${vsSpxSpread(aaplYtd, aaplSpxYtd).toFixed(1)} points. Yahoo trailing YTD as of Sep 30.`,
      },
      catalyst: {
        headline: 'Q4 date is still unannounced on Apple IR. Do not treat Oct 29 as official.',
        steps: [
          'Fiscal year ended around this week',
          'Last confirmed call was July 30 (Q3)',
          'Yahoo lists October 29',
          'IR has not named the date',
        ],
        note: 'Yahoo floats October 29. That is a calendar estimate. The last IR-confirmed call is Q3 on July 30 ($109.4B revenue, $2.02 diluted EPS).',
      },
      action: {
        headline: 'HOLD the position. Do not add on a +1.10% Wednesday.',
        body: 'You already own it. Averaging in here doubles the same name. Next contribution still diversifies, not AAPL.',
      },
    },
    {
      ticker: 'VOO',
      chapterTitle: 'VOO · the foundation is not the problem',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      metrics: [
        {label: 'YTD', value: '+12.99%'},
        {label: 'Wednesday', value: '−0.23%'},
      ],
      copy: {
        headline: 'Best simple core. New core money simplifies here.',
        body: 'Wednesday $700.86. Yahoo YTD daily total return +12.99%. Do not sell. Stop splitting every future contribution with VTI.',
      },
    },
    {
      ticker: 'VTI',
      chapterTitle: 'VTI · excellent, overlapping',
      rating: 'HOLD',
      tone: 'long' as const,
      metrics: [
        {label: 'YTD', value: '+12.89%'},
        {label: 'Wednesday', value: '−0.27%'},
      ],
      copy: {
        headline: 'Excellent. Mega-caps still dominate, so the top looks like VOO.',
        body: 'Wednesday $374.24. Yahoo YTD daily total return +12.89%. Do not sell. The overlap with VOO is the issue — not the fund quality.',
      },
    },
    {
      ticker: 'VUG',
      chapterTitle: 'VUG · growth sleeve still lagging the index',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      returns: {
        headline: 'The growth label is not beating the S&P this year — and you already own the individual winners.',
        bars: [
          {label: 'VUG YTD', pct: vugYtd, tone: 'watch' as const},
          {label: 'S&P YTD', pct: spxYtdPct, tone: 'long' as const},
        ],
        note: 'Yahoo YTD daily total return +10.97% vs S&P +11.77%. Wednesday $90.11 +0.19%. HOLD existing. No priority additions.',
      },
    },
    {
      ticker: 'MGK',
      chapterTitle: 'MGK · same issue, more concentrated',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      metrics: [
        {label: 'YTD', value: '+12.27%'},
        {label: 'Wednesday', value: '+0.24%'},
      ],
      copy: {
        body: 'Wednesday $92.65. Yahoo YTD daily total return +12.27%. You already own NVDA and AAPL directly. HOLD. Stop feeding it. Not a sell call — tax and account mechanics are not reconstructed from the latest screen.',
      },
    },
    {
      ticker: 'GDV',
      chapterTitle: 'GDV · a completely different job',
      rating: 'HOLD · INCOME / DIVERSIFIER',
      tone: 'long' as const,
      metrics: [
        {label: 'Market', value: '$28.29'},
        {label: 'Wednesday', value: '−0.60%'},
        {label: 'Fwd dist.', value: '6.36%'},
        {label: 'NAV', value: 'unread'},
      ],
      copy: {
        body: 'Closed-end income/value. Yahoo trailing YTD +6.72% as of Sep 30. Next named cash dividend $0.15, ex Oct 16. When AI/growth gets punched, this sleeve is supposed to look different. Not a growth engine. Not “Next NVDA.”',
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
      id: 'europe-thu',
      area: 'GLOBAL' as const,
      question: 'Where did Europe close Thursday?',
      whyItMatters: 'London and the continent were still in session at this 9:17 ET wake. Intraday snapshots conflicted.',
      neededToKnow: 'Official FTSE / DAX / STOXX closes after the European cash close.',
      status: 'unknown' as const,
    },
    {
      id: 'boc-cad',
      area: 'CA' as const,
      question: 'What did BoC Valet print for USD/CAD, and what is the official TSX daily PDF?',
      whyItMatters: 'The contribution is in C$. DJ 5pm NY 1.4234 is a wrap print, not the Valet series.',
      neededToKnow: 'BoC Valet FXUSDCAD for 2026-09-30 plus the official TSX daily report.',
      status: 'partial' as const,
    },
    {
      id: 'aapl-q4-date',
      area: 'name' as const,
      ticker: 'AAPL',
      question: 'When is Apple’s official Q4 call?',
      whyItMatters: 'Yahoo lists October 29. That is not an IR confirmation. A guessed date would be a fake catalyst.',
      neededToKnow: 'Apple IR names the date and time.',
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
    existingPortfolio: 'HOLD — sell nothing this morning.',
    freshCapital: 'New core money still simplifies into VOO. No add to NVDA or AAPL on Wednesday’s bounce.',
    bestAdd: 'VOO',
    highestUpsideWatch: 'none named',
    biggestRisk: 'Mega-cap growth overlap across NVDA, AAPL, MGK, VUG, VOO, VTI on a 5.29% 10-year',
    nextTrigger: 'Friday — BLS September Employment Situation, 8:30 ET',
    ifThen: [
      {
        tone: 'watch' as const,
        if: 'Jobs Friday is orderly and the 10-year stops rising',
        then: 'HOLD. Do not chase Wednesday’s Nasdaq bounce.',
      },
      {
        tone: 'long' as const,
        if: 'Fresh C$ arrives and no new name is sourced',
        then: 'VOO. Not another growth sleeve.',
      },
      {
        tone: 'caution' as const,
        if: 'The 10-year keeps climbing through jobs',
        then: 'Do not add duration. Leave NVDA and AAPL alone.',
      },
      {
        tone: 'short' as const,
        if: 'Demand language turns and the factor stack breaks together',
        then: 'Consider reducing overlap, not just one ticker',
      },
    ],
  },
  risks: [
    {
      n: '01',
      title: 'Growth-factor concentration',
      body: 'NVDA + AAPL + MGK + VUG + VOO + VTI repeatedly own the same mega-cap ecosystem. Weights unread.',
    },
    {
      n: '02',
      title: 'Interest rates',
      body: `The 10-year closed ${tenYear}% Wednesday. High long rates compress long-duration growth — the exact overweight.`,
    },
    {
      n: '03',
      title: 'AI ROI',
      body: 'The debate is still whether profits justify hundreds of billions of annual infrastructure. That sits under NVDA and most of the indirect book.',
    },
  ],
  close: {
    kicker: 'DIAGNOSTIC',
    headline: 'Wednesday mixed. Tokyo strong. Jobs Friday.',
    body: `S&P 7,651.54 −0.25%. Nasdaq +0.24%. 10-year ${tenYear}%. Apple recovered some of Tuesday. Nvidia pays the $0.25 today. The book did not change. After jobs: numbers, then HOLD / ADD VOO / do-not-chase.`,
    pills: [
      {tone: 'watch' as const, label: 'HOLD THIS MORNING'},
      {tone: 'long' as const, label: 'VOO FOR NEW C$'},
      {tone: 'caution' as const, label: 'JOBS FRIDAY'},
    ],
    followThrough: [
      {
        tone: 'watch' as const,
        if: 'Jobs is orderly and the 10-year fades',
        then: 'HOLD the book. Still no new name.',
      },
      {
        tone: 'caution' as const,
        if: 'Yields lurch higher on a hot payrolls print',
        then: 'More VOO / cash. Do not add the growth stack.',
      },
      {
        tone: 'long' as const,
        if: 'An asymmetric candidate is named in a filing or by Evens',
        then: 'That is when the Next-NVDA sleeve gets capital.',
      },
    ],
  },
  tickerTape: [
    `SPX ${spxClose.toLocaleString('en-US')}  ${spxDayPct}%`,
    `SPX YTD  +${spxYtdPct}%`,
    `NASDAQ  +${nasdaqDayPct}%  YTD +${nasdaqYtdPct}%`,
    `NVDA  $${nvdaClose.toFixed(2)}  +${nvdaDayPct}%`,
    `AAPL  $${aaplClose.toFixed(2)}  +${aaplDayPct}%`,
    `10Y  ${tenYear}%`,
    `NIKKEI  +${nikkeiDayPct}%`,
    `TSX  ${tsxClose.toLocaleString('en-US')}  ${tsxDayPct}%`,
    `JOBS  FRIDAY 8:30 ET`,
    `VOO CORE / ADD`,
    `SELL NOTHING THIS MORNING`,
  ],
};

export const episode: DailyReport = parseDailyReport(raw);
