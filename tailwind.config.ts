import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: "rgb(var(--primary-rgb) / <alpha-value>)",
        "primary-strong": "rgb(var(--primary-strong-rgb) / <alpha-value>)",
        accent: "rgb(var(--accent-rgb) / <alpha-value>)",
        ink: "rgb(var(--ink-rgb) / <alpha-value>)",
        muted: "rgb(var(--muted-rgb) / <alpha-value>)",
        page: "rgb(var(--page-rgb) / <alpha-value>)",
        line: "rgb(var(--line-rgb) / <alpha-value>)",
        success: "#15803d",
        warning: "#b45309",
        danger: "#b91c1c",
      },
      borderRadius: {
        card: "var(--radius-card)",
        control: "var(--radius-control)",
      },
      boxShadow: {
        card: "0 2px 10px rgba(15, 23, 42, 0.06)",
        pop: "0 12px 32px rgba(15, 23, 42, 0.14)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        heading: ["var(--font-heading)"],
      },
    },
  },
  plugins: [],
};

export default config;
