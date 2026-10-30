import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        theme: {
          base: "var(--theme-bg-base)",
          surface: "var(--theme-surface)",
          primary: "var(--theme-text-primary)",
          muted: "var(--theme-text-muted)",
          accent: "var(--theme-accent)",
          editorial: "var(--theme-editorial)",
          border: "var(--theme-border)",
        },
      },
      fontFamily: {
        display: ["Georgia", "Times New Roman", "serif"],
        sans: ["Arial", "Helvetica", "sans-serif"],
      },
      letterSpacing: { editorial: "-0.055em" },
    },
  },
  plugins: [],
}

export default config
