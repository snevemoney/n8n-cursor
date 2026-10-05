import {vsSpxSpread} from '../compute';
import {parseDailyReport, type DailyReport} from '../schema';

const nvdaYtd = 25.44;
const nvdaSpxYtd = 12.81;
const aaplYtd = 22.74;
const aaplSpxYtd = 12.81;
const nvdaClose = 233.95;
const nvdaDayPct = 1.34;
const aaplClose = 333.69;
const aaplDayPct = 1.02;
const spxClose = 7722.72;
const spxDayPct = 0.73;
const spxYtdPct = 12.81;
const nasdaqClose = 27190.86;
const nasdaqDayPct = 1.19;
const tenYear = 5.28;
const vooClose = 707.54;
const vooDayPct = 0.74;
const vooYtd = 12.82;
const vtiClose = 377.99;
const vtiDayPct = 0.75;
const vtiYtd = 12.74;
const vugClose = 91.17;
const vugDayPct = 1.04;
const vugYtd = 12.13;
const mgkClose = 93.68;
const mgkDayPct = 0.99;
const mgkYtd = 13.48;
const gdvMkt = 28.37;
const gdvNav = 32.52;
const gdvDiscount = -12.76;
const gdvYtd = 7.0;
const tsxClose = 35502.65;
const tsxDayPct = 0.99;
const tsxYtd = 11.95;
const nikkeiClose = 69946.86;
const nikkeiDayPct = 2.4;
const topixClose = 4145;
const topixDayPct = 1.33;
const hangSengClose = 24040;
const hangSengDayPct = 0.3;
const q3Guide = 108.0;
const q3GuideLow = 105.84;
const q3GuideHigh = 110.16;

