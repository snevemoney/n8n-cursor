import {parseDailyReport, type DailyReport} from '../schema';

const nvdaClose = 227.38;
const nvdaDayPct = 2.3;
const aaplClose = 338.98;
const aaplDayPct = 0.85;
const vooClose = 712.78;
const vooDayPct = 1.57;
const vtiClose = 381.1;
const vtiDayPct = 1.51;
const vugClose = 91.02;
const vugDayPct = 2.56;
const mgkClose = 93.33;
const mgkDayPct = 2.68;
const gdvClose = 29.11;
const gdvDayPct = 0.55;
const spxClose = 7764.7;
const spxDayPct = 1.49;
const spxYtdPct = 13.4;
const nasdaqClose = 27122.09;
const nasdaqDayPct = 2.26;
const dowClose = 52048.83;
const dowDayPct = 0.71;
const russellClose = 2875.36;
const russellDayPct = 0.52;
const soxClose = 12433.17;
const soxDayPct = 4.29;
const tenYearOfficialFri = 5.01;
const tenYearMondaySession = 4.95;
const nikkei = 65018.95;
const nikkeiDayPct = 1.38;
const hangSeng = 25087.75;
const hangSengDayPct = 0.18;
const shanghai = 3952.13;
const shanghaiDayPct = 0.06;
const kospi = 7017.91;
const kospiDayPct = 0.15;
const ftseMon = 10739.01;
const ftseMonDayPct = 0.75;
const daxMon = 25575.01;
const daxMonDayPct = 1.07;
const cacMon = 8138.94;
const cacMonDayPct = 0.92;
const ftseSession = 10747.56;
const daxSession = 25736.64;
const cacSession = 8182.55;
const tsxClose = 36009.4;
const tsxDayPct = 0.57;
const wtiSettle = 95.78;
const wtiSettleDayPct = -4.51;
const brentSettle = 100.34;
const brentSettleDayPct = -3.4;
const wtiSession = 89.93;
const brentSession = 98.39;
const nvdaQ2Rev = 96.2;
const nvdaDcRev = 89.0;
const nvdaQ3Guide = 108.0;

