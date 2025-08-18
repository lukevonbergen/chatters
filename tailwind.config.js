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
    },
  },
  plugins: [require("tailwindcss-animate")],
};
