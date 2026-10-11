import {vsSpxSpread} from '../compute';
import {parseDailyReport, type DailyReport} from '../schema';

/** Last US / CA cash: Tuesday 29 Sep 2026. Asia Wednesday 30 Sep: Nikkei + TOPIX. Europe Wednesday session omitted. */
const nvdaClose = 227.21;
const nvdaDayPct = -0.72;
const nvdaYtd = 21.83;
const nvdaBeta = 2.22;
const aaplClose = 329.4;
const aaplDayPct = -2.66;
const aaplYtd = 21.17;
const vooYtd = 12.01;
const vtiYtd = 11.93;
const vugYtd = 10.61;
const mgkYtd = 11.96;
const gdvYtd = 2.48;
const spxClose = 7670.84;
const spxDayPct = -0.17;
const spxYtdPct = 12.06;
const nasdaqClose = 26797.54;
const nasdaqDayPct = -0.09;
const dowClose = 51349.92;
const dowDayPct = -0.26;
const tenYear = 5.26;
const nikkei = 66753.72;
const nikkeiDayPct = 1.94;
const topix = 4108.65;
const topixDayPct = 1.67;
const tsxClose = 35460.27;
const tsxPoints = -29.59;
const tsxDayPct = -0.08;
const cadOfficial = 1.4188;
const wtiTue = 89.38;
const goldTue = 4179.7;
const goldTuePts = 11.3;
const nvdaQ2Rev = 96.2;
const nvdaDcRev = 89.0;
const nvdaQ3Guide = 108.0;
const nvdaSpxYtd = spxYtdPct;
const aaplSpxYtd = spxYtdPct;
const pceYy = 3.4;
const pceCoreYy = 3.0;
const pceMm = 0.3;
const pceCoreMm = 0.2;

