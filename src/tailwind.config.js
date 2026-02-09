/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors for the RPG theme
        'arx-dark': '#0f0f1a',
        'arx-darker': '#080810',
        'arx-purple': '#8b5cf6',
        'arx-purple-dark': '#6d28d9',
        'arx-gold': '#fbbf24',
        'arx-gold-dark': '#d97706',
      },
      fontFamily: {
        'medieval': ['Cinzel', 'serif'],
      }
    },
  },
  plugins: [],
}
