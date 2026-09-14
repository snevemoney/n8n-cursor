import {parseDailyReport, type DailyReport} from '../schema';

// Monday 2026-09-14 America/Toronto (~09:03 EDT). Trading-day wake.
// Asia Monday cash is closed. US cash has not opened (9:30 ET). TSX cash
// is not the official close yet. Do not treat pre-market as a close.
// Registered prior on this tree is 2026-08-25. 2026-09-13 is still only
// on open PR 284. Book unchanged: AAPL, NVDA, VOO, VTI, VUG, MGK, GDV.
const nvdaClose = 218.29;
const nvdaDayPct = -0.03;
const nvdaPremarket = 212.02;
const nvdaPremarketPct = -2.87;
const aaplClose = 332.27;
const aaplDayPct = 1.75;
const vooClose = 702.56;
const vooDayPct = 0.85;
const vtiClose = 376.31;
const vtiDayPct = 0.82;
const vugClose = 88.02;
const vugDayPct = 0.9;
const mgkClose = 89.9;
const mgkDayPct = 0.91;
const gdvClose = 29.55;
const gdvDayPct = 0.51;
const spxClose = 7656.98;
const spxDayPct = 0.86;
const nasdaqDayPct = 0.96;
const tenYearRecap = 4.96;
const nvdaGuide = 108.0;

