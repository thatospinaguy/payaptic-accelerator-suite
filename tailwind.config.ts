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
        background: "var(--background)",
        foreground: "var(--foreground)",
        payaptic: {
          navy: "#002C4F",
          primary: "var(--payaptic-primary)",
          "primary-light": "var(--payaptic-primary-light)",
          accent: "var(--payaptic-accent)",
          "accent-light": "var(--payaptic-accent-light)",
        },
      },
    },
  },
  plugins: [],
};
export default config;
