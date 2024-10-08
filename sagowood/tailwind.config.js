/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  mode:'jit',
  purge:[
    './public/**/*.html',
    './src/**/*.{js,jsx,ts,tsx,vue}',
  ],
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {},
  },
  plugins: [],
}