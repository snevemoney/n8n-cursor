import {vsSpxSpread} from '../compute';
import {parseDailyReport, type DailyReport} from '../schema';

/** Saturday 3 Oct 2026 America/Toronto. Cash closed. Last US / CA / Europe / Asia cash: Friday 2 Oct. */
const nvdaClose = 233.95;
const nvdaDayPct = 1.34;
const nvdaYtd = 25.74;
const aaplClose = 333.69;
const aaplDayPct = 1.02;
const aaplYtd = 23.08;
const vooClose = 707.54;
const vooDayPct = 0.74;
const vooYtd = 12.97;
const vtiClose = 377.99;
const vtiDayPct = 0.75;
const vtiYtd = 12.87;
const vugClose = 91.17;
const vugDayPct = 1.04;
const vugYtd = 11.33;
const mgkClose = 93.68;
const mgkDayPct = 0.99;
const mgkYtd = 12.67;
const gdvClose = 28.37;
const gdvDayPct = 0.88;
const gdvNav = 32.52;
const gdvDiscount = -12.76;
const gdvYtd = 7.0;
const spxClose = 7722.72;
const spxDayPct = 0.73;
const spxYtdPct = 12.81;
const nasdaqClose = 27190.86;
const nasdaqDayPct = 1.19;
const nasdaqYtdPct = 17;
const dowClose = 51176.96;
const dowDayPct = 0.49;
const russellClose = 2832.9;
const russellDayPct = 0.9;
const tenYear = 5.28;
const nikkei = 68309.46;
const nikkeiDayPct = -0.94;
const nikkeiYtdPct = 35.7;
const topix = 4091.0;
const topixDayPct = -0.99;
const hangSeng = 23972.29;
const hangSengDayPct = -2.6;
const hangSengYtdPct = -6.47;
const daxFri = 25231.2;
const daxFriDayPct = 1.17;
const daxYtdPct = 3.02;
const tsxClose = 35502.65;
const tsxDayPct = 0.99;
const tsxYtdPct = 11.95;
const tsxVClose = 880.57;
const tsxVDayPct = 0.2;
const cadUsdBnn = '70.20 cents US';
const wtiClose = 91.11;
const wtiDayPct = -1.9;
const nvdaQ2Rev = 96.2;
const nvdaDcRev = 89.0;
const nvdaQ3Guide = 108.0;
const nvdaQ2Eps = 2.46;
const nvdaBeta = 2.22;
const jobsNfp = 29000;
const jobsUnemp = 4.2;
const nvdaSpxYtd = spxYtdPct;
const aaplSpxYtd = spxYtdPct;

