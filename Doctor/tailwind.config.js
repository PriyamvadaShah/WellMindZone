/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",         // ✅ App Router
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/context/**/*.{js,jsx,ts,tsx}",
    "./src/hooks/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#19252BFF",
        secondary: "#19252BFF",
        light: "#F6F6F6",
        accent: "#FFCB74",
        "navy-800": "#0a1128",
        "navy-900": "#001f3f",
      },
      fontFamily: {
        main: ["Arial", "Gill Sans", "Zurich"],
        montserrat: ["sans-serif"],
      },
    },
  },
  plugins: [],
};
