import {vsSpxSpread} from '../compute';
import {parseDailyReport, type DailyReport} from '../schema';

/** Last US / CA cash: Thursday 1 Oct 2026. Asia Friday 2 Oct. Jobs printed 8:30 ET. Europe Friday session omitted. */
const nvdaClose = 230.86;
const nvdaDayPct = 1.09;
const nvdaYtd = 24.08;
const aaplClose = 330.32;
const aaplDayPct = -0.81;
const aaplYtd = 21.83;
const vooClose = 702.35;
const vooDayPct = 0.21;
const vooYtd = 12.96;
const vtiClose = 375.18;
const vtiDayPct = 0.25;
const vtiYtd = 12.86;
const vugClose = 90.23;
const vugDayPct = 0.13;
const vugYtd = 11.33;
const mgkClose = 92.76;
const mgkDayPct = 0.12;
const gdvClose = 28.12;
const gdvDayPct = -0.6;
const gdvNav = 32.25;
const gdvDiscount = -12.81;
const gdvYtd = 6.05;
const spxClose = 7666.45;
const spxDayPct = 0.19;
const spxYtdPct = 11.99;
const nasdaqClose = 26871.6;
const nasdaqDayPct = 0.04;
const nasdaqYtdPct = 15.6;
const dowClose = 50926.56;
const dowDayPct = 0.04;
const tenYear = 5.24;
const nikkei = 68309.46;
const nikkeiDayPct = -0.94;
const nikkeiYtdPct = 35.7;
const topix = 4091.0;
const topixDayPct = -0.99;
const hangSeng = 23972.29;
const hangSengDayPct = -2.6;
const hangSengYtdPct = -6.47;
const daxThu = 24939.35;
const daxThuDayPct = -1.03;
const tsxClose = 35154.76;
const tsxDayPct = -0.23;
const tsxYtdPct = 10.85;
const usdCadDj = 1.4222;
const nvdaQ2Rev = 96.2;
const nvdaDcRev = 89.0;
const nvdaQ3Guide = 108.0;
const jobsNfp = 29000;
const jobsUnemp = 4.2;
const jobsAheMom = 0.1;
const jobsAheYy = 3.0;
const jobsRev = -60000;
const nvdaSpxYtd = spxYtdPct;
const aaplSpxYtd = spxYtdPct;

