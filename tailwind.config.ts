import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        mono: ["var(--font-roboto-mono)", "Roboto Mono", "monospace"],
      },
      colors: {
        payaptic: {
          navy: "#002C4F",
          emerald: "#12C472",
          ocean: "#0076A8",
          sky: "#00A6FF",
          lime: "#A3FFD4",
        },
      },
    },
  },
  plugins: [],
};
export default config;
