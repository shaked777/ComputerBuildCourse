/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Assistant', 'Rubik', 'system-ui', 'sans-serif'],
        display: ['Rubik', 'Assistant', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        // Soft neutral backgrounds (Brilliant-style "paper")
        paper: '#FBFBFD',
        surface: '#FFFFFF',
        line: '#E7E9EF',

        // Primary text ink scale
        ink: {
          DEFAULT: '#2B2D42',
          soft: '#5C6072',
          faint: '#9AA0B4',
        },

        // Brilliant / Duolingo "Correct" green (CTA + success)
        correct: {
          light: '#E4FFCE',
          DEFAULT: '#58CC02',
          dark: '#46A302',
          text: '#3A7A02',
        },
        // "Incorrect" red (errors + lost hearts)
        wrong: {
          light: '#FFE2E2',
          DEFAULT: '#FF4B4B',
          dark: '#E23B3B',
          text: '#C81E1E',
        },

        // Accent used for the learning path "spine" + neutral CTA
        brand: {
          50: '#EEF4FF',
          100: '#D9E6FF',
          200: '#BCD2FF',
          400: '#5C8DF6',
          500: '#3B6FE0',
          600: '#2E58BC',
        },

        heart: '#FF4B4B',
        xp: '#FFC800',
        gold: '#FFB100',
      },
      boxShadow: {
        card: '0 2px 0 0 #E7E9EF, 0 1px 2px rgba(20,23,40,0.04)',
        'card-hover': '0 4px 14px rgba(20,23,40,0.10)',
        node: '0 6px 0 0 rgba(0,0,0,0.12)',
        'node-press': '0 2px 0 0 rgba(0,0,0,0.12)',
        bar: '0 -4px 24px rgba(20,23,40,0.06)',
        pop: '0 10px 30px rgba(20,23,40,0.14)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '15%, 55%': { transform: 'translateX(-9px)' },
          '35%, 75%': { transform: 'translateX(9px)' },
        },
        pop: {
          '0%': { transform: 'scale(0.85)', opacity: '0' },
          '60%': { transform: 'scale(1.04)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        rise: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shine: {
          '0%': { backgroundPosition: '-120% 0' },
          '100%': { backgroundPosition: '220% 0' },
        },
      },
      animation: {
        shake: 'shake 0.45s cubic-bezier(.36,.07,.19,.97) both',
        pop: 'pop 0.32s ease-out both',
        floaty: 'floaty 3.2s ease-in-out infinite',
        rise: 'rise 0.35s ease-out both',
        shine: 'shine 2.4s linear infinite',
      },
    },
  },
  plugins: [],
}
