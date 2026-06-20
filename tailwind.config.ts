import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f8fafc",
        foreground: "#0f172a",
        primary: "#0891b2",
        "primary-foreground": "#ffffff",
        panel: "#ffffff",
        muted: "#f1f5f9",
        danger: "#e11d48",
        success: "#059669",
        warning: "#d97706",
      },
    },
  },
  plugins: [],
};

export default config;
