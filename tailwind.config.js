/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        natyalaya: {
          50: '#fbf6f0',
          100: '#f5eadd',
          200: '#ebd0b5',
          300: '#deaf83',
          400: '#d18652',
          500: '#cb6632',
          600: '#bd4d26',
          700: '#9d3a21', // Primary Brand Color
          800: '#803022',
          900: '#682a1f',
          950: '#38130d',
        },
        gold: {
          500: '#d4af37',
          600: '#b4941f'
        }
      },
      fontFamily: {
        sans: ['Lato', 'sans-serif'],
        serif: ['Cormorant Garamond', 'serif'],
      }
    },
  },
  plugins: [],
}