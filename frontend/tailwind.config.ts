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
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        hairline: "var(--hairline)",
        "hairline-strong": "var(--hairline-strong)",
        bone: "var(--text)",
        muted: "var(--text-muted)",
        faint: "var(--text-faint)",
        champagne: "var(--champagne)",
        "champagne-dim": "var(--champagne-dim)",
        "on-champagne": "var(--on-champagne)",
        oxide: "var(--oxide)",
        "oxide-text": "var(--oxide-text)",
        caution: "var(--caution)",
        error: "var(--error)",
      },
      fontFamily: {
        display: ["'Newsreader'", "Georgia", "serif"],
        sans: ["'Hanken Grotesk'", "system-ui", "sans-serif"],
        mono: ["'DM Mono'", "monospace"],
      },
      borderRadius: {
        DEFAULT: "4px",
      },
    },
  },
  plugins: [],
};

export default config;
