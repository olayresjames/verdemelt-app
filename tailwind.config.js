/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'sage-green': '#8F9779',
        'soft-green': '#D1E8E2',
        'dark-green': '#2D3A26',
        cream: '#FDFBF7',
      },
    },
  },
  plugins: [],
}
