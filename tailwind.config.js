/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./N8NChatbot.tsx"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        n8n: {
          pink: {
            DEFAULT: "#FF91AC",
            10: "#FFE8EC",
            20: "#FFD0D9",
            30: "#FFBCCA",
            70: "#87003C",
            80: "#5A0026",
            90: "#44001B",
          },
          core: {
            black: "#191919",
            white: "#FAFAFA",
          },
          gray: {
            0: "#FFFFFF",
            5: "#FAFAFA",
            10: "#F8F8F8",
            15: "#F1F1F1",
            20: "#EAEAEA",
            25: "#E0E0E0",
            30: "#D6D6D6",
            40: "#BFBFBF",
            50: "#A4A4A4",
            60: "#868686",
            70: "#676767",
            80: "#464646",
            85: "#353535",
            90: "#242424",
            95: "#191919",
          },
        },
      },
      borderRadius: {
        "n8n-xs": "4px",
        "n8n-sm": "8px",
        "n8n-md": "12px",
        "n8n-lg": "16px",
        "n8n-xl": "24px",
        "n8n-full": "9999px",
      },
      boxShadow: {
        "n8n-pink": "0 4px 14px 0 rgba(255, 145, 172, 0.35)",
        "n8n-pink-lg": "0 8px 24px 0 rgba(255, 145, 172, 0.45)",
      },
    },
  },
  plugins: [],
};