const raw = {
  meta: {
    date: '2026-10-03',
    dateLabel: 'OCT 3, 2026',
    title: 'Daily Wealth Intelligence',
    thesis:
      'Cash is closed. Friday the book bounced with the Nasdaq after a soft jobs print. The 10-year still closed 5.28%. Same seven lines. A weekend is not a new name.',
    thesisLead: 'Cash is closed.',
    thesisAccent: 'Friday bounce. 10-year still 5.28%.',
    catalyst: 'Next cash Monday. CPI October 14. FOMC October 27–28. Nvidia November 17. Apple Q4 still unannounced on IR.',
    universe: ['AAPL', 'NVDA', 'VOO', 'VTI', 'VUG', 'MGK', 'GDV'],
  },
  market: {
    spxClose,
    spxDayPct,
    spxYtdPct,
    nasdaqDayPct,
    tenYearYield: tenYear,
    note: 'Saturday. Last cash is Friday. Soft jobs lifted U.S. and Canada. The 10-year still closed 5.28% on the Treasury table after an early dip. Do not treat a weekend as a live tape.',
    nextCalendar: {
      label: 'Monday cash · CPI Oct 14 · FOMC Oct 28',
      detail: 'Next U.S. / Canada cash is Monday October 6. BLS CPI September data prints October 14 at 8:30 ET. FOMC meets October 27–28. Nvidia Q3 call named November 17. Apple Q4 date still unannounced on IR.',
    },
  },
  markets: {
    global: {
      indices: [
        {
          label: 'Nikkei 225',
          value: nikkei.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: nikkeiDayPct,
          note: `Friday close (Nikkei index page). YTD +${nikkeiYtdPct}% (Dow Jones / FactSet, same Friday print).`,
        },
        {
          label: 'TOPIX',
          value: topix.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: topixDayPct,
          note: 'Friday close (RTHK / FISCO wrap).',
        },
        {
          label: 'Hang Seng',
          value: hangSeng.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: hangSengDayPct,
          note: `Friday close (Yonhap Infomax / RTHK). YTD ${hangSengYtdPct}% (Dow Jones / FactSet, same Friday print).`,
        },
        {
          label: 'DAX',
          value: daxFri.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: daxFriDayPct,
          note: `Friday close. YTD +${daxYtdPct}% (Dow Jones Market Data / FactSet).`,
        },
      ],
      commodities: [
        {
          label: 'WTI Nov',
          value: `$${wtiClose.toFixed(2)}`,
          dayPct: wtiDayPct,
          note: 'NYMEX November settlement Friday (Dow Jones Market Data).',
        },
      ],
      rates: [
        {
          label: 'U.S. 10-year',
          value: `${tenYear}%`,
          note: 'Treasury daily par Friday 10/02. Official table. FRED DGS10 unread.',
        },
      ],
      note: 'Shanghai Friday holiday (Golden Week). ASX unread. Friday Europe cash sourced for DAX only. FTSE / CAC unread this sitting.',
    },
    us: {
      indices: [
        {label: 'S&P 500', value: spxClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}), dayPct: spxDayPct},
        {label: 'Nasdaq', value: nasdaqClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}), dayPct: nasdaqDayPct},
        {label: 'Dow', value: dowClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}), dayPct: dowDayPct},
        {label: 'Russell 2000', value: russellClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}), dayPct: russellDayPct},
      ],
      yields: [
        {
          label: 'U.S. 10-year',
          value: `${tenYear}%`,
          note: 'Treasury daily par Friday 5.28 after Thursday 5.24. Yields dipped on the jobs print, then retraced (AP / Treasury table).',
        },
      ],
      note: `Friday close (AP / Reuters). S&P YTD +${spxYtdPct}% (Yahoo as of Oct 2). Nasdaq YTD +${nasdaqYtdPct}% (AP). Week: S&P −0.3%, Nasdaq +0.5%, Dow −1.3% (AP). Jobs already printed Friday: +${jobsNfp.toLocaleString('en-US')} / ${jobsUnemp}%. Cash is closed until Monday.`,
    },
    ca: {
      indices: [
        {
          label: 'S&P/TSX',
          value: tsxClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: tsxDayPct,
          note: `+347.89 points. YTD +${tsxYtdPct}%. Snapped a four-day slide (TSX daily report / Reuters).`,
        },
        {
          label: 'S&P/TSX Venture',
          value: tsxVClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: tsxVDayPct,
          note: 'Official TSX daily trading report Friday.',
        },
      ],
      cadUsd: `BNN wrap: ${cadUsdBnn} vs 70.21 Thursday. BoC Valet unread.`,
      note: 'TSX official daily report Friday. Materials and industrials led (Reuters). BoC Valet FXUSDCAD unread.',
    },
    calendar: {
      items: [
        {
          when: 'Monday October 6',
          where: 'US' as const,
          label: 'Next U.S. / Canada cash',
          why: 'Weekend. Friday is the last sourced close. Do not treat Saturday as a live tape.',
        },
        {
          when: 'October 7 2:00 ET',
          where: 'US' as const,
          label: 'FOMC minutes (Sept 15–16)',
          why: 'Named on the Federal Reserve October calendar.',
        },
        {
          when: 'October 14 8:30 ET',
          where: 'US' as const,
          label: 'September CPI',
          why: 'BLS named October 14. Same day the Fed calendar lists the Beige Book at 2:00 ET.',
        },
        {
          when: 'October 27–28',
          where: 'US' as const,
          label: 'FOMC meeting',
          why: 'Fed calendar. Statement and press conference October 28 at 2:00 ET.',
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
      rating: 'HOLD — weekend watch',
      tone: 'watch' as const,
      role: 'Highest factor weight in the story',
      whatMatters: 'Friday +1.34% to $233.95. Q3 guide still $108.0B ±2%. Next named call Nov 17. No add on a closed tape.',
      ytd: nvdaYtd,
    },
    {
      ticker: 'AAPL',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Recent purchase',
      whatMatters: 'Friday +1.02% to $333.69. Q4 date still unannounced on IR.',
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
      whatMatters: 'Same mega-cap stack as VUG, NVDA, and AAPL. Friday $93.68. Yahoo trailing YTD +12.67% as of Oct 1.',
      ytd: mgkYtd,
      overlapWith: ['NVDA', 'AAPL', 'VUG', 'VOO'],
    },
    {
      ticker: 'GDV',
      rating: 'HOLD — income / diversifier',
      tone: 'long' as const,
      role: 'Income sleeve',
      whatMatters: `Different job. Friday $${gdvClose.toFixed(2)} +${gdvDayPct}%. Gabelli NAV $${gdvNav.toFixed(2)}, discount ${gdvDiscount}%.`,
      ytd: gdvYtd,
    },
  ],
  portfolio: {
    concentrationThesis: 'VOO + VTI + VUG + MGK + AAPL + NVDA still buy the same U.S. mega-cap growth names.',
    concentrationBody:
      'Friday the stack moved together: Nvidia +1.34%, Apple +1.02%, Nasdaq +1.19%, S&P +0.73%. Soft jobs is a discount-rate story for that whole book. The 10-year still closed 5.28%. Weights still unknown, so the size of the overlap stays qualitative.',
    factorStack: ['NVDA', 'AAPL', 'MGK', 'VUG', 'VOO', 'VTI'],
    factorLabel: 'U.S. mega-cap / growth',
    overlapNote: 'same ecosystem',
  },
  names: [
    {
      ticker: 'NVDA',
      chapterTitle: 'NVDA · Friday bounce, same guide',
      rating: 'HOLD — WEEKEND WATCH',
      tone: 'watch' as const,
      price: nvdaClose,
      dayPct: nvdaDayPct,
      holdNote: 'No add on a closed weekend tape. Next named event is November 17.',
      streak: [-0.41, 0.22, 1.68, -0.72, 0.51, 1.09, 1.34],
      streakHeadline: 'Seven sessions. Two red. Friday was the strongest up day in the window.',
      streakNote: 'Closes from Investing.com: Sep 24 through Oct 2. Red days: 2 of 7. Not a 21-day grid.',
      fundamentals: [
        {label: 'Q2 FY27 revenue', value: `$${nvdaQ2Rev.toFixed(1)}B +106% y/y`},
        {label: 'Q2 data center', value: `$${nvdaDcRev.toFixed(1)}B +117% y/y`},
        {label: 'Q2 GAAP EPS', value: `$${nvdaQ2Eps.toFixed(2)}`},
        {label: 'Q3 guide', value: `$${nvdaQ3Guide.toFixed(1)}B ±2%`},
        {label: 'Q3 GM guide', value: '74.0% ±50 bp'},
        {label: 'Beta', value: String(nvdaBeta)},
      ],
      vsSpx: {
        headline: 'Still ahead of the S&P YTD. Extra return is real. Extra volatility is the price.',
        bars: [
          {label: 'NVDA YTD', pct: nvdaYtd, tone: 'nvda' as const},
          {label: 'S&P YTD', pct: nvdaSpxYtd, tone: 'muted' as const},
        ],
        note: `Spread: ${vsSpxSpread(nvdaYtd, nvdaSpxYtd) >= 0 ? '+' : ''}${vsSpxSpread(nvdaYtd, nvdaSpxYtd).toFixed(1)} points (NVDA Yahoo trailing YTD − S&P Yahoo YTD, as of Oct 2). Friday close $233.95. Beta ${nvdaBeta} (Yahoo).`,
      },
      consensus: {
        rows: [
          {label: 'Q2 revenue (printed)', value: `$${nvdaQ2Rev.toFixed(1)}B`},
          {label: 'Q3 revenue guide', value: `$${nvdaQ3Guide.toFixed(1)}B ±2%`},
          {label: 'Q3 GM guide', value: '74.0% ±50 bp'},
          {label: 'China DC compute in guide', value: 'None assumed'},
        ],
        note: 'August 26 IR. Next named call November 17. Street whisper unread.',
        range: {metric: 'Q3 revenue guide', unit: 'B', low: 105.84, high: 110.16, guide: 108.0},
      },
      narrative: {
        leftTitle: 'THE FEAR',
        leftHeadline: 'A 5.28% 10-year still reprices long-duration growth. Soft jobs did not erase that.',
        leftBody:
          'Friday’s Treasury par close is 5.28% after Thursday’s 5.24%. Yields dipped on the payrolls print, then came back (AP). That is still a high cost of capital under every growth line in the book.',
        rightTitle: 'THE COUNTER',
        rightHeadline: 'IR still guides $108.0B ±2%. Friday the stock closed $233.95, +1.34%.',
        rightBody:
          'Q2 data center $89.0B. No China data-center compute in the Q3 outlook. Next named event is November 17 — not this weekend.',
      },
      interpretation: {
        chips: [
          {label: 'CONFIRMED', tone: 'long' as const, text: 'Q2 printed $96.2B. Q3 guide is $108.0B ±2%.'},
          {label: 'CONFIRMED', tone: 'watch' as const, text: 'Friday cash +1.34% to $233.95. 10-year 5.28%.'},
          {
            label: 'INFERENCE',
            tone: 'caution' as const,
            text: 'The debate is still ROI on the buildout, not “is AI real.”',
          },
        ],
        note: 'No composite score. Missing inputs stay UNKNOWN on the prediction board.',
      },
      actionMatrix: {
        headline: 'HOLD. Weekend is not an add day. Next named event is November 17.',
        rows: [
          {
            tone: 'watch' as const,
            if: 'Monday cash is orderly and the 10-year stays near 5.28%',
            then: 'HOLD. Do not chase Friday’s +1.34%.',
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
        headline: 'Polarity from IR and Friday’s cash — no composite score.',
        nodes: [
          {id: 'labs', label: 'Frontier labs / CSPs', polarity: 'confirmed' as const, x: 0.08, y: 0.22},
          {id: 'demand', label: 'GPU demand', polarity: 'confirmed' as const, x: 0.3, y: 0.22},
          {id: 'spend', label: 'AI factory buildout', polarity: 'confirmed' as const, x: 0.5, y: 0.22, evidence: 'Q3 guide $108.0B ±2%'},
          {id: 'financing', label: 'Third-party capital', polarity: 'concern' as const, x: 0.3, y: 0.78, evidence: '>$500B named, subject to docs'},
          {id: 'nvda', label: 'NVDA', polarity: 'neutral' as const, x: 0.62, y: 0.5},
          {id: 'jobs', label: 'Payrolls / 10-year', polarity: 'concern' as const, x: 0.3, y: 0.5, evidence: `+${Math.round(jobsNfp / 1000)}k · ${tenYear}%`},
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
      chapterTitle: 'AAPL · Friday recovered Thursday',
      rating: 'HOLD',
      tone: 'long' as const,
      price: aaplClose,
      dayPct: aaplDayPct,
      returns: {
        headline: 'Still ahead of the S&P YTD. Friday’s +1.02% does not change the hold.',
        bars: [
          {label: 'YTD', pct: aaplYtd, tone: 'long' as const},
          {label: 'S&P YTD', pct: aaplSpxYtd, tone: 'muted' as const},
          {label: '1 year', pct: 30.25, tone: 'gold' as const},
        ],
        panelTitle: 'FRIDAY PRINT',
        panelBody: '+1.02% to $333.69 after Thursday’s −0.81% to $330.32.',
        note: `Spread vs S&P YTD: ${vsSpxSpread(aaplYtd, aaplSpxYtd) >= 0 ? '+' : ''}${vsSpxSpread(aaplYtd, aaplSpxYtd).toFixed(1)} points. Yahoo trailing YTD and 1-year as of Oct 2.`,
      },
      catalyst: {
        headline: 'Q4 date is still unannounced on Apple IR. Do not treat Oct 29 as official.',
        steps: [
          'Fiscal year just ended',
          'Last confirmed call was July 30 (Q3)',
          'Calendars float October 29',
          'IR has not named the date',
        ],
        note: 'Apple investor page unread for a new date this sitting. Calendars float October 29. That is a calendar estimate.',
      },
      action: {
        headline: 'HOLD the position. Do not add on a weekend.',
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
        {label: 'Friday', value: `+${vooDayPct}%`},
      ],
      copy: {
        headline: 'Best simple core. New core money simplifies here.',
        body: `Friday $${vooClose.toFixed(2)}. Yahoo trailing YTD +${vooYtd}% as of Oct 1. Do not sell. Stop splitting every future contribution with VTI.`,
      },
    },
    {
      ticker: 'VTI',
      chapterTitle: 'VTI · excellent, overlapping',
      rating: 'HOLD',
      tone: 'long' as const,
      metrics: [
        {label: 'YTD', value: `+${vtiYtd}%`},
        {label: 'Friday', value: `+${vtiDayPct}%`},
      ],
      copy: {
        headline: 'Excellent. Mega-caps still dominate, so the top looks like VOO.',
        body: `Friday $${vtiClose.toFixed(2)}. Yahoo trailing YTD +${vtiYtd}% as of Oct 1. Do not sell. The overlap with VOO is the issue — not the fund quality.`,
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
        note: `Yahoo trailing YTD +${vugYtd}% as of Oct 1 vs S&P Yahoo +${spxYtdPct}% as of Oct 2. Friday $${vugClose.toFixed(2)} +${vugDayPct}%. HOLD existing. No priority additions.`,
      },
    },
    {
      ticker: 'MGK',
      chapterTitle: 'MGK · same issue, more concentrated',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      metrics: [
        {label: 'Friday', value: `$${mgkClose.toFixed(2)}`},
        {label: 'Day', value: `+${mgkDayPct}%`},
        {label: 'YTD', value: `+${mgkYtd}%`},
      ],
      copy: {
        body: `Friday $${mgkClose.toFixed(2)}. Yahoo trailing YTD +${mgkYtd}% as of Oct 1. You already own NVDA and AAPL directly. HOLD. Stop feeding it. Not a sell call — tax and account mechanics are not reconstructed from the latest screen.`,
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
        {label: 'Friday', value: `+${gdvDayPct}%`},
      ],
      copy: {
        body: `Closed-end income/value. Gabelli market $${gdvClose.toFixed(2)}, NAV $${gdvNav.toFixed(2)}, discount ${gdvDiscount}% as of Oct 2. Gabelli YTD +${gdvYtd}%. When AI/growth gets punched, this sleeve is supposed to look different. Not a growth engine. Not “Next NVDA.”`,
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
      id: 'etf-fri-ytd',
      area: 'book' as const,
      question: 'What is Friday total-return YTD for VOO / VTI / VUG / MGK?',
      whyItMatters: 'Yahoo trailing YTD on those four lines is as of Oct 1. Friday prices are Oct 2. Mixing the two without a label would fake a same-day YTD.',
      neededToKnow: 'Yahoo or Vanguard trailing YTD dated October 2.',
      status: 'partial' as const,
    },
    {
      id: 'boc-cad',
      area: 'CA' as const,
      question: 'What did BoC Valet print for USD/CAD Friday?',
      whyItMatters: 'BNN wrapped 70.20 U.S. cents. That is a news wrap, not the official noon rate.',
      neededToKnow: 'Bank of Canada Valet FXUSDCAD for 2026-10-02.',
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
    existingPortfolio: 'HOLD — sell nothing this weekend.',
    freshCapital: 'New core money still simplifies into VOO. No add to NVDA or AAPL on a closed tape.',
    bestAdd: 'VOO',
    highestUpsideWatch: 'none named',
    biggestRisk: 'Mega-cap growth overlap across NVDA, AAPL, MGK, VUG, VOO, VTI on a 5.28% 10-year',
    nextTrigger: 'Monday cash — then CPI October 14, FOMC October 28, Nvidia November 17',
    ifThen: [
      {
        tone: 'watch' as const,
        if: 'Monday cash is orderly and the 10-year stays near 5.28%',
        then: 'HOLD. Do not chase Friday’s Nvidia +1.34%.',
      },
      {
        tone: 'long' as const,
        if: 'Fresh C$ arrives and no new name is sourced',
        then: 'VOO. Not another growth sleeve.',
      },
      {
        tone: 'caution' as const,
        if: 'The 10-year turns back up when cash reopens',
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
      body: `The 10-year closed ${tenYear}% Friday. Soft jobs cut hike odds. They do not cut the rate already on the screen. High long rates compress long-duration growth — the exact overweight.`,
    },
    {
      n: '03',
      title: 'AI ROI',
      body: 'The debate is still whether profits justify hundreds of billions of annual infrastructure. That sits under NVDA and most of the indirect book.',
    },
  ],
  close: {
    kicker: 'DIAGNOSTIC',
    headline: 'Weekend. Friday bounce. Book unchanged.',
    body: `Friday S&P 7,722.72 +0.73%. Nasdaq +1.19%. 10-year ${tenYear}%. Nvidia +1.34%. Apple +1.02%. TSX +0.99%. Jobs already printed. Cash is closed until Monday. HOLD / ADD VOO / do-not-chase.`,
    pills: [
      {tone: 'watch' as const, label: 'HOLD THIS WEEKEND'},
      {tone: 'long' as const, label: 'VOO FOR NEW C$'},
      {tone: 'caution' as const, label: 'CASH CLOSED'},
    ],
    followThrough: [
      {
        tone: 'watch' as const,
        if: 'Monday cash is orderly and the 10-year fades',
        then: 'HOLD the book. Still no new name.',
      },
      {
        tone: 'caution' as const,
        if: 'Yields lurch higher when cash reopens',
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
    `SATURDAY · CASH CLOSED`,
    `SPX ${spxClose.toLocaleString('en-US')} +${spxDayPct}%`,
    `SPX YTD +${spxYtdPct}%`,
    `NASDAQ +${nasdaqDayPct}% YTD +${nasdaqYtdPct}%`,
    `NVDA $${nvdaClose.toFixed(2)} +${nvdaDayPct}%`,
    `AAPL $${aaplClose.toFixed(2)} +${aaplDayPct}%`,
    `10Y ${tenYear}%`,
    `NIKKEI ${nikkeiDayPct}%`,
    `HSI ${hangSengDayPct}%`,
    `DAX +${daxFriDayPct}%`,
    `TSX ${tsxClose.toLocaleString('en-US')} +${tsxDayPct}%`,
    `VOO CORE / ADD`,
    `SELL NOTHING THIS WEEKEND`,
  ],
};

export const episode: DailyReport = parseDailyReport(raw);
