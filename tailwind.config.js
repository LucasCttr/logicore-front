/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",        // Importante: apunta a /app
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // Importante: apunta a /components
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",      // Por si usas la carpeta pages
  ],
  theme: {
    extend: {},
  },
}