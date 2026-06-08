/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#fdf4ff',
          100: '#f9e8ff',
          200: '#f2ceff',
          300: '#e8a6ff',
          400: '#d96fff',
          500: '#c340f5',
          600: '#a621d6',
          700: '#8a18b0',
          800: '#721990',
          900: '#5d1675',
        },
        ink: {
          900: '#0d0d14',
          800: '#14141f',
          700: '#1c1c2e',
          600: '#242440',
          500: '#3a3a5c',
          400: '#5a5a80',
          300: '#8888aa',
          200: '#aaaacc',
          100: '#ccccee',
        },
        accent: {
          cyan:   '#00e5ff',
          amber:  '#ffb703',
          green:  '#06d6a0',
          rose:   '#ff4d6d',
          violet: '#7b2fff',
        },
      },
      backgroundImage: {
        'mesh-dark': `radial-gradient(at 40% 20%, hsla(280,80%,20%,0.4) 0px, transparent 50%),
                      radial-gradient(at 80% 0%,  hsla(240,80%,18%,0.3) 0px, transparent 50%),
                      radial-gradient(at 0%  50%,  hsla(300,70%,15%,0.3) 0px, transparent 50%)`,
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease both',
        'slide-up':   'slideUp 0.4s ease both',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'shimmer':    'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
}
