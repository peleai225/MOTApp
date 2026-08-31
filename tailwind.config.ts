import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        nuit:   '#0F1829',
        sable:  '#FDF6EC',
        soleil: '#F59E0B',
        route:  '#E9550D',
        voyage: '#1D4ED8',
        brume:  '#EFF3FF',
        encre:  '#1A1A2E',
        pierre: '#6B7280',
        braise: '#FEF3C7',
        // garde primary pour compatibilité
        primary: {
          DEFAULT: '#1D4ED8',
          light:   '#3B82F6',
          dark:    '#0F1829',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        card: '16px',
        btn:  '12px',
        xl:   '16px',
        '2xl':'20px',
        '3xl':'24px',
      },
      boxShadow: {
        card:   '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        btn:    '0 4px 16px rgba(233,85,13,0.35)',
        ticket: '0 4px 24px rgba(15,24,41,0.12)',
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px' }],
      },
    },
  },
  plugins: [],
} satisfies Config
