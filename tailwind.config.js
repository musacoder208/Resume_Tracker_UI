/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      /* =====================================================
       COLORS (SEMANTIC – USED DIRECTLY IN JSX)
       ===================================================== */
      colors: {
        /* Page background (used on <body>, layouts) */
        background: {
          DEFAULT: 'var(--color-background)', // bg-background
          subtle: 'var(--color-background-subtle)', // bg-background-subtle
        },

        /* Surfaces: cards, tables, menus, popovers */
        surface: {
          DEFAULT: 'var(--color-surface)', // bg-surface
          muted: 'var(--color-surface-muted)', // bg-surface-muted
          hover: 'var(--color-surface-hover)', // hover:bg-surface-hover
          elevated: 'var(--color-surface-elevated)', // bg-surface-elevated (menus, modals)
          active: 'var(--color-surface-active)', // active/selected rows
          disabled: 'var(--color-surface-disabled)', // disabled containers
        },

        /* Text colors */
        text: {
          DEFAULT: 'var(--color-text)', // text-text
          muted: 'var(--color-text-muted)', // text-text-muted
          subtle: 'var(--color-text-subtle)', // placeholders, hints
          inverted: 'var(--color-text-inverted)', // text on primary bg
          disabled: 'var(--color-text-disabled)', // disabled labels
        },

        /* Borders & separators */
        border: {
          DEFAULT: 'var(--color-border)',        // border-border
          muted:   'var(--color-border-muted)',   // divide-border-muted
          focus:   'var(--color-border-focus)',   // ring-border-focus
          danger:  'var(--color-border-danger)',  // error borders
          strong:  'var(--color-border-strong)',  // selected rows, active cards
          info:    'var(--color-border-info)',    // informational / interactive
          inverse: 'var(--color-border-inverse)', // on-dark surfaces
        },

        /* Brand / primary actions */
        primary: {
          DEFAULT: 'var(--color-primary)', // bg-primary
          hover: 'var(--color-primary-hover)', // hover:bg-primary-hover
          active: 'var(--color-primary-active)', // active:bg-primary-active
          subtle: 'var(--color-primary-subtle)', // light background highlight
          foreground: 'var(--color-primary-foreground)', // text on primary bg
        },

        /* Status colors */
        success: {
          DEFAULT: 'var(--color-success)', // bg-success
          foreground: 'var(--color-success-foreground)',
          subtle: 'var(--color-success-subtle)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          foreground: 'var(--color-warning-foreground)',
          subtle: 'var(--color-warning-subtle)',
        },
        error: {
          DEFAULT: 'var(--color-error)',
          foreground: 'var(--color-error-foreground)',
          subtle: 'var(--color-error-subtle)',
        },
      },

      /* =====================================================
       BORDER RADIUS (USED AS rounded-md, rounded-lg, etc.)
       ===================================================== */
      borderRadius: {
        none: 'var(--radius-none)',
        sm:   'var(--radius-sm)',   // buttons, inputs
        md:   'var(--radius-md)',   // cards
        lg:   'var(--radius-lg)',   // modals
        xl:   'var(--radius-xl)',   // large panels
        full: 'var(--radius-full)', // pill / avatar
      },

      borderWidth: {
        DEFAULT: 'var(--border-width-sm)',  // 1px
        '0':     'var(--border-width-none)',
        '2':     'var(--border-width-md)',
        '4':     'var(--border-width-lg)',
      },

      /* =====================================================
       TYPOGRAPHY
       ===================================================== */
      fontFamily: {
        primary: ['var(--font-family-primary)'],  // font-primary — Poppins
        mono:    ['var(--font-family-mono)'],      // font-mono    — Fira Code
      },

      fontSize: {
        xs:    ['0.75rem',  { lineHeight: '1.3',  letterSpacing: '0.02em'  }],  // 12px
        sm:    ['0.875rem', { lineHeight: '1.5',  letterSpacing: '0em'     }],  // 14px
        base:  ['1rem',     { lineHeight: '1.5',  letterSpacing: '0em'     }],  // 16px
        lg:    ['1.125rem', { lineHeight: '1.3',  letterSpacing: '0em'     }],  // 18px
        xl:    ['1.25rem',  { lineHeight: '1.3',  letterSpacing: '0em'     }],  // 20px
        '2xl': ['1.5rem',   { lineHeight: '1.3',  letterSpacing: '0em'     }],  // 24px
        '3xl': ['2rem',     { lineHeight: '1.3',  letterSpacing: '-0.01em' }],  // 32px
        '4xl': ['2.5rem',   { lineHeight: '1.15', letterSpacing: '-0.01em' }],  // 40px
        '5xl': ['3rem',     { lineHeight: '1.15', letterSpacing: '-0.02em' }],  // 48px
        '6xl': ['3.5rem',   { lineHeight: '1.15', letterSpacing: '-0.03em' }],  // 56px
        '7xl': ['4rem',     { lineHeight: '1.1',  letterSpacing: '-0.03em' }],  // 64px
      },

      fontWeight: {
        light:      'var(--font-weight-light)',       // 300
        normal:     'var(--font-weight-normal)',      // 400
        medium:     'var(--font-weight-medium)',      // 500
        semibold:   'var(--font-weight-semibold)',    // 600
        bold:       'var(--font-weight-bold)',        // 700
        extrabold:  'var(--font-weight-extra-bold)',  // 800
      },

      /* =====================================================
       SHADOWS (USED AS shadow-md, shadow-lg)
       ===================================================== */
      boxShadow: {
        sm: 'var(--shadow-sm)', // inputs, subtle cards
        md: 'var(--shadow-md)', // dropdowns
        lg: 'var(--shadow-lg)', // modals
      },
    },
  },

  plugins: [],
};
