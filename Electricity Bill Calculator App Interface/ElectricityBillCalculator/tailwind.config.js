/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        primary: "#1D2E1B", // Forest Brew - Main Color
        "primary-support": "#468432", // Supportive Main

        // Backgrounds
        background: "#C8D2A6", // Tea Mist - App Background
        "surface-alt": "#DDE6C8", // Slightly darker Tea Mist

        // Semantic Colors
        error: "#FF3F33", // Error Color
        success: "#FFDE42", // Success Color (yellow/gold)

        // Utility Colors
        border: "#B0C29A",
        divider: "#D8E0C8",
        shadow: "rgba(29, 46, 27, 0.15)",
        overlay: "rgba(29, 46, 27, 0.5)",
      },
    },
  },
  plugins: [],
};
