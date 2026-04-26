/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#dfeeff',
          200: '#b8ddff',
          300: '#79c2ff',
          400: '#32a3ff',
          500: '#0784f3',
          600: '#0066d1',
          700: '#0051a9',
          800: '#04458b',
          900: '#0a3a73',
        },
        surface: {
          0: '#ffffff',
          50: '#f8f9fb',
          100: '#f1f3f5',
          200: '#e5e8ec',
          300: '#d1d6dd',
          400: '#9da5b0',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        success: { 500: '#10b981', 100: '#d1fae5' },
        warning: { 500: '#f59e0b', 100: '#fef3c7' },
        danger:  { 500: '#ef4444', 100: '#fee2e2' },
      },
    },
  },
  plugins: [],
};
