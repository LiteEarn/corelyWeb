/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0F766E',
        secondary: '#14B8A6',
        success: '#16A34A',
        warning: '#F59E0B',
        danger: '#DC2626',
        neutral: {
          900: '#0F172A',
          600: '#475569',
          300: '#CBD5E1',
          100: '#F1F5F9',
        },
      },
      spacing: {
        'topbar-height': '64px',
        'sidebar-width': '260px',
      },
      borderRadius: {
        'ds-sm': '8px',
        'ds-md': '12px',
        'ds-lg': '16px',
      },
      boxShadow: {
        'ds-card': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'ds-hover': '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
        'ds-modal': '0 20px 25px rgba(0, 0, 0, 0.15), 0 10px 10px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}

