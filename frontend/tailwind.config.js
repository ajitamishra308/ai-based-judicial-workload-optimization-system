/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#0f1b2d", light: "#16263d" },
        gold: { DEFAULT: "#c9a227", light: "#e0bc4f" },
        cream: "#faf7f2",
        ink: "#1c2530",
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}
