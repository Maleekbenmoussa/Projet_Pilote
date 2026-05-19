/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}', '../project-.jsx'],
  theme: {
    extend: {
      colors: {
        'neutral-text': '#111111',
        'neutral-text-secondary': '#4f4f4f',
        'neutral-card': '#ffffff',
        'primary-cta': '#f9e98e',
        'primary-bg': '#e9f2f2',
      },
      boxShadow: {
        soft: '0 4px 24px rgba(0,0,0,0.06)',
        'soft-lg': '0 12px 40px rgba(0,0,0,0.1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.35s ease-out forwards',
      },
    },
  },
  plugins: [],
}
