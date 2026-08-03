import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        present: "#16a34a",
        partial: "#d97706",
        absent: "#dc2626",
        today: "#2563eb",
      },
    },
  },
  plugins: [],
};
export default config;
