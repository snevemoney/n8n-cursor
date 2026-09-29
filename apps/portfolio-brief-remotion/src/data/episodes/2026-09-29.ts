import {vsSpxSpread} from '../compute';
import {parseDailyReport, type DailyReport} from '../schema';

/** Last US / CA cash: Monday 28 Sep 2026. Asia Tuesday 29 Sep: Nikkei close only. Europe Tuesday is session, omitted. */
const nvdaClose = 228.86;
const nvdaDayPct = 1.68;
const nvdaYtd = 22.71;
const aaplClose = 338.4;
const aaplDayPct = -0.78;
const aaplYtd = 24.48;
const vooClose = 703.61;
const vooDayPct = -1.01;
const vooYtd = 12.2;
const vtiClose = 375.84;
const vtiDayPct = -1.03;
const vtiYtd = 12.1;
const vugClose = 90.04;
const vugDayPct = -0.99;
const vugYtd = 10.74;
const mgkClose = 92.48;
const mgkDayPct = -0.95;
const mgkYtd = 12.02;
const gdvClose = 28.59;
const gdvDayPct = -1.24;
const gdvYtd = 2.95;
const spxClose = 7683.69;
const spxDayPct = -0.77;
const spxYtdPct = 12.24;
const nasdaqClose = 26820.38;
const nasdaqDayPct = -0.92;
const dowClose = 51481.51;
const dowDayPct = -0.67;
const russellClose = 2817.91;
const russellDayPct = -0.69;
const soxClose = 12465.24;
const soxDayPct = -1.61;
const tenYear = 5.24;
const nikkei = 65155.57;
const nikkeiDayPct = -1.1;
const tsxClose = 35489.86;
const tsxPoints = -311.03;
const tsxDayPct = -0.87;
const tsxV = 894.25;
const tsxVDayPct = -2.9;
const cadOfficial = 1.4168;
const wtiMon = 92.6;
const goldMon = 4168.4;
const goldMonPts = -152.8;
const nvdaQ2Rev = 96.2;
const nvdaDcRev = 89.0;
const nvdaQ3Guide = 108.0;
const nvdaSpxYtd = spxYtdPct;
const aaplSpxYtd = spxYtdPct;

