import {parseDailyReport, type DailyReport} from '../schema';

// Tuesday 2026-09-08 America/Toronto (~09:00 EDT). First cash after Labor Day.
// US / CA cash last printed Friday 2026-09-04. Regular session opens 9:30 ET —
// this wake is pre-open. Do not treat futures as a cash print.
// Tokyo Tuesday cash printed. Europe Monday close now sourced. Europe Tuesday
// is mid-session at this wake — omitted.
const nvdaClose = 230.36;
const nvdaDayPct = 0.84;
const aaplClose = 319.97;
const aaplDayPct = -2.51;
const vooClose = 708.01;
const vooDayPct = -0.38;
const vtiClose = 379.73;
const vtiDayPct = -0.32;
const vugClose = 88.45;
const vugDayPct = -0.48;
const mgkClose = 90.23;
const mgkDayPct = -0.49;
const gdvClose = 29.98;
const gdvDayPct = -0.6;
const spxClose = 7718.6;
const spxDayPct = -0.38;
const spxYtdPct = 12.8;
const nasdaqDayPct = -0.29;
const tenYearFri = 4.78;
const nvdaGuide = 108.0;

const raw = {
  meta: {
    date: '2026-09-08',
    dateLabel: 'SEP 08, 2026',
    title: 'Daily Wealth Intelligence',
    thesis:
      'Cash reopens today. Friday is still the last print on the book. Tokyo already reversed Monday’s AI run. That is not a US quote.',
    thesisLead: 'Cash reopens today.',
    thesisAccent: 'Friday is still the last book print.',
    catalyst:
      'US/CA cash 9:30 ET. BLS PPI Thu Sep 10. CPI Fri Sep 11 8:30 a.m. ET. FOMC Sep 15–16 (Fed calendar, SEP).',
    kicker: 'First cash after Labor Day · Tokyo Tuesday red',
    universe: ['AAPL', 'NVDA', 'VOO', 'VTI', 'VUG', 'MGK', 'GDV'],
  },
  market: {
    spxClose,
    spxDayPct,
    spxYtdPct,
    nasdaqDayPct,
    tenYearYield: tenYearFri,
    note: 'Last US cash is Friday: S&P 500 7,718.60 −0.38% (YTD +12.8%). 2-year Friday 4.37% (AP). 10-year Friday recap 4.78% (Newsquawk 4.784%). This 09:00 Toronto wake is pre-open. No Tuesday US cash print yet.',
    nextCalendar: {
      label: 'Cash 9:30 · PPI Thu · CPI Fri · FOMC next week',
      detail: 'Regular US/CA session opens 9:30 ET today. BLS: PPI Thu Sep 10; CPI Fri Sep 11 8:30 a.m. ET. Fed calendar: FOMC Sep 15–16 with SEP. Decision day Wednesday Sep 16.',
    },
  },
  markets: {
    global: {
      indices: [
        {
          label: 'Nikkei 225',
          value: '65,269.33',
          dayPct: -1.7,
          note: 'Tuesday Tokyo close (Zaikei / FISCO 15:31 JST; Edge Asia wrap). −1,130.51 from Monday 66,399.84. Topix 4,050.33 −1.83% (same wires).',
        },
        {
          label: 'DAX',
          value: '25,981.79',
          dayPct: -0.25,
          note: 'Monday Xetra close (The Edge Europe wrap, exchange-confirmed). Tuesday Europe is mid-session at this wake — omitted.',
        },
        {
          label: 'FTSE 100',
          value: '10,822.13',
          dayPct: -0.08,
          note: 'Monday close (AJ Bell −8.96 pts; Edge matches LSE post-auction). Tuesday close unread.',
        },
        {
          label: 'CAC 40',
          value: '8,306.15',
          dayPct: 0.33,
          note: 'Monday Euronext 18:00 CET (The Edge). Stoxx Europe 600 Monday 649.81 −0.01%.',
        },
      ],
      commodities: [
        {
          label: 'WTI crude',
          value: '$91.48',
          dayPct: 0.2,
          note: 'Last official NYMEX October settle is Friday +$0.18. Monday holiday / electronic prints (~$92.5–$92.8) are not a regular settle. Tuesday intra unread as a settle.',
        },
      ],
      rates: [{label: 'U.S. 10-year (Fri recap)', value: `${tenYearFri}%`}],
      fx: [
        {
          label: 'CAD/USD',
          note: 'Official Friday close still unread. A cents recap is not a close. USD/JPY Tokyo wrap is not CAD.',
        },
      ],
      note: 'New Tuesday print is Tokyo, and it reversed Monday. Europe last locked close is Monday. Hang Seng Tuesday not independently locked — omitted. US/CA cash has not printed yet.',
    },
    us: {
      indices: [
        {label: 'S&P 500', value: '7,718.60', dayPct: spxDayPct},
        {label: 'Nasdaq', value: '26,506.99', dayPct: nasdaqDayPct},
        {label: 'Dow', value: '53,414.25', dayPct: -0.51},
        {label: 'Russell 2000', value: '2,975.65', dayPct: 0.2},
      ],
      yields: [
        {label: 'U.S. 10-year Friday recap', value: `${tenYearFri}%`},
        {label: 'U.S. 2-year Friday (AP)', value: '4.37%'},
      ],
      note: 'Labor Day closed Monday (Nasdaq ETS2026-47). Next cash is this morning’s 9:30 ET open. AP Friday: +162,000 August jobs. Official BLS empsit table still unread here. Fed H.15 for today prints 4:15 p.m. — not used.',
    },
    ca: {
      indices: [
        {label: 'S&P/TSX Composite', value: '36,513.80', dayPct: -0.33},
        {label: 'TSX Venture (Baystreet recap)', value: '965.40'},
      ],
      note: 'TMX Labour Day closed Monday. Next TSX session is this morning. Friday TSX 36,513.80 −0.33% (TMX Money Sep 4 4:00 p.m. ET). StatCan Daily: August employment −42,000; unemployment 6.4%. BoC Sep 2 hold at 2.25% (official FAD). Next date October 28 + MPR. CAD/USD official close unread.',
    },
    calendar: {
      items: [
        {
          when: 'Tuesday Sep 8 — today 9:30 ET',
          where: 'US' as const,
          label: 'First US cash after Labor Day',
          why: 'Regular session opens 9:30 ET. Friday is still the last print at this 09:00 wake.',
        },
        {
          when: 'Tuesday Sep 8 — today',
          where: 'CA' as const,
          label: 'First TSX session after Labour Day',
          why: 'TMX holiday table. Friday TSX still stands until the cash close.',
        },
        {
          when: 'Thursday Sep 10 8:30 a.m. ET',
          where: 'US' as const,
          label: 'PPI (August)',
          why: 'BLS 2026 selected-releases table. One day before CPI.',
        },
        {
          when: 'Friday Sep 11 8:30 a.m. ET',
          where: 'US' as const,
          label: 'CPI (August)',
          why: 'BLS CPI schedule. Last CPI before the September FOMC.',
        },
        {
          when: 'Sep 15–16 · SEP meeting',
          where: 'US' as const,
          label: 'FOMC + SEP',
          why: 'federalreserve.gov 2026 calendar. Decision day is Wednesday Sep 16.',
        },
        {
          when: 'October 28',
          where: 'CA' as const,
          label: 'Bank of Canada rate + MPR',
          why: 'Official Sep 2 hold at 2.25% still stands. Next announcement Oct 28 with the MPR.',
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
      role: 'Guide tape',
      whatMatters:
        'Friday $230.36 (+0.84%). IR Q3 guide still $108.0B ±2%. Tokyo reversed Tuesday. That is not a US cash print and not a pre-open buy.',
    },
    {
      ticker: 'AAPL',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Recent purchase',
      whatMatters: 'Friday $319.97 (−2.51%). Do not add into the first reopen print. Apple newsroom unread — no event claim.',
    },
    {
      ticker: 'VOO',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      role: 'Best simple core',
      whatMatters: `Friday $${vooClose.toFixed(2)} (${vooDayPct}%). New core money still simplifies here after a real cash session.`,
    },
    {
      ticker: 'VTI',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Broad US',
      whatMatters: `Friday $${vtiClose.toFixed(2)} (${vtiDayPct}%). Excellent fund; still overlaps VOO.`,
      overlapWith: ['VOO'],
    },
    {
      ticker: 'VUG',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Growth sleeve',
      whatMatters: `Friday $${vugClose.toFixed(2)} (${vugDayPct}%). Same mega-cap names you already own.`,
      overlapWith: ['NVDA', 'AAPL', 'VOO', 'MGK'],
    },
    {
      ticker: 'MGK',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Mega-cap growth',
      whatMatters: `Friday $${mgkClose.toFixed(2)} (${mgkDayPct}%). Even tighter overlap with NVDA and AAPL.`,
      overlapWith: ['NVDA', 'AAPL', 'VUG', 'VOO'],
    },
    {
      ticker: 'GDV',
      rating: 'HOLD — income / diversifier',
      tone: 'long' as const,
      role: 'Income sleeve',
      whatMatters: `Friday $${gdvClose.toFixed(2)} (${gdvDayPct}%). Different job. Not a growth engine.`,
    },
  ],
  portfolio: {
    concentrationThesis: 'VOO + VTI + VUG + MGK + AAPL + NVDA still buy the same companies.',
    concentrationBody:
      'Friday split the stack: NVDA up, AAPL down, the index sleeves a little red. A Tokyo reversal does not unstack that. Reopen is not a new book. Weights are still unknown, so size stays qualitative.',
    factorStack: ['NVDA', 'AAPL', 'MGK', 'VUG', 'VOO', 'VTI'],
    factorLabel: 'U.S. mega-cap / growth',
    overlapNote: 'same ecosystem',
  },
  names: [
    {
      ticker: 'NVDA',
      chapterTitle: 'NVDA · Friday green, Tokyo reversed, US cash not printed',
      rating: 'HOLD — critical watch',
      tone: 'watch' as const,
      price: nvdaClose,
      dayPct: nvdaDayPct,
      holdNote: 'One green Friday plus a red Tokyo session is not a reopen buy. Guide is still $108.0B ±2%.',
      streak: [0.84],
      streakHeadline: 'One sourced US session this sitting: Friday +0.84%. Zero red in this window.',
      streakNote:
        'Tuesday has no US cash print at 09:00. Tokyo −1.70% is not an NVDA streak cell. Momentum formula counts red days in this window only. No 0–100 score.',
      fundamentals: [
        {label: 'Q2 FY27 revenue', value: '$96.2B  +106% y/y'},
        {label: 'Q2 data center', value: '$89.0B  +117% y/y'},
        {label: 'Q2 GAAP / non-GAAP EPS', value: '$2.46  /  $2.22'},
        {label: 'Q2 gross margin', value: '75.0%'},
        {label: 'Q3 revenue guide', value: '$108.0B ±2%'},
        {label: 'Q3 gross margin guide', value: '74.0% ±50 bps'},
      ],
      consensus: {
        rows: [
          {label: 'Q2 printed revenue', value: '$96.2B'},
          {label: 'Q3 company guide', value: '$108.0B ±2%'},
          {label: 'Q3 margin guide', value: '74.0% ±50 bps'},
          {label: 'China DC compute in guide', value: 'none assumed'},
        ],
        note: 'NVIDIA IR August 26. Street consensus and whisper unread this sitting — not drawn. Next dividend $0.25 on Oct 1; record Sep 10 (same IR).',
        range: {
          metric: 'Q3 revenue guide',
          unit: 'B',
          guide: nvdaGuide,
          low: 105.84,
          high: 110.16,
        },
      },
      narrative: {
        leftTitle: 'THE FEAR',
        leftHeadline: '“Tokyo just gave back Monday’s AI run. Reopen can reprice the stack.”',
        leftBody:
          'Nikkei 65,269.33 −1.70% after Monday +2.12%. Friday indexes already faded after AP’s +162,000 August payrolls reprint. IR still names independent compute-financing platforms targeting over $500B of third-party capital over time.',
        rightTitle: 'THE COUNTER',
        rightHeadline: 'Printed demand is still huge. Guide assumes no China DC compute.',
        rightBody:
          'Q2 revenue $96.2B. Data center $89.0B. Q3 guide $108.0B ±2%. A Tokyo session does not change the guide. Vera Rubin remains the production story on the IR tape.',
      },
      interpretation: {
        chips: [
          {label: 'CONFIRMED', tone: 'long' as const, text: 'Q2 print and Q3 guide are official IR, not a rumor.'},
          {
            label: 'CONFIRMED',
            tone: 'watch' as const,
            text: 'Friday cash $230.36 was green while the S&P was red. That is one session, not a regime.',
          },
          {
            label: 'INFERENCE',
            tone: 'caution' as const,
            text: 'Tokyo reversed. CPI and FOMC still sit on the 10-year that owns this stack.',
          },
        ],
        note: 'No composite score. Missing whisper stays UNKNOWN. Empty Next-NVDA stays empty.',
      },
      actionMatrix: {
        headline: 'Today: HOLD into the reopen. No pre-open trade.',
        rows: [
          {
            tone: 'long' as const,
            if: 'After a clean inflation tape the book needs cash put to work',
            then: 'VOO first',
          },
          {
            tone: 'watch' as const,
            if: 'CPI or FOMC reprices the 10-year hard',
            then: 'HOLD the stack. Re-read duration risk.',
          },
          {
            tone: 'caution' as const,
            if: 'NVDA guide or margin talk deteriorates',
            then: 'Do not automatically buy the dip',
          },
          {
            tone: 'short' as const,
            if: 'Demand talk breaks and the name gaps ~10%+',
            then: 'Consider reducing exposure — Evens decides',
          },
        ],
      },
      network: {
        title: 'NVDA · qualitative demand chain',
        headline: 'Polarity from IR + Friday tape — no composite score. Equal node size.',
        nodes: [
          {id: 'labs', label: 'Frontier labs / clouds', polarity: 'confirmed' as const, x: 0.08, y: 0.22},
          {id: 'demand', label: 'GPU demand', polarity: 'confirmed' as const, x: 0.3, y: 0.22},
          {id: 'spend', label: 'AI factory buildout', polarity: 'confirmed' as const, x: 0.5, y: 0.22, evidence: 'Q2 DC $89.0B'},
          {id: 'financing', label: 'Third-party capital', polarity: 'concern' as const, x: 0.3, y: 0.78, evidence: '>$500B platforms'},
          {id: 'nvda', label: 'NVDA', polarity: 'neutral' as const, x: 0.62, y: 0.5},
          {id: 'supply', label: 'Vera Rubin / partners', polarity: 'confirmed' as const, x: 0.82, y: 0.18, evidence: 'Full production'},
          {id: 'margins', label: 'Margins', polarity: 'confirmed' as const, x: 0.82, y: 0.5, evidence: 'Q2 75.0%'},
          {id: 'eps', label: 'Q3 guide', polarity: 'inference' as const, x: 0.82, y: 0.82, evidence: '$108.0B ±2%'},
          {id: 'valuation', label: 'Valuation', polarity: 'inference' as const, x: 0.94, y: 0.5},
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
      chapterTitle: 'AAPL · Friday −2.5%, still HOLD',
      rating: 'HOLD',
      tone: 'long' as const,
      price: aaplClose,
      dayPct: aaplDayPct,
      holdNote: 'Do not add into the first reopen after a red Friday. Next contribution should not double the same name.',
      action: {
        headline: 'HOLD the position.',
        body: 'Friday did the down-day. YTD page unread after the drop — omitted. Apple newsroom unread. Do not stack another AAPL buy into a pre-open tape.',
      },
    },
    {
      ticker: 'VOO',
      chapterTitle: 'VOO · still the simple core',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      metrics: [{label: 'Friday', value: `$${vooClose.toFixed(2)}  ${vooDayPct}%`}],
      copy: {
        headline: 'Best simple core. New core money simplifies here.',
        body: 'Do not sell. Stop splitting every future contribution with VTI. Friday followed the S&P. YTD page unread this sitting — omitted.',
      },
    },
    {
      ticker: 'VTI',
      chapterTitle: 'VTI · excellent, overlapping',
      rating: 'HOLD',
      tone: 'long' as const,
      metrics: [{label: 'Friday', value: `$${vtiClose.toFixed(2)}  ${vtiDayPct}%`}],
      copy: {
        headline: 'Excellent. The top still looks like VOO.',
        body: 'Do not sell. The overlap with VOO is the issue — not the fund quality.',
      },
    },
    {
      ticker: 'VUG',
      chapterTitle: 'VUG · growth sleeve, no add',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      metrics: [{label: 'Friday', value: `$${vugClose.toFixed(2)}  ${vugDayPct}%`}],
      copy: {
        headline: 'You already own the individual winners.',
        body: 'HOLD existing. No priority additions. A Tokyo reversal is not a thesis change.',
      },
    },
    {
      ticker: 'MGK',
      chapterTitle: 'MGK · tighter overlap',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      metrics: [{label: 'Friday', value: `$${mgkClose.toFixed(2)}  ${mgkDayPct}%`}],
      copy: {
        body: 'You already own NVDA and AAPL directly. HOLD. Stop feeding it. Not a sell call — tax and account mechanics are not on this tape.',
      },
    },
    {
      ticker: 'GDV',
      chapterTitle: 'GDV · a different job',
      rating: 'HOLD · INCOME / DIVERSIFIER',
      tone: 'long' as const,
      metrics: [{label: 'Market', value: `$${gdvClose.toFixed(2)}  ${gdvDayPct}%`}],
      copy: {
        body: 'Closed-end income/value. NAV and discount unread this sitting — omitted. Not “Next NVDA.”',
      },
    },
  ],
  nextNvda: [],
  unknowns: [
    {
      id: 'bls-official-table',
      area: 'US' as const,
      question: 'What is on the official BLS August Employment Situation table?',
      whyItMatters:
        'AP reprints +162,000 jobs and recaps hold unemployment at 4.1%. The official table was unread here. We will not invent a score from that.',
      neededToKnow: 'BLS empsit table, or a screenshot Evens opens.',
      status: 'partial' as const,
    },
    {
      id: 'weights',
      area: 'book' as const,
      question: 'What is each line’s weight in the book?',
      whyItMatters: 'Concentration stays a count of overlapping lines until weights exist. We cannot size mega-cap.',
      neededToKnow: 'Sourced account weights. Do not estimate from prices.',
      status: 'unknown' as const,
    },
    {
      id: 'nvda-ytd-whisper',
      area: 'name' as const,
      ticker: 'NVDA',
      question: 'What is NVDA YTD on the same page as the $230.36 close — and is there a street whisper vs $108.0B ±2%?',
      whyItMatters: 'Expectation-risk stays UNKNOWN without a sourced whisper. No decorative YTD bar.',
      neededToKnow: 'A quote-page YTD and a named street/whisper print.',
      status: 'unknown' as const,
    },
    {
      id: 'cadusd-friday',
      area: 'CA' as const,
      question: 'What did CAD/USD actually close Friday — and what is it into this reopen?',
      whyItMatters: 'The book’s contribution is in C$. A cents recap is not a CAD close.',
      neededToKnow: 'A sourced CAD/USD or USD/CAD official close.',
      status: 'unknown' as const,
    },
    {
      id: 'us-cash-today',
      area: 'US' as const,
      question: 'Where did US cash actually print on Tuesday?',
      whyItMatters: 'This 09:00 wake is pre-open. A future or a headline is not the book’s last print.',
      neededToKnow: 'Index-page and quote-page closes after 16:00 ET.',
      status: 'unknown' as const,
    },
  ],
  scenarios: [],
  capitalPlan: {
    existingPortfolio: 'HOLD — sell nothing into a pre-open reopen.',
    freshCapital:
      'New core money still simplifies into VOO after a real cash session. Do not chase NVDA on one green Friday plus a Tokyo reversal. Do not add AAPL on a −2.5% Friday into the first print.',
    bestAdd: 'VOO',
    highestUpsideWatch: 'none named',
    biggestRisk:
      'Mega-cap growth overlap across NVDA, AAPL, MGK, VUG, VOO, VTI — plus a 10-year that can reprice on CPI / FOMC.',
    nextTrigger: 'Cash open today 9:30 ET · PPI Sep 10 · CPI Sep 11 · FOMC Sep 15–16',
    ifThen: [
      {
        tone: 'long' as const,
        if: 'The book needs cash put to work after a clean inflation tape',
        then: 'VOO first',
      },
      {
        tone: 'watch' as const,
        if: 'CPI or FOMC reprices the 10-year hard',
        then: 'HOLD the stack. Re-read duration risk. No pre-open trade.',
      },
      {
        tone: 'caution' as const,
        if: 'NVDA guide or margin talk deteriorates',
        then: 'Do not automatically buy the dip',
      },
      {
        tone: 'short' as const,
        if: 'Demand talk breaks and NVDA gaps ~10%+',
        then: 'Consider reducing exposure — Evens decides',
      },
    ],
  },
  risks: [
    {
      n: '01',
      title: 'Growth-factor concentration',
      body: 'NVDA + AAPL + MGK + VUG + VOO + VTI repeatedly own the same mega-cap ecosystem. Three of seven lines list overlap. Weights unknown.',
    },
    {
      n: '02',
      title: 'Interest rates',
      body: `Friday 10-year recaps around ${tenYearFri}% (Newsquawk settle 4.784%). Long rates still sit on the exact overweight.`,
    },
    {
      n: '03',
      title: 'Labor / inflation path',
      body: 'August U.S. payrolls reprinted +162,000 (AP). Canada −42,000 (StatCan Daily). Official BLS table still unread. BLS CPI Sep 11 is the next named print.',
    },
    {
      n: '04',
      title: 'AI ROI / financed demand',
      body: 'IR is mobilizing over $500B of third-party capital for AI factories. That sits under NVDA and most of the indirect book.',
    },
  ],
  close: {
    kicker: 'DIAGNOSTIC',
    headline: 'Reopen is not a new book.',
    body: 'Friday’s split tape still stands on the names you own. Indexes faded. Nvidia green. Apple red. Tokyo gave back Monday’s AI run overnight. That is not a US quote. Official BLS table still unread here. Last WTI settle is still Friday $91.48. Sell nothing. If any C$ goes to work after a real cash session, it still belongs in VOO.',
    pills: [
      {tone: 'watch' as const, label: 'HOLD INTO REOPEN'},
      {tone: 'long' as const, label: 'VOO IF NEW CASH'},
      {tone: 'caution' as const, label: 'PPI THU · CPI FRI'},
    ],
    followThrough: [
      {
        tone: 'watch' as const,
        if: 'NVDA stays the guide tape but the stock is unattractive',
        then: 'Do not invent a scout. Empty Next-NVDA stays empty.',
      },
      {
        tone: 'caution' as const,
        if: 'CPI or oil reprice inflation higher',
        then: 'More VOO / cash / non-AI quality — Evens decides.',
      },
      {
        tone: 'long' as const,
        if: 'An asymmetric candidate is named by Evens or a filing',
        then: 'That is when the Next-NVDA sleeve gets a name.',
      },
    ],
  },
  tickerTape: [
    `SPX  ${spxClose.toLocaleString('en-US')}  ${spxDayPct}%`,
    `SPX YTD  +${spxYtdPct}%`,
    `NASDAQ  ${nasdaqDayPct}%`,
    `NVDA  $${nvdaClose.toFixed(2)}  +${nvdaDayPct}%`,
    `AAPL  $${aaplClose.toFixed(2)}  ${aaplDayPct}%`,
    `VOO  $${vooClose.toFixed(2)}  ${vooDayPct}%`,
    `TSX  36,513.80  −0.33%`,
    `NIKKEI  65,269.33  −1.70%`,
    `DAX MON  25,981.79  −0.25%`,
    `10Y  ~${tenYearFri}%`,
    `WTI FRI  $91.48`,
    `CASH OPEN  9:30 ET`,
    `SELL NOTHING INTO REOPEN`,
  ],
};

export const episode: DailyReport = parseDailyReport(raw);
