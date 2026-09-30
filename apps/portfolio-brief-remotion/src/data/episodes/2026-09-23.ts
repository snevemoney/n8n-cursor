import {vsSpxSpread} from '../compute';
import {parseDailyReport, type DailyReport} from '../schema';

const nvdaClose = 228.87;
const nvdaDayPct = 0.66;
const nvdaYtd = 23.01;
const aaplClose = 339.75;
const aaplDayPct = 0.23;
const aaplYtd = 25.31;
const aaplY1 = 33.16;
const vooClose = 712.78;
const vooDayPct = 0;
const vooYtd = 14.36;
const vtiClose = 381.27;
const vtiDayPct = 0.04;
const vtiYtd = 14.36;
const vugClose = 91.12;
const vugDayPct = 0.11;
const vugYtd = 12.19;
const mgkClose = 93.52;
const mgkDayPct = 0.2;
const mgkYtd = 13.27;
const gdvClose = 29.14;
const gdvDayPct = 0.1;
const gdvYtd = 9.93;
const spxClose = 7764.64;
const spxDayPct = 0;
const spxYtdPct = 13.4;
const nasdaqClose = 27244.28;
const nasdaqDayPct = 0.45;
const dowClose = 51863.69;
const dowDayPct = -0.36;
const russellClose = 2889.92;
const russellDayPct = 0.5;
const soxClose = 12689.82;
const soxDayPct = 2.06;
const tenYearOfficial = 4.96;
const nikkei = 65018.95;
const nikkeiDayPct = 1.38;
const hangSeng = 24834.12;
const hangSengDayPct = -1.01;
const shanghai = 3936.52;
const shanghaiDayPct = -0.39;
const kospi = 7080.92;
const kospiDayPct = 0.9;
const ftseTue = 10708.33;
const ftseTueDayPct = -0.29;
const daxTue = 25578.85;
const daxTueDayPct = 0.02;
const cacTue = 8154.91;
const cacTueDayPct = 0.2;
const ftseSession = 10706.11;
const daxSession = 25429.62;
const cacSession = 8132.69;
const tsxClose = 36335.61;
const tsxDayPct = 0.91;
const brentSettle = 99.25;
const brentSettleDayPct = -1.09;
const nvdaQ2Rev = 96.2;
const nvdaDcRev = 89.0;
const nvdaQ3Guide = 108.0;

