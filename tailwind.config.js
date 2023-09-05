/** @type {import('tailwindcss').Config} */
module.exports = {
  mod: 'jit',
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
      }
    },
  },
  plugins: [],
}

