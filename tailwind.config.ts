import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        payaptic: {
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
