import {vsSpxSpread} from '../compute';
import {parseDailyReport, type DailyReport} from '../schema';

/** Monday 2026-08-31 cash. Tuesday 2026-09-01 America/Toronto is pre-open / pre-JOLTS at write. */
const nvdaClose = 220.78;
const nvdaDayPct = 1.48;
const nvdaYtd = 18.53;
const nvdaSpxYtd = 12.28;
const nvdaBeta = 2.21;
const aaplClose = 316.85;
const aaplDayPct = -0.89;
const aaplYtd = 16.87;
const aaplSpxYtd = 12.28;
const vooYtd = 13.47;
const vtiYtd = 13.84;
const vugYtd = 8.52;
const mgkYtd = 9.37;
const gdvYtd = 13.19;
const spxClose = 7686.14;
const spxDayPct = -0.33;
const spxYtdPct = 12.28;
const nasdaqClose = 26370.89;
const nasdaqDayPct = -0.12;
const tenYear = 4.75;
const tsxClose = 36270.48;
const tsxDayPct = -0.78;

const raw = {
  meta: {
    date: '2026-09-01',
    dateLabel: 'SEP 01, 2026',
    title: 'Daily Wealth Intelligence',
    thesis:
      'Nvidia already printed $96.2B and guided $108B. Monday cash bounced the name. The book is still the same U.S. mega-cap stack. Oil and the 10-year pressed the August close.',
    thesisLead: 'The print is in.',
    thesisAccent: 'The book is still concentrated.',
    catalyst: 'JOLTS 10:00 ET this morning. July openings are not printed yet.',
    kicker: 'Tuesday open · Monday cash',
    universe: ['AAPL', 'NVDA', 'VOO', 'VTI', 'VUG', 'MGK', 'GDV'],
  },
  market: {
    spxClose,
    spxDayPct,
    spxYtdPct,
    nasdaqDayPct,
    tenYearYield: tenYear,
    note: 'Monday cash: S&P 7,686.14 (−0.33%). Nasdaq 26,370.89 (−0.12%). 10-year 4.75%. Energy was the bid; most other sectors were not. Tuesday pre-market is not a close.',
    nextCalendar: {
      label: 'JOLTS 10:00 ET · BoC Wed · jobs Fri',
      detail: 'BLS JOLTS (July) today 10:00 ET. Bank of Canada rate Wed Sep 2 09:45 ET. Employment Situation (August) Fri Sep 4 8:30 ET.',
    },
  },
  markets: {
    global: {
      indices: [
        {label: 'Nikkei 225', value: '66,215.34', dayPct: -0.15},
        {label: 'Hang Seng', value: '25,329.73', dayPct: -0.93},
        {label: 'Shanghai Composite', value: '3,979.89', dayPct: -0.16},
        {label: 'DAX', value: '26,024.97', dayPct: -0.89},
        {label: 'FTSE 100', value: '10,769.81', dayPct: -0.5},
        {label: 'CAC 40', value: '8,321.93', dayPct: -0.15},
        {label: 'EURO STOXX 50', value: '6,388.56', dayPct: -0.49},
        {label: 'S&P/ASX 200', value: '9,066.70', dayPct: -0.1},
        {label: 'KOSPI', value: '6,835.80', dayPct: 0.23},
        {label: 'Taiwan TAIEX', value: '46,948.72', dayPct: 1.78},
      ],
      commodities: [
        {
          label: 'WTI crude (CL=F)',
          value: '87.98',
          dayPct: 2.59,
          note: 'Yahoo live 8:56 AM EDT Tuesday — not a Monday settlement.',
        },
      ],
      rates: [{label: 'U.S. 10-year (Mon cash)', value: `${tenYear}%`}],
      note: 'World prints from the Yahoo S&P 500 page related-index list. Oil is Tuesday morning live, labeled as such.',
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
        {label: 'Dow', value: '53,185.90', dayPct: -0.7},
        {label: 'Russell 2000', value: '2,956.45', dayPct: -0.54},
      ],
      sectors: [{label: 'Energy', dayPct: 2.1, note: 'FXEmpire: only S&P sector with a bid Monday.'}],
      breadth:
        'FXEmpire Monday: NYSE decliners led 1.95-to-1. Nasdaq 2,931 down / 1,859 up. Volume 15.65B.',
      yields: [
        {label: 'U.S. 10-year', value: `${tenYear}%`},
        {label: 'U.S. 30-year', value: '5.243%'},
        {label: 'U.S. 2-year', value: '4.339%'},
        {label: 'VIX', value: '15.91', dayPct: 6.64},
      ],
      note: 'Reuters / FXEmpire / TV News Check Monday close. S&P YTD +12.28% (Yahoo trailing as of Aug 31). Nasdaq YTD +13.5% (TV News Check). August still finished up: S&P +2.6%, Nasdaq +3.9%.',
    },
    ca: {
      indices: [
        {
          label: 'S&P/TSX Composite',
          value: tsxClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: tsxDayPct,
        },
        {label: 'S&P/TSX Venture', value: '982.51', dayPct: -0.67},
      ],
      cadUsd: '0.7219 Monday previous close (Yahoo CADUSD=X). Tuesday live ~0.7202 as of 14:06 GMT+1 — not a Tuesday TSX close.',
      note: 'TSX Monday cash 36,270.48 (−0.78%), month +2.96% (Morningstar Data Talk). Venture print from Yahoo CADUSD related list.',
    },
    calendar: {
      items: [
        {
          when: 'Tue Sep 1 · 10:00 ET',
          where: 'US' as const,
          label: 'JOLTS (July)',
          why: 'BLS schedule. Last print: June openings 7.4 million (Aug 4 release). Today’s number is not out at write.',
        },
        {
          when: 'Wed Sep 2 · 09:45 ET',
          where: 'CA' as const,
          label: 'Bank of Canada rate',
          why: 'Official 2026 announcement calendar. Overnight target last held at 2.25% on July 15.',
        },
        {
          when: 'Fri Sep 4 · 8:30 ET',
          where: 'US' as const,
          label: 'Employment Situation (August)',
          why: 'BLS September schedule. Next U.S. jobs print.',
        },
        {
          when: 'Mon Sep 7',
          where: 'US' as const,
          label: 'Labor Day',
          why: 'BLS calendar: U.S. markets closed.',
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
      whatMatters: 'Q2 $96.2B / Q3 guide $108.0B ±2%, no China DC compute. Monday cash +1.48%.',
      ytd: nvdaYtd,
      overlapWith: ['AAPL', 'VUG', 'MGK', 'VOO', 'VTI'],
    },
    {
      ticker: 'AAPL',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Recent purchase',
      whatMatters: 'Monday −0.89%. Still beating the S&P YTD. Next earnings Oct 29.',
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
      whatMatters: 'Excellent fund. Still overlaps VOO at the top.',
      ytd: vtiYtd,
      overlapWith: ['VOO'],
    },
    {
      ticker: 'VUG',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Growth sleeve',
      whatMatters: 'Growth label, still lagging the S&P YTD.',
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
      whatMatters: 'Different job. Forward distribution ~5.94%. Not a growth engine.',
      ytd: gdvYtd,
    },
  ],
  portfolio: {
    concentrationThesis: 'VOO + VTI + VUG + MGK + AAPL + NVDA still buy the same companies.',
    concentrationBody:
      'Monday’s tape showed it: energy was green, the rest of the book leaned red except NVDA’s bounce. Several Wealthsimple lines still move together.',
    factorStack: ['NVDA', 'AAPL', 'MGK', 'VUG', 'VOO', 'VTI'],
    factorLabel: 'U.S. mega-cap / growth',
    overlapNote: 'same ecosystem',
  },
  names: [
    {
      ticker: 'NVDA',
      chapterTitle: 'NVDA · the print is in. The tape is still jumpy.',
      rating: 'HOLD — POST-PRINT WATCH',
      tone: 'watch' as const,
      price: nvdaClose,
      dayPct: nvdaDayPct,
      holdNote: 'No add into JOLTS / jobs / a 4.75% 10-year. Tuesday pre-market ~$216.90 (−1.63%) is not a close.',
      streak: [-0.98, -2.91, 2.19, -1.59, 8.74, -4.58, 1.48],
      streakHeadline: 'Seven sessions around the print. Four red. One huge green day. Then a fade. Then a bounce.',
      streakNote:
        'Yahoo daily closes Aug 21–31: −0.98, −2.91, +2.19, −1.59, +8.74 (Aug 26 report day), −4.58, +1.48. Momentum formula counts red days only.',
      fundamentals: [
        {label: 'Market cap', value: '$5.331T'},
        {label: 'Q2 FY27 revenue', value: '$96.2B  +18% q/q  +106% y/y'},
        {label: 'Q2 data center', value: '$89.0B  +117% y/y'},
        {label: 'Q2 gross margin', value: '75.0% GAAP and non-GAAP'},
        {label: 'Q2 EPS', value: '$2.46 GAAP  /  $2.22 non-GAAP'},
        {label: 'Q3 revenue guide', value: '$108.0B ±2%  ·  no China DC compute'},
        {label: 'Q3 GM guide', value: '74.0% ±50 bps'},
        {label: 'TTM revenue / NI / EPS', value: '$303.0B  /  $192.9B  /  $7.90'},
        {label: 'P/E (TTM)  ·  Beta', value: `27.95×  ·  ${nvdaBeta}`},
      ],
      vsSpx: {
        headline: 'Beating the S&P YTD again — with a 2.2 beta and a jumpy week.',
        bars: [
          {label: 'NVDA YTD', pct: nvdaYtd, tone: 'nvda' as const},
          {label: 'S&P YTD', pct: nvdaSpxYtd, tone: 'muted' as const},
        ],
        note: `Spread: ${vsSpxSpread(nvdaYtd, nvdaSpxYtd) >= 0 ? '+' : ''}${vsSpxSpread(nvdaYtd, nvdaSpxYtd).toFixed(2)} points (NVDA YTD − S&P YTD). Yahoo trailing as of Aug 31. Beta: ${nvdaBeta}.`,
      },
      consensus: {
        rows: [
          {label: 'Q2 printed revenue', value: '$96.2B'},
          {label: 'Q3 company guide', value: '$108.0B ±2%'},
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
        leftHeadline: 'Friday sold a large print. Monday only bounced part of it.',
        leftBody:
          'Aug 27 close $227.98 after the report. Aug 28 $217.55 (−4.58%). Aug 31 $220.78 (+1.48%). Guide assumes zero China data-center compute. Gross-margin guide 74.0% is below the 75.0% print.',
        rightTitle: 'THE COUNTER',
        rightHeadline: 'The company just printed $96.2B and pointed at $108B.',
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
            text: 'Cash is still digesting the print. A 2.2-beta name plus a 4.75% 10-year is not a quiet sleeve.',
          },
        ],
        note: 'No composite score. Formulas: red-day count from the seven-print streak. Whisper UNKNOWN.',
      },
      actionMatrix: {
        headline: 'This morning: HOLD. Do not add into JOLTS.',
        rows: [
          {
            tone: 'watch' as const,
            if: 'JOLTS / Friday jobs keep the 10-year bid and NVDA stays choppy',
            then: 'HOLD. Fresh core money still goes to VOO.',
          },
          {
            tone: 'long' as const,
            if: 'Labor prints cool and the 10-year backs off with the $108B guide intact',
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
          {id: 'rates', label: '10-year 4.75%', polarity: 'concern' as const, x: 0.82, y: 0.5, evidence: 'Mon cash'},
          {id: 'cash', label: 'Jumpy cash tape', polarity: 'inference' as const, x: 0.82, y: 0.82},
        ],
        edges: [
          {from: 'print', to: 'dc'},
          {from: 'dc', to: 'guide'},
          {from: 'guide', to: 'nvda'},
          {from: 'china', to: 'guide', label: 'excluded'},
          {from: 'nvda', to: 'gm'},
          {from: 'nvda', to: 'rates'},
          {from: 'rates', to: 'cash'},
        ],
      },
    },
    {
      ticker: 'AAPL',
      chapterTitle: 'AAPL · still the recent purchase',
      rating: 'HOLD',
      tone: 'long' as const,
      price: aaplClose,
      dayPct: aaplDayPct,
      holdNote: 'Do not add again this week. You just bought it. Next contribution should diversify.',
      returns: {
        headline: 'Beating the S&P YTD. Monday gave back Friday’s bounce.',
        bars: [
          {label: 'YTD', pct: aaplYtd, tone: 'long' as const},
          {label: 'S&P YTD', pct: aaplSpxYtd, tone: 'muted' as const},
          {label: '1 year', pct: 37.0, tone: 'gold' as const},
          {label: '6 months', pct: 19.94, tone: 'aapl' as const},
          {label: '1 month', pct: 2.57, tone: 'muted' as const},
        ],
        panelTitle: 'NEXT PRINT',
        panelBody: 'Yahoo earnings date Oct 29, 2026. No new IR catalyst sourced this sitting.',
        note: `Spread vs S&P YTD: ${vsSpxSpread(aaplYtd, aaplSpxYtd) >= 0 ? '+' : ''}${vsSpxSpread(aaplYtd, aaplSpxYtd).toFixed(2)} points. Trailing as of Aug 31. Chart: 6M +19.94%, 1M +2.57%.`,
      },
      action: {
        headline: 'HOLD the position.',
        body: 'Monday close $316.85 (−0.89%). Do not double the same name with the next C$ contribution.',
      },
    },
    {
      ticker: 'VOO',
      chapterTitle: 'VOO · the foundation is not the problem',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      metrics: [
        {label: 'Monday close', value: '$704.89  −0.33%'},
        {label: 'YTD', value: '+13.47%'},
      ],
      copy: {
        headline: 'Best simple core. New core money simplifies here.',
        body: 'Monday moved with the S&P. Do not sell. Stop splitting every future contribution with VTI.',
      },
    },
    {
      ticker: 'VTI',
      chapterTitle: 'VTI · excellent, overlapping',
      rating: 'HOLD',
      tone: 'long' as const,
      metrics: [
        {label: 'Monday close', value: '$378.15  −0.32%'},
        {label: 'YTD', value: '+13.84%'},
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
          {label: 'VUG 1-year', pct: 15.44, tone: 'muted' as const},
        ],
        note: 'Yahoo quote chart YTD +8.52% / 1-year +15.44%. Monday close $88.24 (−0.34%). HOLD existing. No priority additions.',
      },
    },
    {
      ticker: 'MGK',
      chapterTitle: 'MGK · same issue, tighter mega-cap',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      metrics: [
        {label: 'Monday close', value: '$89.90  −0.24%'},
        {label: 'YTD', value: '+9.37%'},
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
        {label: 'Market', value: '$30.16  −0.46%'},
        {label: 'YTD', value: '+13.19%'},
        {label: 'Fwd dist.', value: '~5.94%'},
      ],
      copy: {
        body: 'Closed-end income/value. Monday market $30.16. Fresh NAV / discount not read this sitting. When AI/growth gets punched, this sleeve is supposed to look different. Not “Next NVDA.”',
      },
    },
  ],
  nextNvda: [],
  unknowns: [
    {
      id: 'jolts-print',
      area: 'US' as const,
      question: 'What did July JOLTS openings / quits actually print?',
      whyItMatters: 'The 10-year is already 4.75%. A hot openings print feeds the hike tape that hits this growth book.',
      neededToKnow: 'BLS JOLTS release at 10:00 ET. Last sourced print is June 7.4 million (Aug 4).',
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
      whyItMatters: 'Market $30.16 is not NAV. The Aug 25 tape had a July 31 NAV snapshot that is now stale.',
      neededToKnow: 'A dated CEF NAV / discount from the fund page or a quote that prints NAV.',
      status: 'unknown' as const,
    },
  ],
  scenarios: [],
  capitalPlan: {
    existingPortfolio: 'HOLD — sell nothing this morning.',
    freshCapital: 'No add into JOLTS. New core money still simplifies into VOO.',
    bestAdd: 'VOO',
    highestUpsideWatch: 'none named',
    biggestRisk: 'Mega-cap growth overlap plus a 4.75% 10-year and higher oil',
    nextTrigger: 'JOLTS 10:00 ET today · BoC Wed · U.S. jobs Friday',
    ifThen: [
      {
        tone: 'watch' as const,
        if: 'JOLTS / Friday jobs keep the 10-year bid and NVDA stays choppy',
        then: 'HOLD. Fresh core money still goes to VOO.',
      },
      {
        tone: 'long' as const,
        if: 'Labor prints cool and the 10-year backs off with the $108B guide intact',
        then: 'Still HOLD first. Adding is a later sitting.',
      },
      {
        tone: 'caution' as const,
        if: 'Guide quality gets questioned or China-exclusion risk widens',
        then: 'Do not automatically buy the dip.',
      },
      {
        tone: 'short' as const,
        if: 'Demand talk turns into a cut and the name drops hard again',
        then: 'Consider reducing. Not this morning’s tape.',
      },
    ],
  },
  risks: [
    {
      n: '01',
      title: 'Growth-factor concentration',
      body: 'NVDA + AAPL + MGK + VUG + VOO + VTI still own the same mega-cap ecosystem. Weights are unknown.',
    },
    {
      n: '02',
      title: 'Interest rates and oil',
      body: 'Monday 10-year 4.75%. 30-year 5.243%. WTI ~$87.98 Tuesday morning. That combination is the opposite of a quiet growth tape.',
    },
    {
      n: '03',
      title: 'Post-print digestion',
      body: 'The IR print is large. Cash already faded it once. Guide assumes no China DC compute. Next NVDA report is November.',
    },
  ],
  close: {
    kicker: 'DIAGNOSTIC',
    headline: 'The print is no longer the event. The book still is.',
    body: 'Monday cash: NVDA bounced, the S&P and TSX did not. Hold the book. Watch JOLTS at 10, the Bank of Canada Wednesday, and U.S. jobs Friday. New core money still goes to VOO.',
    pills: [
      {tone: 'watch' as const, label: 'HOLD THIS MORNING'},
      {tone: 'caution' as const, label: 'NO PRE-JOLTS ADD'},
      {tone: 'long' as const, label: 'VOO FOR NEW CORE'},
    ],
    followThrough: [
      {
        tone: 'watch' as const,
        if: 'JOLTS is hot and yields stay bid',
        then: 'Do not add growth. Keep new money in VOO / cash.',
      },
      {
        tone: 'caution' as const,
        if: 'Jobs Friday re-prices the Fed path higher',
        then: 'Same concentration risk as last week — just louder.',
      },
      {
        tone: 'long' as const,
        if: 'An asymmetric candidate is named by Evens or a filing',
        then: 'That is when the Next-NVDA sleeve gets a row.',
      },
    ],
  },
  tickerTape: [
    `SPX ${spxClose.toLocaleString('en-US')}  ${spxDayPct}%`,
    `SPX YTD  +${spxYtdPct}%`,
    `NASDAQ  ${nasdaqClose.toLocaleString('en-US')}  ${nasdaqDayPct}%`,
    `NVDA  $${nvdaClose.toFixed(2)}  +${nvdaDayPct}%`,
    `AAPL  $${aaplClose.toFixed(2)}  ${aaplDayPct}%`,
    `10Y  ${tenYear}%`,
    `TSX  ${tsxClose.toLocaleString('en-US')}  ${tsxDayPct}%`,
    `JOLTS  10:00 ET`,
    `BOC  WED 09:45 ET`,
    `JOBS  FRI 08:30 ET`,
    `VOO CORE / ADD`,
    `SELL NOTHING THIS MORNING`,
  ],
};

export const episode: DailyReport = parseDailyReport(raw);
