import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

/** Couleur pilotée par une variable CSS (canaux RGB) : s'adapte au thème clair / sombre */
const v = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`

/**
 * Palette tirée de la livrée des cars MOT :
 * carrosserie blanche, virgule bleu roi, bande diagonale rouge.
 * Les valeurs claires / sombres sont définies dans assets/css/main.css.
 */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        /* Remplissage de marque : identique dans les deux thèmes */
        bleu: {
          /* Texte et liens en bleu : plus clair en thème sombre pour rester lisible */
          ink: v('accent'),
          50:  v('bleu-50'),
          100: v('bleu-100'),
          200: v('bleu-200'),
          500: '#3048A8',
          DEFAULT: '#1F3285',
          700: '#182867',
          900: '#0F1A45',
        },
        rouge: { 50: v('rouge-50'), DEFAULT: v('rouge'), 700: '#B22216' },
        vert:  { 50: v('vert-50'),  DEFAULT: v('vert') },
        ambre: { 50: v('ambre-50'), DEFAULT: v('ambre') },
        surface:  v('surface'),
        ciel:     v('ciel'),
        encre:    v('encre'),
        asphalte: v('asphalte'),
        gravier:  v('gravier'),
        ligne:    v('ligne'),
        hairline: v('hairline'),
        track:    v('track'),
        chevron:  v('chevron'),

        /* Jetons shadcn (Sonner, AlertDialog…) */
        border:      'hsl(var(--border))',
        input:       'hsl(var(--input))',
        ring:        'hsl(var(--ring))',
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',
        primary:     { DEFAULT: 'hsl(var(--primary))',     foreground: 'hsl(var(--primary-foreground))' },
        secondary:   { DEFAULT: 'hsl(var(--secondary))',   foreground: 'hsl(var(--secondary-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        muted:       { DEFAULT: 'hsl(var(--muted))',       foreground: 'hsl(var(--muted-foreground))' },
        accent:      { DEFAULT: 'hsl(var(--accent))',      foreground: 'hsl(var(--accent-foreground))' },
        popover:     { DEFAULT: 'hsl(var(--popover))',     foreground: 'hsl(var(--popover-foreground))' },
        card:        { DEFAULT: 'hsl(var(--card))',        foreground: 'hsl(var(--card-foreground))' },
      },
      fontFamily: {
        sans:    ['Barlow', 'system-ui', 'sans-serif'],
        display: ['"Barlow Condensed"', 'Barlow', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['11px', { lineHeight: '14px' }],
        xs:    ['12.5px', { lineHeight: '17px' }],
        sm:    ['14px', { lineHeight: '20px' }],
        base:  ['16px', { lineHeight: '23px' }],
        lg:    ['18px', { lineHeight: '24px' }],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '4xl': '28px',
      },
      boxShadow: {
        bar:   '0 -1px 0 rgba(13,21,48,0.06), 0 -8px 24px rgba(13,21,48,0.04)',
        panel: '0 1px 2px rgba(13,21,48,0.05), 0 12px 32px -8px rgba(13,21,48,0.14)',
        lift:  '0 1px 2px rgba(13,21,48,0.06), 0 4px 14px -4px rgba(13,21,48,0.10)',
        sheet: '0 -12px 40px rgba(13,21,48,0.18)',
        cta:   '0 6px 18px -6px rgba(31,50,133,0.55)',
        outline: '0 0 0 1px rgb(var(--c-hairline))',
        divider: '0 1px 0 rgb(var(--c-hairline))',
        field:   'inset 0 0 0 1px rgb(var(--c-field))',
        'field-focus': 'inset 0 0 0 2px rgb(var(--c-accent))',
        radio:   'inset 0 0 0 2px rgb(var(--c-chevron))',
        seat:    'inset 0 0 0 2px rgb(var(--c-bleu-200))',
      },
      transitionTimingFunction: {
        native: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up':   { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [animate],
} satisfies Config
