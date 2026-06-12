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
      },
      spacing: {
        'topbar-height': '64px',
        'sidebar-width': '260px',
      }
    },
  },
  plugins: [],
}

