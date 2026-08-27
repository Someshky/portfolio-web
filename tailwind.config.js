/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // A deep forest green in place of the earlier generic blue — reads
        // as "premium finance app" rather than "default framework blue."
        brand: {
          50: '#eef6f2',
          100: '#d7e9e0',
          500: '#2d6a53',
          600: '#1f4b3f',
          700: '#163a31',
        },
        cream: '#f6f4ee',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
