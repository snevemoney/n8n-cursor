import {loadFont as loadInstrument} from '@remotion/google-fonts/InstrumentSerif';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';

const instrument = loadInstrument('normal', {
  weights: ['400'],
  subsets: ['latin'],
});
const inter = loadInter('normal', {
  weights: ['400', '500', '600', '700'],
  subsets: ['latin'],
});
const mono = loadMono('normal', {
  weights: ['400', '500', '600'],
  subsets: ['latin'],
});

export const fonts = {
  display: instrument.fontFamily,
  sans: inter.fontFamily,
  mono: mono.fontFamily,
};

export const color = {
  bg: '#07080c',
  bgLift: '#0d1016',
  panel: '#11151d',
  panelHot: '#161c27',
  line: '#232a37',
  lineHot: '#334056',
  text: '#e9eef6',
  muted: '#8b93a7',
  faint: '#5b6476',
  gold: '#d6a21b',
  goldDim: '#8a6a14',
  long: '#3dcc8a',
  longDim: 'rgba(61, 204, 138, 0.14)',
  short: '#ff5c6a',
  shortDim: 'rgba(255, 92, 106, 0.14)',
  watch: '#f0b429',
  watchDim: 'rgba(240, 180, 41, 0.14)',
  caution: '#ff8a3d',
  nvda: '#76b900',
  aapl: '#c8ccd0',
  ink: '#f4f1e8',
  inference: '#9aa4b8',
};

export const layout = {
  padX: 80,
  padY: 56,
  chromeH: 52,
  tickerH: 44,
};