const raw = {
  meta: {
    date: '2026-09-30',
    dateLabel: 'SEP 30, 2026',
    title: 'Daily Wealth Intelligence',
    thesis:
      'Tuesday cash was a small red day. Apple took the hit. The 10-year closed 5.26%. August PCE printed 3.4% headline and 3.0% core. The book is still the same seven U.S. growth lines.',
    thesisLead: 'Apple took Tuesday.',
    thesisAccent: 'The 10-year is 5.26%.',
    catalyst:
      'BEA printed August PCE this morning. Jobs Friday. Nvidia’s next named call is November 17.',
    universe: ['AAPL', 'NVDA', 'VOO', 'VTI', 'VUG', 'MGK', 'GDV'],
  },
  market: {
    spxClose,
    spxDayPct,
    spxYtdPct,
    nasdaqDayPct,
    tenYearYield: tenYear,
    note: 'Tuesday U.S. cash slipped as the 10-year closed 5.26%. Apple −2.66%. Nvidia −0.72%. This checkout’s registered prior tape is still Aug 25 — mid-September episodes live on open PRs.',
    nextCalendar: {
      label: 'Jobs Friday · Nvidia Nov 17',
      detail: 'BLS Employment Situation Friday 8:30 ET. Nvidia Q3 call named for November 17. Apple Q4 date still unannounced.',
    },
  },
  markets: {
    global: {
      indices: [
        {
          label: 'Nikkei 225',
          value: nikkei.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: nikkeiDayPct,
          note: 'Wednesday close (Nikkei / Jiji / Kyodo)',
        },
        {
          label: 'TOPIX',
          value: topix.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: topixDayPct,
          note: 'Wednesday close (Nikkei / Kyodo)',
        },
      ],
      commodities: [
        {label: 'WTI November', value: `$${wtiTue.toFixed(2)}`, note: 'Tuesday settle (Canadian Press); −$3.22'},
        {
          label: 'Gold December',
          value: `$${goldTue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
          note: `Tuesday settle (Canadian Press); +${goldTuePts.toFixed(2)}`,
        },
      ],
      note: 'Hang Seng, ASX, Shanghai, and Kospi Wednesday closes unread as official prints. Europe Wednesday is still a session at this 9:20 ET wake — omitted.',
    },
    us: {
      indices: [
        {label: 'S&P 500', value: spxClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}), dayPct: spxDayPct},
        {label: 'Nasdaq', value: nasdaqClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}), dayPct: nasdaqDayPct},
        {label: 'Dow', value: dowClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}), dayPct: dowDayPct},
      ],
      yields: [{label: 'U.S. 10-year', value: `${tenYear}%`, note: 'Treasury daily par Tuesday via wraps that cited the official table. FRED DGS10 unread.'}],
      note: 'Tuesday close. Yahoo / Reuters / AP / Nasdaq. NYSE is opening at this 9:20 ET wake — do not treat pre-market as cash.',
    },
    ca: {
      indices: [
        {
          label: 'S&P/TSX',
          value: tsxClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: tsxDayPct,
          note: `${tsxPoints} points (Canadian Press). Official TSX daily report for Sep 29 unread.`,
        },
      ],
      cadUsd: `BoC Valet FXUSDCAD ${cadOfficial} on 2026-09-29 (70.48 U.S. cents)`,
      note: 'TSX Venture Tuesday close unread. Official TSX PDF for Sep 29 unread.',
    },
    calendar: {
      items: [
        {
          when: 'Wednesday 8:30 ET',
          where: 'US' as const,
          label: 'BEA August PCE (printed)',
          why: `Headline PCE +${pceMm}% m/m / +${pceYy}% y/y. Core +${pceCoreMm}% m/m / +${pceCoreYy}% y/y. Annual NEA update in the same release.`,
        },
        {
          when: 'Wednesday 8:30 ET',
          where: 'US' as const,
          label: 'Q2 GDP third estimate',
          why: 'Scheduled with PCE. Print unread this sitting.',
        },
        {
          when: 'Friday 8:30 ET',
          where: 'US' as const,
          label: 'September employment report',
          why: 'BLS Employment Situation for September. Confirmed on the October schedule.',
        },
        {
          when: 'October 1',
          where: 'US' as const,
          label: 'Nvidia $0.25 dividend',
          why: 'Named on the August 26 IR release. Record date was September 10.',
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
      whatMatters: 'Tuesday −0.72% to $227.21. Q3 guide still $108.0B ±2%. Next named call Nov 17.',
      ytd: nvdaYtd,
    },
    {
      ticker: 'AAPL',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Recent purchase',
      whatMatters: 'Tuesday −2.66% to $329.40. Q4 date still unannounced on IR.',
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
      whatMatters: 'Different job. Tuesday $28.46 −0.45%. NAV unread. Next named dividend $0.15, ex Oct 16.',
      ytd: gdvYtd,
    },
  ],
  portfolio: {
    concentrationThesis: 'VOO + VTI + VUG + MGK + AAPL + NVDA still buy the same U.S. mega-cap growth names.',
    concentrationBody:
      'Tuesday showed the split: Apple −2.66%, Nvidia −0.72%, the S&P −0.17%. One factor. Two prints. Weights still unknown, so the size of that overlap stays qualitative.',
    factorStack: ['NVDA', 'AAPL', 'MGK', 'VUG', 'VOO', 'VTI'],
    factorLabel: 'U.S. mega-cap / growth',
    overlapNote: 'same ecosystem',
  },
  names: [
    {
      ticker: 'NVDA',
      chapterTitle: 'NVDA · the print is behind; the 10-year is not',
      rating: 'HOLD — POST-PRINT WATCH',
      tone: 'watch' as const,
      price: nvdaClose,
      dayPct: nvdaDayPct,
      holdNote: 'No add on a 5.26% 10-year. Next named event is November 17.',
      streak: [2.3, 0.66, -1.47, -0.41, 0.22, 1.68, -0.72],
      streakHeadline: 'Seven sessions. Not a collapse. Tuesday gave back Monday.',
      streakNote: 'Yahoo history closes Sep 21–29. Two red days in the window. Last print −0.72%.',
      fundamentals: [
        {label: 'Market cap', value: '$5.49T'},
        {label: 'Q2 FY27 revenue', value: `$${nvdaQ2Rev.toFixed(1)}B  +106% y/y`},
        {label: 'Q2 data center', value: `$${nvdaDcRev.toFixed(1)}B  +117% y/y`},
        {label: 'Q2 GAAP EPS', value: '$2.46'},
        {label: 'Q3 guide', value: `$${nvdaQ3Guide.toFixed(1)}B ±2%`},
        {label: 'Q3 GM guide', value: '74.0% ±50 bp'},
        {label: 'TTM EPS / P/E', value: '$7.91  /  28.7×'},
        {label: 'Beta', value: String(nvdaBeta)},
      ],
      vsSpx: {
        headline: 'Still ahead of the S&P YTD. The extra return is smaller than the extra volatility.',
        bars: [
          {label: 'NVDA YTD', pct: nvdaYtd, tone: 'nvda' as const},
          {label: 'S&P YTD', pct: nvdaSpxYtd, tone: 'muted' as const},
        ],
        note: `Spread: ${vsSpxSpread(nvdaYtd, nvdaSpxYtd) >= 0 ? '+' : ''}${vsSpxSpread(nvdaYtd, nvdaSpxYtd).toFixed(1)} points (NVDA price YTD − S&P YTD). Beta: ${nvdaBeta}. Yahoo history vs Dec 31 close $186.50.`,
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
        leftHeadline: 'A 5.26% 10-year reprices long-duration growth. Core PCE is still 3.0%.',
        leftBody:
          'Tuesday’s 10-year close is the highest since 2007 on the wraps that cited Treasury’s table. August PCE +3.4% headline / +3.0% core. That is the cost of capital under every growth line in the book.',
        rightTitle: 'THE COUNTER',
        rightHeadline: 'IR still guides $108.0B ±2% and says Vera Rubin is in production.',
        rightBody:
          'Q2 data center $89.0B. No China data-center compute in the Q3 outlook. Partnerships named to mobilize over $500B of third-party AI infrastructure capital, subject to definitive agreements.',
      },
      interpretation: {
        chips: [
          {label: 'CONFIRMED', tone: 'long' as const, text: 'Q2 printed $96.2B. Q3 guide is $108.0B ±2%.'},
          {label: 'CONFIRMED', tone: 'watch' as const, text: 'August PCE 3.4% / 3.0% core on a 5.26% 10-year.'},
          {
            label: 'INFERENCE',
            tone: 'caution' as const,
            text: 'The debate is still ROI on the buildout, not “is AI real.”',
          },
        ],
        note: 'No composite score. Missing inputs stay UNKNOWN on the prediction board.',
      },
      actionMatrix: {
        headline: 'HOLD. Next named event is November 17.',
        rows: [
          {
            tone: 'watch' as const,
            if: 'Jobs Friday is orderly and the 10-year stops rising',
            then: 'HOLD. Do not chase a quiet Tuesday.',
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
        headline: 'Polarity from IR and this morning’s PCE — no composite score.',
        nodes: [
          {id: 'labs', label: 'Frontier labs / CSPs', polarity: 'confirmed' as const, x: 0.08, y: 0.22},
          {id: 'demand', label: 'GPU demand', polarity: 'confirmed' as const, x: 0.3, y: 0.22},
          {id: 'spend', label: 'AI factory buildout', polarity: 'confirmed' as const, x: 0.5, y: 0.22, evidence: 'Q3 guide $108.0B ±2%'},
          {id: 'financing', label: 'Third-party capital', polarity: 'concern' as const, x: 0.3, y: 0.78, evidence: '>$500B named, subject to docs'},
          {id: 'nvda', label: 'NVDA', polarity: 'neutral' as const, x: 0.62, y: 0.5},
          {id: 'rates', label: '10-year / PCE', polarity: 'concern' as const, x: 0.3, y: 0.5, evidence: '5.26% · core 3.0%'},
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
      chapterTitle: 'AAPL · Tuesday was the red day',
      rating: 'HOLD',
      tone: 'long' as const,
      price: aaplClose,
      dayPct: aaplDayPct,
      streak: [0.85, 0.23, -0.8, -0.33, 1.53, -0.78, -2.66],
      streakHeadline: 'Seven sessions. Tuesday −2.66% is the print that matters.',
      streakNote: 'Yahoo history closes Sep 21–29. Off the Sep 22 high $345.34 by about 4.6%.',
      returns: {
        headline: 'Still ahead of the S&P YTD. Tuesday was a one-day hit, not a new thesis.',
        bars: [
          {label: 'YTD', pct: aaplYtd, tone: 'long' as const},
          {label: 'S&P YTD', pct: aaplSpxYtd, tone: 'muted' as const},
          {label: '1 year', pct: 29.36, tone: 'gold' as const},
          {label: '6 months', pct: 29.79, tone: 'aapl' as const},
          {label: '3 months', pct: 13.84, tone: 'muted' as const},
          {label: '1 month', pct: 1.31, tone: 'muted' as const},
        ],
        panelTitle: 'TUESDAY PRINT',
        panelBody: '−2.66% to $329.40. 52-week high $345.34 on Sep 22.',
        note: `Spread vs S&P YTD: ${vsSpxSpread(aaplYtd, aaplSpxYtd) >= 0 ? '+' : ''}${vsSpxSpread(aaplYtd, aaplSpxYtd).toFixed(1)} points. Price YTD vs Dec 31 close $271.86.`,
      },
      catalyst: {
        headline: 'Q4 date is still unannounced on Apple IR. Do not treat Oct 29 as official.',
        steps: [
          'Fiscal Q4 ended around this week',
          'Last confirmed call was July 30',
          'Street calendars guess late October',
          'IR has not named the date',
        ],
        note: 'Yahoo and street calendars float October 29. That is an estimate. The last IR-confirmed call is Q3 on July 30.',
      },
      action: {
        headline: 'HOLD the position. Do not add on a −2.66% Tuesday.',
        body: 'You already own it. Averaging down here doubles the same name. Next contribution still diversifies, not AAPL.',
      },
    },
    {
      ticker: 'VOO',
      chapterTitle: 'VOO · the foundation is not the problem',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      metrics: [
        {label: 'YTD', value: '+12.01%'},
        {label: 'Tuesday', value: '−0.16%'},
      ],
      copy: {
        headline: 'Best simple core. New core money simplifies here.',
        body: 'Tuesday $702.46. Yahoo chart YTD +12.01%. Do not sell. Stop splitting every future contribution with VTI.',
      },
    },
    {
      ticker: 'VTI',
      chapterTitle: 'VTI · excellent, overlapping',
      rating: 'HOLD',
      tone: 'long' as const,
      metrics: [
        {label: 'YTD', value: '+11.93%'},
        {label: 'Tuesday', value: '−0.15%'},
      ],
      copy: {
        headline: 'Excellent. Mega-caps still dominate, so the top looks like VOO.',
        body: 'Tuesday $375.26. YTD chained from the last sourced chart print plus Tuesday’s close. Do not sell. The overlap with VOO is the issue — not the fund quality.',
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
        note: 'Yahoo chart YTD +10.61% vs S&P +12.06%. Tuesday $89.94 −0.11%. HOLD existing. No priority additions.',
      },
    },
    {
      ticker: 'MGK',
      chapterTitle: 'MGK · same issue, more concentrated',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      metrics: [
        {label: 'YTD', value: '+11.96%'},
        {label: 'Tuesday', value: '−0.05%'},
      ],
      copy: {
        body: 'Tuesday $92.43. You already own NVDA and AAPL directly. HOLD. Stop feeding it. Not a sell call — tax and account mechanics are not reconstructed from the latest screen.',
      },
    },
    {
      ticker: 'GDV',
      chapterTitle: 'GDV · a completely different job',
      rating: 'HOLD · INCOME / DIVERSIFIER',
      tone: 'long' as const,
      metrics: [
        {label: 'Market', value: '$28.46'},
        {label: 'Tuesday', value: '−0.45%'},
        {label: 'Fwd dist.', value: '6.32%'},
        {label: 'NAV', value: 'unread'},
      ],
      copy: {
        body: 'Closed-end income/value. Yahoo performance YTD +7.36% with dividends; price YTD about +2.48%. Next named cash dividend $0.15, ex Oct 16. When AI/growth gets punched, this sleeve is supposed to look different. Not a growth engine. Not “Next NVDA.”',
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
      id: 'gdp-third',
      area: 'US' as const,
      question: 'What did the Q2 GDP third estimate print this morning?',
      whyItMatters: 'BEA scheduled it with August PCE. PCE is read. GDP is not.',
      neededToKnow: 'The BEA GDP (Third Estimate) Q2 2026 release page.',
      status: 'unknown' as const,
    },
    {
      id: 'gdv-nav',
      area: 'name' as const,
      ticker: 'GDV',
      question: 'What is GDV’s latest NAV and discount?',
      whyItMatters: 'Market $28.46 is not NAV. The income sleeve’s job is the discount, not the ticker print.',
      neededToKnow: 'A Gabelli / CEF Connect NAV print dated this week.',
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
      id: 'global-ex-tokyo',
      area: 'GLOBAL' as const,
      question: 'Where did Hang Seng / ASX / Shanghai / Kospi / Europe close?',
      whyItMatters: 'World tape has Tokyo only. Europe was still a session at wake.',
      neededToKnow: 'Index-page prints for any session we claim to cover.',
      status: 'unknown' as const,
    },
  ],
  scenarios: [],
  capitalPlan: {
    existingPortfolio: 'HOLD — sell nothing this morning.',
    freshCapital: 'New core money still simplifies into VOO. Do not buy the AAPL dip on a −2.66% Tuesday.',
    bestAdd: 'VOO',
    highestUpsideWatch: 'none named',
    biggestRisk: '5.26% 10-year plus mega-cap overlap across NVDA, AAPL, MGK, VUG, VOO, VTI',
    nextTrigger: 'Friday — BLS September jobs. Then Nvidia November 17.',
    ifThen: [
      {
        tone: 'watch' as const,
        if: 'Jobs Friday is orderly and the 10-year stops rising',
        then: 'HOLD. Contribution still goes to VOO.',
      },
      {
        tone: 'caution' as const,
        if: 'Jobs or the 10-year push long rates higher again',
        then: 'Do not add growth. Keep new cash in VOO or uninvested.',
      },
      {
        tone: 'long' as const,
        if: 'Nov 17 clears the $108B guide and Rubin supply stays in the story',
        then: 'Re-read ADD on NVDA. Not before the print.',
      },
      {
        tone: 'short' as const,
        if: 'Guide cuts or the whole factor stack breaks together',
        then: 'Consider reducing overlap, not averaging AAPL.',
      },
    ],
  },
  risks: [
    {
      n: '01',
      title: 'Growth-factor concentration',
      body: 'NVDA + AAPL + MGK + VUG + VOO + VTI repeatedly own the same mega-cap ecosystem. Tuesday’s Apple print is a reminder that one name can move without the index.',
    },
    {
      n: '02',
      title: 'Interest rates',
      body: `The 10-year closed ${tenYear}% Tuesday. August core PCE is still ${pceCoreYy}%. High long rates compress the exact overweight.`,
    },
    {
      n: '03',
      title: 'AI ROI',
      body: 'IR still guides $108.0B and names $500B+ of third-party infrastructure capital. The debate is whether profits justify the buildout — not whether AI exists.',
    },
  ],
  close: {
    kicker: 'DIAGNOSTIC',
    headline: 'PCE printed. The book did not change.',
    body: 'August PCE is 3.4% / 3.0% core. Apple took Tuesday. Nvidia barely moved. Sell nothing. New core money still goes to VOO. Watch Friday’s jobs print. Nvidia’s next named date is November 17.',
    pills: [
      {tone: 'watch' as const, label: 'HOLD THIS MORNING'},
      {tone: 'caution' as const, label: 'NO AAPL DIP-BUY'},
      {tone: 'long' as const, label: 'VOO FOR NEW CASH'},
    ],
    followThrough: [
      {
        tone: 'watch' as const,
        if: 'Jobs Friday is noisy but the book is intact',
        then: 'Keep the contribution path. Do not invent a scout.',
      },
      {
        tone: 'caution' as const,
        if: 'Long rates keep rising after PCE',
        then: 'More VOO / cash. Less growth sleeve.',
      },
      {
        tone: 'long' as const,
        if: 'An asymmetric candidate is named by Evens or a filing',
        then: 'That is when the Next-NVDA sleeve gets a name.',
      },
    ],
  },
  tickerTape: [
    `SPX ${spxClose.toLocaleString('en-US')}  ${spxDayPct}%`,
    `SPX YTD  +${spxYtdPct}%`,
    `NASDAQ  ${nasdaqDayPct}%`,
    `NVDA  $${nvdaClose.toFixed(2)}  ${nvdaDayPct}%`,
    `AAPL  $${aaplClose.toFixed(2)}  ${aaplDayPct}%`,
    `10Y  ${tenYear}%`,
    `PCE  +${pceYy}% / CORE +${pceCoreYy}%`,
    `NIKKEI  +${nikkeiDayPct}%`,
    `JOBS  FRIDAY`,
    `NVDA  NOV 17`,
    `VOO CORE / ADD`,
    `SELL NOTHING THIS MORNING`,
  ],
};

export const episode: DailyReport = parseDailyReport(raw);