const raw = {
  meta: {
    date: '2026-09-29',
    dateLabel: 'SEP 29, 2026',
    title: 'Daily Wealth Intelligence',
    thesis:
      'Monday cash went red. The 10-year printed 5.24%. The book is still the same seven U.S. growth lines. Nvidia rose while the chip index fell. That is a split inside one factor, not a new book.',
    thesisLead: 'Monday cash went red.',
    thesisAccent: 'The book is still the same seven lines.',
    catalyst:
      'Tuesday 10:00 ET is JOLTS. Wednesday is BEA PCE and the Q2 GDP third estimate. StatCan already printed July GDP unchanged.',
    universe: ['AAPL', 'NVDA', 'VOO', 'VTI', 'VUG', 'MGK', 'GDV'],
  },
  market: {
    spxClose,
    spxDayPct,
    spxYtdPct,
    nasdaqDayPct,
    tenYearYield: tenYear,
    note: 'Monday U.S. cash fell as the Treasury 10-year closed 5.24%. Nvidia was the exception inside a weaker chip tape.',
    nextCalendar: {
      label: 'JOLTS today · PCE tomorrow',
      detail: 'BLS JOLTS and Conference Board at 10:00 ET. BEA PCE and Q2 GDP third estimate Wednesday 8:30 ET.',
    },
  },
  markets: {
    global: {
      indices: [{label: 'Nikkei 225', value: nikkei.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}), dayPct: nikkeiDayPct, note: 'Tuesday close (Business Upturn)'}],
      commodities: [
        {label: 'WTI November', value: `$${wtiMon.toFixed(2)}`, note: 'Monday settle (Canadian Press); +19 cents'},
        {label: 'Gold December', value: `$${goldMon.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, note: `Monday settle (Canadian Press); ${goldMonPts} on the day`},
      ],
      note: 'Hang Seng, ASX, Shanghai, and Kospi Tuesday closes unread as official prints. Europe Tuesday is still a session at 9:12 ET — omitted.',
    },
    us: {
      indices: [
        {label: 'S&P 500', value: spxClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}), dayPct: spxDayPct},
        {label: 'Nasdaq', value: nasdaqClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}), dayPct: nasdaqDayPct},
        {label: 'Dow', value: dowClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}), dayPct: dowDayPct},
        {label: 'Russell 2000', value: russellClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}), dayPct: russellDayPct},
        {label: 'SOX', value: soxClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}), dayPct: soxDayPct},
      ],
      yields: [{label: 'U.S. 10-year', value: `${tenYear}%`, note: 'Treasury daily par table Monday (not FRED DGS10)'}],
      note: 'Monday close. AP / Canadian Press / Yahoo / Nasdaq OMX SOX. NYSE is not open yet at this 9:12 ET wake.',
    },
    ca: {
      indices: [
        {label: 'S&P/TSX', value: tsxClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}), dayPct: tsxDayPct, note: `${tsxPoints} points (Canadian Press / Investing)`},
        {label: 'TSX Venture', value: tsxV.toFixed(2), dayPct: tsxVDayPct, note: 'Baystreet Monday'},
      ],
      cadUsd: `BoC Valet FXUSDCAD ${cadOfficial} on 2026-09-28 (70.58 U.S. cents)`,
      note: 'StatCan July GDP essentially unchanged. August advance estimate +0.2%.',
    },
    calendar: {
      items: [
        {
          when: 'Tuesday 8:30 ET',
          where: 'CA' as const,
          label: 'StatCan July GDP',
          why: 'Printed: July real GDP essentially unchanged. August advance +0.2%.',
        },
        {
          when: 'Tuesday 10:00 ET',
          where: 'US' as const,
          label: 'JOLTS + Conference Board',
          why: 'Not out at this 9:12 ET wake. Do not invent the print.',
        },
        {
          when: 'Wednesday 8:30 ET',
          where: 'US' as const,
          label: 'BEA PCE + Q2 GDP third estimate',
          why: 'Fed preferred inflation print on a 5.24% 10-year.',
        },
        {
          when: 'Friday 8:30 ET',
          where: 'US' as const,
          label: 'September employment report',
          why: 'Jobs print after JOLTS and PCE.',
        },
        {
          when: 'November 17',
          where: 'US' as const,
          label: 'Nvidia Q3 call (named Aug 26)',
          why: 'Named on the August 26 call. IR events page unread this sitting.',
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
      whatMatters: 'Monday +1.68% while SOX −1.61%. Q3 guide still $108.0B ±2%.',
      ytd: nvdaYtd,
    },
    {
      ticker: 'AAPL',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Recent purchase',
      whatMatters: 'Monday −0.78%. Q4 date still unannounced.',
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
      whatMatters: 'Monday print includes the Sep 28 ex-date. Still lagging S&P YTD.',
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
      whatMatters: 'Different job. NAV unread. Not Next-NVDA.',
      ytd: gdvYtd,
    },
  ],
  portfolio: {
    concentrationThesis: 'VOO + VTI + VUG + MGK + AAPL + NVDA still buy the same U.S. mega-cap growth names.',
    concentrationBody:
      'Monday showed the stack: the index fell, the chip index fell harder, and six of seven lines went red. Nvidia was the exception, not a second factor.',
    factorStack: ['NVDA', 'AAPL', 'MGK', 'VUG', 'VOO', 'VTI'],
    factorLabel: 'U.S. mega-cap / growth',
    overlapNote: 'same ecosystem',
  },
  names: [
    {
      ticker: 'NVDA',
      chapterTitle: 'NVDA · up on a down chip day',
      rating: 'HOLD — POST-PRINT WATCH',
      tone: 'watch' as const,
      price: nvdaClose,
      dayPct: nvdaDayPct,
      holdNote: 'No add on a one-day split versus SOX.',
      streak: [1.34, 2.3, 0.66, -1.47, -0.41, 0.22, 1.68],
      streakHeadline: 'Seven Yahoo sessions. Two red. The last print is green on a red SOX day.',
      streakNote: 'Yahoo daily closes through Monday 28 Sep. Not a 21-day grid.',
      fundamentals: [
        {label: 'Q2 FY27 revenue', value: `$${nvdaQ2Rev.toFixed(1)}B  +106% y/y`},
        {label: 'Q2 data center', value: `$${nvdaDcRev.toFixed(1)}B  +117% y/y`},
        {label: 'Q2 gross margin', value: '75.0% GAAP and non-GAAP'},
        {label: 'Q3 revenue guide', value: `$${nvdaQ3Guide.toFixed(1)}B  ±2%`},
        {label: 'Q3 margin guide', value: '74.0%  ±50 bp'},
        {label: 'China DC compute in guide', value: 'None assumed'},
      ],
      vsSpx: {
        headline: 'Still beating the S&P YTD. Monday’s extra vol is the chip tape, not a new earnings print.',
        bars: [
          {label: 'NVDA YTD', pct: nvdaYtd, tone: 'nvda' as const},
          {label: 'S&P YTD', pct: nvdaSpxYtd, tone: 'muted' as const},
        ],
        note: `Spread: ${vsSpxSpread(nvdaYtd, nvdaSpxYtd) >= 0 ? '+' : ''}${vsSpxSpread(nvdaYtd, nvdaSpxYtd).toFixed(1)} points (NVDA YTD − S&P YTD). Yahoo last / 2025 year-end.`,
      },
      consensus: {
        rows: [
          {label: 'Company Q3 revenue', value: '$108.0B ±2%'},
          {label: 'Company Q3 margin', value: '74.0% ±50 bp'},
          {label: 'Q2 print', value: '$96.2B revenue · $89.0B data center'},
        ],
        note: 'Company guide from the August 26 release. Street whisper unread. Do not draw a whisper zone.',
        range: {metric: 'Company Q3 revenue guide', unit: 'B', guide: 108.0, low: 105.84, high: 110.16},
      },
      narrative: {
        leftTitle: 'THE FEAR',
        leftHeadline: '“The 10-year at 5.24% and an OpenAI pause can reprice the whole AI stack.”',
        leftBody:
          'Monday SOX −1.61% (Nasdaq OMX). Yields at a 2007-area close. That is duration plus a demand-timing scare — not a new Nvidia quarter.',
        rightTitle: 'THE COUNTER',
        rightHeadline: 'August 26 already printed $96.2B and guided $108.0B ±2% with China at zero.',
        rightBody:
          'Monday NVDA +1.68% on that same tape. One session does not retire the financing or margin questions from the call.',
      },
      interpretation: {
        chips: [
          {label: 'CONFIRMED', tone: 'long' as const, text: 'Q2 revenue $96.2B and Q3 guide $108.0B ±2% are company numbers.'},
          {label: 'CONFIRMED', tone: 'watch' as const, text: 'Q3 margin guide 74.0% ±50 bp is below the 75.0% Q2 print.'},
          {
            label: 'INFERENCE',
            tone: 'caution' as const,
            text: 'A green Nvidia day against a red SOX is a split, not proof the book is diversified.',
          },
        ],
        note: 'Next company update named November 17 on the August 26 call. IR events page unread this sitting.',
      },
      actionMatrix: {
        headline: 'HOLD the line. Do not add because SOX fell and NVDA did not.',
        rows: [
          {
            tone: 'long' as const,
            if: 'PCE cools and the 10-year gives back the 5.24% close',
            then: 'Re-read the book. Still no automatic add.',
          },
          {
            tone: 'watch' as const,
            if: 'JOLTS / PCE keep the 10-year bid',
            then: 'HOLD. Mega-cap duration stays the risk.',
          },
          {
            tone: 'caution' as const,
            if: 'Chip tape keeps falling while NVDA holds',
            then: 'Treat it as concentration, not a free hedge.',
          },
          {
            tone: 'short' as const,
            if: 'Company guide is cut before November 17',
            then: 'That is a new fact. Re-open REDUCE.',
          },
        ],
      },
      network: {
        title: 'NVDA · qualitative demand chain',
        headline: 'Polarity from the August 26 IR release — no composite score.',
        nodes: [
          {id: 'labs', label: 'AI labs / hyperscalers', polarity: 'confirmed' as const, x: 0.08, y: 0.22},
          {id: 'demand', label: 'GPU demand', polarity: 'confirmed' as const, x: 0.3, y: 0.22},
          {id: 'spend', label: 'Q3 guide', polarity: 'confirmed' as const, x: 0.5, y: 0.22, evidence: '$108.0B ±2%'},
          {id: 'financing', label: 'Customer financing', polarity: 'concern' as const, x: 0.3, y: 0.78, evidence: 'Named on Aug 26 call'},
          {id: 'nvda', label: 'NVDA', polarity: 'neutral' as const, x: 0.62, y: 0.5},
          {id: 'supply', label: 'Memory / supply', polarity: 'concern' as const, x: 0.82, y: 0.18, evidence: 'Bottleneck through FY28'},
          {id: 'margins', label: 'Margins', polarity: 'concern' as const, x: 0.82, y: 0.5, evidence: '74.0% ±50 bp'},
          {id: 'eps', label: 'Next print', polarity: 'inference' as const, x: 0.82, y: 0.82, evidence: 'Nov 17 named'},
          {id: 'valuation', label: '10-year 5.24%', polarity: 'concern' as const, x: 0.94, y: 0.5},
        ],
        edges: [
          {from: 'labs', to: 'demand'},
          {from: 'demand', to: 'spend'},
          {from: 'spend', to: 'nvda'},
          {from: 'financing', to: 'nvda', label: 'exposure'},
          {from: 'nvda', to: 'supply'},
          {from: 'nvda', to: 'margins'},
          {from: 'margins', to: 'eps'},
          {from: 'eps', to: 'valuation'},
        ],
      },
    },
    {
      ticker: 'AAPL',
      chapterTitle: 'AAPL · the recent purchase',
      rating: 'HOLD',
      tone: 'long' as const,
      price: aaplClose,
      dayPct: aaplDayPct,
      returns: {
        headline: 'Still beating the S&P YTD. Monday followed the index down. Q4 date is not a company date.',
        bars: [
          {label: 'AAPL YTD', pct: aaplYtd, tone: 'long' as const},
          {label: 'S&P YTD', pct: aaplSpxYtd, tone: 'muted' as const},
        ],
        panelTitle: '52-WEEK HIGH (YAHOO)',
        panelBody: 'Yahoo 52-week high $345.34. Monday close $338.40.',
        note: `Spread vs S&P YTD: ${vsSpxSpread(aaplYtd, aaplSpxYtd) >= 0 ? '+' : ''}${vsSpxSpread(aaplYtd, aaplSpxYtd).toFixed(1)} points. Yahoo last / 2025 year-end.`,
      },
      catalyst: {
        headline: 'Q4 FY2026 call date is unannounced on Apple IR.',
        steps: ['Fiscal Q4 ends this month', 'Company has not posted a call date', 'Street guesses are not a date'],
        note: 'Do not treat October 29 as announced.',
      },
      action: {
        headline: 'HOLD the position.',
        body: 'Do not add on a red index day. The next contribution should still diversify, not double the same name.',
      },
    },
    {
      ticker: 'VOO',
      chapterTitle: 'VOO · the foundation is not the problem',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      metrics: [
        {label: 'Monday', value: `$${vooClose.toFixed(2)}  ${vooDayPct}%`},
        {label: 'YTD', value: `+${vooYtd}%`},
      ],
      copy: {
        headline: 'Best simple core. New core money simplifies here.',
        body: 'Monday followed the S&P. Do not sell. Stop splitting every future contribution with VTI.',
      },
    },
    {
      ticker: 'VTI',
      chapterTitle: 'VTI · excellent, overlapping',
      rating: 'HOLD',
      tone: 'long' as const,
      metrics: [
        {label: 'Monday', value: `$${vtiClose.toFixed(2)}  ${vtiDayPct}%`},
        {label: 'YTD', value: `+${vtiYtd}%`},
      ],
      copy: {
        headline: 'Excellent. Mega-caps still dominate, so the top looks like VOO.',
        body: 'Do not sell. The overlap with VOO is the issue — not the fund quality.',
      },
    },
    {
      ticker: 'VUG',
      chapterTitle: 'VUG · growth sleeve, still behind the index',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      metrics: [{label: 'Monday', value: `$${vugClose.toFixed(2)}  ${vugDayPct}%`}],
      returns: {
        headline: 'YTD still trails the S&P. Monday’s close includes the September 28 ex-date.',
        bars: [
          {label: 'VUG YTD', pct: vugYtd, tone: 'watch' as const},
          {label: 'S&P YTD', pct: spxYtdPct, tone: 'long' as const},
        ],
        note: 'Yahoo last / 2025 year-end. HOLD existing. No priority additions.',
      },
    },
    {
      ticker: 'MGK',
      chapterTitle: 'MGK · same stack, more concentrated',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      metrics: [
        {label: 'Monday', value: `$${mgkClose.toFixed(2)}  ${mgkDayPct}%`},
        {label: 'YTD', value: `+${mgkYtd}%`},
      ],
      copy: {
        body: 'You already own NVDA and AAPL directly. HOLD. Stop feeding it. Not a sell call — weights and tax lots are unread.',
      },
    },
    {
      ticker: 'GDV',
      chapterTitle: 'GDV · a different job',
      rating: 'HOLD · INCOME / DIVERSIFIER',
      tone: 'long' as const,
      metrics: [
        {label: 'Monday', value: `$${gdvClose.toFixed(2)}  ${gdvDayPct}%`},
        {label: 'YTD', value: `+${gdvYtd}%`},
        {label: 'NAV', value: 'unread'},
      ],
      copy: {
        body: 'Closed-end income/value. NAV and discount unread this sitting. When growth is punched, this sleeve is supposed to look different. Not a growth engine. Not Next-NVDA.',
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
      id: 'fred-10y',
      area: 'US' as const,
      question: 'What did FRED DGS10 print for Monday 28 Sep?',
      whyItMatters: 'The tape uses the Treasury par table 5.24%. That is not the FRED constant-maturity series.',
      neededToKnow: 'A FRED DGS10 observation for 2026-09-28. The FRED CSV timed out this sitting.',
      status: 'partial' as const,
    },
    {
      id: 'asia-ex-nikkei',
      area: 'GLOBAL' as const,
      question: 'Where did Hang Seng, ASX, Shanghai, and Kospi close Tuesday?',
      whyItMatters: 'Only the Nikkei Tuesday close is sourced. Intra-session prints are not closes.',
      neededToKnow: 'Official index-page closes for any session we claim.',
      status: 'unknown' as const,
    },
    {
      id: 'jolts',
      area: 'US' as const,
      question: 'What did August JOLTS print?',
      whyItMatters: 'The 10:00 ET release is still ahead of this 9:12 ET wake.',
      neededToKnow: 'The BLS table after 10:00 ET.',
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
    freshCapital: 'New core money still simplifies into VOO. Do not add NVDA or AAPL on a one-day split.',
    bestAdd: 'VOO',
    highestUpsideWatch: 'none named',
    biggestRisk: 'Mega-cap growth overlap across NVDA, AAPL, MGK, VUG, VOO, VTI — now sitting under a 5.24% 10-year',
    nextTrigger: 'Tuesday 10:00 JOLTS · Wednesday PCE',
    ifThen: [
      {
        tone: 'long' as const,
        if: 'PCE cools and the 10-year gives back Monday’s close',
        then: 'Re-read. Core add is still VOO, not another mega-cap line.',
      },
      {
        tone: 'watch' as const,
        if: 'JOLTS / PCE keep yields bid',
        then: 'HOLD the book. Do not chase NVDA strength versus SOX.',
      },
      {
        tone: 'caution' as const,
        if: 'Chip tape keeps falling while the book stays this concentrated',
        then: 'Do not automatically buy the dip in VUG or MGK.',
      },
      {
        tone: 'short' as const,
        if: 'Nvidia cuts the $108.0B guide before November 17',
        then: 'Re-open REDUCE on the growth stack.',
      },
    ],
  },
  risks: [
    {
      n: '01',
      title: 'Growth-factor concentration',
      body: 'NVDA + AAPL + MGK + VUG + VOO + VTI repeatedly own the same mega-cap ecosystem. Monday made that visible.',
    },
    {
      n: '02',
      title: 'Interest rates',
      body: `The Treasury 10-year closed ${tenYear}% Monday — a 2007-area print. That compresses the exact overweight.`,
    },
    {
      n: '03',
      title: 'AI ROI and supply',
      body: 'August 26 already moved the debate to margins (74.0% ±50 bp) and memory supply through FY28. A one-day NVDA bounce does not close that.',
    },
  ],
  close: {
    kicker: 'DIAGNOSTIC',
    headline: 'Monday was a rate-and-overlap day, not a new Nvidia quarter.',
    body: 'The company numbers are still August 26. The new facts are the 5.24% 10-year, a red TSX, and StatCan July GDP unchanged. Watch JOLTS at 10:00. Do not trade this tape.',
    pills: [
      {tone: 'watch' as const, label: 'HOLD THIS MORNING'},
      {tone: 'long' as const, label: 'CORE ADD = VOO'},
      {tone: 'caution' as const, label: 'NO SCOUT NAME'},
    ],
    followThrough: [
      {
        tone: 'watch' as const,
        if: 'JOLTS is hot and the 10-year stays bid',
        then: 'Keep fresh capital on VOO / cash. Do not add the growth sleeve.',
      },
      {
        tone: 'caution' as const,
        if: 'PCE tomorrow keeps inflation sticky',
        then: 'The overlap risk is the story, not a new ticker.',
      },
      {
        tone: 'long' as const,
        if: 'An asymmetric name is filed or Evens names one',
        then: 'That is when the Next-NVDA sleeve gets a candidate.',
      },
    ],
  },
  tickerTape: [
    `SPX ${spxClose.toLocaleString('en-US')}  ${spxDayPct}%`,
    `SPX YTD  +${spxYtdPct}%`,
    `NASDAQ  ${nasdaqDayPct}%`,
    `NVDA  $${nvdaClose.toFixed(2)}  +${nvdaDayPct}%`,
    `AAPL  $${aaplClose.toFixed(2)}  ${aaplDayPct}%`,
    `SOX  ${soxDayPct}%`,
    `10Y  ${tenYear}%`,
    `TSX  ${tsxDayPct}%`,
    `CAD  ${cadOfficial}`,
    `NIKKEI  ${nikkeiDayPct}%`,
    `STATCAN JUL GDP  UNCHANGED`,
    `JOLTS  10:00 ET`,
    `VOO CORE / ADD`,
    `SELL NOTHING THIS MORNING`,
  ],
};

export const episode: DailyReport = parseDailyReport(raw);
