import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0b0e14",
        surface: "#151a24",
        border: "#232938",
        live: "#ef4444",
        accent: "#22c55e",
      },
    },
  },
  plugins: [],
};
export default config;
