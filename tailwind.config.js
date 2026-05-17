/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./*.tsx",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cormorant Garamond"', "Georgia", "serif"],
        body: ['"Instrument Sans"', '"Helvetica Neue"', "sans-serif"],
        accent: ['"DM Mono"', "Courier New", "monospace"],
      },
      colors: {
        parchment: {
          50: "#FEFCF9",
          100: "#F8F3EC",
          200: "#F0E9DC",
          300: "#E5DCCB",
          400: "#D4C4A8",
        },
        terra: {
          100: "#F5E0D8",
          200: "#E8C4B0",
          300: "#D4A088",
          400: "#C4785A",
          500: "#B5613A",
          600: "#9A4D2A",
        },
        botanical: {
          100: "#EDF2ED",
          200: "#D4E2D6",
          300: "#A8C2AA",
          400: "#7AA07F",
          500: "#5A7A5F",
          600: "#456048",
          700: "#344A37",
        },
        ink: {
          50: "#F7F5F2",
          100: "#EDE9E3",
          200: "#D8D0C4",
          300: "#B8ADA0",
          400: "#8C8275",
          500: "#6B6258",
          600: "#4A443C",
          700: "#2D2A26",
          800: "#1A1816",
        },
        dusty: {
          100: "#F7EDE9",
          200: "#E8D3CC",
          300: "#D4B0A4",
          400: "#B88878",
          500: "#9C6B5A",
        },
        sage: {
          50: "#EDF2ED",
          100: "#EDF2ED",
          200: "#D4E2D6",
          300: "#A8C2AA",
          400: "#7AA07F",
          500: "#5A7A5F",
          600: "#456048",
          700: "#344A37",
        },
      },
    },
  },
  plugins: [],
};
