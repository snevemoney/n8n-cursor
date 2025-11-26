/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'SF Mono', 'Menlo', 'Consolas', 'Liberation Mono', 'monospace'],
      },
      screens: {
        // Explicit pixel-based breakpoints
        'phone': { 'max': '767px' },      // Phone: ≤767px
        'tablet': { 'min': '768px', 'max': '1279px' }, // Tablet: 768px-1279px
        'desktop': { 'min': '1280px' },   // Desktop: ≥1280px
      },
    },
  },
  plugins: [],
}

