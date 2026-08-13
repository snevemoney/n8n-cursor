/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: '#0A0A0C',
        'surface-raised': '#141418',
        'surface-overlay': '#1C1C22',
        accent: '#5B8CFF',
        'accent-hover': '#7BA3FF',
        'text-primary': '#F5F5F7',
        'text-secondary': '#8E8E93',
        'text-muted': '#636366',
        'border-subtle': '#2C2C2E',
        'status-hot': '#FF6B6B',
        'status-warm': '#FFB84D',
        'status-booked': '#4ADE80',
        'status-reminded': '#5B8CFF',
      },
    },
  },
  plugins: [],
}