const raw = {
  meta: {
    date: '2026-09-22',
    dateLabel: 'SEP 22, 2026',
    title: 'Daily Wealth Intelligence',
    thesis:
      'Monday U.S. cash finally printed. Nasdaq made a record. The book rode the same mega-cap growth bid. Tokyo is still shut. Do not chase Monday’s chip close into Tuesday’s open.',
    thesisLead: 'Monday cash printed.',
    thesisAccent: 'Do not chase the chip close.',
    catalyst:
      'U.S. and TSX cash open in minutes. Mac mini / Studio are in stores today. Official Monday 10-year still unread.',
    kicker:
      'Tuesday 9:20 America/Toronto. Tokyo cash shut through Wednesday. HK, Shanghai, and Seoul closed. Europe is still in session. Last North American cash is Monday.',
    universe: ['AAPL', 'NVDA', 'VOO', 'VTI', 'VUG', 'MGK', 'GDV'],
  },
  market: {
    spxClose,
    spxDayPct,
    spxYtdPct,
    nasdaqDayPct,
    tenYearYield: tenYearMondaySession,
    note: 'Monday U.S. cash: S&P 7,764.70 +1.49%. Nasdaq 27,122.09 +2.26% — record (AP / Reuters). AP: 10-year fell to 4.95%. Official FRED DGS10 last is 5.01% on 09/18. NVDA Monday $227.38 +2.30%.',
    nextCalendar: {
      label: 'U.S. / CA cash open',
      detail: 'Tuesday cash unread — NYSE / TSX open 09:30 ET. Mac mini / Studio in stores today. BoJ call effective Thu Sep 24. Tokyo cash also returns Thursday.',
    },
  },
  markets: {
    global: {
      indices: [
        {
          label: 'Nikkei 225',
          value: nikkei.toLocaleString('en-US'),
          dayPct: nikkeiDayPct,
          note: 'Tokyo cash shut Mon–Wed (Respect for the Aged Day, Citizens’ Holiday, Autumnal Equinox). Last cash Friday 65,018.95 +1.38% (FRED NIKKEI225). Next cash Thu Sep 24.',
        },
        {
          label: 'Hang Seng',
          value: hangSeng.toLocaleString('en-US'),
          dayPct: hangSengDayPct,
          note: 'Tuesday close 25,087.75 +45 / +0.18% (RTHK rounded 25,087 +0.2%). Summit week. Not a book ticker.',
        },
        {
          label: 'Shanghai Composite',
          value: shanghai.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: shanghaiDayPct,
          note: 'Tuesday close 3,952.13 +0.06% (RTHK / Yonhap Infomax / Eastmoney). Shenzhen Component 13,723 −0.05%.',
        },
        {
          label: 'Kospi',
          value: kospi.toLocaleString('en-US'),
          dayPct: kospiDayPct,
          note: 'Tuesday close 7,017.91 +10 / +0.15% (Businesskorea / RTHK). Gave back an early +2% surge. Not a holding.',
        },
        {
          label: 'FTSE 100',
          value: ftseSession.toLocaleString('en-US'),
          note: `Tuesday session ~10,747.56 at 13:06 UTC (Yahoo). Not a London close. Monday close was ${ftseMon.toLocaleString('en-US')} +${ftseMonDayPct}% (Bastille / Armenpress).`,
        },
        {
          label: 'DAX 40',
          value: daxSession.toLocaleString('en-US'),
          note: `Tuesday session ~25,736.64 at 13:06 UTC (Yahoo). Not a Frankfurt close. Monday close was ${daxMon.toLocaleString('en-US')} +${daxMonDayPct}%.`,
        },
        {
          label: 'CAC 40',
          value: cacSession.toLocaleString('en-US'),
          note: `Tuesday session ~8,182.55 at 13:06 UTC (Yahoo). Not a Paris close. Monday close was ${cacMon.toLocaleString('en-US')} +${cacMonDayPct}%.`,
        },
      ],
      commodities: [
        {
          label: 'WTI',
          value: `$${wtiSettle.toFixed(2)} Mon settle`,
          dayPct: wtiSettleDayPct,
          note: `Monday NYMEX Oct settle $95.78 −4.51% (WAM / Yonhap / MarketWatch). Tuesday session ~$${wtiSession.toFixed(2)} (Yahoo 09:20 ET). Session is not a settle.`,
        },
        {
          label: 'Brent',
          value: `$${brentSettle.toFixed(2)} Mon settle`,
          dayPct: brentSettleDayPct,
          note: `Monday Nov settle $100.34 −3.4% (WAM). Tuesday session ~$${brentSession.toFixed(2)} (Yahoo 09:20 ET).`,
        },
      ],
      rates: [
        {
          label: 'U.S. 10-year',
          value: `${tenYearMondaySession.toFixed(2)}% AP Mon session`,
          note: `AP Monday: fell to ${tenYearMondaySession.toFixed(2)}%. Official FRED DGS10 last is ${tenYearOfficialFri.toFixed(2)}% on 09/18. Official Monday par unread at this wake.`,
        },
        {
          label: 'BoJ overnight call',
          value: 'around 1.25%',
          note: 'Already voted 7–2. Effective Thu Sep 24. Tokyo cash also returns that morning.',
        },
      ],
      note: 'Tuesday GLOBAL: HK / Shanghai / Seoul closed. Tokyo holiday through Wednesday. Europe still in session. Oil Tuesday print is a session, not a NYMEX settle. USD/JPY unread this sitting — omitted.',
    },
    us: {
      indices: [
        {
          label: 'S&P 500',
          value: spxClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: spxDayPct,
          note: 'Monday cash (AP). AP: 0.4% under the record. Tuesday cash unread — NYSE opens 09:30 ET.',
        },
        {
          label: 'Nasdaq',
          value: nasdaqClose.toLocaleString('en-US'),
          dayPct: nasdaqDayPct,
          note: 'Monday record close (AP / Reuters). First record close since June 2 (Reuters). Tuesday unread.',
        },
        {label: 'Dow', value: dowClose.toLocaleString('en-US'), dayPct: dowDayPct, note: 'Monday (AP). Tuesday unread.'},
        {
          label: 'Russell 2000',
          value: russellClose.toLocaleString('en-US'),
          dayPct: russellDayPct,
          note: 'Monday (AP). Tuesday unread.',
        },
      ],
      sectors: [
        {
          label: 'Philadelphia Semiconductor',
          value: soxClose.toLocaleString('en-US'),
          dayPct: soxDayPct,
          note: 'Monday SOX +4.29% (Yahoo daily; Reuters said +4.3%). Chip bid under NVDA / VUG / MGK. Tuesday SOX unread.',
        },
        {
          label: 'Energy',
          note: 'Monday WTI settle $95.78 (−4.51%). Sector level unread — omitted.',
        },
      ],
      breadth: 'Monday breadth unread this sitting — omitted, not faked. Tuesday breadth unread.',
      yields: [
        {
          label: 'U.S. 10-year',
          value: `${tenYearMondaySession.toFixed(2)}% AP Mon session / ${tenYearOfficialFri.toFixed(2)}% FRED 09/18`,
          note: 'Friday official par is now sourced at 5.01% (FRED DGS10). Official Monday par still unread at 9:20 ET.',
        },
      ],
      note: 'Monday U.S. cash. AP YTD: S&P +13.4%. Do not invent a Tuesday pre-open. Nasdaq +2.26% was the record. The book’s growth sleeve moved with it.',
    },
    ca: {
      indices: [
        {
          label: 'S&P/TSX Composite',
          value: tsxClose.toLocaleString('en-US'),
          dayPct: tsxDayPct,
          note: 'Monday close 36,009.40 +202.75 / +0.57% (Reuters). Tech +2.96% (Reuters). Tuesday TSX unread — opens 09:30 ET.',
        },
      ],
      cadUsd: '1.4021 CAD per USD (BoC Valet FXUSDCAD daily average 2026-09-21). Tuesday average not posted yet.',
      note: 'Monday cash. Tuesday TSX closed until 09:30 ET. StatCan today is travel (July), not CPI. August CPI already printed Sep 14 at +3.0% y/y. BoC overnight still the last hold.',
    },
    calendar: {
      items: [
        {
          when: 'Tuesday 09:30 ET',
          where: 'US' as const,
          label: 'U.S. / CA cash open',
          why: 'Tuesday North American cash unread at this wake. Monday was a record Nasdaq. Do not add into the open.',
        },
        {
          when: 'Tuesday Sep 22',
          where: 'US' as const,
          label: 'Mac mini / Mac Studio in stores',
          why: 'Apple shop + MacRumors: available starting 9.22; same-day pickup in many stores. Local-AI Macs. Still a product calendar, not a quarter print. 512GB Studio later — late October.',
        },
        {
          when: 'Wed–Fri this week',
          where: 'GLOBAL' as const,
          label: 'Xi in Washington',
          why: 'RTHK: Xi arrives Wednesday for a visit through Friday. HK bid is not a book ticker. Do not invent a trade from the headline.',
        },
        {
          when: 'Thursday Sep 24',
          where: 'GLOBAL' as const,
          label: 'BoJ overnight call effective + Tokyo cash back',
          why: 'Already voted 7–2 around 1.25% (BoJ). Effective date, not a new vote. First Tokyo cash after Silver Week.',
        },
        {
          when: 'Oct 1',
          where: 'US' as const,
          label: 'NVIDIA dividend',
          why: 'IR: $0.25 payable Oct 1 (record Sep 10). Cash event, not a thesis change.',
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
      rating: 'HOLD — no add into the open',
      tone: 'watch' as const,
      role: 'Highest-beta AI line',
      whatMatters:
        'Monday cash $227.38 +2.30%. Q3 guide still $108.0B ±2%. SOX +4.29%. That is not a sourced add before Tuesday U.S. cash.',
    },
    {
      ticker: 'AAPL',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Recent purchase',
      whatMatters:
        'Monday $338.98 +0.85%. Mac mini / Studio are in stores today. Store date is not an add. You just bought it.',
    },
    {
      ticker: 'VOO',
      rating: 'CORE / ADD AFTER TUESDAY U.S. CASH',
      tone: 'long' as const,
      role: 'Best simple core',
      whatMatters: 'Monday $712.78 +1.57%. New core money still simplifies here — after the tape, not in the pre-open.',
    },
    {
      ticker: 'VTI',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Broad US',
      whatMatters: 'Monday $381.10 +1.51%. Excellent. Still overlaps VOO at the top.',
    },
    {
      ticker: 'VUG',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Growth sleeve',
      whatMatters: 'Monday $91.02 +2.56%. Moved with the Nasdaq record. You already own NVDA and AAPL directly.',
    },
    {
      ticker: 'MGK',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Mega-cap growth',
      whatMatters: 'Monday $93.33 +2.68%. Same stack, tighter. Do not feed it on a chip bid.',
    },
    {
      ticker: 'GDV',
      rating: 'HOLD — income / diversifier',
      tone: 'long' as const,
      role: 'Income sleeve',
      whatMatters: 'Monday $29.11 +0.55%. Different job. NAV unread this sitting — omitted.',
    },
  ],
  portfolio: {
    concentrationThesis: 'VOO + VTI + VUG + MGK + AAPL + NVDA keep buying the same companies.',
    concentrationBody:
      'Monday’s Nasdaq record and SOX +4.29% lit several Wealthsimple lines at once. That is the overlap, not a new thesis.',
    factorStack: ['NVDA', 'AAPL', 'MGK', 'VUG', 'VOO', 'VTI'],
    factorLabel: 'U.S. mega-cap / growth',
    overlapNote: 'same ecosystem',
  },
  names: [
    {
      ticker: 'NVDA',
      chapterTitle: 'NVDA · Monday’s bid is not an add',
      rating: 'HOLD — NO ADD INTO THE OPEN',
      tone: 'watch' as const,
      price: nvdaClose,
      dayPct: nvdaDayPct,
      holdNote: 'Monday close $227.38. Q3 guide still $108.0B ±2%. Do not chase SOX into Tuesday’s open.',
      streak: [-0.03, -3.36, 0.57, 0.82, 2.54, 1.34, 2.3],
      streakHeadline: 'Seven sourced sessions. Four green after a −3.36% gap. Not a collapse. Not an add signal.',
      streakNote:
        'Yahoo daily closes Sep 11 → Sep 21. Last seven day-changes only. Do not invent a longer grid.',
      fundamentals: [
        {label: 'Q2 revenue', value: `$${nvdaQ2Rev.toFixed(1)}B  +106% y/y`},
        {label: 'Data Center', value: `$${nvdaDcRev.toFixed(1)}B  +117% y/y`},
        {label: 'Q3 guide', value: `$${nvdaQ3Guide.toFixed(1)}B ±2%`},
        {label: 'Q3 GM guide', value: '74.0% ±50 bp'},
        {label: 'Dividend', value: '$0.25  pay Oct 1'},
      ],
      consensus: {
        rows: [
          {label: 'Q3 revenue guide', value: '$108.0B ±2%'},
          {label: 'Q3 GM guide', value: '74.0% ±50 bp'},
          {label: 'China DC compute in guide', value: 'none assumed'},
        ],
        note: 'IR / SEC from the Aug 26 print. Unchanged this sitting. Whisper unread — omitted.',
        range: {metric: 'Q3 revenue guide', unit: 'B', guide: nvdaQ3Guide, low: 105.84, high: 110.16},
      },
      narrative: {
        leftTitle: 'THE BID',
        leftHeadline: 'Monday SOX +4.3%. NVDA +2.30%. Nasdaq record.',
        leftBody:
          'Reuters: AMD, Intel, Arm led the tape. Meta +11.4% on Muse. That is a chip session, not a new NVDA filing.',
        rightTitle: 'THE HOLD',
        rightHeadline: 'Q3 guide is still $108.0B ±2%. No China DC compute in the outlook.',
        rightBody:
          'IR: $96.2B Q2 / $89.0B Data Center. Third-party capital still named. A Monday close is not a sourced add.',
      },
      interpretation: {
        chips: [
          {label: 'CONFIRMED', tone: 'long' as const, text: 'Q3 guide still $108.0B ±2% (NVIDIA IR).'},
          {label: 'CONFIRMED', tone: 'watch' as const, text: 'Monday cash $227.38 +2.30% on a record Nasdaq / SOX +4.29%.'},
          {
            label: 'INFERENCE',
            tone: 'caution' as const,
            text: 'A one-day chip bid after oil and yields eased is not a reason to stack more mega-cap growth.',
          },
        ],
        note: 'No composite score. Missing inputs stay UNKNOWN.',
      },
      actionMatrix: {
        headline: 'HOLD. No add into Tuesday’s open.',
        rows: [
          {
            tone: 'long' as const,
            if: 'Tuesday U.S. cash holds Monday without a chip crash',
            then: 'HOLD. New core money can go to VOO after the tape.',
          },
          {
            tone: 'watch' as const,
            if: 'Chips gap up after Monday SOX and the Nasdaq record',
            then: 'HOLD. Do not chase Monday’s NVDA close.',
          },
          {
            tone: 'caution' as const,
            if: 'Official 10-year stays near 5% and NVDA gives back Monday',
            then: 'Do not automatically buy the dip',
          },
          {
            tone: 'short' as const,
            if: 'Oil session keeps sliding and the overlap reprices harder',
            then: 'Do not average down on the headline. Re-read, then decide.',
          },
        ],
      },
      network: {
        title: 'NVDA · qualitative demand chain',
        headline: 'Polarity from IR + Monday cash + Tuesday Asia. No composite score.',
        nodes: [
          {id: 'labs', label: 'GPU demand', polarity: 'confirmed' as const, x: 0.08, y: 0.22},
          {
            id: 'demand',
            label: 'AI factory build',
            polarity: 'confirmed' as const,
            x: 0.3,
            y: 0.22,
            evidence: 'Q3 guide $108B ±2%',
          },
          {
            id: 'oil',
            label: 'WTI Mon settle',
            polarity: 'inference' as const,
            x: 0.5,
            y: 0.22,
            evidence: '$95.78 −4.51%',
          },
          {id: 'financing', label: 'Third-party capital', polarity: 'concern' as const, x: 0.3, y: 0.78},
          {id: 'nvda', label: 'NVDA', polarity: 'neutral' as const, x: 0.62, y: 0.5},
          {id: 'sox', label: 'SOX Mon', polarity: 'confirmed' as const, x: 0.82, y: 0.18, evidence: '+4.29%'},
          {id: 'margins', label: 'GM guide 74%', polarity: 'inference' as const, x: 0.82, y: 0.5},
          {
            id: 'rates',
            label: '10-year 4.95%',
            polarity: 'concern' as const,
            x: 0.82,
            y: 0.82,
            evidence: 'AP Mon session',
          },
          {id: 'valuation', label: 'Monday close', polarity: 'inference' as const, x: 0.94, y: 0.5},
        ],
        edges: [
          {from: 'labs', to: 'demand'},
          {from: 'demand', to: 'nvda'},
          {from: 'oil', to: 'rates'},
          {from: 'sox', to: 'nvda'},
          {from: 'financing', to: 'nvda', label: 'exposure'},
          {from: 'nvda', to: 'margins'},
          {from: 'rates', to: 'valuation'},
          {from: 'margins', to: 'valuation'},
        ],
      },
    },
    {
      ticker: 'AAPL',
      chapterTitle: 'AAPL · store date is not an add',
      rating: 'HOLD',
      tone: 'long' as const,
      price: aaplClose,
      dayPct: aaplDayPct,
      holdNote: 'Monday close $338.98. You just bought it. Store date today is not an add.',
      catalyst: {
        headline: 'Mac mini / Studio in stores today (Apple shop: Available starting 9.22).',
        steps: [
          'Local-AI Macs dated Sep 22',
          'MacRumors: same-day pickup in many stores',
          'That is a product calendar, not a quarter beat',
          '512GB Studio is late October, not today',
        ],
        note: 'Store date is sourced. A Monday Nasdaq record is not a reason to add AAPL.',
      },
      action: {
        headline: 'HOLD the position.',
        body: 'Do not add AAPL into the open. Next contribution should diversify, not stack the same name.',
      },
    },
    {
      ticker: 'VOO',
      chapterTitle: 'VOO · still the simple core',
      rating: 'CORE / ADD AFTER TUESDAY U.S. CASH',
      tone: 'long' as const,
      price: vooClose,
      dayPct: vooDayPct,
      metrics: [{label: 'Monday close', value: `$${vooClose.toFixed(2)} +${vooDayPct}%`}],
      copy: {
        headline: 'Best simple core. New core money waits for the U.S. tape, then simplifies here.',
        body: 'Do not sell. Do not split the next contribution with VTI. Do not add in the pre-open.',
      },
    },
    {
      ticker: 'VTI',
      chapterTitle: 'VTI · excellent, overlapping',
      rating: 'HOLD',
      tone: 'long' as const,
      price: vtiClose,
      dayPct: vtiDayPct,
      metrics: [{label: 'Monday close', value: `$${vtiClose.toFixed(2)} +${vtiDayPct}%`}],
      copy: {
        headline: 'Excellent. Mega-caps still dominate, so the top looks like VOO.',
        body: 'Do not sell. The overlap with VOO is the issue — not the fund quality.',
      },
    },
    {
      ticker: 'VUG',
      chapterTitle: 'VUG · growth sleeve, already owned elsewhere',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      price: vugClose,
      dayPct: vugDayPct,
      metrics: [{label: 'Monday close', value: `$${vugClose.toFixed(2)} +${vugDayPct}%`}],
      copy: {
        headline: 'You already own NVDA and AAPL directly.',
        body: 'HOLD existing. No priority additions. Holding YTD vs S&P unread this sitting — omitted, not faked.',
      },
    },
    {
      ticker: 'MGK',
      chapterTitle: 'MGK · same stack, tighter',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      price: mgkClose,
      dayPct: mgkDayPct,
      metrics: [{label: 'Monday close', value: `$${mgkClose.toFixed(2)} +${mgkDayPct}%`}],
      copy: {
        body: 'More mega-cap than VUG. You already own the names. HOLD. Stop feeding it. Not a sell call — tax lots unread.',
      },
    },
    {
      ticker: 'GDV',
      chapterTitle: 'GDV · a different job',
      rating: 'HOLD · INCOME / DIVERSIFIER',
      tone: 'long' as const,
      price: gdvClose,
      dayPct: gdvDayPct,
      metrics: [{label: 'Monday market', value: `$${gdvClose.toFixed(2)} +${gdvDayPct}%`}],
      copy: {
        body: 'Closed-end income/value. NAV unread this sitting — omitted, not faked. When growth gets punched, this sleeve is supposed to look different. Not Next-NVDA.',
      },
    },
  ],
  nextNvda: [],
  unknowns: [
    {
      id: 'weights',
      area: 'book' as const,
      question: 'What is each line’s weight in the book?',
      whyItMatters: 'Concentration stays qualitative until weights exist.',
      neededToKnow: 'Sourced account weights. Do not estimate from prices.',
      status: 'unknown' as const,
    },
    {
      id: 'treasury-par-monday',
      area: 'US' as const,
      question: 'What is the official Treasury par 10-year for 2026-09-21?',
      whyItMatters:
        'AP said the yield fell to 4.95% Monday. FRED DGS10 last official is now 5.01% on 09/18. A session quote is not the Monday par row.',
      neededToKnow: 'Treasury TextView / H.15 / FRED DGS10 row dated 09/21.',
      status: 'partial' as const,
    },
    {
      id: 'tuesday-na-cash',
      area: 'US' as const,
      question: 'Where did U.S. and TSX cash print on Tuesday?',
      whyItMatters: 'This wake is 09:20 ET. NYSE / TSX open 09:30. Monday is not a Tuesday close.',
      neededToKnow: 'Sourced Tuesday cash closes after the session — not a pre-open.',
      status: 'unknown' as const,
    },
    {
      id: 'holding-ytd',
      area: 'book' as const,
      question: 'What is each line’s YTD versus the S&P?',
      whyItMatters: 'S&P YTD +13.4% is sourced (AP Monday). Name YTD unread — a copied August figure would be a lie.',
      neededToKnow: 'Sourced YTD prints for NVDA, AAPL, VOO, VTI, VUG, MGK, GDV.',
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
    existingPortfolio: 'HOLD — sell nothing into the open.',
    freshCapital: 'No add before Tuesday U.S. cash. New core money simplifies into VOO after the tape, not in the pre-open.',
    bestAdd: 'VOO — after Tuesday U.S. cash, not this open',
    highestUpsideWatch: 'none named',
    biggestRisk:
      'Mega-cap growth overlap across NVDA, AAPL, MGK, VUG, VOO, VTI — plus a 10-year still near 5% official on Friday after a Fed hike and a BoJ hike the same week',
    nextTrigger:
      'Tuesday 09:30 ET — U.S. / CA cash. Official Monday 10-year still due. Mac mini / Studio in stores today. BoJ call effective Thu Sep 24.',
    ifThen: [
      {
        tone: 'long' as const,
        if: 'Tuesday U.S. cash holds Monday without a chip crash',
        then: 'HOLD names. New core money can go to VOO.',
      },
      {
        tone: 'watch' as const,
        if: 'Chips gap up after Monday SOX and the Nasdaq record',
        then: 'HOLD. Do not chase Monday’s NVDA close.',
      },
      {
        tone: 'caution' as const,
        if: 'Official 10-year stays near 5% and growth gives back Monday',
        then: 'Do not buy the dip. Wait for a second tape.',
      },
      {
        tone: 'short' as const,
        if: 'Oil session keeps sliding and the overlap reprices harder',
        then: 'Do not average into NVDA/MGK/VUG on the headline.',
      },
    ],
  },
  risks: [
    {
      n: '01',
      title: 'Growth-factor concentration',
      body: 'NVDA + AAPL + MGK + VUG + VOO + VTI repeatedly own the same mega-cap ecosystem. Monday’s record Nasdaq made that visible again.',
    },
    {
      n: '02',
      title: 'Interest rates',
      body: `AP Monday: 10-year fell to ${tenYearMondaySession.toFixed(2)}%. Official Friday par is now ${tenYearOfficialFri.toFixed(2)}% (FRED DGS10 09/18). Official Monday par unread. Long rates still compress the exact overweight.`,
    },
    {
      n: '03',
      title: 'Oil into inflation into the Fed',
      body: `Monday WTI settle $95.78 (−4.51%). Tuesday session ~$${wtiSession.toFixed(2)} is not a settle. The Fed statement still says inflation remains elevated.`,
    },
  ],
  close: {
    kicker: 'DIAGNOSTIC',
    headline: 'Monday printed. Tokyo is still shut. Do not chase the chip close.',
    body: 'Same seven lines. Same overlap. Nasdaq made a record. HK and Seoul are not a Wealthsimple ticket. Sell nothing. If fresh capital arrives after Tuesday U.S. cash, it still wants VOO first.',
    pills: [
      {tone: 'watch' as const, label: 'HOLD INTO THE OPEN'},
      {tone: 'caution' as const, label: 'NO CHASE ON MONDAY CHIPS'},
      {tone: 'long' as const, label: 'VOO AFTER U.S. CASH'},
    ],
    followThrough: [
      {
        tone: 'watch' as const,
        if: 'Chips bid and the book still looks expensive versus VOO',
        then: 'Keep the overlap. Do not add NVDA, VUG, or MGK.',
      },
      {
        tone: 'caution' as const,
        if: 'Oil session and the 10-year start hitting growth again',
        then: 'More VOO / cash / non-AI quality. Do not average the sleeve.',
      },
      {
        tone: 'long' as const,
        if: 'An asymmetric candidate is named by Evens or a filing',
        then: 'That is when the Next-NVDA sleeve gets a name.',
      },
    ],
  },
  tickerTape: [
    `SPX ${spxClose.toLocaleString('en-US')}  +${spxDayPct}% MON`,
    `SPX YTD  +${spxYtdPct}%`,
    `NASDAQ  ${nasdaqClose.toLocaleString('en-US')}  +${nasdaqDayPct}% RECORD`,
    `NVDA  $${nvdaClose.toFixed(2)}  +${nvdaDayPct}%`,
    `AAPL  $${aaplClose.toFixed(2)}  +${aaplDayPct}%`,
    `SOX  +${soxDayPct}% MON`,
    `10Y  ${tenYearMondaySession}% AP / ${tenYearOfficialFri}% FRED 9/18`,
    `TSX  ${tsxClose.toLocaleString('en-US')}  +${tsxDayPct}%`,
    `HSI  ${hangSeng.toLocaleString('en-US')}  +${hangSengDayPct}%`,
    `WTI SETTLE  $${wtiSettle.toFixed(2)}  ${wtiSettleDayPct}%`,
    `TOKYO SHUT THRU WED`,
    `MAC STORES TODAY`,
    `VOO AFTER TUESDAY CASH`,
    `SELL NOTHING INTO THE OPEN`,
  ],
};

export const episode: DailyReport = parseDailyReport(raw);
