/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "assets-globales-azul": "var(--assets-globales-azul)",
        "assets-globales-blanco": "var(--assets-globales-blanco)",
        "assets-globales-blanco-palido": "var(--assets-globales-blanco-palido)",
        "assets-globales-color-2": "var(--assets-globales-color-2)",
        "assets-globales-color-3": "var(--assets-globales-color-3)",
        sidebar: "#27374D",
      },
      fontFamily: {
        botones: "var(--botones-font-family)",
        h1: "var(--h1-font-family)",
        h2: "var(--h2-font-family)",
        h3: "var(--h3-font-family)",
        // Work Sans
        worksans: ["Work Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};