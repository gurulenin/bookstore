/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'noto-tamil': ['"Noto Sans Tamil"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