const raw = {
  meta: {
    date: '2026-09-23',
    dateLabel: 'SEP 23, 2026',
    title: 'Daily Wealth Intelligence',
    thesis:
      'Tuesday U.S. cash printed a split tape. Nasdaq made a second record. The S&P was flat. The book barely moved. Do not add into Wednesday’s open.',
    thesisLead: 'Tuesday cash was a split tape.',
    thesisAccent: 'Do not add into the open.',
    catalyst:
      'U.S. and TSX cash open in minutes. Official Tuesday 10-year still unread. Tokyo still shut. Xi is in Washington this week.',
    kicker:
      'Wednesday 9:11 America/Toronto. Last North American cash is Tuesday. Tokyo holiday through today. HK, Shanghai, and Seoul closed. Europe is in session.',
    universe: ['AAPL', 'NVDA', 'VOO', 'VTI', 'VUG', 'MGK', 'GDV'],
  },
  market: {
    spxClose,
    spxDayPct,
    spxYtdPct,
    nasdaqDayPct,
    tenYearYield: tenYearOfficial,
    note: 'Tuesday U.S. cash: S&P 7,764.64 −0.06 points / flat (AP / Yahoo). Nasdaq 27,244.28 +0.45% — second record (AP). Official FRED DGS10 last is 4.96% on 09/21. NVDA Tuesday $228.87 +0.66%.',
    nextCalendar: {
      label: 'U.S. / CA cash open',
      detail: 'Wednesday cash unread — NYSE / TSX open 09:30 ET. BoJ call effective Thu Sep 24. Tokyo cash also returns Thursday.',
    },
  },
  markets: {
    global: {
      indices: [
        {
          label: 'Nikkei 225',
          value: nikkei.toLocaleString('en-US'),
          dayPct: nikkeiDayPct,
          note: 'Tokyo cash shut Mon–Wed (Respect for the Aged Day, Citizens’ Holiday, Autumnal Equinox). Last cash Friday 65,018.95 +1.38% (FRED NIKKEI225, prior tape). Next cash Thu Sep 24.',
        },
        {
          label: 'Hang Seng',
          value: hangSeng.toLocaleString('en-US'),
          dayPct: hangSengDayPct,
          note: 'Wednesday close 24,834.12 −253.63 / −1.01% (Yonhap Infomax / The Standard). First close under 25,000 this week. Not a book ticker.',
        },
        {
          label: 'Shanghai Composite',
          value: shanghai.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: shanghaiDayPct,
          note: 'Wednesday close 3,936.52 −0.39% (Yonhap Infomax / GMT Eight). Shenzhen Component 13,636.07 −0.64%.',
        },
        {
          label: 'Kospi',
          value: kospi.toLocaleString('en-US'),
          dayPct: kospiDayPct,
          note: 'Wednesday close 7,080.92 +63.01 / +0.90% (Korea Times / Digital Today / MBN). Last cash before Chuseok. Not a holding.',
        },
        {
          label: 'FTSE 100',
          value: ftseSession.toLocaleString('en-US'),
          note: `Wednesday session ~10,706.11 −0.02% at 13:58 GMT+1 (Yahoo). Not a London close. Tuesday close was ${ftseTue.toLocaleString('en-US')} ${ftseTueDayPct}% (Bastille / Armenpress).`,
        },
        {
          label: 'DAX 40',
          value: daxSession.toLocaleString('en-US'),
          note: `Wednesday session ~25,429.62 −0.58% at 14:56 GMT+2 (Yahoo). Not a Frankfurt close. Tuesday close was ${daxTue.toLocaleString('en-US')} +${daxTueDayPct}%.`,
        },
        {
          label: 'CAC 40',
          value: cacSession.toLocaleString('en-US'),
          note: `Wednesday session ~8,132.69 −0.27% at 14:58 GMT+2 (Yahoo). Not a Paris close. Tuesday close was ${cacTue.toLocaleString('en-US')} +${cacTueDayPct}%.`,
        },
      ],
      commodities: [
        {
          label: 'Brent',
          value: `$${brentSettle.toFixed(2)} Tue settle`,
          dayPct: brentSettleDayPct,
          note: 'Tuesday Nov settle $99.25 −$1.09 / −1.09% (AP / FinancialJuice). First settle under $100 since Sep 8 (Gate).',
        },
        {
          label: 'WTI',
          note: 'Tuesday NYMEX settle unread this sitting — two wires disagreed on the print. Omitted, not faked. AP confirmed Brent only.',
        },
      ],
      rates: [
        {
          label: 'U.S. 10-year',
          value: `${tenYearOfficial.toFixed(2)}% FRED 09/21`,
          note: `Official FRED DGS10 last is ${tenYearOfficial.toFixed(2)}% on 09/21 (updated Sep 22). Official Tuesday par unread at this wake. AP Tuesday: yields held relatively steady.`,
        },
        {
          label: 'BoJ overnight call',
          value: 'around 1.25%',
          note: 'Already voted 7–2 on Sep 18 (BoJ). Effective Thu Sep 24. Tokyo cash also returns that morning.',
        },
      ],
      note: 'Wednesday GLOBAL: HK / Shanghai / Seoul closed. Tokyo holiday through today. Europe still in session. WTI Tuesday settle omitted. USD/JPY unread this sitting — omitted.',
    },
    us: {
      indices: [
        {
          label: 'S&P 500',
          value: spxClose.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          dayPct: spxDayPct,
          note: 'Tuesday cash (AP / Yahoo). −0.06 points / flat. AP: 0.4% under the August record. Wednesday cash unread — NYSE opens 09:30 ET.',
        },
        {
          label: 'Nasdaq',
          value: nasdaqClose.toLocaleString('en-US'),
          dayPct: nasdaqDayPct,
          note: 'Tuesday second record close (AP / ADVFN). +122.18. AP rounded the day to +0.5%. Wednesday unread.',
        },
        {label: 'Dow', value: dowClose.toLocaleString('en-US'), dayPct: dowDayPct, note: 'Tuesday (AP). Wednesday unread.'},
        {
          label: 'Russell 2000',
          value: russellClose.toLocaleString('en-US'),
          dayPct: russellDayPct,
          note: 'Tuesday +14.56 / +0.5% (AP). Wednesday unread.',
        },
      ],
      sectors: [
        {
          label: 'Philadelphia Semiconductor',
          value: soxClose.toLocaleString('en-US'),
          dayPct: soxDayPct,
          note: 'Tuesday SOX +2.06% (Yahoo). Sixth green session on the prior tape’s count is not re-sourced here — day print only. Chip bid still under NVDA / VUG / MGK.',
        },
        {
          label: 'Energy',
          note: 'Tuesday Brent settle $99.25 (−1.09%). WTI settle unread. Sector level unread — omitted.',
        },
      ],
      breadth: 'Tuesday breadth unread this sitting — omitted, not faked. Wednesday breadth unread.',
      yields: [
        {
          label: 'U.S. 10-year',
          value: `${tenYearOfficial.toFixed(2)}% FRED 09/21`,
          note: 'Official Tuesday par still unread at 9:11 ET. AP Tuesday: yields held relatively steady.',
        },
      ],
      note: 'Tuesday U.S. cash. AP YTD: S&P +13.4%. Yahoo YTD +13.43%. Do not invent a Wednesday pre-open as cash. Nasdaq +0.45% was the second record. The book’s growth sleeve barely moved.',
    },
    ca: {
      indices: [
        {
          label: 'S&P/TSX Composite',
          value: tsxClose.toLocaleString('en-US'),
          dayPct: tsxDayPct,
          note: 'Tuesday close 36,335.61 +326.21 / +0.91% (Yahoo). Wednesday TSX unread — opens 09:30 ET.',
        },
      ],
      cadUsd: '1.4064 CAD per USD (BoC Valet FXUSDCAD daily average 2026-09-22). Reuters Tuesday session 1.4075 is not the official average.',
      note: 'Tuesday cash. Wednesday TSX closed until 09:30 ET. BoC overnight still the last hold. Official Tuesday CAD is 1.4064.',
    },
    calendar: {
      items: [
        {
          when: 'Wednesday 09:30 ET',
          where: 'US' as const,
          label: 'U.S. / CA cash open',
          why: 'Wednesday North American cash unread at this wake. Tuesday was a second Nasdaq record and a flat S&P. Do not add into the open.',
        },
        {
          when: 'Wed–Fri this week',
          where: 'GLOBAL' as const,
          label: 'Xi in Washington',
          why: 'AP / WTOP: Xi starts a state visit Wednesday. HK sold AI names on a separate Beijing probe headline. Not a book ticker. Do not invent a trade from the visit.',
        },
        {
          when: 'Thursday Sep 24',
          where: 'GLOBAL' as const,
          label: 'BoJ overnight call effective + Tokyo cash back',
          why: 'Already voted 7–2 around 1.25% (BoJ Sep 18). Effective date, not a new vote. First Tokyo cash after Silver Week.',
        },
        {
          when: 'Oct 1',
          where: 'US' as const,
          label: 'NVIDIA dividend',
          why: 'IR: $0.25 payable Oct 1 (record Sep 10). Cash event, not a thesis change.',
        },
        {
          when: 'Oct 29 / Nov 17',
          where: 'US' as const,
          label: 'AAPL then NVDA earnings dates',
          why: 'Yahoo dated AAPL Oct 29 and NVDA Nov 17. Dates only. No new guide this sitting.',
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
        'Tuesday cash $228.87 +0.66%. Q3 guide still $108.0B ±2%. SOX +2.06%. That is not a sourced add before Wednesday U.S. cash.',
      ytd: nvdaYtd,
    },
    {
      ticker: 'AAPL',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Recent purchase',
      whatMatters:
        'Tuesday $339.75 +0.23%. Mac mini / Studio launched yesterday. Store date is not an add. You just bought it.',
      ytd: aaplYtd,
    },
    {
      ticker: 'VOO',
      rating: 'CORE / ADD AFTER WEDNESDAY U.S. CASH',
      tone: 'long' as const,
      role: 'Best simple core',
      whatMatters: 'Tuesday $712.78 unchanged. New core money still simplifies here — after the tape, not in the pre-open.',
      ytd: vooYtd,
    },
    {
      ticker: 'VTI',
      rating: 'HOLD',
      tone: 'long' as const,
      role: 'Broad US',
      whatMatters: 'Tuesday $381.27 +0.04%. Excellent. Still overlaps VOO at the top.',
      ytd: vtiYtd,
      overlapWith: ['VOO'],
    },
    {
      ticker: 'VUG',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Growth sleeve',
      whatMatters: 'Tuesday $91.12 +0.11%. Trailing S&P YTD. You already own NVDA and AAPL directly.',
      ytd: vugYtd,
      overlapWith: ['NVDA', 'AAPL', 'VOO', 'MGK'],
    },
    {
      ticker: 'MGK',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      role: 'Mega-cap growth',
      whatMatters: 'Tuesday $93.52 +0.20%. Same stack, tighter. Do not feed it on a chip bid.',
      ytd: mgkYtd,
      overlapWith: ['NVDA', 'AAPL', 'VUG', 'VOO'],
    },
    {
      ticker: 'GDV',
      rating: 'HOLD — income / diversifier',
      tone: 'long' as const,
      role: 'Income sleeve',
      whatMatters: 'Tuesday $29.14 +0.10%. Different job. Yahoo YTD +9.93%. NAV unread this sitting — omitted.',
      ytd: gdvYtd,
    },
  ],
  portfolio: {
    concentrationThesis: 'VOO + VTI + VUG + MGK + AAPL + NVDA keep buying the same companies.',
    concentrationBody:
      'Tuesday’s second Nasdaq record and SOX +2.06% still light the same Wealthsimple lines. The S&P was flat. That is the overlap, not a new thesis.',
    factorStack: ['NVDA', 'AAPL', 'MGK', 'VUG', 'VOO', 'VTI'],
    factorLabel: 'U.S. mega-cap / growth',
    overlapNote: 'same ecosystem',
  },
  names: [
    {
      ticker: 'NVDA',
      chapterTitle: 'NVDA · Tuesday’s print is not an add',
      rating: 'HOLD — NO ADD INTO THE OPEN',
      tone: 'watch' as const,
      price: nvdaClose,
      dayPct: nvdaDayPct,
      holdNote: 'Tuesday close $228.87. Q3 guide still $108.0B ±2%. Do not chase SOX into Wednesday’s open.',
      streak: [2.3, 0.66],
      streakHeadline: 'Two sourced sessions this sitting. Monday +2.30%, Tuesday +0.66%. Not a collapse. Not an add signal.',
      streakNote: 'Yahoo daily closes Sep 21 → Sep 22 only. Do not invent a longer grid.',
      fundamentals: [
        {label: 'Q2 revenue', value: `$${nvdaQ2Rev.toFixed(1)}B  +106% y/y`},
        {label: 'Data Center', value: `$${nvdaDcRev.toFixed(1)}B  +117% y/y`},
        {label: 'Q3 guide', value: `$${nvdaQ3Guide.toFixed(1)}B ±2%`},
        {label: 'Q3 GM guide', value: '74.0% ±50 bp'},
        {label: 'Dividend', value: '$0.25  pay Oct 1'},
      ],
      vsSpx: {
        headline: 'Beating the S&P YTD is not a reason to add before Wednesday cash.',
        bars: [
          {label: 'NVDA YTD', pct: nvdaYtd, tone: 'nvda' as const},
          {label: 'S&P YTD', pct: 13.43, tone: 'muted' as const},
        ],
        note: `Spread: ${vsSpxSpread(nvdaYtd, 13.43) >= 0 ? '+' : ''}${vsSpxSpread(nvdaYtd, 13.43).toFixed(2)} points (NVDA YTD − S&P YTD, Yahoo as of 9/22). Two YTD scalars only — no invented daily path.`,
      },
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
        leftTitle: 'THE TAPE',
        leftHeadline: 'Tuesday SOX +2.06%. NVDA +0.66%. Nasdaq second record.',
        leftBody:
          'Yahoo: NVDA $228.87 on 93.3M shares. Premarket 9:13 ET was $227.60 −0.56% — session, not cash. That is a chip session, not a new NVDA filing.',
        rightTitle: 'THE HOLD',
        rightHeadline: 'Q3 guide is still $108.0B ±2%. No China DC compute in the outlook.',
        rightBody:
          'IR: $96.2B Q2 / $89.0B Data Center. Next dated print is Nov 17 (Yahoo). A Tuesday close is not a sourced add.',
      },
      interpretation: {
        chips: [
          {label: 'CONFIRMED', tone: 'long' as const, text: 'Q3 guide still $108.0B ±2% (NVIDIA IR).'},
          {
            label: 'CONFIRMED',
            tone: 'watch' as const,
            text: 'Tuesday cash $228.87 +0.66% on a second Nasdaq record / SOX +2.06%.',
          },
          {
            label: 'INFERENCE',
            tone: 'caution' as const,
            text: 'A quiet follow-through after Monday’s chip bid is not a reason to stack more mega-cap growth.',
          },
        ],
        note: 'No composite score. Missing inputs stay UNKNOWN.',
      },
      actionMatrix: {
        headline: 'HOLD. No add into Wednesday’s open.',
        rows: [
          {
            tone: 'long' as const,
            if: 'Wednesday U.S. cash holds Tuesday without a chip crash',
            then: 'HOLD. New core money can go to VOO after the tape.',
          },
          {
            tone: 'watch' as const,
            if: 'Chips gap after the second Nasdaq record',
            then: 'HOLD. Do not chase Tuesday’s NVDA close.',
          },
          {
            tone: 'caution' as const,
            if: 'Official 10-year stays near 5% and NVDA gives back Tuesday',
            then: 'Do not automatically buy the dip',
          },
          {
            tone: 'short' as const,
            if: 'The overlap reprices harder while the S&P stays flat',
            then: 'Do not average down on the headline. Re-read, then decide.',
          },
        ],
      },
      network: {
        title: 'NVDA · qualitative demand chain',
        headline: 'Polarity from IR + Tuesday cash + Wednesday Asia. No composite score.',
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
            label: 'Brent Tue settle',
            polarity: 'inference' as const,
            x: 0.5,
            y: 0.22,
            evidence: '$99.25 −1.09%',
          },
          {id: 'financing', label: 'Third-party capital', polarity: 'concern' as const, x: 0.3, y: 0.78},
          {id: 'nvda', label: 'NVDA', polarity: 'neutral' as const, x: 0.62, y: 0.5},
          {id: 'sox', label: 'SOX Tue', polarity: 'confirmed' as const, x: 0.82, y: 0.18, evidence: '+2.06%'},
          {id: 'margins', label: 'GM guide 74%', polarity: 'inference' as const, x: 0.82, y: 0.5},
          {
            id: 'rates',
            label: '10-year 4.96%',
            polarity: 'concern' as const,
            x: 0.82,
            y: 0.82,
            evidence: 'FRED 09/21',
          },
          {id: 'valuation', label: 'Tuesday close', polarity: 'inference' as const, x: 0.94, y: 0.5},
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
      chapterTitle: 'AAPL · yesterday’s store date is not an add',
      rating: 'HOLD',
      tone: 'long' as const,
      price: aaplClose,
      dayPct: aaplDayPct,
      holdNote: 'Tuesday close $339.75. You just bought it. Store date was yesterday. Not an add.',
      returns: {
        headline: 'Beating the S&P YTD. Two sourced bars only — no invented 6-month path.',
        bars: [
          {label: 'YTD', pct: aaplYtd, tone: 'long' as const},
          {label: 'S&P YTD', pct: 13.43, tone: 'muted' as const},
          {label: '1 year', pct: aaplY1, tone: 'gold' as const},
        ],
        note: `Spread vs S&P YTD: ${vsSpxSpread(aaplYtd, 13.43) >= 0 ? '+' : ''}${vsSpxSpread(aaplYtd, 13.43).toFixed(2)} points (Yahoo as of 9/22).`,
      },
      catalyst: {
        headline: 'Mac mini / Studio launched Tuesday (MacRumors / Apple Newsroom: available starting Sep 22).',
        steps: [
          'Local-AI Macs dated Sep 22',
          'That is a product calendar, not a quarter beat',
          '512GB Studio is late October, not this week',
          'Next dated earnings: Oct 29 (Yahoo)',
        ],
        note: 'Store date is sourced. A Tuesday Nasdaq record is not a reason to add AAPL.',
      },
      action: {
        headline: 'HOLD the position.',
        body: 'Do not add AAPL into the open. Next contribution should diversify, not stack the same name.',
      },
    },
    {
      ticker: 'VOO',
      chapterTitle: 'VOO · still the simple core',
      rating: 'CORE / ADD AFTER WEDNESDAY U.S. CASH',
      tone: 'long' as const,
      price: vooClose,
      dayPct: vooDayPct,
      metrics: [
        {label: 'Tuesday close', value: `$${vooClose.toFixed(2)} unchanged`},
        {label: 'YTD', value: `+${vooYtd.toFixed(2)}% (Yahoo as of 9/21)`},
      ],
      copy: {
        headline: 'Best simple core. New core money waits for the U.S. tape, then simplifies here.',
        body: 'Tuesday matched Monday’s $712.78. Do not sell. Do not split the next contribution with VTI. Do not add in the pre-open.',
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
        {label: 'Tuesday close', value: `$${vtiClose.toFixed(2)} +${vtiDayPct}%`},
        {label: 'YTD', value: `+${vtiYtd.toFixed(2)}% (Yahoo as of 9/21)`},
      ],
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
      returns: {
        headline: 'Despite the growth label, VUG is still behind the S&P YTD — and you already own the individual winners.',
        bars: [
          {label: 'VUG YTD', pct: vugYtd, tone: 'watch' as const},
          {label: 'S&P YTD', pct: 13.43, tone: 'long' as const},
        ],
        note: 'Yahoo YTD as of 9/21. Two scalars only. Action: HOLD existing. No priority additions.',
      },
    },
    {
      ticker: 'MGK',
      chapterTitle: 'MGK · same stack, tighter',
      rating: 'HOLD / no priority add',
      tone: 'watch' as const,
      price: mgkClose,
      dayPct: mgkDayPct,
      metrics: [
        {label: 'Tuesday close', value: `$${mgkClose.toFixed(2)} +${mgkDayPct}%`},
        {label: 'YTD', value: `+${mgkYtd.toFixed(2)}% (Yahoo as of 9/21)`},
      ],
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
      metrics: [
        {label: 'Tuesday market', value: `$${gdvClose.toFixed(2)} +${gdvDayPct}%`},
        {label: 'YTD', value: `+${gdvYtd.toFixed(2)}% (Yahoo)`},
        {label: 'Fwd dist.', value: '~6.18% (Yahoo)'},
      ],
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
      whyItMatters: 'Concentration stays qualitative until weights exist. We cannot size how much mega-cap.',
      neededToKnow: 'Sourced account weights. Do not estimate from prices.',
      status: 'unknown' as const,
    },
    {
      id: 'tue-10y',
      area: 'US' as const,
      question: 'What is the official Tuesday 10-year par?',
      whyItMatters: 'Growth-duration risk sits under NVDA, VUG, and MGK. A session comment is not H.15.',
      neededToKnow: 'FRED DGS10 observation dated 2026-09-22.',
      status: 'unknown' as const,
    },
    {
      id: 'wti-settle',
      area: 'GLOBAL' as const,
      question: 'What did WTI settle Tuesday?',
      whyItMatters: 'Oil is the other duration / energy read. Two wires disagreed on the print.',
      neededToKnow: 'One NYMEX October settle from a single official or wire page.',
      status: 'unknown' as const,
    },
    {
      id: 'wed-na-cash',
      area: 'US' as const,
      question: 'Where do U.S. and TSX cash print Wednesday?',
      whyItMatters: 'This wake is 9:11 ET. North American cash is still unread.',
      neededToKnow: 'NYSE / TSX closes after 09:30 ET open — or a later official recap.',
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
    freshCapital: 'No add into Wednesday’s open. New core money simplifies into VOO after U.S. cash.',
    bestAdd: 'VOO',
    highestUpsideWatch: 'none named',
    biggestRisk: 'Mega-cap growth overlap across NVDA, AAPL, MGK, VUG, VOO, VTI',
    nextTrigger: 'Wednesday — U.S. / CA cash open 09:30 ET',
    ifThen: [
      {
        tone: 'long' as const,
        if: 'Wednesday U.S. cash holds Tuesday without a chip crash',
        then: 'HOLD. New core money can go to VOO after the tape.',
      },
      {
        tone: 'watch' as const,
        if: 'Chips gap after the second Nasdaq record',
        then: 'HOLD. Do not chase Tuesday’s NVDA close.',
      },
      {
        tone: 'caution' as const,
        if: 'Official 10-year stays near 5% and NVDA gives back Tuesday',
        then: 'Do not automatically buy the dip',
      },
      {
        tone: 'short' as const,
        if: 'The overlap reprices harder while the S&P stays flat',
        then: 'Do not average down on the headline. Re-read, then decide.',
      },
    ],
  },
  risks: [
    {
      n: '01',
      title: 'Growth-factor concentration',
      body: 'NVDA + AAPL + MGK + VUG + VOO + VTI repeatedly own the same mega-cap ecosystem.',
    },
    {
      n: '02',
      title: 'Interest rates',
      body: `Official 10-year last is ${tenYearOfficial}% on 09/21. Tuesday par unread. High long rates compress long-duration growth — the exact overweight.`,
    },
    {
      n: '03',
      title: 'AI ROI',
      body: 'The debate is still whether profits justify hundreds of billions of annual infrastructure. That sits under NVDA and most of the indirect book.',
    },
  ],
  close: {
    kicker: 'DIAGNOSTIC',
    headline: 'Tuesday was a split tape, not a new thesis.',
    body: 'Nasdaq made a second record. The S&P was flat. The book barely moved. After Wednesday cash: numbers first — then a HOLD / ADD-VOO / stay-put for the next contribution.',
    pills: [
      {tone: 'watch' as const, label: 'HOLD THIS MORNING'},
      {tone: 'caution' as const, label: 'NO ADD INTO THE OPEN'},
      {tone: 'long' as const, label: 'VOO AFTER THE TAPE'},
    ],
    followThrough: [
      {
        tone: 'watch' as const,
        if: 'Wednesday cash holds Tuesday and NVDA is still unattractive to add',
        then: 'Keep new money in VOO. Do not invent a scout.',
      },
      {
        tone: 'caution' as const,
        if: 'Chips give back the two-day record while the 10-year stays near 5%',
        then: 'More VOO / cash / non-AI quality. Still no dip-buy on a headline.',
      },
      {
        tone: 'long' as const,
        if: 'An asymmetric candidate is named by Evens or a filing',
        then: 'That is when the Next-NVDA sleeve gets a name.',
      },
    ],
  },
  tickerTape: [
    `SPX ${spxClose.toLocaleString('en-US')}  FLAT`,
    `SPX YTD  +${spxYtdPct}%`,
    `NASDAQ  ${nasdaqClose.toLocaleString('en-US')}  +${nasdaqDayPct}%  RECORD`,
    `NVDA  $${nvdaClose.toFixed(2)}  +${nvdaDayPct}%`,
    `AAPL  $${aaplClose.toFixed(2)}  +${aaplDayPct}%`,
    `SOX  +${soxDayPct}%`,
    `10Y  ${tenYearOfficial}% FRED 09/21`,
    `TSX  ${tsxClose.toLocaleString('en-US')}  +${tsxDayPct}%`,
    `HSI  −${Math.abs(hangSengDayPct)}%`,
    `BRENT  $${brentSettle.toFixed(2)}`,
    `VOO CORE / AFTER CASH`,
    `SELL NOTHING THIS MORNING`,
  ],
};

export const episode: DailyReport = parseDailyReport(raw);
