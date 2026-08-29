/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        dusk: "#1B2A4A",
        duskdeep: "#101B32",
        gold: "#D9A441",
        goldlight: "#F0C978",
        sage: "#7A8C5B",
        sand: "#F4EFE3",
        clay: "#A8462F",
        ink: "#22201B",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Work Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
