/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontSize:{
        feedTimestamp: '0.625rem', // 10px
      }
    },
  },
  plugins: [],
}

