import type { Config } from "tailwindcss";

// 仕様書 3章のカラーをそのまま採用。本文プライマリは indigo ではなくネイビー #1e4b7a。
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#1e4b7a", 700: "#173c63", 50: "#eef4fb" },
        gold: { DEFAULT: "#b8952f", soft: "#cbb582" },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-noto)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      transitionTimingFunction: {
        app: "cubic-bezier(0.4,0,0.2,1)",
      },
    },
  },
  plugins: [],
};

export default config;