const raw = {
  meta: {
    date: '2026-10-02',
    dateLabel: 'OCT 2, 2026',
    title: 'Daily Wealth Intelligence',
    thesis:
      'Jobs missed. Payrolls +29,000. Street wanted about 84,000. The book is still the same seven U.S. growth lines. Soft jobs is a rate story, not a new name.',
    thesisLead: 'Jobs missed.',
    thesisAccent: 'Payrolls +29,000. Street wanted ~84,000.',
    catalyst: 'BLS printed. Next named prints: Nvidia November 17. Apple Q4 still unannounced on IR.',
    universe: ['AAPL', 'NVDA', 'VOO', 'VTI', 'VUG', 'MGK', 'GDV'],
  },
  market: {
    spxClose,
    spxDayPct,
    spxYtdPct,
    nasdaqDayPct,
    tenYearYield: tenYear,
    note: 'Thursday U.S. cash eked higher as the 10-year eased to 5.24% from Wednesday’s 5.29%. Jobs printed 8:30 ET: +29,000 / 4.2% unemployed. Futures jumped after the print. U.S. cash is still Thursday.',
    nextCalendar: {
      label: 'Nvidia Nov 17 · October jobs Nov 6',
      detail: 'September jobs already printed. Next BLS Employment Situation is November 6. Nvidia Q3 call named November 17. Apple Q4 date still unannounced on IR.',
    },
  },
  markets: {
    global: {
      indices: [
        {
          label: 'Nikkei 225',
          value: nikkei.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: nikkeiDayPct,
          note: `Friday close. YTD +${nikkeiYtdPct}% (Dow Jones / FactSet)`,
        },
        {
          label: 'TOPIX',
          value: topix.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: topixDayPct,
          note: 'Friday close (FISCO / Jiji)',
        },
        {
          label: 'Hang Seng',
          value: hangSeng.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: hangSengDayPct,
          note: `Friday close. YTD ${hangSengYtdPct}% (Dow Jones / FactSet)`,
        },
        {
          label: 'DAX',
          value: daxThu.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: daxThuDayPct,
          note: 'Thursday close (Stooq). Friday Europe still in session at this 9:04 ET wake — omitted.',
        },
      ],
      note: 'Shanghai Friday holiday. ASX unread. Friday Europe cash omitted (in-session). Thursday AP Europe: London −1.7%, Paris −1.6%, Frankfurt −1.0%.',
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
          note: 'Thursday Treasury daily par 5.24 after Wednesday 5.29 (Edge / Traders Agency citing the official table). FRED DGS10 unread.',
        },
      ],
      note: `Thursday close. AP / Seattle Times / Edge. S&P YTD +${spxYtdPct}% (Yahoo as of Oct 1). Nasdaq YTD +${nasdaqYtdPct}% (AP). BLS 8:30 ET: +29,000 payrolls, jobless ${jobsUnemp}%, AHE +${jobsAheMom}% m/m / +${jobsAheYy}% y/y. July/August revised ${jobsRev.toLocaleString('en-US')} combined. Street (CNBC / Dow Jones) wanted ~84,000 and 4.1%. NYSE opens 9:30 — do not treat futures as cash.`,
    },
    ca: {
      indices: [
        {
          label: 'S&P/TSX',
          value: tsxClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: tsxDayPct,
          note: `−81.11 points. YTD +${tsxYtdPct}%. Four-day losing streak. Lowest close since July 20 (Dow Jones Market Data).`,
        },
      ],
      cadUsd: `DJ 5pm NY USD/CAD ${usdCadDj} (70.32 U.S. cents). BoC Valet unread.`,
      note: 'Official TSX daily report unread. TSX Venture unread this sitting. BoC Valet FXUSDCAD unread.',
    },
    calendar: {
      items: [
        {
          when: 'Friday 8:30 ET · printed',
          where: 'US' as const,
          label: 'September employment report',
          why: `BLS: +${jobsNfp.toLocaleString('en-US')} payrolls, unemployment ${jobsUnemp}%. Revisions ${jobsRev.toLocaleString('en-US')}. Street wanted ~84,000 and 4.1%.`,
        },
        {
          when: 'October 16',
          where: 'US' as const,
          label: 'GDV $0.15 ex-dividend',
          why: 'Gabelli named $0.15 for October, record October 16, payable October 23.',
        },
        {
          when: 'November 6 8:30 ET',
          where: 'US' as const,
          label: 'October employment report',
          why: 'Next BLS Employment Situation, named on today’s release.',
        },
        {
          when: 'November 17',
          where: 'US' as const,
          label: 'Nvidia Q3 call',
          why: 'Named August 26. Guide still $108.0B ±2%.',
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
      whatMatters: 'Thursday +1.09% to $230.86. Q3 guide still $108.0B ±2%. Next named call Nov 17. Dividend paid yesterday.',
      ytd: nvdaYtd,
    },
    {
      ticker: 'AAPL',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Recent purchase',
      whatMatters: 'Thursday −0.81% to $330.32 after Wednesday’s +1.10%. Q4 date still unannounced on IR.',
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
      whatMatters: 'Same mega-cap stack as VUG, NVDA, and AAPL. Thursday $92.76. YTD unread this sitting.',
      overlapWith: ['NVDA', 'AAPL', 'VUG', 'VOO'],
    },
    {
      ticker: 'GDV',
      rating: 'HOLD — income / diversifier',
      tone: 'long' as const,
      role: 'Income sleeve',
      whatMatters: `Different job. Thursday $${gdvClose.toFixed(2)} ${gdvDayPct}%. Gabelli NAV $${gdvNav.toFixed(2)}, discount ${gdvDiscount}%. Next named dividend $0.15, ex Oct 16.`,
      ytd: gdvYtd,
    },
  ],
  portfolio: {
    concentrationThesis: 'VOO + VTI + VUG + MGK + AAPL + NVDA still buy the same U.S. mega-cap growth names.',
    concentrationBody:
      'Thursday showed the split inside the same factor: Nvidia +1.09%, Apple −0.81%, S&P +0.19%, Nasdaq +0.04%. Soft jobs is a discount-rate story for that whole stack. Weights still unknown, so the size of the overlap stays qualitative.',
    factorStack: ['NVDA', 'AAPL', 'MGK', 'VUG', 'VOO', 'VTI'],
    factorLabel: 'U.S. mega-cap / growth',
    overlapNote: 'same ecosystem',
  },
  names: [
    {
      ticker: 'NVDA',
      chapterTitle: 'NVDA · jobs day, not a new thesis',
      rating: 'HOLD — POST-PRINT WATCH',
      tone: 'watch' as const,
      price: nvdaClose,
      dayPct: nvdaDayPct,
      holdNote: 'No add on a jobs bounce in futures. Cash dividend paid yesterday. Next named event is November 17.',
      streak: [-1.47, -0.41, 0.22, 1.68, -0.72, 0.51, 1.09],
      streakHeadline: 'Seven sessions. Three red. Thursday was the strongest up day in the window.',
      streakNote: 'Closes from FT / StatMuse: Sep 23 through Oct 1. Red days: 3 of 7. Not a 21-day grid.',
      fundamentals: [
        {label: 'Q2 FY27 revenue', value: `$${nvdaQ2Rev.toFixed(1)}B +106% y/y`},
        {label: 'Q2 data center', value: `$${nvdaDcRev.toFixed(1)}B +117% y/y`},
        {label: 'Q2 GAAP EPS', value: '$2.46'},
        {label: 'Q3 guide', value: `$${nvdaQ3Guide.toFixed(1)}B ±2%`},
        {label: 'Q3 GM guide', value: '74.0% ±50 bp'},
      ],
      vsSpx: {
        headline: 'Still ahead of the S&P YTD. Extra return is real. Extra volatility is the price.',
        bars: [
          {label: 'NVDA YTD', pct: nvdaYtd, tone: 'nvda' as const},
          {label: 'S&P YTD', pct: nvdaSpxYtd, tone: 'muted' as const},
        ],
        note: `Spread: ${vsSpxSpread(nvdaYtd, nvdaSpxYtd) >= 0 ? '+' : ''}${vsSpxSpread(nvdaYtd, nvdaSpxYtd).toFixed(1)} points (NVDA Yahoo trailing YTD − S&P Yahoo YTD, as of Oct 1). Thursday close $230.86.`,
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
        leftHeadline: 'A 5.24% 10-year still reprices long-duration growth. Soft jobs does not erase that.',
        leftBody:
          'Thursday’s 10-year par close is 5.24% after Wednesday’s 5.29%. That is still a high cost of capital under every growth line in the book. Soft payrolls cut the odds of an October hike (CNBC). They do not cut the rate already on the screen.',
        rightTitle: 'THE COUNTER',
        rightHeadline: 'IR still guides $108.0B ±2%. Thursday the stock closed $230.86, +1.09%.',
        rightBody:
          'Q2 data center $89.0B. No China data-center compute in the Q3 outlook. $0.25 cash dividend paid October 1. Next named event is November 17 — not this jobs print.',
      },
      interpretation: {
        chips: [
          {label: 'CONFIRMED', tone: 'long' as const, text: 'Q2 printed $96.2B. Q3 guide is $108.0B ±2%.'},
          {label: 'CONFIRMED', tone: 'watch' as const, text: 'BLS +29,000 / 4.2%. Thursday 10-year 5.24%.'},
          {
            label: 'INFERENCE',
            tone: 'caution' as const,
            text: 'The debate is still ROI on the buildout, not “is AI real.”',
          },
        ],
        note: 'No composite score. Missing inputs stay UNKNOWN on the prediction board.',
      },
      actionMatrix: {
        headline: 'HOLD. Jobs day is not an add day. Next named event is November 17.',
        rows: [
          {
            tone: 'watch' as const,
            if: 'Futures fade and the 10-year stays near 5.24%',
            then: 'HOLD. Do not chase Thursday’s +1.09%.',
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
        headline: 'Polarity from IR and this morning’s jobs print — no composite score.',
        nodes: [
          {id: 'labs', label: 'Frontier labs / CSPs', polarity: 'confirmed' as const, x: 0.08, y: 0.22},
          {id: 'demand', label: 'GPU demand', polarity: 'confirmed' as const, x: 0.3, y: 0.22},
          {id: 'spend', label: 'AI factory buildout', polarity: 'confirmed' as const, x: 0.5, y: 0.22, evidence: 'Q3 guide $108.0B ±2%'},
          {id: 'financing', label: 'Third-party capital', polarity: 'concern' as const, x: 0.3, y: 0.78, evidence: '>$500B named, subject to docs'},
          {id: 'nvda', label: 'NVDA', polarity: 'neutral' as const, x: 0.62, y: 0.5},
          {id: 'jobs', label: 'Payrolls / 10-year', polarity: 'concern' as const, x: 0.3, y: 0.5, evidence: '+29k · 5.24%'},
          {id: 'supply', label: 'Vera Rubin / TSM', polarity: 'confirmed' as const, x: 0.82, y: 0.18, evidence: 'IR: full production'},
          {id: 'margins', label: 'GM guide', polarity: 'inference' as const, x: 0.82, y: 0.5, evidence: '74.0% ±50 bp'},
          {id: 'eps', label: 'Nov 17 print', polarity: 'inference' as const, x: 0.82, y: 0.82},
        ],
        edges: [
          {from: 'labs', to: 'demand'},
          {from: 'demand', to: 'spend'},
          {from: 'spend', to: 'nvda'},
          {from: 'financing', to: 'nvda', label: 'exposure'},
          {from: 'jobs', to: 'nvda', label: 'discount'},
          {from: 'nvda', to: 'supply'},
          {from: 'nvda', to: 'margins'},
          {from: 'margins', to: 'eps'},
        ],
      },
    },
    {
      ticker: 'AAPL',
      chapterTitle: 'AAPL · Thursday gave back Wednesday',
      rating: 'HOLD',
      tone: 'long' as const,
      price: aaplClose,
      dayPct: aaplDayPct,
      returns: {
        headline: 'Still ahead of the S&P YTD. Thursday’s −0.81% does not change the hold.',
        bars: [
          {label: 'YTD', pct: aaplYtd, tone: 'long' as const},
          {label: 'S&P YTD', pct: aaplSpxYtd, tone: 'muted' as const},
        ],
        panelTitle: 'THURSDAY PRINT',
        panelBody: '−0.81% to $330.32 after Wednesday’s +1.10% to $333.02.',
        note: `Spread vs S&P YTD: ${vsSpxSpread(aaplYtd, aaplSpxYtd) >= 0 ? '+' : ''}${vsSpxSpread(aaplYtd, aaplSpxYtd).toFixed(1)} points. Yahoo trailing YTD as of Oct 1.`,
      },
      catalyst: {
        headline: 'Q4 date is still unannounced on Apple IR. Do not treat Oct 29 as official.',
        steps: [
          'Fiscal year ended around this week',
          'Last confirmed call was July 30 (Q3)',
          'Calendars float October 29',
          'IR has not named the date',
        ],
        note: 'Calendars float October 29. That is a calendar estimate. The last IR-confirmed call is Q3 on July 30.',
      },
      action: {
        headline: 'HOLD the position. Do not add on a jobs-morning bounce.',
        body: 'You already own it. Averaging in here doubles the same name. Next contribution still diversifies, not AAPL.',
      },
    },
    {
      ticker: 'VOO',
      chapterTitle: 'VOO · the foundation is not the problem',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      metrics: [
        {label: 'YTD', value: `+${vooYtd}%`},
        {label: 'Thursday', value: `+${vooDayPct}%`},
      ],
      copy: {
        headline: 'Best simple core. New core money simplifies here.',
        body: `Thursday $${vooClose.toFixed(2)}. Total-return YTD +${vooYtd}% through Oct 1 (Total Real Returns). Do not sell. Stop splitting every future contribution with VTI.`,
      },
    },
    {
      ticker: 'VTI',
      chapterTitle: 'VTI · excellent, overlapping',
      rating: 'HOLD',
      tone: 'long' as const,
      metrics: [
        {label: 'YTD', value: `+${vtiYtd}%`},
        {label: 'Thursday', value: `+${vtiDayPct}%`},
      ],
      copy: {
        headline: 'Excellent. Mega-caps still dominate, so the top looks like VOO.',
        body: `Thursday $${vtiClose.toFixed(2)}. Total-return YTD +${vtiYtd}% through Oct 1 (Total Real Returns). Do not sell. The overlap with VOO is the issue — not the fund quality.`,
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
        note: `Total-return YTD +${vugYtd}% through Oct 1 vs S&P Yahoo +${spxYtdPct}%. Thursday $${vugClose.toFixed(2)} +${vugDayPct}%. HOLD existing. No priority additions.`,
      },
    },
    {
      ticker: 'MGK',
      chapterTitle: 'MGK · same issue, more concentrated',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      metrics: [
        {label: 'Thursday', value: `$${mgkClose.toFixed(2)}`},
        {label: 'Day', value: `+${mgkDayPct}%`},
        {label: 'YTD', value: 'unread'},
      ],
      copy: {
        body: 'Thursday $92.76. Oct 1 YTD unread this sitting — do not keep Wednesday’s number. You already own NVDA and AAPL directly. HOLD. Stop feeding it. Not a sell call — tax and account mechanics are not reconstructed from the latest screen.',
      },
    },
    {
      ticker: 'GDV',
      chapterTitle: 'GDV · a completely different job',
      rating: 'HOLD · INCOME / DIVERSIFIER',
      tone: 'long' as const,
      metrics: [
        {label: 'Market', value: `$${gdvClose.toFixed(2)}`},
        {label: 'NAV', value: `$${gdvNav.toFixed(2)}`},
        {label: 'Discount', value: `${gdvDiscount}%`},
        {label: 'Thursday', value: '−0.60%'},
      ],
      copy: {
        body: `Closed-end income/value. Gabelli market $28.12, NAV $32.25, discount −12.81% as of Oct 1. Gabelli YTD +${gdvYtd}%. Next named cash dividend $0.15, ex Oct 16, payable Oct 23. When AI/growth gets punched, this sleeve is supposed to look different. Not a growth engine. Not “Next NVDA.”`,
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
      id: 'friday-us-cash',
      area: 'US' as const,
      question: 'Where did U.S. cash settle after the jobs print?',
      whyItMatters: 'This 9:04 ET wake is before the 9:30 open. Futures jumped. That is not Thursday’s cash and not Friday’s close.',
      neededToKnow: 'Official S&P / Nasdaq / 10-year after the Friday cash close.',
      status: 'unknown' as const,
    },
    {
      id: 'europe-fri',
      area: 'GLOBAL' as const,
      question: 'Where did Europe close Friday?',
      whyItMatters: 'London and the continent were still in session at this 9:04 ET wake. Thursday DAX is the last sourced European close.',
      neededToKnow: 'Official FTSE / DAX / STOXX closes after the European cash close.',
      status: 'unknown' as const,
    },
    {
      id: 'aapl-q4-date',
      area: 'name' as const,
      ticker: 'AAPL',
      question: 'When is Apple’s official Q4 call?',
      whyItMatters: 'Calendars float October 29. That is not an IR confirmation. A guessed date would be a fake catalyst.',
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
    freshCapital: 'New core money still simplifies into VOO. No add to NVDA or AAPL on a jobs-morning futures bounce.',
    bestAdd: 'VOO',
    highestUpsideWatch: 'none named',
    biggestRisk: 'Mega-cap growth overlap across NVDA, AAPL, MGK, VUG, VOO, VTI on a 5.24% 10-year',
    nextTrigger: 'Friday U.S. cash after the jobs print — then Nvidia November 17',
    ifThen: [
      {
        tone: 'watch' as const,
        if: 'Friday cash is orderly and the 10-year stays near 5.24%',
        then: 'HOLD. Do not chase Thursday’s Nvidia +1.09%.',
      },
      {
        tone: 'long' as const,
        if: 'Fresh C$ arrives and no new name is sourced',
        then: 'VOO. Not another growth sleeve.',
      },
      {
        tone: 'caution' as const,
        if: 'The 10-year turns back up after the open',
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
      body: `The 10-year closed ${tenYear}% Thursday. Soft jobs cut hike odds. They do not cut the rate already on the screen. High long rates compress long-duration growth — the exact overweight.`,
    },
    {
      n: '03',
      title: 'AI ROI',
      body: 'The debate is still whether profits justify hundreds of billions of annual infrastructure. That sits under NVDA and most of the indirect book.',
    },
  ],
  close: {
    kicker: 'DIAGNOSTIC',
    headline: 'Jobs missed. Book unchanged. Do not chase futures.',
    body: `BLS +29,000 / 4.2%. Street wanted ~84,000. Thursday S&P 7,666.45 +0.19%. 10-year ${tenYear}%. Nvidia +1.09%. Apple −0.81%. The book did not change. After the open: Friday cash, then HOLD / ADD VOO / do-not-chase.`,
    pills: [
      {tone: 'watch' as const, label: 'HOLD THIS MORNING'},
      {tone: 'long' as const, label: 'VOO FOR NEW C$'},
      {tone: 'caution' as const, label: 'JOBS ALREADY PRINTED'},
    ],
    followThrough: [
      {
        tone: 'watch' as const,
        if: 'Friday cash is orderly and the 10-year fades',
        then: 'HOLD the book. Still no new name.',
      },
      {
        tone: 'caution' as const,
        if: 'Yields lurch higher after the open',
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
    `SPX ${spxClose.toLocaleString('en-US')} +${spxDayPct}%`,
    `SPX YTD +${spxYtdPct}%`,
    `NASDAQ +${nasdaqDayPct}% YTD +${nasdaqYtdPct}%`,
    `NVDA $${nvdaClose.toFixed(2)} +${nvdaDayPct}%`,
    `AAPL $${aaplClose.toFixed(2)} ${aaplDayPct}%`,
    `10Y ${tenYear}%`,
    `JOBS +29,000 / 4.2%`,
    `NIKKEI ${nikkeiDayPct}%`,
    `HSI ${hangSengDayPct}%`,
    `TSX ${tsxClose.toLocaleString('en-US')} ${tsxDayPct}%`,
    `VOO CORE / ADD`,
    `SELL NOTHING THIS MORNING`,
  ],
};

export const episode: DailyReport = parseDailyReport(raw);
