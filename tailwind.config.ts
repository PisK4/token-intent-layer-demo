import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B1120",
        surface: "#111827",
        "surface-elevated": "#1E293B",
        border: "#334155",
        foreground: "#F8FAFC",
        muted: "#94A3B8",
        accent: {
          DEFAULT: "#22C55E",
          soft: "rgba(34, 197, 94, 0.15)",
        },
        rail: {
          cctp: "#3B82F6",
          vault: "#22C55E",
          intent: "#A855F7",
          lz: "#F59E0B",
          wormhole: "#F97316",
          direct: "#14B8A6",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-space-grotesk)", "var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glow: "0 0 24px rgba(34, 197, 94, 0.25)",
        card: "0 8px 24px rgba(2, 6, 23, 0.4)",
      },
      keyframes: {
        "flow-pulse": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "flow-pulse": "flow-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
