/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
    "!./node_modules/**",
    "!./dist/**",
  ],
  theme: {
    extend: {
      colors: {
        'brand-charcoal': '#1a1a1a',
        'brand-red': '#dc2626',
      },
      fontFamily: {
        sans: ['"Varela Round"', 'system-ui', 'sans-serif'],
        display: ['"Permanent Marker"', 'system-ui', 'sans-serif'],
        graffiti: ['"Permanent Marker"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
