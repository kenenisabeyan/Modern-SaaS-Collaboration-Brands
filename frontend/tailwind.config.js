/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          400: '#2563EB',
          500: '#2563EB',
          600: '#2563EB',
        },
        orange: {
          400: '#00D4FF',
          500: '#00D4FF',
          600: '#00D4FF',
        }
      }
    },
  },
  plugins: [],
}
