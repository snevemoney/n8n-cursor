import {vsSpxSpread} from '../compute';
import {parseDailyReport, type DailyReport} from '../schema';

/** Monday 5 Oct cash close. Tuesday 6 Oct 9:03 America/Toronto — US cash not open. */
const nvdaYtd = 28.4;
const aaplYtd = 22.78;
const vugYtd = 13.22;
const mgkYtd = 14.58;
const gdvYtd = 7.02;
const nvdaSpxYtd = 13.56;
const aaplSpxYtd = 13.56;
const nvdaClose = 238.9;
const nvdaDayPct = 2.12;
const nvdaBeta = 2.22;
const aaplClose = 332.89;
const aaplDayPct = -0.24;
const spxClose = 7773.95;
const spxDayPct = 0.66;
const spxYtdPct = 13.56;
const nasdaqClose = 27477.31;
const nasdaqDayPct = 1.05;
const tenYear = 5.31;

const raw = {
  meta: {
    date: '2026-10-06',
    dateLabel: 'OCT 6, 2026',
    title: 'Daily Wealth Intelligence',
    thesis:
      'The book is still the same seven U.S. mega-cap growth lines. Monday the Nasdaq made a record while the official 10-year printed 5.31%. NVDA already reported. HOLD into the open.',
    thesisLead: 'Same seven lines.',
    thesisAccent: 'Record Nasdaq. 5.31% ten-year.',
    catalyst: 'BLS CPI on Oct 14. Then NVDA on Nov 17.',
    kicker: 'Tuesday morning · last cash is Monday',
    universe: ['AAPL', 'NVDA', 'VOO', 'VTI', 'VUG', 'MGK', 'GDV'],
  },
  market: {
    spxClose,
    spxDayPct,
    spxYtdPct,
    nasdaqDayPct,
    tenYearYield: tenYear,
    note: 'Nasdaq record close. Official Treasury 10-year 5.31% (Friday 5.28%). US cash not open at this wake.',
    nextCalendar: {
      label: 'CPI Oct 14 · NVDA Nov 17',
      detail: 'BLS September CPI 8:30 ET. Yahoo lists NVDA Nov 17. Apple IR has not posted Q4.',
    },
  },
  markets: {
    global: {
      indices: [
        {label: 'Nikkei 225', value: '70,683.98', dayPct: 1.05, note: 'Tuesday Tokyo close'},
        {label: 'TOPIX', value: '4,183.56', dayPct: 0.92, note: 'JIJI Tuesday close'},
      ],
      note: 'Asia closed. Mainland China holiday. Europe still open — no Europe close on this tape.',
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
          note: 'Record close',
        },
      ],
      yields: [{label: 'U.S. 10-year CMT', value: `${tenYear}%`, note: 'Treasury CSV 5 Oct; Friday 5.28%'}],
      note: 'Monday cash. Mega-cap growth led. Long rates at a 24-year high on the official curve.',
    },
    ca: {
      indices: [
        {label: 'S&P/TSX Composite', value: '35,518.55', dayPct: 0.04, note: 'TSX daily report + Yahoo'},
        {label: 'S&P/TSX Venture', value: '878.58', dayPct: -0.23, note: 'TSX daily report'},
      ],
      cadUsd: '1 USD = 1.4254 CAD (BoC daily average, 5 Oct)',
      note: 'Toronto cash closed Monday. Flat index. CAD a touch weaker vs Friday 1.4246.',
    },
    calendar: {
      items: [
        {
          when: 'Wed Oct 14',
          where: 'US' as const,
          label: 'BLS CPI (September)',
          why: 'Official BLS calendar. 8:30 ET. First named U.S. print after this wake.',
        },
        {
          when: 'Oct 27–28',
          where: 'US' as const,
          label: 'FOMC',
          why: 'Federal Reserve calendar. No SEP star on this meeting.',
        },
        {
          when: 'Tue Nov 17',
          where: 'US' as const,
          label: 'Nvidia earnings',
          why: 'Yahoo lists Nov 17. Q3 FY27 guide on the Aug 26 IR release is $108.0B ±2%.',
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
      rating: 'HOLD',
      tone: 'watch' as const,
      role: 'Largest event name — next print Nov 17',
      whatMatters: 'Aug 26 IR already printed. $96.2B quarter. $108.0B ±2% Q3 guide.',
      ytd: nvdaYtd,
    },
    {
      ticker: 'AAPL',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Direct name',
      whatMatters: 'Monday −0.24%. June quarter is the last IR print. Q4 date not on Apple IR.',
      ytd: aaplYtd,
    },
    {
      ticker: 'VOO',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      role: 'Best simple core',
      whatMatters: 'Monday $712.32 +0.68%. Trailing YTD total return 13.81% as of Oct 2 — not a Monday price YTD.',
    },
    {
      ticker: 'VTI',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Broad US',
      whatMatters: 'Monday $380.60 +0.69%. Trailing YTD total return 13.72% as of Oct 2. Still overlaps VOO.',
      overlapWith: ['VOO'],
    },
    {
      ticker: 'VUG',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Growth sleeve',
      whatMatters: 'Yahoo chart YTD +13.22% as of Monday — about even with the S&P. Same mega-cap stack.',
      ytd: vugYtd,
      overlapWith: ['NVDA', 'AAPL', 'VOO', 'MGK'],
    },
    {
      ticker: 'MGK',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Mega-cap growth',
      whatMatters: 'Yahoo chart YTD +14.58% as of Monday — now ahead of the S&P. You already own NVDA and AAPL.',
      ytd: mgkYtd,
      overlapWith: ['NVDA', 'AAPL', 'VUG', 'VOO'],
    },
    {
      ticker: 'GDV',
      rating: 'HOLD — income / diversifier',
      tone: 'long' as const,
      role: 'Income sleeve',
      whatMatters: 'Market $28.37 unchanged Monday. Yahoo total-return YTD +7.02%. NAV unread this wake.',
      ytd: gdvYtd,
    },
  ],
  portfolio: {
    concentrationThesis: 'VOO + VTI + VUG + MGK + AAPL + NVDA still buy the same companies.',
    concentrationBody:
      'VUG and MGK are no longer lagging the S&P the way they were in August. That does not fix overlap. When mega-cap growth turns, several lines still move together.',
    factorStack: ['NVDA', 'AAPL', 'MGK', 'VUG', 'VOO', 'VTI'],
    factorLabel: 'U.S. mega-cap / growth',
    overlapNote: 'same ecosystem',
  },
  names: [
    {
      ticker: 'NVDA',
      chapterTitle: 'NVDA · the August print is on the tape',
      rating: 'HOLD',
      tone: 'watch' as const,
      price: nvdaClose,
      dayPct: nvdaDayPct,
      holdNote: 'No add into the open. Next named call is Nov 17.',
      fundamentals: [
        {label: 'Market cap', value: '$5.769T'},
        {label: 'Q2 FY27 revenue', value: '$96.2B  +106% YoY'},
        {label: 'Q2 Data Center', value: '$89.0B  +117% YoY'},
        {label: 'Q2 GAAP EPS', value: '$2.46'},
        {label: 'Q2 gross margin', value: '75.0%'},
        {label: 'TTM revenue / NI', value: '$303.0B  /  $192.9B'},
        {label: 'TTM EPS  /  P/E', value: '$7.91  /  30.2×'},
        {label: 'Beta', value: String(nvdaBeta)},
      ],
      vsSpx: {
        headline: 'YTD spread vs the S&P is large. That is not a score. It is two Yahoo YTD prints.',
        bars: [
          {label: 'NVDA YTD', pct: nvdaYtd, tone: 'nvda' as const},
          {label: 'S&P YTD', pct: nvdaSpxYtd, tone: 'muted' as const},
        ],
        note: `Spread: ${vsSpxSpread(nvdaYtd, nvdaSpxYtd) >= 0 ? '+' : ''}${vsSpxSpread(nvdaYtd, nvdaSpxYtd).toFixed(1)} points (NVDA YTD − S&P YTD). Beta: ${nvdaBeta}.`,
      },
      consensus: {
        rows: [
          {label: 'Q3 FY27 revenue guide', value: '$108.0B ±2%'},
          {label: 'Q3 gross margin guide', value: '74.0% ±50 bp'},
          {label: 'China DC compute in outlook', value: 'None assumed'},
          {label: 'Next named call', value: 'Nov 17 (Yahoo)'},
        ],
        note: 'IR Aug 26. Vera Rubin production shipments started in early August. No whisper on this tape.',
        range: {metric: 'Q3 FY27 revenue guide', unit: 'B', guide: 108.0, low: 105.84, high: 110.16},
      },
      narrative: {
        leftTitle: 'THE RATE',
        leftHeadline: 'The official 10-year is 5.31%.',
        leftBody:
          'That is the Treasury CMT print for Monday. Friday was 5.28%. Long duration growth is the overweight. A record Nasdaq and a 24-year yield can sit together for a session. They do not have to stay friends.',
        rightTitle: 'THE PRINT',
        rightHeadline: 'Q2 was $96.2B. The guide is $108.0B ±2%.',
        rightBody:
          'Gross margin 75.0% last quarter. Next-quarter guide 74.0% ±50 bp. No China data-center compute in the outlook. Rubin is in production. The debate is still ROI on the capex, not “is AI real.”',
      },
      interpretation: {
        chips: [
          {label: 'CONFIRMED', tone: 'long' as const, text: 'Q2 IR: $96.2B revenue, $89.0B data center, 75.0% margin.'},
          {label: 'CONFIRMED', tone: 'watch' as const, text: 'Q3 guide $108.0B ±2% and 74.0% margin. China DC compute not in the outlook.'},
          {
            label: 'INFERENCE',
            tone: 'caution' as const,
            text: 'The 5.31% ten-year is the live pressure on this factor. Not a sell ticket.',
          },
        ],
        note: 'No 0–100 score. No seven-day streak on this wake — only Monday +2.12% is sourced.',
      },
      actionMatrix: {
        headline: 'HOLD. Do not buy the open.',
        rows: [
          {
            tone: 'long' as const,
            if: 'CPI is calm and the Nov 17 guide holds ≥$108B with ~74% margins',
            then: 'Keep HOLD. Fresh core still goes to VOO, not this name.',
          },
          {
            tone: 'watch' as const,
            if: 'Normal Nov 17 print around the $108B guide',
            then: 'HOLD',
          },
          {
            tone: 'caution' as const,
            if: 'Guide or margin slips, or the 10-year keeps marching',
            then: 'Do not automatically buy the dip',
          },
          {
            tone: 'short' as const,
            if: 'Demand deterioration shows up in the November call',
            then: 'Consider reducing. That is Evens. Not this desk.',
          },
        ],
      },
      network: {
        title: 'NVDA · qualitative demand chain',
        headline: 'Polarity from IR and the rate tape — no composite score.',
        nodes: [
          {id: 'labs', label: 'Hyperscale / ACIE', polarity: 'confirmed' as const, x: 0.08, y: 0.22},
          {id: 'demand', label: 'GPU demand', polarity: 'confirmed' as const, x: 0.3, y: 0.22},
          {id: 'spend', label: 'AI factory spend', polarity: 'confirmed' as const, x: 0.5, y: 0.22, evidence: 'Q2 +$15B q/q'},
          {id: 'rates', label: '10-year 5.31%', polarity: 'concern' as const, x: 0.3, y: 0.78, evidence: 'Treasury CMT'},
          {id: 'nvda', label: 'NVDA', polarity: 'neutral' as const, x: 0.62, y: 0.5},
          {id: 'rubin', label: 'Vera Rubin', polarity: 'confirmed' as const, x: 0.82, y: 0.18, evidence: 'Shipments early Aug'},
          {id: 'margins', label: 'Margins', polarity: 'confirmed' as const, x: 0.82, y: 0.5, evidence: '75% → 74% guide'},
          {id: 'guide', label: 'Q3 guide', polarity: 'confirmed' as const, x: 0.82, y: 0.82, evidence: '$108B ±2%'},
          {id: 'valuation', label: 'Valuation', polarity: 'inference' as const, x: 0.94, y: 0.5},
        ],
        edges: [
          {from: 'labs', to: 'demand'},
          {from: 'demand', to: 'spend'},
          {from: 'spend', to: 'nvda'},
          {from: 'rates', to: 'nvda', label: 'duration'},
          {from: 'nvda', to: 'rubin'},
          {from: 'nvda', to: 'margins'},
          {from: 'margins', to: 'guide'},
          {from: 'guide', to: 'valuation'},
        ],
      },
    },
    {
      ticker: 'AAPL',
      chapterTitle: 'AAPL · last IR print is the June quarter',
      rating: 'HOLD',
      tone: 'long' as const,
      price: aaplClose,
      dayPct: aaplDayPct,
      returns: {
        headline: 'Still beating the S&P YTD. Monday was a red session. Q4 date is not on Apple IR.',
        bars: [
          {label: 'YTD', pct: aaplYtd, tone: 'long' as const},
          {label: 'S&P YTD', pct: aaplSpxYtd, tone: 'muted' as const},
          {label: '1 year', pct: 29.49, tone: 'gold' as const},
        ],
        note: `Spread vs S&P YTD: ${vsSpxSpread(aaplYtd, aaplSpxYtd) >= 0 ? '+' : ''}${vsSpxSpread(aaplYtd, aaplSpxYtd).toFixed(1)} points. 6-month / 3-month / 1-month omitted — unread.`,
      },
      catalyst: {
        headline: 'June quarter: $109.4B revenue, $2.02 EPS, 50.1% gross margin.',
        steps: [
          'iPhone, Mac, Services June-quarter records (Apple IR 30 Jul)',
          'Siri AI named at WWDC26 — not a proven revenue line',
          'Q4 date: Yahoo lists Oct 29; Apple IR has not posted it',
        ],
        note: 'Do not treat the Yahoo date as an Apple filing. HOLD the position. Do not double the name.',
      },
      action: {
        headline: 'HOLD the position.',
        body: 'Monday close $332.89. Do not add into the open. Next contribution still diversifies. That means VOO, not another AAPL ticket.',
      },
    },
    {
      ticker: 'VOO',
      chapterTitle: 'VOO · the foundation is not the problem',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      metrics: [
        {label: 'Monday close', value: '$712.32  +0.68%'},
        {label: 'YTD tot. ret.', value: '+13.81%  (as of Oct 2)'},
      ],
      copy: {
        headline: 'Best simple core. New core money simplifies here.',
        body: 'Do not sell. Stop splitting every future contribution with VTI. Monday price YTD is unread — the 13.81% is Yahoo trailing total return as of Friday.',
      },
    },
    {
      ticker: 'VTI',
      chapterTitle: 'VTI · excellent, overlapping',
      rating: 'HOLD',
      tone: 'long' as const,
      metrics: [
        {label: 'Monday close', value: '$380.60  +0.69%'},
        {label: 'YTD tot. ret.', value: '+13.72%  (as of Oct 2)'},
      ],
      copy: {
        headline: 'Excellent. Mega-caps still dominate, so the top looks like VOO.',
        body: 'Do not sell. The overlap with VOO is the issue — not the fund quality.',
      },
    },
    {
      ticker: 'VUG',
      chapterTitle: 'VUG · catching up is not a reason to add',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      returns: {
        headline: 'Chart YTD is now about even with the S&P. You already own the individual winners.',
        bars: [
          {label: 'VUG YTD', pct: vugYtd, tone: 'watch' as const},
          {label: 'S&P YTD', pct: spxYtdPct, tone: 'long' as const},
          {label: 'VUG 1-year', pct: 14.73, tone: 'muted' as const},
        ],
        note: 'Monday close $92.06 +0.98%. HOLD existing. No priority additions.',
      },
    },
    {
      ticker: 'MGK',
      chapterTitle: 'MGK · same stack, now ahead of the index',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      returns: {
        headline: 'Chart YTD +14.58% vs S&P +13.56%. That is still the same mega-cap book.',
        bars: [
          {label: 'MGK YTD', pct: mgkYtd, tone: 'watch' as const},
          {label: 'S&P YTD', pct: spxYtdPct, tone: 'long' as const},
          {label: 'MGK 1-year', pct: 17.16, tone: 'muted' as const},
        ],
        note: 'Monday close $94.59 +0.97%. You already own NVDA and AAPL directly. HOLD. Stop feeding it.',
      },
    },
    {
      ticker: 'GDV',
      chapterTitle: 'GDV · a different job',
      rating: 'HOLD · INCOME / DIVERSIFIER',
      tone: 'long' as const,
      metrics: [
        {label: 'Market', value: '$28.37  unchanged'},
        {label: 'YTD tot. ret.', value: '+7.02%'},
        {label: 'Fwd. yield', value: '6.34%'},
        {label: 'NAV', value: 'unread'},
      ],
      copy: {
        body: 'Closed-end income. Gabelli page 404 this wake — no fresh NAV or discount. Yahoo total-return YTD +7.02% lags the S&P. That is the job: look different when growth is punched. Not Next-NVDA. Next cash dividend $0.15, ex Oct 16 (Yahoo).',
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
      id: 'europe-close',
      area: 'GLOBAL' as const,
      question: 'Where did STOXX / DAX / FTSE close on Tuesday?',
      whyItMatters: 'Europe was still open at this 9:03 ET wake. Intraday prints are not a close.',
      neededToKnow: 'A sourced Europe close after the London / Frankfurt session ends.',
      status: 'unknown' as const,
    },
    {
      id: 'gdv-nav',
      area: 'name' as const,
      ticker: 'GDV',
      question: 'What is GDV NAV and discount today?',
      whyItMatters: 'The income sleeve is judged on NAV and discount, not only the market print.',
      neededToKnow: 'Gabelli CEF page or a sourced NAV. The fund URL 404’d this wake.',
      status: 'unknown' as const,
    },
    {
      id: 'aapl-q4-date',
      area: 'name' as const,
      ticker: 'AAPL',
      question: 'When does Apple IR say Q4 FY26 prints?',
      whyItMatters: 'Yahoo lists Oct 29. That is not an Apple filing. The calendar must not invent a date.',
      neededToKnow: 'Apple newsroom or investor.apple.com release.',
      status: 'partial' as const,
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
    freshCapital: 'No add into the open. New core money simplifies into VOO.',
    bestAdd: 'VOO',
    highestUpsideWatch: 'none named',
    biggestRisk: 'Mega-cap growth overlap plus a 5.31% official 10-year',
    nextTrigger: 'Wednesday Oct 14 — BLS CPI. Then NVDA Nov 17.',
    ifThen: [
      {
        tone: 'long' as const,
        if: 'CPI is calm and the Nov 17 guide holds ≥$108B with ~74% margins',
        then: 'Keep HOLD. Fresh core still VOO.',
      },
      {
        tone: 'watch' as const,
        if: 'Normal Nov 17 print around the $108B guide',
        then: 'HOLD',
      },
      {
        tone: 'caution' as const,
        if: 'Guide or margin slips, or the 10-year keeps marching',
        then: 'Do not automatically buy the dip',
      },
      {
        tone: 'short' as const,
        if: 'Demand deterioration shows up in the November call',
        then: 'Consider reducing. Evens decides.',
      },
    ],
  },
  risks: [
    {
      n: '01',
      title: 'Growth-factor concentration',
      body: 'NVDA + AAPL + MGK + VUG + VOO + VTI still own the same mega-cap ecosystem. VUG/MGK catching the S&P does not reduce overlap.',
    },
    {
      n: '02',
      title: 'Interest rates',
      body: `Official 10-year CMT is ${tenYear}% (Monday). Friday was 5.28%. High long rates compress long-duration growth — the exact overweight.`,
    },
    {
      n: '03',
      title: 'AI ROI after the print',
      body: 'The Aug 26 IR moved the story from “will they print?” to “will $108B ±2% of quarterly revenue keep being paid for?” That sits under NVDA and most of the indirect book.',
    },
  ],
  close: {
    kicker: 'DIAGNOSTIC',
    headline: 'Monday’s record Nasdaq is not a new book.',
    body: 'Seven lines. Same overlap. Official 10-year 5.31%. NVDA already reported. HOLD into the open. Watch CPI Oct 14, then the November call. Publish and trades stay Evens.',
    pills: [
      {tone: 'watch' as const, label: 'HOLD THIS MORNING'},
      {tone: 'long' as const, label: 'CORE ADD = VOO'},
      {tone: 'caution' as const, label: 'CPI OCT 14'},
    ],
    followThrough: [
      {
        tone: 'watch' as const,
        if: 'NVDA keeps the guide and the stock is unattractive',
        then: 'Look downstream / upstream only if Evens names a ticker.',
      },
      {
        tone: 'caution' as const,
        if: 'CPI or the November call looks weaker',
        then: 'More VOO / cash / non-AI quality. No invented scout.',
      },
      {
        tone: 'long' as const,
        if: 'An asymmetric candidate is named by Evens or a filing',
        then: 'That is when the Next-NVDA sleeve gets a row.',
      },
    ],
  },
  tickerTape: [
    `SPX ${spxClose.toLocaleString('en-US')}  +${spxDayPct}%`,
    `SPX YTD  +${spxYtdPct}%`,
    `NASDAQ  ${nasdaqClose.toLocaleString('en-US')}  +${nasdaqDayPct}%  RECORD`,
    `NVDA  $${nvdaClose.toFixed(2)}  +${nvdaDayPct}%`,
    `AAPL  $${aaplClose.toFixed(2)}  ${aaplDayPct}%`,
    `10Y CMT  ${tenYear}%`,
    `NIKKEI  70,683.98  +1.05%`,
    `TSX  35,518.55  +0.04%`,
    `USD/CAD  1.4254`,
    `CPI  OCT 14`,
    `NVDA  NOV 17`,
    `VOO CORE / ADD`,
    `SELL NOTHING THIS MORNING`,
  ],
};

export const episode: DailyReport = parseDailyReport(raw);
