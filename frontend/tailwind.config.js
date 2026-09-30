/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: '#FAF8F4',
          soft: '#FDFCFA',
          elevated: '#F5F2EB',
        },
        navy: {
          DEFAULT: '#071A2F',
          primary: '#071A2F',
          midnight: '#03101D',
          secondary: '#0B2748',
          blue: '#123C69',
          muted: '#1F3A5C',
          hover: '#0E2F54',
        },
        champagne: {
          DEFAULT: '#C5A46D',
          light: '#DECBA6',
          dark: '#9A7E4D',
          subtle: 'rgba(197, 164, 109, 0.12)',
        },
        brand: {
          primary: '#071A2F',
          secondary: '#123C69',
          accent: '#C5A46D',
          light: '#FAF8F4',
          dark: '#03101D',
          blue: '#071A2F',
          gold: '#C5A46D',
          navy: '#071A2F',
          muted: '#6B7280',
        },
        surface: {
          light: '#FAF8F4',
          soft: '#F7F8FA',
          DEFAULT: '#FFFFFF',
          elevated: '#F4F5F7',
          card: '#FFFFFF',
          dark: '#071A2F',
          midnight: '#03101D',
        },
        border: {
          subtle: 'rgba(7, 26, 47, 0.06)',
          light: '#E8ECF2',
          DEFAULT: '#D5DDE8',
          dark: '#93A1B5',
        },
      },
      fontFamily: {
        sans: ['"Manrope"', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.02em',
        normal: '0em',
        wide: '0.04em',
        wider: '0.08em',
        widest: '0.14em',
      },
      borderRadius: {
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        'full': '9999px',
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(7, 26, 47, 0.03)',
        'card': '0 4px 20px -4px rgba(7, 26, 47, 0.05)',
        'hover': '0 16px 36px -8px rgba(7, 26, 47, 0.08)',
        'hero-product': '0 30px 60px -15px rgba(7, 26, 47, 0.18)',
        'polaroid': '0 8px 24px -4px rgba(7, 26, 47, 0.12), 0 2px 6px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
        '.text-balance': {
          'text-wrap': 'balance',
        },
        '.perspective-1200': {
          perspective: '1200px',
        },
        '.preserve-3d': {
          'transform-style': 'preserve-3d',
        },
      });
    },
  ],
};