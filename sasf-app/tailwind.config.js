/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter_400Regular'],
        medium: ['Inter_500Medium'],
        semibold: ['Inter_600SemiBold'],
        bold: ['Inter_700Bold'],
      },
      colors: {
        // Escala neutra (slate) — alinhada a Texto principal #0F172A (900),
        // Texto secundário #64748B (500), Borda #E2E8F0 (200) e Background #F8FAFC (50).
        gray: {
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
        },
        // Amarelo/aviso — alinhado ao Aviso #F59E0B (500).
        yellow: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
        },
        primary: { DEFAULT: '#2563EB', light: '#DBEAFE', dark: '#1D4ED8', 50: '#EFF6FF' },
        secondary: { DEFAULT: '#10B981', light: '#D1FAE5', dark: '#059669' },
        accent: { DEFAULT: '#06B6D4', light: '#CFFAFE', dark: '#0E7490' },
        background: '#F8FAFC',
        surface: '#FFFFFF',
        success: { DEFAULT: '#16A34A', light: '#DCFCE7' },
        warning: { DEFAULT: '#F59E0B', light: '#FEF3C7' },
        danger: { DEFAULT: '#DC2626', light: '#FEE2E2' },
        info: { DEFAULT: '#06B6D4', light: '#CFFAFE' },
      },
    },
  },
  plugins: [],
};
