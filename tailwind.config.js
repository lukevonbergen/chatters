/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'Gilroy', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
