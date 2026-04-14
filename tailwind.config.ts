import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#f5f3ee",
        ink: "#243228",
        sage: {
          50: "#f3f7f2",
          100: "#dce8dd",
          200: "#bdd0c0",
          300: "#98b09f",
          400: "#789284",
          500: "#60796d",
          600: "#4e6258",
          700: "#404f47",
          800: "#34403a",
          900: "#2b3430"
        },
        sand: "#ece6dc",
        blush: "#f4d8ca",
        gold: "#ddb768"
      },
      boxShadow: {
        card: "0 12px 40px rgba(71, 82, 72, 0.08)"
      },
      fontFamily: {
        sans: ["SF Pro Display", "Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at top left, rgba(190, 213, 195, 0.85), transparent 35%), radial-gradient(circle at bottom right, rgba(221, 183, 104, 0.2), transparent 30%)"
      }
    }
  },
  plugins: []
};

export default config;
