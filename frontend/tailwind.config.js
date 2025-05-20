/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",       // Add support for app directory if using Next 13+
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['var(--font-outfit)', 'sans-serif'], // Custom font
      },
      colors: {
        background: '#f9f9fc',  // Soft, modern background
      },
    },
  },
  plugins: [],
}
