/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        afacad: ["Afacad"],
      },
      colors: {
        primary: "#224D11",
        secondary: "#88B377",
        background: "#F9FAFC",
        card: "#FFFFFF",
        text: "#1C330C",
        border: "#E1E8F0",
        success: "#4BB543",
        error: "#FF3333",
      },
    },
  },
  plugins: [],
};
