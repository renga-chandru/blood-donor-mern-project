/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blood: {
          50: '#fdf2f2',
          100: '#fbe4e4',
          500: '#ea3333',
          600: '#d92222',
          700: '#b81818',
        }
      }
    },
  },
  plugins: [],
}
