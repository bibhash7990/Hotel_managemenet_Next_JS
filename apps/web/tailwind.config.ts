import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1rem', sm: '1.5rem', lg: '2rem' },
      screens: { '2xl': '1280px' },
    },
    extend: {
      colors: {
        border: 'hsl(214 25% 90%)',
        background: 'hsl(40 25% 98%)',
        foreground: 'hsl(215 35% 12%)',
        primary: {
          DEFAULT: 'hsl(213 60% 28%)',
          50: 'hsl(213 70% 96%)',
          100: 'hsl(213 65% 92%)',
          200: 'hsl(213 60% 84%)',
          300: 'hsl(213 60% 70%)',
          400: 'hsl(213 60% 52%)',
          500: 'hsl(213 60% 38%)',
          600: 'hsl(213 60% 28%)',
          700: 'hsl(213 65% 22%)',
          800: 'hsl(215 60% 16%)',
          900: 'hsl(215 60% 12%)',
          foreground: 'hsl(40 30% 98%)',
        },
        accent: {
          DEFAULT: 'hsl(38 92% 52%)',
          50: 'hsl(40 100% 96%)',
          100: 'hsl(40 95% 90%)',
          200: 'hsl(40 95% 80%)',
          300: 'hsl(38 95% 68%)',
          400: 'hsl(38 92% 58%)',
          500: 'hsl(38 92% 52%)',
          600: 'hsl(34 92% 46%)',
          700: 'hsl(30 90% 38%)',
          foreground: 'hsl(215 60% 12%)',
        },
        secondary: {
          DEFAULT: 'hsl(213 30% 95%)',
          foreground: 'hsl(215 35% 18%)',
        },
        muted: {
          DEFAULT: 'hsl(213 25% 96%)',
          foreground: 'hsl(215 14% 38%)',
        },
        destructive: {
          DEFAULT: 'hsl(0 75% 50%)',
          foreground: 'hsl(0 0% 100%)',
        },
        success: {
          DEFAULT: 'hsl(152 60% 36%)',
          foreground: 'hsl(0 0% 100%)',
        },
        warning: {
          DEFAULT: 'hsl(38 92% 50%)',
          foreground: 'hsl(215 60% 12%)',
        },
        info: {
          DEFAULT: 'hsl(202 80% 42%)',
          foreground: 'hsl(0 0% 100%)',
        },
        card: {
          DEFAULT: 'hsl(0 0% 100%)',
          foreground: 'hsl(215 35% 12%)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      borderRadius: {
        lg: '0.75rem',
        md: 'calc(0.75rem - 2px)',
        sm: 'calc(0.75rem - 4px)',
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      fontSize: {
        display: ['clamp(2.5rem, 5vw, 3.75rem)', { lineHeight: '1.05', fontWeight: '700', letterSpacing: '-0.025em' }],
        'heading-1': ['clamp(1.875rem, 3vw, 2.5rem)', { lineHeight: '1.15', fontWeight: '700', letterSpacing: '-0.02em' }],
        'heading-2': ['clamp(1.5rem, 2.4vw, 1.875rem)', { lineHeight: '1.25', fontWeight: '600', letterSpacing: '-0.015em' }],
        'heading-3': ['1.25rem', { lineHeight: '1.4', fontWeight: '600', letterSpacing: '-0.01em' }],
        body: ['1rem', { lineHeight: '1.6' }],
        caption: ['0.875rem', { lineHeight: '1.45' }],
      },
      transitionDuration: {
        DEFAULT: '200ms',
        interaction: '250ms',
      },
      boxShadow: {
        'soft': '0 1px 2px 0 rgba(15, 23, 42, 0.04), 0 1px 3px 0 rgba(15, 23, 42, 0.06)',
        'elevated': '0 4px 6px -2px rgba(15, 23, 42, 0.05), 0 12px 24px -8px rgba(15, 23, 42, 0.10)',
        'glow': '0 0 0 4px rgba(38, 96, 196, 0.12)',
        'card-hover': '0 16px 40px -16px rgba(15, 23, 42, 0.18), 0 6px 12px -6px rgba(15, 23, 42, 0.10)',
      },
      backgroundImage: {
        'hero-gradient':
          'linear-gradient(180deg, rgba(8, 22, 51, 0.72) 0%, rgba(8, 22, 51, 0.45) 45%, rgba(8, 22, 51, 0.10) 100%)',
        'subtle-warm':
          'radial-gradient(ellipse at top, hsl(40 80% 95%) 0%, transparent 60%), radial-gradient(ellipse at bottom right, hsl(213 40% 94%) 0%, transparent 55%)',
        'shimmer':
          'linear-gradient(90deg, transparent, rgba(255,255,255,0.65), transparent)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      animation: {
        'fade-in': 'fade-in 350ms ease-out both',
        'slide-up': 'slide-up 400ms cubic-bezier(0.16, 1, 0.3, 1) both',
        shimmer: 'shimmer 2.2s linear infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
