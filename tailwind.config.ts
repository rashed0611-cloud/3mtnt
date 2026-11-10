import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0b74de",
        "primary-strong": "#075bb0",
        ink: "#172033",
        muted: "#64748b",
        page: "#f5f7fb",
        line: "#e5e7eb",
        success: "#15803d",
        warning: "#b45309",
        danger: "#b91c1c",
      },
      borderRadius: {
        card: "12px",
        control: "8px",
      },
      boxShadow: {
        card: "0 2px 10px rgba(15, 23, 42, 0.06)",
        pop: "0 12px 32px rgba(15, 23, 42, 0.14)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
