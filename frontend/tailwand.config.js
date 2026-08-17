/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Sirf ye ek line kafi hai saare folders ke liye
  ],
  
  
  // DARK MODE ENABLED: Ye line zaroori hai toggle ke liye
  darkMode: "class",

  theme: {
      /* FONT FAMILY ADD HERE */
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        jakarta: ["Plus Jakarta Sans", "sans-serif"],
      },
    extend: {
      /* 1. Custom Brand Colors */
      colors: {
        brand: {
          light: '#6366f1', // Indigo 500
          DEFAULT: '#4f46e5', // Indigo 600
          dark: '#4338ca', // Indigo 700
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
        }
      },

      /* 2. Background Size */
      backgroundSize: {
        "300%": "300%",
      },

      /* 3. Animations */
      animation: {
        blob: "blob 7s infinite",
        "gradient-x": "gradient-x 10s ease infinite",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.4s ease-out forwards",
        "spin-slow": "spin 3s linear infinite",
      },

      /* 4. Keyframes */
      keyframes: {
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },

  /* 5. Custom Plugins */
  plugins: [
  ],

  safelist: [
    "dark",
    "bg-emerald-500", "bg-amber-500", "bg-rose-500",
    "text-emerald-600", "text-amber-600", "text-rose-600",
    "animation-delay-2000", "animation-delay-4000",
    "from-blue-500", "via-blue-600", "to-indigo-600",
    "from-sky-500", "via-indigo-600", "to-blue-700",
    "bg-gradient-to-r", "animate-gradient-x",
    "bg-[length:300%_300%]",
  ],
};