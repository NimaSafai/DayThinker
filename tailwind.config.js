/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        afacad: ["Afacad"],
      },
      colors: {
        primary: "#4F86E7",
        secondary: "#97B4F0",
        background: "#F9FAFC",
        card: "#FFFFFF",
        text: "#333333",
        border: "#E1E8F0",
        success: "#4BB543",
        error: "#FF3333",
      },
    },
  },
  plugins: [],
};