const raw = {
  meta: {
    date: '2026-09-14',
    dateLabel: 'SEP 14, 2026',
    title: 'Daily Wealth Intelligence',
    thesis:
      'Monday Asia sold AI and chips. US cash is still Friday. The book is the same seven lines. StatCan CPI held 3.0%. FOMC starts tomorrow.',
    thesisLead: 'Asia sold chips. US cash is still Friday.',
    thesisAccent: 'StatCan held 3.0%. FOMC starts tomorrow.',
    catalyst: 'FOMC Sep 15–16 (Fed calendar, SEP). US cash opens 9:30 ET. StatCan August CPI is on the table.',
    kicker: 'Monday Asia cash · StatCan CPI · FOMC tomorrow',
    universe: ['AAPL', 'NVDA', 'VOO', 'VTI', 'VUG', 'MGK', 'GDV'],
  },
  market: {
    spxClose,
    spxDayPct,
    nasdaqDayPct,
    tenYearYield: tenYearRecap,
    note: 'US cash last print is Friday: S&P 500 7,656.98 +65.28 / +0.86% (AP / Seattle Times). Snapped a four-day losing streak. Week still −0.8%. Monday pre-market is not a close. 10-year Asia-session recap 4.96% (Moneycontrol / The Edge). Official Treasury table unread this sitting. S&P YTD page unread — omitted.',
    nextCalendar: {
      label: 'FOMC Sep 15–16 + SEP',
      detail:
        'federalreserve.gov 2026 calendar. Decision Wednesday Sep 16, 2:00 p.m. ET, press conference 2:30. Official BLS August CPI stays on the table. StatCan August CPI printed this morning: +3.0% y/y, −0.1% m/m.',
    },
  },
  markets: {
    global: {
      indices: [
        {
          label: 'Nikkei 225',
          value: '63,492.99',
          dayPct: -0.81,
          note: 'Monday Tokyo close (Kyodo / Mainichi). −518.35. Lowest since July 30. Topix 4,058.21 +0.74% / +29.91 — banks up, chips down. SoftBank −10.7% (Kyodo).',
        },
        {
          label: 'Hang Seng',
          value: '24,917.60',
          dayPct: 0.45,
          note: 'Monday Hong Kong close (Reuters Asia wrap / Infoseek). +111. Hang Seng Tech −0.06% to 4,317.94 (Cnyes wrap).',
        },
        {
          label: 'Shanghai Composite',
          value: '3,885.33',
          dayPct: -0.1,
          note: 'Monday close (Reuters Asia wrap / MarketWatch). CSI 300 −0.67% (Infoseek).',
        },
        {
          label: 'STOXX 600',
          value: '637.5',
          dayPct: -0.3,
          note: 'Reuters Monday 08:40 GMT — Europe still open. Not a close. Tech −2%. DAX / CAC / FTSE closes unread this sitting.',
        },
      ],
      commodities: [
        {
          label: 'WTI crude (Fri settle)',
          value: '$100.05',
          dayPct: -2.37,
          note: 'Friday NYMEX October settle −$2.43 (EnergyNow). Monday morning EnergyNow ~5:32 a.m. MDT Trading View: ~$103.54, not a settle.',
        },
        {
          label: 'Brent (Fri settle)',
          value: '$104.61',
          dayPct: -2.81,
          note: 'Friday November ICE settle −$3.02 (EnergyNow). Monday morning EnergyNow ~$108.04, not a settle.',
        },
        {
          label: 'WTI crude (Mon morning)',
          value: '~$103.54',
          dayPct: 3.49,
          note: 'EnergyNow Monday morning report, Trading View ~5:32 a.m. MDT. Up ~$3.49 from Friday settle. Not the official close.',
        },
        {
          label: 'Brent (Mon morning)',
          value: '~$108.04',
          dayPct: 3.28,
          note: 'EnergyNow Monday morning report. Up ~$3.43 from Friday settle. Not the official close.',
        },
      ],
      rates: [
        {
          label: 'U.S. 10-year (Mon Asia recap)',
          value: `${tenYearRecap}%`,
          note: 'Moneycontrol / The Edge: 10-year steadied at 4.96% in early Asia. Friday end-week recap was 4.97% in the same wrap. Official Treasury par-curve unread (prior sitting 409).',
        },
        {
          label: 'U.S. 2-year (Mon Asia recap)',
          value: '4.62%',
          note: 'Moneycontrol / The Edge early Asia. Friday recap was 4.63%. Official table unread.',
        },
        {
          label: 'USD/JPY (Tokyo 5 p.m.)',
          value: '154.39–40',
          note: 'Kyodo Monday 5 p.m. Tokyo vs 153.53–63 in New York Friday.',
        },
      ],
      fx: [
        {
          label: 'USD/CAD',
          value: '1.3866',
          note: 'Bank of Canada Valet daily average Friday 2026-09-11. 1 CAD = 72.12 U.S. cents. Monday Valet publishes by 16:30 ET — not out at this wake.',
        },
      ],
      note: 'Monday Asia cash is in. Europe is open, not closed. US cash is still Friday. Oil is a morning print, not a Monday settle.',
    },
    us: {
      indices: [
        {label: 'S&P 500', value: '7,656.98', dayPct: spxDayPct, note: 'Friday cash (AP / Seattle Times). Monday cash not open.'},
        {
          label: 'Nasdaq',
          value: '26,333.04',
          dayPct: nasdaqDayPct,
          note: 'Friday cash. +251.31.',
        },
        {label: 'Dow', value: '52,573.29', dayPct: 0.98, note: 'Friday cash.'},
        {label: 'Russell 2000', value: '2,903.94', dayPct: 0.45, note: 'Friday cash.'},
      ],
      yields: [
        {label: 'U.S. 10-year Monday Asia recap', value: `${tenYearRecap}%`},
        {label: 'U.S. 2-year Monday Asia recap', value: '4.62%'},
      ],
      note: 'Last US cash is Friday. Week still down: S&P −0.8%, Dow −1.6%, Nasdaq −0.7%, Russell −2.4% (Seattle Times). Official BLS August CPI from Friday’s table: +0.4% m/m, +3.4% y/y; core +0.3% / +2.4%. Gasoline +3.9% m/m, +27.4% y/y. BLS archive 403 this sitting — not re-downloaded. Official PPI unread. S&P YTD unread — omitted. NVDA StockAnalysis pre-market 9:03 a.m. ET: $212.02 −2.87% — not a close.',
    },
    ca: {
      indices: [
        {
          label: 'S&P/TSX Composite',
          value: '35,697.49',
          dayPct: 0.54,
          note: 'TMX Daily Trade Report Sep 11. Previous close 35,506.28. Monday official close is not out. Reuters: September TSX futures −0.17% at 05:54 a.m. ET — futures, not cash.',
        },
        {
          label: 'S&P/TSX 60',
          value: '2,096.44',
          dayPct: 0.62,
          note: 'TMX Daily Trade Report Sep 11. Previous 2,083.54.',
        },
        {
          label: 'S&P/TSX Venture',
          value: '927.86',
          dayPct: -0.32,
          note: 'TMX Daily Trade Report Sep 11. Previous 930.88.',
        },
      ],
      cadUsd: '72.12¢ (BoC daily average 1.3866 USD/CAD, Friday)',
      note: 'Official StatCan August CPI (The Daily, 2026-09-14): +3.0% y/y, matching July; −0.1% m/m; seasonally adjusted +0.2% m/m. Excluding gasoline +2.4% y/y (after +2.2%). Gasoline +22.8% y/y (after +25.7%). Groceries +2.8% y/y. CPI-trim / median / common unread (Table 4 not extracted). Next FAD Oct 28 + MPR. Last named hold Sep 2 at 2.25%.',
    },
    calendar: {
      items: [
        {
          when: 'Monday Sep 14 — printed',
          where: 'CA' as const,
          label: 'StatCan August CPI',
          why: 'The Daily: +3.0% y/y, −0.1% m/m. Next CPI is October 19 (September). Not a trade.',
        },
        {
          when: 'Monday Sep 14',
          where: 'US' as const,
          label: 'iOS 27 free update',
          why: 'Apple newsroom: iOS 27 available Monday Sep 14. Hour unread. Not a unit guide.',
        },
        {
          when: 'Monday Sep 14 — 9:30 ET',
          where: 'US' as const,
          label: 'US cash open',
          why: 'This wake is before the open. Friday cash and NVDA pre-market are not the Monday close.',
        },
        {
          when: 'Sep 15–16 · SEP meeting',
          where: 'US' as const,
          label: 'FOMC + SEP',
          why: 'federalreserve.gov 2026 calendar. Decision Wednesday Sep 16, 2:00 p.m. ET. August US CPI is already official.',
        },
        {
          when: 'Friday Sep 18',
          where: 'US' as const,
          label: 'iPhone 18 Pro availability',
          why: 'Apple newsroom: pre-orders opened Sat Sep 12; availability Fri Sep 18 in 65+ countries. Duo pre-order Oct 16 / launch Oct 23.',
        },
        {
          when: 'October 1',
          where: 'US' as const,
          label: 'NVIDIA $0.25 dividend pay date',
          why: 'NVIDIA IR Aug 26: record was Sep 10; pay Oct 1. Calendar fact, not a thesis.',
        },
        {
          when: 'October 14',
          where: 'US' as const,
          label: 'BLS September CPI',
          why: 'BLS CPI release schedule. Next official US table after August.',
        },
        {
          when: 'October 19',
          where: 'CA' as const,
          label: 'StatCan September CPI',
          why: 'The Daily next-release line on the August CPI page.',
        },
        {
          when: 'October 28',
          where: 'CA' as const,
          label: 'Bank of Canada rate + MPR',
          why: 'Official BoC 2026 schedule. Next announcement Oct 28 with the MPR.',
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
        'Last cash Friday $218.29 (−0.03%). StockAnalysis pre-market 9:03 a.m. ET $212.02 (−2.87%) is not a close. IR Q3 guide still $108.0B ±2%. Four red of the last seven sourced cash sessions.',
    },
    {
      ticker: 'AAPL',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Recent purchase',
      whatMatters:
        'Last cash Friday $332.27 (+1.75%). iOS 27 is due today (newsroom). Pro availability is Friday. Do not add on the event tape.',
    },
    {
      ticker: 'VOO',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      role: 'Best simple core',
      whatMatters: `Friday $${vooClose.toFixed(2)} (+${vooDayPct}%). New core money still simplifies here.`,
    },
    {
      ticker: 'VTI',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Broad US',
      whatMatters: `Friday $${vtiClose.toFixed(2)} (+${vtiDayPct}%). Excellent fund; still overlaps VOO.`,
      overlapWith: ['VOO'],
    },
    {
      ticker: 'VUG',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Growth sleeve',
      whatMatters: `Friday $${vugClose.toFixed(2)} (+${vugDayPct}%, Dow Jones Newswires). Same mega-cap names you already own.`,
      overlapWith: ['NVDA', 'AAPL', 'VOO', 'MGK'],
    },
    {
      ticker: 'MGK',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Mega-cap growth',
      whatMatters: `Friday $${mgkClose.toFixed(2)} (+${mgkDayPct}%). Even tighter overlap with NVDA and AAPL.`,
      overlapWith: ['NVDA', 'AAPL', 'VUG', 'VOO'],
    },
    {
      ticker: 'GDV',
      rating: 'HOLD — income / diversifier',
      tone: 'long' as const,
      role: 'Income sleeve',
      whatMatters: `Friday $${gdvClose.toFixed(2)} (+${gdvDayPct}%). Different job. Not a growth engine.`,
    },
  ],
  portfolio: {
    concentrationThesis: 'VOO + VTI + VUG + MGK + AAPL + NVDA still buy the same companies.',
    concentrationBody:
      'Monday Asia sold the chip stack. If US cash follows, several Wealthsimple lines can turn red together. Weights are still unknown, so size stays qualitative.',
    factorStack: ['NVDA', 'AAPL', 'MGK', 'VUG', 'VOO', 'VTI'],
    factorLabel: 'U.S. mega-cap / growth',
    overlapNote: 'same ecosystem',
  },
  names: [
    {
      ticker: 'NVDA',
      chapterTitle: 'NVDA · Friday cash flat; Monday pre-market is not a close',
      rating: 'HOLD — critical watch',
      tone: 'watch' as const,
      price: nvdaClose,
      dayPct: nvdaDayPct,
      holdNote: `Last cash is Friday $${nvdaClose.toFixed(2)} (−0.03%). Pre-market $${nvdaPremarket.toFixed(2)} (${nvdaPremarketPct}%) is not a buy and not a close. Guide is still $108.0B ±2%.`,
      streak: [3.21, 1.8, 0.84, -2.01, -0.91, -2.26, -0.03],
      streakHeadline: 'Seven sourced US cash sessions: 4 red. Friday was the fourth red, almost flat.',
      streakNote:
        'StockAnalysis cash: Sep 2 +3.21, Sep 3 +1.80, Sep 4 +0.84, Sep 8 −2.01, Sep 9 −0.91, Sep 10 −2.26 to $218.36, Sep 11 −0.03 to $218.29. Labor Day Sep 7 had no cash. Pre-market is outside this window. Momentum formula counts red days in this cash window only. No 0–100 score.',
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
        note: 'NVIDIA IR August 26. Street consensus and whisper unread this sitting — not drawn. Next dividend $0.25 on Oct 1; record was Sep 10 (same IR).',
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
        leftHeadline: '“Labs talking slower AI plus $108 Brent into FOMC can reprice the stack.”',
        leftBody:
          'Kyodo: Nikkei −0.81% after Anthropic CEO Dario Amodei called Saturday for slower development; Altman said he was considering slowing too. SoftBank −10.7%. Reuters: STOXX tech −2% at 08:40 GMT. EnergyNow Monday morning: WTI ~$103.54, Brent ~$108.04. 10-year recap 4.96%. Pre-market NVDA −2.87% is not cash.',
        rightTitle: 'THE COUNTER',
        rightHeadline: 'Printed demand is still huge. Guide assumes no China DC compute.',
        rightBody:
          'Q2 revenue $96.2B. Data center $89.0B. Q3 guide $108.0B ±2%. A Kyodo source said demand expanding is not the same as a halt. Vera Rubin remains the production story on the IR tape. Dividend record was Sep 10; pay is Oct 1. Do not treat a CEO blog as a guide cut.',
      },
      interpretation: {
        chips: [
          {label: 'CONFIRMED', tone: 'long' as const, text: 'Q2 print and Q3 guide are official IR, not a rumor.'},
          {
            label: 'CONFIRMED',
            tone: 'watch' as const,
            text: 'Four red of the last seven sourced US cash sessions. Monday pre-market is a separate tape.',
          },
          {
            label: 'CONFIRMED',
            tone: 'caution' as const,
            text: 'Monday Asia sold chips. Oil is higher this morning. FOMC starts tomorrow.',
          },
        ],
        note: 'No composite score. Missing whisper stays UNKNOWN. Empty Next-NVDA stays empty.',
      },
      actionMatrix: {
        headline: 'Monday: HOLD. No pre-open buy.',
        rows: [
          {
            tone: 'long' as const,
            if: 'After FOMC the book needs cash put to work',
            then: 'VOO first',
          },
          {
            tone: 'watch' as const,
            if: 'US cash follows Asia and NVDA gaps on the open',
            then: 'HOLD. Pre-market is not a close. Re-read after cash.',
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
        headline: 'Polarity from IR + Monday tape — no composite score. Equal node size.',
        nodes: [
          {id: 'labs', label: 'Frontier labs / clouds', polarity: 'concern' as const, x: 0.08, y: 0.22, evidence: 'Amodei Sat post'},
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
      chapterTitle: 'AAPL · iOS 27 today; still one name you own',
      rating: 'HOLD',
      tone: 'long' as const,
      price: aaplClose,
      dayPct: aaplDayPct,
      holdNote: 'You already own it. Friday cash and a software day are not an add. Pre-market unread this sitting.',
      catalyst: {
        headline: 'Apple newsroom: iOS 27 today; iPhone 18 Pro availability Friday.',
        steps: [
          'iOS 27 free update Monday Sep 14 (newsroom). Hour unread.',
          'iPhone 18 Pro pre-orders opened Sat Sep 12 5:00 a.m. PT',
          'Availability Fri Sep 18 in 65+ countries (newsroom)',
          'Duo pre-order Oct 16 · launch Oct 23',
        ],
        note: 'Official newsroom. No unit guide. No revenue claim. Friday cash $332.27 (+1.75%).',
      },
      action: {
        headline: 'HOLD the position.',
        body: 'Software day is real. Phones land Friday. That is still one name you already own. YTD page unread this sitting — omitted. Do not stack another AAPL buy into the same mega-cap sleeve.',
      },
    },
    {
      ticker: 'VOO',
      chapterTitle: 'VOO · still the simple core',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      metrics: [{label: 'Friday cash', value: `$${vooClose.toFixed(2)}  +${vooDayPct}%`}],
      copy: {
        headline: 'Best simple core. New core money simplifies here.',
        body: 'Do not sell. Stop splitting every future contribution with VTI. Monday US cash has not printed. YTD page unread this sitting — omitted.',
      },
    },
    {
      ticker: 'VTI',
      chapterTitle: 'VTI · excellent, overlapping',
      rating: 'HOLD',
      tone: 'long' as const,
      metrics: [{label: 'Friday cash', value: `$${vtiClose.toFixed(2)}  +${vtiDayPct}%`}],
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
      metrics: [{label: 'Friday cash', value: `$${vugClose.toFixed(2)}  +${vugDayPct}%`}],
      copy: {
        headline: 'You already own the individual winners.',
        body: 'HOLD existing. No priority additions. A chip-sold Asia tape is not a reason to add overlap. Dow Jones Newswires Friday: rose 0.9% to $88.02.',
      },
    },
    {
      ticker: 'MGK',
      chapterTitle: 'MGK · tighter overlap',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      metrics: [{label: 'Friday cash', value: `$${mgkClose.toFixed(2)}  +${mgkDayPct}%`}],
      copy: {
        body: 'You already own NVDA and AAPL directly. HOLD. Stop feeding it. Not a sell call — tax and account mechanics are not on this tape.',
      },
    },
    {
      ticker: 'GDV',
      chapterTitle: 'GDV · a different job',
      rating: 'HOLD · INCOME / DIVERSIFIER',
      tone: 'long' as const,
      metrics: [{label: 'Market', value: `$${gdvClose.toFixed(2)}  +${gdvDayPct}%`}],
      copy: {
        body: 'Closed-end income/value. NAV and discount unread this sitting — omitted. Not “Next NVDA.”',
      },
    },
  ],
  nextNvda: [],
  unknowns: [
    {
      id: 'us-monday-cash',
      area: 'US' as const,
      question: 'What did US cash actually print after 9:30 ET?',
      whyItMatters:
        'This wake is before the open. NVDA pre-market −2.87% is not the Monday close. Friday cash is still the last official US tape.',
      neededToKnow: 'Index and book closes after the Monday session, from an index or quote page.',
      status: 'unknown' as const,
    },
    {
      id: 'tsx-monday-cash',
      area: 'CA' as const,
      question: 'What did the official TMX Monday close print?',
      whyItMatters:
        'Last official TSX is Friday 35,697.49. Reuters futures −0.17% is not cash. StatCan CPI is on the table into the local session.',
      neededToKnow: 'TMX Daily Trade Report for 2026-09-14.',
      status: 'unknown' as const,
    },
    {
      id: 'europe-closes',
      area: 'GLOBAL' as const,
      question: 'Where did FTSE / DAX / CAC close Monday?',
      whyItMatters:
        'Reuters STOXX 600 −0.3% at 08:40 GMT is an open print. A close would finish the Europe lane.',
      neededToKnow: 'Index-page closes after London / Frankfurt / Paris cash.',
      status: 'partial' as const,
    },
    {
      id: 'weights',
      area: 'book' as const,
      question: 'What is each line’s weight in the book?',
      whyItMatters: 'Concentration stays qualitative until weights exist. We cannot size how much mega-cap.',
      neededToKnow: 'Sourced account weights. Do not estimate from prices.',
      status: 'unknown' as const,
    },
    {
      id: 'holding-ytd',
      area: 'book' as const,
      question: 'What is each holding’s sourced YTD?',
      whyItMatters: 'August 25 YTD scalars are stale. Two YTD numbers would draw a lollipop — only if both are live.',
      neededToKnow: 'A fund or quote page YTD for each line, dated Friday or later.',
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
    existingPortfolio: 'HOLD — sell nothing before US cash.',
    freshCapital: 'No pre-open buy. New core money simplifies into VOO after FOMC if cash must work.',
    bestAdd: 'VOO',
    highestUpsideWatch: 'none named',
    biggestRisk:
      'Mega-cap growth overlap across NVDA, AAPL, MGK, VUG, VOO, VTI — sitting under a 4.96% 10-year recap, Monday oil bid, and FOMC tomorrow',
    nextTrigger: 'US cash open, then FOMC Sep 15–16 + SEP',
    ifThen: [
      {
        tone: 'long' as const,
        if: 'After FOMC the book needs cash put to work',
        then: 'VOO first',
      },
      {
        tone: 'watch' as const,
        if: 'US cash follows Asia and duration reprices',
        then: 'HOLD the stack. Re-read after the close.',
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
  risks: [
    {
      n: '01',
      title: 'Growth-factor concentration',
      body: 'NVDA + AAPL + MGK + VUG + VOO + VTI repeatedly own the same mega-cap ecosystem. Monday Asia sold chips. If US cash follows, the overlap shows up as one move.',
    },
    {
      n: '02',
      title: 'Oil + rates into FOMC',
      body: `The 10-year recap sat at ${tenYearRecap}%. Friday WTI settled $100.05; Monday morning EnergyNow ~$103.54 / Brent ~$108.04. Official US CPI +3.4% y/y. StatCan held 3.0% y/y with gasoline still +22.8% y/y. High long rates compress the exact overweight. FOMC decision is Wednesday.`,
    },
    {
      n: '03',
      title: 'AI pace talk vs printed demand',
      body: 'Kyodo and Reuters sourced a Saturday Amodei post plus Altman considering slower development. That moved Asia chips. IR still prints Q2 $96.2B / Q3 guide $108.0B ±2%. A blog is not a guide cut. The debate is still whether profits justify the buildout.',
    },
  ],
  close: {
    kicker: 'DIAGNOSTIC',
    headline: 'Monday Asia is new. US cash is not. The book is still seven names.',
    body: 'StatCan held 3.0%. NVDA pre-market is not a close. After US cash: FOMC, then HOLD / VOO — Evens decides. No trade from this desk.',
    pills: [
      {tone: 'watch' as const, label: 'HOLD INTO THE OPEN'},
      {tone: 'caution' as const, label: 'NO PRE-MARKET BUY'},
      {tone: 'long' as const, label: 'VOO IF CASH MUST WORK'},
    ],
    followThrough: [
      {
        tone: 'watch' as const,
        if: 'FOMC keeps the 10-year bid',
        then: 'Do not add growth overlap. Re-read duration.',
      },
      {
        tone: 'caution' as const,
        if: 'Oil stays bid into the decision',
        then: 'More VOO / cash / non-AI quality — Evens decides.',
      },
      {
        tone: 'long' as const,
        if: 'An asymmetric candidate is named',
        then: 'That is when the Next-NVDA sleeve gets capital.',
      },
    ],
  },
  tickerTape: [
    `SPX ${spxClose.toLocaleString('en-US')}  +${spxDayPct}% FRI`,
    `NASDAQ  +${nasdaqDayPct}% FRI`,
    `NVDA  $${nvdaClose.toFixed(2)}  ${nvdaDayPct}% FRI`,
    `NVDA PM  $${nvdaPremarket.toFixed(2)}  ${nvdaPremarketPct}%`,
    `AAPL  $${aaplClose.toFixed(2)}  +${aaplDayPct}% FRI`,
    `NIKKEI  63,492.99  −0.81%`,
    `WTI AM  ~$103.54`,
    `TSX FRI  35,697.49`,
    `STATCAN  +3.0% y/y`,
    `FOMC  SEP 15–16`,
    `VOO CORE / ADD`,
    `SELL NOTHING INTO THE OPEN`,
  ],
};

export const episode: DailyReport = parseDailyReport(raw);
