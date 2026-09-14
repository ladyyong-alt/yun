/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        clay: {
          bg: '#EEF2F7',
          card: '#FFFFFF',
          purple: {
            light: '#A29BFE',
            DEFAULT: '#6C5CE7',
            dark: '#5644D8',
          },
          blue: {
            light: '#74B9FF',
            DEFAULT: '#0984E3',
            dark: '#076BB8',
          },
          teal: {
            light: '#81ECEC',
            DEFAULT: '#00CEC9',
            dark: '#00A8A3',
          },
          mint: {
            light: '#55EFC4',
            DEFAULT: '#00B894',
            dark: '#009477',
          },
          peach: {
            light: '#FAB1A0',
            DEFAULT: '#FF7675',
            dark: '#E84118',
          },
          yellow: {
            light: '#FFEAA7',
            DEFAULT: '#FDCB6E',
            dark: '#E17055',
          },
          slate: {
            50: '#F8FAFC',
            100: '#F1F5F9',
            200: '#E2E8F0',
            300: '#CBD5E1',
            400: '#94A3B8',
            500: '#64748B',
            600: '#475569',
            700: '#334155',
            800: '#1E293B',
            900: '#0F172A',
          }
        }
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
        'clay': '2rem',
      },
      boxShadow: {
        'clay-card': '14px 14px 28px #d1d9e6, -14px -14px 28px #ffffff, inset 3px 3px 6px rgba(255, 255, 255, 0.9), inset -3px -3px 6px rgba(163, 177, 198, 0.25)',
        'clay-card-hover': '18px 18px 36px #c4cdda, -18px -18px 36px #ffffff, inset 3px 3px 6px rgba(255, 255, 255, 0.95), inset -3px -3px 6px rgba(163, 177, 198, 0.3)',
        'clay-btn': '8px 8px 16px #cdd6e3, -8px -8px 16px #ffffff, inset 2px 2px 4px rgba(255, 255, 255, 0.8), inset -2px -2px 4px rgba(163, 177, 198, 0.3)',
        'clay-btn-active': 'inset 4px 4px 8px #c8d2df, inset -4px -4px 8px #ffffff',
        'clay-pill': '6px 6px 12px #d1d9e6, -6px -6px 12px #ffffff, inset 2px 2px 3px rgba(255, 255, 255, 0.8), inset -2px -2px 3px rgba(163, 177, 198, 0.2)',
        'clay-pill-active': 'inset 3px 3px 6px #bcc7d6, inset -3px -3px 6px #ffffff',
        'clay-input': 'inset 4px 4px 8px #d3dbe7, inset -4px -4px 8px #ffffff',
        'clay-primary': '8px 8px 20px rgba(108, 92, 231, 0.35), -6px -6px 16px #ffffff, inset 3px 3px 5px rgba(255, 255, 255, 0.4), inset -3px -3px 5px rgba(0, 0, 0, 0.2)',
        'clay-primary-active': 'inset 4px 4px 8px rgba(0, 0, 0, 0.25), inset -4px -4px 8px rgba(255, 255, 255, 0.25)',
        'clay-accent': '8px 8px 20px rgba(0, 206, 201, 0.35), -6px -6px 16px #ffffff, inset 3px 3px 5px rgba(255, 255, 255, 0.4), inset -3px -3px 5px rgba(0, 0, 0, 0.2)',
        'clay-peach': '8px 8px 20px rgba(255, 118, 117, 0.35), -6px -6px 16px #ffffff, inset 3px 3px 5px rgba(255, 255, 255, 0.4), inset -3px -3px 5px rgba(0, 0, 0, 0.2)',
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'float-slow': 'float 7s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.02)' },
        }
      }
    },
  },
  plugins: [],
}
