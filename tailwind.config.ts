import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // Enable dark mode with class strategy
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Modern Minimal Theme - Light & Dark Mode Palette
        primary: {
          // Light mode: Indigo 600, Dark mode: Indigo 400
          DEFAULT: "#4F46E5", // indigo-600
          light: "#818CF8", // indigo-400
          hover: "#4338CA", // indigo-700
          "dark-hover": "#A5B4FC", // indigo-300
        },
        accent: {
          // Success/Completion colors
          DEFAULT: "#10B981", // emerald-500 (light)
          dark: "#34D399", // emerald-400 (dark)
          hover: "#059669", // emerald-600 (light)
          "dark-hover": "#6EE7B7", // emerald-300 (dark)
        },
        warning: {
          DEFAULT: "#F59E0B", // amber-500 (light)
          dark: "#FBBF24", // amber-400 (dark)
        },
        error: {
          DEFAULT: "#EF4444", // red-500 (light)
          dark: "#F87171", // red-400 (dark)
        },
        // Priority-specific colors for task indicators
        priority: {
          high: "#EF4444", // red-500 (light)
          "high-dark": "#F87171", // red-400 (dark)
          medium: "#F59E0B", // amber-500 (light)
          "medium-dark": "#FBBF24", // amber-400 (dark)
          low: "#10B981", // emerald-500 (light)
          "low-dark": "#34D399", // emerald-400 (dark)
        },
        // Semantic backgrounds
        background: {
          DEFAULT: "#F9FAFB", // neutral-50 (light)
          dark: "#0F172A", // slate-900 (dark)
        },
        surface: {
          DEFAULT: "#FFFFFF", // white (light)
          dark: "#1E293B", // slate-800 (dark)
          sidebar: "#F1F5F9", // slate-100 (light)
          "sidebar-dark": "#1A2234", // custom slate-850 (dark)
        },
        border: {
          DEFAULT: "#E2E8F0", // slate-200 (light)
          dark: "#334155", // slate-700 (dark)
        },
        text: {
          primary: "#1E293B", // slate-800 (light)
          "primary-dark": "#F1F5F9", // slate-100 (dark)
          secondary: "#64748B", // slate-500 (light)
          "secondary-dark": "#94A3B8", // slate-400 (dark)
          placeholder: "#94A3B8", // slate-400 (light)
          "placeholder-dark": "#64748B", // slate-500 (dark)
        },
        highlight: {
          DEFAULT: "#EEF2FF", // indigo-50 (light)
          dark: "#312E81", // indigo-900 (dark)
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(15, 23, 42, 0.08)",
        "card-hover": "0 4px 6px -1px rgba(15, 23, 42, 0.1)",
        "card-dark": "0 1px 3px 0 rgba(0, 0, 0, 0.4)",
        "card-hover-dark": "0 4px 6px -1px rgba(0, 0, 0, 0.5)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-in": "slideIn 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(-10px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
