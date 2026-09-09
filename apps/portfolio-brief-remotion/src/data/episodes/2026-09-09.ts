import {parseDailyReport, type DailyReport} from '../schema';

// Wednesday 2026-09-09 America/Toronto (~09:00 EDT).
// Last US/CA cash is Tuesday 2026-09-08. Regular session opens 9:30 ET —
// this wake is pre-open. Do not treat futures as a cash print.
// Tokyo Wednesday cash printed. Europe Tuesday close sourced.
// Wednesday Europe is mid-session at this wake — omitted.
const nvdaClose = 225.73;
const nvdaDayPct = -2.01;
const aaplClose = 316.22;
const aaplDayPct = -1.17;
const vooClose = 704.07;
const vooDayPct = -0.56;
const vtiClose = 377.6;
const vtiDayPct = -0.56;
const vugClose = 88.12;
const vugDayPct = -0.37;
const mgkClose = 89.94;
const mgkDayPct = -0.32;
const gdvClose = 29.83;
const gdvDayPct = -0.5;
const spxClose = 7673.52;
const spxDayPct = -0.58;
const spxYtdPct = 12.1;
const nasdaqDayPct = -0.32;
const tenYear = 4.804;
const nvdaGuide = 108.0;

const raw = {
  meta: {
    date: '2026-09-09',
    dateLabel: 'SEP 09, 2026',
    title: 'Daily Wealth Intelligence',
    thesis:
      'Tuesday cash printed. Oil and the 10-year did the work. NVDA gave Friday back. Apple’s event is later today — that is not a new buy.',
    thesisLead: 'Tuesday cash printed.',
    thesisAccent: 'Oil and the 10-year did the work.',
    catalyst:
      'US/CA cash 9:30 ET. Apple event 1:00 p.m. ET (newsroom unread). BLS PPI Thu Sep 10. CPI Fri Sep 11 8:30 a.m. ET. FOMC Sep 15–16.',
    kicker: 'First full cash after Labor Day · NVDA −2.01%',
    universe: ['AAPL', 'NVDA', 'VOO', 'VTI', 'VUG', 'MGK', 'GDV'],
  },
  market: {
    spxClose,
    spxDayPct,
    spxYtdPct,
    nasdaqDayPct,
    tenYearYield: tenYear,
    note: 'Tuesday S&P 500 7,673.52 −45.08 (−0.58% vs Friday 7,718.60; AP rounded −0.6%). YTD +12.1% (AP). 10-year settled 4.804% (Newsquawk). 2-year settled 4.400%. This 09:00 Toronto wake is pre-open. No Wednesday US cash print yet.',
    nextCalendar: {
      label: 'Cash 9:30 · Apple 1pm ET · PPI Thu · CPI Fri · FOMC next week',
      detail: 'Regular US/CA session opens 9:30 ET today. Apple “Surprise and Shine” 10:00 a.m. PT / 1:00 p.m. ET — product claims unread. BLS: PPI Thu Sep 10; CPI Fri Sep 11 8:30 a.m. ET. Fed calendar: FOMC Sep 15–16 with SEP. Decision day Wednesday Sep 16.',
    },
  },
  markets: {
    global: {
      indices: [
        {
          label: 'Nikkei 225',
          value: '65,142.78',
          dayPct: -0.19,
          note: 'Wednesday Tokyo close (Zaikei 15:31 JST; Kyodo / Mainichi). −126.55 from Tuesday 65,269.33. Topix 4,046.64 −0.09% (same wires).',
        },
        {
          label: 'Hang Seng',
          value: '25,274.96',
          dayPct: -0.2,
          note: 'Wednesday (BNN Bloomberg Asia wrap). Shanghai Composite Wednesday 3,951.51 +0.3% (same wrap).',
        },
        {
          label: 'DAX',
          value: '26,007.63',
          dayPct: 0.0,
          note: 'Tuesday Xetra close (The Edge Europe wrap; Kitco PM). Wednesday Europe is mid-session at this wake — omitted.',
        },
        {
          label: 'FTSE 100',
          value: '10,811.66',
          dayPct: -0.1,
          note: 'Tuesday close (Kitco PM / Edge LSE post-auction).',
        },
        {
          label: 'CAC 40',
          value: '8,317.98',
          dayPct: 0.14,
          note: 'Tuesday Euronext (Kitco PM / Edge). Stoxx Europe 600 Tuesday 649.60 −0.05%.',
        },
      ],
      commodities: [
        {
          label: 'WTI crude',
          value: '$93.03',
          dayPct: 1.69,
          note: 'Tuesday NYMEX October settle +1.69% / +1.7% (Reuters / Gate). Sixth cash-session gain. Brent briefly ~$99.50 (AP).',
        },
      ],
      rates: [{label: 'U.S. 10-year (Tue settle)', value: `${tenYear}%`}],
      fx: [
        {
          label: 'CAD/USD',
          note: 'Official Tuesday close still unread. A mid-session cents recap is not a close.',
        },
      ],
      note: 'New Wednesday print is Tokyo (small red after Tuesday’s flush) plus Hang Seng. Europe last locked close is Tuesday. Wednesday Europe mid-session omitted.',
    },
    us: {
      indices: [
        {label: 'S&P 500', value: '7,673.52', dayPct: spxDayPct},
        {label: 'Nasdaq', value: '26,421.41', dayPct: nasdaqDayPct},
        {label: 'Dow', value: '52,786.07', dayPct: -1.18},
        {label: 'Russell 2000', value: '2,960.20', dayPct: -0.5},
      ],
      yields: [
        {label: 'U.S. 10-year Tuesday settle', value: `${tenYear}%`},
        {label: 'U.S. 2-year Tuesday settle', value: '4.400%'},
      ],
      note: 'AP close: SPX −45.08 to 7,673.52; Dow −628.18 to 52,786.07; Nasdaq −85.58 to 26,421.41; Russell −15.44 to 2,960.20. YTD AP: SPX +12.1%, Nasdaq +13.7%, Russell +19.3%. Software names sold (Reuters: Salesforce / Intuit ~−4%). Qualcomm +7% on AWS deal is not a book line. Official BLS August table still unread. Fed H.15 for Tuesday prints 4:15 p.m. — not used.',
    },
    ca: {
      indices: [
        {label: 'S&P/TSX Composite', value: '36,123.05', dayPct: -1.07},
      ],
      note: 'Tuesday TSX 36,123.05 −390.75 / −1.07% from Friday 36,513.80 (Reuters via Rallies; Business Upturn close). Tech −3.1%; Shopify −7.8% (Reuters). Energy +0.9% with oil. BNN 11:41 a.m. ET print was mid-session — not the close. CAD/USD official close unread. BoC Sep 2 hold at 2.25% still stands. Next date October 28 + MPR. BBN notes Canada’s retaliatory tariffs on ~$27.6B of US goods took effect Tuesday — context, not a trade.',
    },
    calendar: {
      items: [
        {
          when: 'Wednesday Sep 9 — today 9:30 ET',
          where: 'US' as const,
          label: 'US cash after Tuesday’s reopen',
          why: 'Regular session opens 9:30 ET. Tuesday is still the last print at this 09:00 wake.',
        },
        {
          when: 'Wednesday Sep 9 — today 1:00 p.m. ET',
          where: 'US' as const,
          label: 'Apple “Surprise and Shine”',
          why: 'TechRadar / Apple India listing: 10:00 a.m. PT at Steve Jobs Theater. Stream unread. Do not invent SKUs.',
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
        'Tuesday $225.73 (−2.01% vs Friday $230.36). IR Q3 guide still $108.0B ±2%. One red reopen is not a dip-buy.',
    },
    {
      ticker: 'AAPL',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Recent purchase',
      whatMatters:
        'Tuesday $316.22 (−1.17%). Event is 1:00 p.m. ET — newsroom unread. Do not add into a keynote you have not watched.',
    },
    {
      ticker: 'VOO',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      role: 'Best simple core',
      whatMatters: `Tuesday $${vooClose.toFixed(2)} (${vooDayPct}%). New core money still simplifies here.`,
    },
    {
      ticker: 'VTI',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Broad US',
      whatMatters: `Tuesday $${vtiClose.toFixed(2)} (${vtiDayPct}%). Excellent fund; still overlaps VOO.`,
      overlapWith: ['VOO'],
    },
    {
      ticker: 'VUG',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Growth sleeve',
      whatMatters: `Tuesday $${vugClose.toFixed(2)} (${vugDayPct}%). Same mega-cap names you already own.`,
      overlapWith: ['NVDA', 'AAPL', 'VOO', 'MGK'],
    },
    {
      ticker: 'MGK',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Mega-cap growth',
      whatMatters: `Tuesday $${mgkClose.toFixed(2)} (${mgkDayPct}%). Even tighter overlap with NVDA and AAPL.`,
      overlapWith: ['NVDA', 'AAPL', 'VUG', 'VOO'],
    },
    {
      ticker: 'GDV',
      rating: 'HOLD — income / diversifier',
      tone: 'long' as const,
      role: 'Income sleeve',
      whatMatters: `Tuesday $${gdvClose.toFixed(2)} (${gdvDayPct}%). Different job. Not a growth engine.`,
    },
  ],
  portfolio: {
    concentrationThesis: 'VOO + VTI + VUG + MGK + AAPL + NVDA still buy the same companies.',
    concentrationBody:
      'Tuesday stacked the book the same way: NVDA, AAPL, and the growth sleeves red together. Oil up and the 10-year higher is the tape under that stack. Weights are still unknown, so size stays qualitative.',
    factorStack: ['NVDA', 'AAPL', 'MGK', 'VUG', 'VOO', 'VTI'],
    factorLabel: 'U.S. mega-cap / growth',
    overlapNote: 'same ecosystem',
  },
  names: [
    {
      ticker: 'NVDA',
      chapterTitle: 'NVDA · Friday green, Tuesday gave it back',
      rating: 'HOLD — critical watch',
      tone: 'watch' as const,
      price: nvdaClose,
      dayPct: nvdaDayPct,
      holdNote: 'One red reopen after a green Friday is not a buy. Guide is still $108.0B ±2%.',
      streak: [0.84, -2.01],
      streakHeadline: 'Two sourced US sessions: Friday +0.84%, Tuesday −2.01%. One red in this window.',
      streakNote:
        'Wednesday has no US cash print at 09:00. Tokyo −0.19% is not an NVDA streak cell. Momentum formula counts red days in this window only. No 0–100 score.',
      fundamentals: [
        {label: 'Q2 FY27 revenue', value: '$96.2B +106% y/y'},
        {label: 'Q2 data center', value: '$89.0B +117% y/y'},
        {label: 'Q2 GAAP / non-GAAP EPS', value: '$2.46 / $2.22'},
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
        leftHeadline: '“Oil near $100 plus a 4.80% 10-year can reprice the whole stack.”',
        leftBody:
          'Tuesday NVDA $225.73 −2.01% (CoinGlass vs Friday $230.36). WTI October $93.03. AP: Brent briefly ~$99.50. IR still names independent compute-financing platforms targeting over $500B of third-party capital over time.',
        rightTitle: 'THE COUNTER',
        rightHeadline: 'Printed demand is still huge. Guide assumes no China DC compute.',
        rightBody:
          'Q2 revenue $96.2B. Data center $89.0B. Q3 guide $108.0B ±2%. A red Tuesday does not change the guide. Vera Rubin remains the production story on the IR tape.',
      },
      interpretation: {
        chips: [
          {label: 'CONFIRMED', tone: 'long' as const, text: 'Q2 print and Q3 guide are official IR, not a rumor.'},
          {
            label: 'CONFIRMED',
            tone: 'watch' as const,
            text: 'Tuesday cash $225.73 was red after Friday green. That is two sessions, not a regime.',
          },
          {
            label: 'INFERENCE',
            tone: 'caution' as const,
            text: 'Oil and the 10-year moved together. CPI and FOMC still sit on this stack.',
          },
        ],
        note: 'No composite score. Missing whisper stays UNKNOWN. Empty Next-NVDA stays empty.',
      },
      actionMatrix: {
        headline: 'Today: HOLD into the open. No pre-open trade. No event add.',
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
        headline: 'Polarity from IR + Tuesday tape — no composite score. Equal node size.',
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
      chapterTitle: 'AAPL · Tuesday −1.17%, event later today',
      rating: 'HOLD',
      tone: 'long' as const,
      price: aaplClose,
      dayPct: aaplDayPct,
      holdNote:
        'Do not add into a 1:00 p.m. ET keynote you have not watched. Next contribution should not double the same name.',
      action: {
        headline: 'HOLD the position.',
        body: 'Tuesday did another down-day after Friday −2.51%. YTD page unread after the drop — omitted. Apple newsroom / stream unread at 09:00. Product rumors are not a print.',
      },
    },
    {
      ticker: 'VOO',
      chapterTitle: 'VOO · still the simple core',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      metrics: [{label: 'Tuesday', value: `$${vooClose.toFixed(2)} ${vooDayPct}%`}],
      copy: {
        headline: 'Best simple core. New core money simplifies here.',
        body: 'Do not sell. Stop splitting every future contribution with VTI. Tuesday followed the S&P. YTD page unread this sitting — omitted.',
      },
    },
    {
      ticker: 'VTI',
      chapterTitle: 'VTI · excellent, overlapping',
      rating: 'HOLD',
      tone: 'long' as const,
      metrics: [{label: 'Tuesday', value: `$${vtiClose.toFixed(2)} ${vtiDayPct}%`}],
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
      metrics: [{label: 'Tuesday', value: `$${vugClose.toFixed(2)} ${vugDayPct}%`}],
      copy: {
        headline: 'You already own the individual winners.',
        body: 'HOLD existing. No priority additions. A red Tuesday is not a thesis change.',
      },
    },
    {
      ticker: 'MGK',
      chapterTitle: 'MGK · tighter overlap',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      metrics: [{label: 'Tuesday', value: `$${mgkClose.toFixed(2)} ${mgkDayPct}%`}],
      copy: {
        body: 'You already own NVDA and AAPL directly. HOLD. Stop feeding it. Not a sell call — tax and account mechanics are not on this tape.',
      },
    },
    {
      ticker: 'GDV',
      chapterTitle: 'GDV · a different job',
      rating: 'HOLD · INCOME / DIVERSIFIER',
      tone: 'long' as const,
      metrics: [{label: 'Market', value: `$${gdvClose.toFixed(2)} ${gdvDayPct}%`}],
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
        'AP reprints +162,000 August jobs. The official table was unread here. We will not invent a score from that.',
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
      question: 'What is NVDA YTD on the same page as the $225.73 close — and is there a street whisper vs $108.0B ±2%?',
      whyItMatters: 'Expectation-risk stays UNKNOWN without a sourced whisper. No decorative YTD bar.',
      neededToKnow: 'A quote-page YTD and a named street/whisper print.',
      status: 'unknown' as const,
    },
    {
      id: 'cadusd-tuesday',
      area: 'CA' as const,
      question: 'What did CAD/USD actually close Tuesday?',
      whyItMatters: 'The book’s contribution is in C$. A mid-session cents recap is not a CAD close.',
      neededToKnow: 'A sourced CAD/USD or USD/CAD official close.',
      status: 'unknown' as const,
    },
    {
      id: 'apple-event-print',
      area: 'name' as const,
      ticker: 'AAPL',
      question: 'What did Apple actually announce at 1:00 p.m. ET — on the newsroom, not a rumor blog?',
      whyItMatters:
        'The event has not started at this 09:00 wake. Invented SKUs would be a lie. Tuesday $316.22 is still the last print.',
      neededToKnow: 'Apple newsroom / official stream after 1:00 p.m. ET.',
      status: 'unknown' as const,
    },
  ],
  scenarios: [],
  capitalPlan: {
    existingPortfolio: 'HOLD — sell nothing into a pre-open Wednesday.',
    freshCapital:
      'New core money still simplifies into VOO. Do not chase NVDA on a −2.01% Tuesday. Do not add AAPL into an unwatched keynote.',
    bestAdd: 'VOO',
    highestUpsideWatch: 'none named',
    biggestRisk:
      'Mega-cap growth overlap across NVDA, AAPL, MGK, VUG, VOO, VTI — plus a 10-year at 4.804% that can reprice on CPI / FOMC / oil.',
    nextTrigger: 'Cash open today 9:30 ET · Apple 1:00 p.m. ET · PPI Sep 10 · CPI Sep 11 · FOMC Sep 15–16',
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
      title: 'Interest rates + oil',
      body: `Tuesday 10-year settled ${tenYear}% (Newsquawk). WTI October $93.03. Long rates and energy inflation sit on the exact overweight.`,
    },
    {
      n: '03',
      title: 'Labor / inflation path',
      body: 'August U.S. payrolls reprinted +162,000 (AP). Official BLS table still unread. BLS PPI Sep 10 and CPI Sep 11 are the next named prints before FOMC.',
    },
    {
      n: '04',
      title: 'AI ROI / financed demand',
      body: 'IR is mobilizing over $500B of third-party capital for AI factories. That sits under NVDA and most of the indirect book.',
    },
  ],
  close: {
    kicker: 'DIAGNOSTIC',
    headline: 'Tuesday was the first full cash after Labor Day. It was red.',
    body: 'S&P 7,673.52 −0.58%. NVDA $225.73 −2.01%. AAPL $316.22 −1.17%. TSX 36,123.05 −1.07%. Tokyo Wednesday barely red after Tuesday’s flush. Apple’s event is later today — unread. Official BLS table still unread. Sell nothing. If any C$ goes to work after a real cash session, it still belongs in VOO.',
    pills: [
      {tone: 'watch' as const, label: 'HOLD INTO OPEN'},
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
    `SPX ${spxClose.toLocaleString('en-US')} ${spxDayPct}%`,
    `SPX YTD +${spxYtdPct}%`,
    `NASDAQ ${nasdaqDayPct}%`,
    `NVDA $${nvdaClose.toFixed(2)} ${nvdaDayPct}%`,
    `AAPL $${aaplClose.toFixed(2)} ${aaplDayPct}%`,
    `VOO $${vooClose.toFixed(2)} ${vooDayPct}%`,
    `TSX 36,123.05 −1.07%`,
    `NIKKEI 65,142.78 −0.19%`,
    `DAX TUE 26,007.63 FLAT`,
    `10Y ${tenYear}%`,
    `WTI $93.03`,
    `APPLE 1:00 PM ET`,
    `SELL NOTHING INTO OPEN`,
  ],
};

export const episode: DailyReport = parseDailyReport(raw);
