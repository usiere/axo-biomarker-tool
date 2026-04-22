/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'monospace'],
        serif: ['Instrument Serif', 'serif'],
      },
      fontSize: {
        'xs': ['10.5px', { lineHeight: '1.4' }],
        'sm': ['11.5px', { lineHeight: '1.4' }],
        'base': ['13.5px', { lineHeight: '1.5' }],
        'lg': ['14px', { lineHeight: '1.5' }],
        'xl': ['16px', { lineHeight: '1.5' }],
        '2xl': ['20px', { lineHeight: '1.4' }],
        '3xl': ['24px', { lineHeight: '1.3' }],
        '4xl': ['32px', { lineHeight: '1.2' }],
        '5xl': ['48px', { lineHeight: '1.1' }],
        '6xl': ['56px', { lineHeight: '1.1' }],
      },
      letterSpacing: {
        'tight': '-0.03em',
        'wide': '0.05em',
        'wider': '0.15em',
      },
      colors: {
        background: '#FAFAF9',
        ink: '#0A0A0A',
        border: '#E7E5E4',
        muted: '#78716C',
        'muted-light': '#A8A29E',
        hover: '#F5F5F4',
        optimal: '#15803D',
        normal: '#CA8A04',
        'out-of-range': '#B91C1C',
      },
      maxWidth: {
        'container': '1100px',
      },
      spacing: {
        '18': '4.5rem',
      },
      animation: {
        'fade-up': 'fadeUp 500ms ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-dot': 'pulseDot 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
      },
      backgroundImage: {
        'grain': 'radial-gradient(circle at 1px 1px, rgba(10,10,10,0.015) 1px, transparent 0)',
      },
    },
  },
  plugins: [],
}