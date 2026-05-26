import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif']
      },
      colors: {
        sage: {
          DEFAULT: '#9CB956',
          50: '#F4F8E8',
          100: '#E8F1D2',
          200: '#D5E5AB',
          300: '#C2D88F',
          400: '#AECB6C',
          500: '#9CB956',
          600: '#7DA13E',
          700: '#5F7E2F',
          800: '#445B22',
          900: '#2C3B16'
        },
        teal: {
          DEFAULT: '#5A8B9D',
          50: '#EAF1F4',
          100: '#D2E0E6',
          200: '#A4C0CC',
          300: '#7FA5B5',
          400: '#5A8B9D',
          500: '#4A7C8E',
          600: '#3E7088',
          700: '#2F5D73',
          800: '#244758',
          900: '#1A3340'
        },
        ink: {
          DEFAULT: '#1F2937',
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827'
        }
      },
      boxShadow: {
        card: '0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.06)',
        soft: '0 4px 14px rgba(15, 23, 42, 0.06)',
        pop: '0 8px 28px rgba(15, 23, 42, 0.12)'
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1rem',
        '3xl': '1.25rem'
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      },
      animation: {
        'slide-up': 'slide-up 220ms ease-out',
        'fade-in': 'fade-in 180ms ease-out'
      }
    }
  },
  plugins: []
} satisfies Config
