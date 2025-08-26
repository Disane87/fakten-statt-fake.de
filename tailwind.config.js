/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
    "./app/**/*.{js,vue,ts}"
  ],
  theme: {
    extend: {
      // Farben werden in main.css als CSS-Variablen gepflegt
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],

  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxtjs/color-mode"
  ]
}