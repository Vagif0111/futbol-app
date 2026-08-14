import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0a0c12",
        surface: "#141822",
        surface2: "#1b202c",
        border: "#262c3a",
        live: "#ff3b5c",
        accent: "#3ddc84",
        accent2: "#22c55e",
        gold: "#f5b301",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.4)",
        pop: "0 4px 16px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [],
};
export default config;
