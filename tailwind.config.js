/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-dashboard)', 'ui-sans-serif', 'system-ui'],
        'marketing': ['var(--font-marketing)', 'ui-sans-serif', 'system-ui'],
        'satoshi': ['Satoshi', 'var(--font-dashboard)', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        'custom': {
          'black': '#000000',
          'blue': '#2563EB', 
          'green': '#22C55D',
          'red': '#EB3232',
          'yellow': '#FBBF24',
          'black-hover': '#000000',
          'blue-hover': '#124BC7',
          'green-hover': '#1B9E4A',
          'red-hover': '#d01414',
          'yellow-hover': '#e1a404'
        }
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
};
