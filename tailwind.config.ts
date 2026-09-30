import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FAF9F6",
        charcoal: "#1C1917",
        stone: "#78716C",
        forest: "#2D4A3E",
        line: "#E7E5E4",
      },
    },
  },
  plugins: [],
};

export default config;