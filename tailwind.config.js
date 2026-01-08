/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Lato"', 'sans-serif'],
      },
      colors: {
        earth: {
          50: '#f9f8f6',
          100: '#efece6',
          200: '#e0dacf',
          300: '#c8bfab',
          400: '#b0a083',
          500: '#9b8a66',
          600: '#7d6d50',
          800: '#4d4436',
        }
      }
    },
  },
  plugins: [],
}
