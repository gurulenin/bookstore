/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans Tamil"', 'sans-serif'],
        'noto-tamil': ['"Noto Sans Tamil"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
