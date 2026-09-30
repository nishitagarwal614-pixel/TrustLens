/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0b132b',
          dark: '#1c2541',
          slate: '#3a506b',
          cyan: '#5bc0be',
          sky: '#6fffe9',
        },
        risk: {
          high: '#ef4444',
          medium: '#f59e0b',
          low: '#3b82f6',
          safe: '#10b981',
        }
      }
    },
  },
  plugins: [],
}
