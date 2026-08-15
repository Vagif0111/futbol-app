import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#f1f2f6",
        surface: "#ffffff",
        surface2: "#0d0d0f",
        border: "#e5e6eb",
        live: "#ef4444",
        accent: "#16a34a",
        accent2: "#15803d",
        ink: "#111318",
        muted: "#6b7280",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06)",
        pop: "0 4px 14px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