const raw = {
  meta: {
    date: '2026-10-05',
    dateLabel: 'OCT 5, 2026',
    title: 'Daily Wealth Intelligence',
    thesis:
      'Asia already printed a risk-on Monday. US and Canada cash have not. The book is still the same U.S. mega-cap stack sitting under a 5.28% official 10-year.',
    thesisLead: 'Asia printed. US cash has not.',
    thesisAccent: 'The book is still the same mega-cap stack.',
    catalyst:
      'US cash opens on Friday’s payrolls miss. Next named company event is Nvidia’s Nov 17 call, not this open.',
    kicker: 'Monday open · last US/CA cash Friday 2 Oct',
    universe: ['AAPL', 'NVDA', 'VOO', 'VTI', 'VUG', 'MGK', 'GDV'],
  },
  market: {
    spxClose,
    spxDayPct,
    spxYtdPct,
    nasdaqDayPct,
    tenYearYield: tenYear,
    note:
      'Friday 2 Oct is the last US cash print. September payrolls +29,000. Official Treasury 10-year 5.28%. Yahoo TNX was 5.30 Monday morning — that is not the Treasury CMT.',
    nextCalendar: {
      label: 'CPI Oct 14 · FOMC Oct 27–28 · NVDA Nov 17',
      detail: 'Apple Q4 date is not on investor.apple.com. Do not treat Oct 29 as announced.',
    },
  },
  markets: {
    global: {
      indices: [
        {
          label: 'Nikkei 225',
          value: nikkeiClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: nikkeiDayPct,
          note: 'Mon 5 Oct official Nikkei page. Three-month closing high on the RTHK wrap.',
        },
        {
          label: 'TOPIX',
          value: topixClose.toLocaleString('en-US'),
          dayPct: topixDayPct,
          note: 'Mon 5 Oct via RTHK wrap. Official JPX page unread.',
        },
        {
          label: 'Hang Seng',
          value: hangSengClose.toLocaleString('en-US'),
          dayPct: hangSengDayPct,
          note: 'Mon 5 Oct RTHK: 24,040, +68 points.',
        },
      ],
      commodities: [
        {label: 'WTI Nov', value: '$91.11', dayPct: -1.9, note: 'Friday 2 Oct settle (week wrap). Monday oil unread.'},
      ],
      note:
        'Shanghai and Seoul were closed for holidays (RTHK). DAX Monday close unread — only an afternoon estimate was on the page. Europe lane omitted as a close.',
    },
    us: {
      indices: [
        {
          label: 'S&P 500',
          value: spxClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: spxDayPct,
          note: 'Fri 2 Oct Yahoo. YTD +12.81% on the same page.',
        },
        {
          label: 'Nasdaq',
          value: nasdaqClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: nasdaqDayPct,
          note: 'Fri 2 Oct Yahoo chart.',
        },
        {label: 'Dow', value: '51,176.96', dayPct: 0.49, note: 'Fri 2 Oct week wrap.'},
        {label: 'Russell 2000', value: '2,832.90', dayPct: 0.94, note: 'Fri 2 Oct week wrap.'},
      ],
      yields: [
        {label: 'U.S. 10-year (Treasury CMT)', value: `${tenYear}%`, note: 'Fri 2 Oct official par table. Thu was 5.24%.'},
      ],
      note:
        'Payrolls miss (+29,000) and Nasdaq +1.19% on Friday. Cash is closed until this morning’s open. Do not treat a pre-open quote as Friday’s close.',
    },
    ca: {
      indices: [
        {
          label: 'S&P/TSX Composite',
          value: tsxClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: tsxDayPct,
          note: `Fri 2 Oct TSX daily report. YTD +${tsxYtd}% (MarketScreener).`,
        },
        {
          label: 'S&P/TSX Venture',
          value: '880.57',
          dayPct: 0.2,
          note: 'Fri 2 Oct official TSX daily report.',
        },
      ],
      cadUsd: '70.20¢ (BoC 1 USD = 1.4246 CAD, Fri 2 Oct)',
      note: 'Canada cash last printed Friday. Monday Toronto session is not in these closes.',
    },
    calendar: {
      items: [
        {
          when: 'Monday (today)',
          where: 'US' as const,
          label: 'US cash open',
          why: 'First US session after the payrolls miss. Last close is Friday.',
        },
        {
          when: 'Wednesday Oct 14',
          where: 'US' as const,
          label: 'CPI (September)',
          why: 'BLS 8:30 ET. First named inflation print after payrolls.',
        },
        {
          when: 'Oct 27–28',
          where: 'US' as const,
          label: 'FOMC',
          why: 'Fed two-day meeting. Decision and press conference Oct 28, 2:00 p.m. ET.',
        },
        {
          when: 'Tuesday Nov 17',
          where: 'US' as const,
          label: 'Nvidia Q3 FY2027 call',
          why: 'Company-stated date from the Aug 26 call. Guide still $108.0B ±2%.',
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
      rating: 'HOLD — next named print Nov 17',
      tone: 'watch' as const,
      role: 'Highest event risk',
      whatMatters: 'Aug 26 IR still the last print. Next named call Nov 17.',
      ytd: nvdaYtd,
    },
    {
      ticker: 'AAPL',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Recent purchase',
      whatMatters: 'Q4 date not on Apple IR. Weekly −2.16% into Friday (Velox).',
      ytd: aaplYtd,
    },
    {
      ticker: 'VOO',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      role: 'Best simple core',
      whatMatters: 'Best simple core. New money still simplifies here.',
      ytd: vooYtd,
    },
    {
      ticker: 'VTI',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Broad US',
      whatMatters: 'Excellent, but still overlaps VOO at the top.',
      ytd: vtiYtd,
      overlapWith: ['VOO'],
    },
    {
      ticker: 'VUG',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Growth sleeve',
      whatMatters: 'Growth sleeve. Price YTD slightly behind the S&P. You already own the names.',
      ytd: vugYtd,
      overlapWith: ['NVDA', 'AAPL', 'VOO', 'MGK'],
    },
    {
      ticker: 'MGK',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Mega-cap growth',
      whatMatters: 'Even more mega-cap overlap with NVDA and AAPL.',
      ytd: mgkYtd,
      overlapWith: ['NVDA', 'AAPL', 'VUG', 'VOO'],
    },
    {
      ticker: 'GDV',
      rating: 'HOLD — income / diversifier',
      tone: 'long' as const,
      role: 'Income sleeve',
      whatMatters: 'Different job. Gabelli still lists NVDA at 1.2% of the Jun 30 top ten.',
      ytd: gdvYtd,
    },
  ],
  portfolio: {
    concentrationThesis: 'VOO + VTI + VUG + MGK + AAPL + NVDA still buy the same U.S. mega-caps.',
    concentrationBody:
      'Friday’s Nasdaq bounce and Monday’s Nikkei bounce are the same factor. When that factor turns, several Wealthsimple lines move together. Weights are still unknown.',
    factorStack: ['NVDA', 'AAPL', 'MGK', 'VUG', 'VOO', 'VTI'],
    factorLabel: 'U.S. mega-cap / growth',
    overlapNote: 'same ecosystem',
  },
  names: [
    {
      ticker: 'NVDA',
      chapterTitle: 'NVDA · last IR is Aug 26. Next named call is Nov 17.',
      rating: 'HOLD — WATCH',
      tone: 'watch' as const,
      price: nvdaClose,
      dayPct: nvdaDayPct,
      holdNote: 'No add at the Monday open. The next named company print is Nov 17.',
      streak: [-0.41, 0.22, 1.68, -0.72, 0.51, 1.09, 1.34],
      streakHeadline: 'Seven Yahoo sessions into Friday. Two red. Not a collapse.',
      streakNote:
        'Sep 24 → Oct 2 day %. Friday tagged a 52-week high at $237.88 and closed $233.95 (Velox / Yahoo).',
      fundamentals: [
        {label: 'Q2 FY27 revenue', value: '$96.2B  +18% q/q  +106% y/y'},
        {label: 'Q2 gross margin', value: '75.0% GAAP and non-GAAP'},
        {label: 'Q2 EPS', value: 'GAAP $2.46  /  non-GAAP $2.22'},
        {label: 'Q3 revenue guide', value: '$108.0B ±2%'},
        {label: 'Q3 GM guide', value: '74.0% ±50 bp'},
        {label: 'China DC compute in guide', value: 'None assumed'},
      ],
      vsSpx: {
        headline: 'Price YTD still beats the S&P. That is not a license to add at the open.',
        bars: [
          {label: 'NVDA YTD', pct: nvdaYtd, tone: 'nvda' as const},
          {label: 'S&P YTD', pct: nvdaSpxYtd, tone: 'muted' as const},
        ],
        note: `Spread: ${vsSpxSpread(nvdaYtd, nvdaSpxYtd) >= 0 ? '+' : ''}${vsSpxSpread(nvdaYtd, nvdaSpxYtd).toFixed(1)} points (NVDA price YTD − S&P YTD). Yahoo chart vs prior-year close. No beta sourced today.`,
      },
      consensus: {
        rows: [
          {label: 'Last quarter revenue', value: '$96.2B'},
          {label: 'This-quarter guide', value: '$108.0B ±2%'},
          {label: 'This-quarter GM guide', value: '74.0% ±50 bp'},
          {label: 'Next named call', value: 'Nov 17 (IR, Aug 26 call)'},
        ],
        note: 'Company guide, not a street whisper. Whisper is UNKNOWN. China data-center compute is not in the outlook.',
        range: {
          metric: 'Q3 revenue guide',
          unit: 'B',
          consensus: q3Guide,
          guide: q3Guide,
          low: q3GuideLow,
          high: q3GuideHigh,
        },
      },
      narrative: {
        leftTitle: 'THE CONSTRAINT',
        leftHeadline: 'Guide assumes no China data-center compute. Margin is guided down to 74%.',
        leftBody:
          'Aug 26 IR: Q3 revenue $108.0B ±2%, gross margin 74.0% ±50 bp. That is a lower margin than the 75.0% Q2 print. The 10-year at 5.28% is the other constraint on a long-duration name.',
        rightTitle: 'THE PRINT',
        rightHeadline: 'Q2 was $96.2B, +106% year over year. Friday closed $233.95, +1.34%.',
        rightBody:
          'Velox: +3.95% on the week, 52-week high $237.88 during Friday’s session. Demand is still large enough for a $108B guide. That is not the same as “add at 9:30.”',
      },
      interpretation: {
        chips: [
          {label: 'CONFIRMED', tone: 'long' as const, text: 'Q2 $96.2B and a $108.0B ±2% Q3 guide are on the IR page.'},
          {
            label: 'CONFIRMED',
            tone: 'watch' as const,
            text: 'China data-center compute is not in the outlook. Q3 margin is guided to 74%.',
          },
          {
            label: 'INFERENCE',
            tone: 'caution' as const,
            text: 'Friday’s bounce is a payrolls-miss tape, not a new company print.',
          },
        ],
        note: 'No 0–100 NVDA score. Prediction-board fundamentals stay UNKNOWN without a named composite mapping.',
      },
      actionMatrix: {
        headline: 'Monday: HOLD. Do not buy the open.',
        rows: [
          {
            tone: 'long' as const,
            if: 'Nov 17 clears the $108B guide and keeps ~74% margin without a demand cut',
            then: 'Re-read ADD vs VOO after the call — not before',
          },
          {
            tone: 'watch' as const,
            if: 'Normal print around the $108B band',
            then: 'HOLD. Fresh capital still prefers VOO',
          },
          {
            tone: 'caution' as const,
            if: 'Guide cut / margin worse than 73.5% / China or supply shock',
            then: 'Do not automatically buy the dip',
          },
          {
            tone: 'short' as const,
            if: 'Demand deterioration after the call',
            then: 'Consider reducing the NVDA line — Evens decides',
          },
        ],
      },
      network: {
        title: 'NVDA · qualitative demand chain',
        headline: 'Polarity from this sitting’s IR and tape — no composite score.',
        nodes: [
          {id: 'guide', label: 'Q3 guide $108B ±2%', polarity: 'confirmed' as const, x: 0.1, y: 0.22, evidence: 'IR Aug 26'},
          {id: 'print', label: 'Q2 $96.2B', polarity: 'confirmed' as const, x: 0.32, y: 0.22, evidence: '+106% y/y'},
          {id: 'margin', label: 'GM 75% → 74% guide', polarity: 'concern' as const, x: 0.32, y: 0.78, evidence: '±50 bp'},
          {id: 'china', label: 'China DC compute', polarity: 'concern' as const, x: 0.54, y: 0.78, evidence: 'Not in outlook'},
          {id: 'nvda', label: 'NVDA', polarity: 'neutral' as const, x: 0.54, y: 0.5},
          {id: 'rates', label: '10-year 5.28%', polarity: 'concern' as const, x: 0.76, y: 0.22, evidence: 'Treasury Fri'},
          {id: 'call', label: 'Nov 17 call', polarity: 'inference' as const, x: 0.76, y: 0.78},
          {id: 'open', label: 'Monday US open', polarity: 'inference' as const, x: 0.92, y: 0.5},
        ],
        edges: [
          {from: 'print', to: 'nvda'},
          {from: 'guide', to: 'nvda'},
          {from: 'margin', to: 'nvda'},
          {from: 'china', to: 'nvda', label: 'excluded'},
          {from: 'rates', to: 'nvda'},
          {from: 'nvda', to: 'call'},
          {from: 'nvda', to: 'open'},
        ],
      },
    },
    {
      ticker: 'AAPL',
      chapterTitle: 'AAPL · Q4 date is not on IR',
      rating: 'HOLD',
      tone: 'long' as const,
      price: aaplClose,
      dayPct: aaplDayPct,
      holdNote: 'HOLD the line. Do not add at the open. You already own it.',
      streak: [-0.33, 1.53, -0.78, -2.66, 1.1, -0.81, 1.02],
      streakHeadline: 'Seven Yahoo sessions. Four red. Friday only repaired part of Tuesday’s −2.66%.',
      returns: {
        headline: 'Price YTD still beats the S&P. The last week did not.',
        bars: [
          {label: 'YTD', pct: aaplYtd, tone: 'long' as const},
          {label: 'S&P YTD', pct: aaplSpxYtd, tone: 'muted' as const},
          {label: '1 week', pct: -2.16, tone: 'short' as const},
        ],
        panelTitle: 'IR CALENDAR',
        panelBody: 'Q4 FY2026 call date not announced on investor.apple.com',
        note: `Spread vs S&P YTD: ${vsSpxSpread(aaplYtd, aaplSpxYtd) >= 0 ? '+' : ''}${vsSpxSpread(aaplYtd, aaplSpxYtd).toFixed(1)} points. Weekly −2.16% from Velox (Sep 25 → Oct 2).`,
      },
      catalyst: {
        headline: 'Last confirmed Apple call is Q3 FY2026, July 30. Q4 is unannounced.',
        steps: [
          'Fiscal year ended Sep 26 (Apple FAQ)',
          'Newsroom has not posted a Q4 date',
          'Street estimates (Oct 29) are not IR',
          'HOLD until Apple names the hour',
        ],
        note: 'Do not put Oct 29 on the board as a company date.',
      },
      action: {
        headline: 'HOLD the position.',
        body: 'Do not add at the Monday open. The next contribution should diversify, not double the same name.',
      },
    },
    {
      ticker: 'VOO',
      chapterTitle: 'VOO · the foundation is not the problem',
      rating: 'CORE / ADD',
      tone: 'long' as const,
      price: vooClose,
      dayPct: vooDayPct,
      metrics: [
        {label: 'Fri close', value: `$${vooClose.toFixed(2)}  +${vooDayPct}%`},
        {label: 'Price YTD', value: `+${vooYtd}%`},
      ],
      copy: {
        headline: 'Best simple core. New core money simplifies here.',
        body: 'Yahoo Fri 2 Oct $707.54, +0.74%. Price YTD +12.82% vs S&P +12.81%. Do not sell. Stop splitting every future contribution with VTI.',
      },
    },
    {
      ticker: 'VTI',
      chapterTitle: 'VTI · excellent, overlapping',
      rating: 'HOLD',
      tone: 'long' as const,
      price: vtiClose,
      dayPct: vtiDayPct,
      metrics: [
        {label: 'Fri close', value: `$${vtiClose.toFixed(2)}  +${vtiDayPct}%`},
        {label: 'Price YTD', value: `+${vtiYtd}%`},
      ],
      copy: {
        headline: 'Excellent. Mega-caps still dominate, so the top looks like VOO.',
        body: 'Yahoo Fri 2 Oct $377.99, +0.75%. Do not sell. The overlap with VOO is the issue — not the fund quality.',
      },
    },
    {
      ticker: 'VUG',
      chapterTitle: 'VUG · growth sleeve, already owned underneath',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      price: vugClose,
      dayPct: vugDayPct,
      returns: {
        headline: 'Price YTD is slightly behind the S&P — and you already own NVDA and AAPL directly.',
        bars: [
          {label: 'VUG YTD', pct: vugYtd, tone: 'watch' as const},
          {label: 'S&P YTD', pct: spxYtdPct, tone: 'long' as const},
        ],
        note: `Yahoo Fri 2 Oct $${vugClose} +${vugDayPct}%. HOLD existing. No priority additions.`,
      },
    },
    {
      ticker: 'MGK',
      chapterTitle: 'MGK · same issue, more concentrated',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      price: mgkClose,
      dayPct: mgkDayPct,
      metrics: [
        {label: 'Fri close', value: `$${mgkClose.toFixed(2)}  +${mgkDayPct}%`},
        {label: 'Price YTD', value: `+${mgkYtd}%`},
      ],
      copy: {
        body: 'Yahoo Fri 2 Oct $93.68. Price YTD +13.48% vs S&P +12.81%. You already own NVDA and AAPL. HOLD. Stop feeding it. Not a sell call — tax and account mechanics are unread.',
      },
    },
    {
      ticker: 'GDV',
      chapterTitle: 'GDV · a different job — still a little NVDA',
      rating: 'HOLD · INCOME / DIVERSIFIER',
      tone: 'long' as const,
      price: gdvMkt,
      metrics: [
        {label: 'NAV (Oct 2)', value: `$${gdvNav.toFixed(2)}`},
        {label: 'Market (Oct 2)', value: `$${gdvMkt.toFixed(2)}`},
        {label: 'Discount', value: `${gdvDiscount}%`},
        {label: 'YTD (Gabelli)', value: `+${gdvYtd.toFixed(2)}%`},
      ],
      copy: {
        body: 'Gabelli Oct 2: NAV $32.52, market $28.37, discount −12.76%, YTD +7.00%. Jun 30 top ten still includes NVDA at 1.20%. Income sleeve, not Next-NVDA.',
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
      id: 'next-nvda',
      area: 'opportunity' as const,
      question: 'Is there a named Next-NVDA or non-book scout?',
      whyItMatters: 'The sleeve and opportunity board stay empty until a name is sourced.',
      neededToKnow: 'Evens or a filing names a ticker that is not already in the book.',
      status: 'unknown' as const,
    },
    {
      id: 'aapl-q4-date',
      area: 'name' as const,
      ticker: 'AAPL',
      question: 'When did Apple name the Q4 FY2026 call?',
      whyItMatters: 'Street estimates are not IR. Putting Oct 29 on the board would be a lie.',
      neededToKnow: 'A newsroom / investor.apple.com post with a date and time.',
      status: 'unknown' as const,
    },
    {
      id: 'europe-close',
      area: 'GLOBAL' as const,
      question: 'Where did DAX / STOXX close on Monday 5 Oct?',
      whyItMatters: 'Only an afternoon DAX estimate was on the page. A close is not a midday print.',
      neededToKnow: 'An index-page close after the European cash finish.',
      status: 'unknown' as const,
    },
    {
      id: 'monday-us-cash',
      area: 'US' as const,
      question: 'What will US and TSX cash actually print today?',
      whyItMatters: 'This brief is a 9:02 America/Toronto wake. Friday is the last close, not today’s open.',
      neededToKnow: 'Monday cash closes from index pages after 16:00 ET.',
      status: 'unknown' as const,
    },
  ],
  scenarios: [],
  capitalPlan: {
    existingPortfolio: 'HOLD — sell nothing at the Monday open.',
    freshCapital: 'No add at the open. New core money simplifies into VOO.',
    bestAdd: 'VOO',
    highestUpsideWatch: 'none named',
    biggestRisk: 'Mega-cap growth overlap across NVDA, AAPL, MGK, VUG, VOO, VTI under a 5.28% 10-year',
    nextTrigger: 'CPI Oct 14 · FOMC Oct 27–28 · NVDA Nov 17. Apple Q4 unannounced.',
    ifThen: [
      {
        tone: 'watch' as const,
        if: 'Monday US open only follows Friday’s Nasdaq bounce',
        then: 'HOLD. Do not chase the open',
      },
      {
        tone: 'long' as const,
        if: 'Fresh C$ arrives and no new name is sourced',
        then: 'VOO',
      },
      {
        tone: 'caution' as const,
        if: '10-year CMT revisits the 5.34% week high after the open',
        then: 'Do not add growth sleeves',
      },
      {
        tone: 'short' as const,
        if: 'Nov 17 guide breaks and the overlap still has no weights',
        then: 'Reduce from evidence — Evens decides',
      },
    ],
  },
  risks: [
    {
      n: '01',
      title: 'Growth-factor concentration',
      body: 'NVDA + AAPL + MGK + VUG + VOO + VTI repeatedly own the same mega-cap ecosystem. GDV’s Jun 30 top ten still has NVDA at 1.20%.',
    },
    {
      n: '02',
      title: 'Interest rates',
      body: `Official 10-year CMT is ${tenYear}% (Fri 2 Oct). That is still near the 24-year zone from last week. High long rates compress the exact overweight.`,
    },
    {
      n: '03',
      title: 'Next print is weeks out',
      body: 'NVDA’s next named call is Nov 17. Apple has not named Q4. Today’s open is a tape event, not a company event.',
    },
  ],
  close: {
    kicker: 'DIAGNOSTIC',
    headline: 'Monday’s open is not an NVDA print.',
    body: 'Asia already moved. US and Canada cash have not. Hold the book. If C$ arrives, it still goes to VOO. Watch CPI Oct 14, FOMC Oct 27–28, and the Nov 17 Nvidia call. Apple Q4 stays blank until IR says so.',
    pills: [
      {tone: 'watch' as const, label: 'HOLD THE OPEN'},
      {tone: 'long' as const, label: 'FRESH C$ → VOO'},
      {tone: 'caution' as const, label: 'NO NEXT-NVDA'},
    ],
    followThrough: [
      {
        tone: 'watch' as const,
        if: 'US cash opens and the book is green on the same factor',
        then: 'That is overlap, not a new thesis',
      },
      {
        tone: 'caution' as const,
        if: 'Yields back up through last week’s high',
        then: 'More VOO / cash / non-AI quality — no growth add',
      },
      {
        tone: 'long' as const,
        if: 'Evens or a filing names a ticker outside the book',
        then: 'That is when the scout board gets a row',
      },
    ],
  },
  tickerTape: [
    `SPX  ${spxClose.toLocaleString('en-US')}  +${spxDayPct}%  FRI`,
    `SPX YTD  +${spxYtdPct}%`,
    `NASDAQ  ${nasdaqClose.toLocaleString('en-US')}  +${nasdaqDayPct}%  FRI`,
    `NVDA  $${nvdaClose.toFixed(2)}  +${nvdaDayPct}%  FRI`,
    `AAPL  $${aaplClose.toFixed(2)}  +${aaplDayPct}%  FRI`,
    `10Y CMT  ${tenYear}%  FRI`,
    `NIKKEI  ${nikkeiClose.toLocaleString('en-US')}  +${nikkeiDayPct}%  MON`,
    `HSI  ${hangSengClose.toLocaleString('en-US')}  +${hangSengDayPct}%  MON`,
    `TSX  ${tsxClose.toLocaleString('en-US')}  +${tsxDayPct}%  FRI`,
    `CAD  70.20¢  BoC FRI`,
    `VOO CORE / ADD`,
    `HOLD THE OPEN`,
  ],
};

export const episode: DailyReport = parseDailyReport(raw);
