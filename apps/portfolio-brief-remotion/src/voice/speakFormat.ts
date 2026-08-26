/** Spoken-English helpers. Round for the ear; do not invent a print. */

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const TEENS = [
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

const TICKER_SAY: Record<string, string> = {
  NVDA: 'Nvidia',
  AAPL: 'Apple',
};

export function sentence(text: string): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (!t) return '';
  const withStop = /[.!?]["'"”’)]?$/.test(t) ? t : `${t}.`;
  return withStop.replace(/(^|[.!?]\s+)([a-z])/g, (_m, lead: string, ch: string) => `${lead}${ch.toUpperCase()}`);
}

export function words0to99(n: number): string {
  if (!Number.isFinite(n)) return String(n);
  const i = Math.round(Math.abs(n));
  if (i > 99) return String(i);
  if (i < 10) return ONES[i] ?? String(i);
  if (i < 20) return TEENS[i - 10] ?? String(i);
  const tens = TENS[Math.floor(i / 10)] ?? '';
  const ones = i % 10;
  return ones === 0 ? tens : `${tens}-${ONES[ones]}`;
}

const twoDigit = (n: number): string => {
  if (n === 0) return 'even';
  if (n < 10) return `oh ${words0to99(n)}`;
  return words0to99(n);
};

/** Trader handle: 7677 → "seventy-six seventy-seven"; 212 → "two twelve". */
export function speakHandle(n: number): string {
  const rounded = Math.round(n);
  if (rounded >= 1000 && rounded <= 99999) {
    return `${words0to99(Math.floor(rounded / 100))} ${twoDigit(rounded % 100)}`;
  }
  if (rounded >= 100 && rounded <= 999) {
    return `${words0to99(Math.floor(rounded / 100))} ${twoDigit(rounded % 100)}`;
  }
  return words0to99(rounded);
}

export function speakPointDecimal(n: number, places = 2): string {
  const sign = n < 0 ? 'minus ' : '';
  const [whole, frac] = Math.abs(n).toFixed(places).split('.');
  const head = words0to99(Number(whole));
  if (!frac) return `${sign}${head}`;
  const tail = frac
    .split('')
    .map((d) => words0to99(Number(d)))
    .join(' ');
  return `${sign}${head} point ${tail}`;
}

const fractionLabel = (abs: number): string | null => {
  if (abs >= 0.28 && abs <= 0.38) return 'a third of a percent';
  if (abs >= 0.45 && abs <= 0.55) return 'about half a percent';
  if (abs >= 0.6 && abs <= 0.72) return 'about two-thirds of a percent';
  if (abs >= 0.95 && abs <= 1.08) return 'about a percent';
  return null;
};

/** Day-move language. 0.32 → "up a third of a percent". */
export function speakPctMove(n: number): string {
  if (n === 0) return 'unchanged';
  const dir = n > 0 ? 'up' : 'down';
  const abs = Math.abs(n);
  const fraction = fractionLabel(abs);
  if (fraction) return `${dir} ${fraction}`;
  if (abs >= 1.65 && abs <= 1.85) return `${dir} about one and three-quarters`;
  if (abs >= 1.4 && abs <= 1.6) return `${dir} about one and a half percent`;
  if (abs >= 9.5) return `${dir} about ${words0to99(Math.round(abs))} percent`;
  if (abs >= 1 && Math.abs(abs - Math.round(abs)) < 0.12) {
    return `${dir} about ${words0to99(Math.round(abs))} percent`;
  }
  return `${dir} ${speakPointDecimal(abs, abs < 10 ? 2 : 1)} percent`;
}

export function speakTicker(ticker: string): string {
  return TICKER_SAY[ticker.toUpperCase()] ?? ticker;
}

/** Acronyms for the ear. Does not invent numbers. Keeps the Next-NVDA sleeve name. */
export function speakReady(text: string): string {
  const t = text
    .replace(/Next-NVDA/gi, '«NEXTNVDA»')
    .replace(/S&P/g, 'S and P')
    .replace(/\bYTD\b/g, 'year to date')
    .replace(/\bNVDA\b/g, 'Nvidia')
    .replace(/\bAAPL\b/g, 'Apple')
    .replace(/\bPCE\b/g, 'P C E')
    .replace(/«NEXTNVDA»/g, 'Next-NVDA');
  return sentence(t);
}
