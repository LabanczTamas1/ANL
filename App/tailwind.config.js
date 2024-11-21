/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      spacing: {
        50: '50px',
      },
      screens: {
        'h-sm': { 'raw': '(max-height: 640px)' }, // Screen height <= 640px
        'h-md': { 'raw': '(min-height: 641px) and (max-height: 1024px)' }, // Between 641px and 1024px
        'h-lg': { 'raw': '(min-height: 1025px)' }, // Screen height >= 1025px
      }
    },
  },
  plugins: [],
}