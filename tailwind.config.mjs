/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Trident Gymnastics Brand Colors
        'trident-blue': '#1573C2',      // Primary blue for buttons, links
        'trident-navy': '#151957',      // Dark navy for headings, hero gradients
        'trident-yellow': '#FFD338',    // Accent yellow for highlights, CTAs
        'trident-gray': '#6C757D',      // Muted text
        'trident-bg': '#f8fbff',        // Light background

        // Tailwind semantic mapping for easier use
        primary: '#1573C2',
        secondary: '#151957',
        accent: '#FFD338',
      },
      borderRadius: {
        'trident': '20px',
        'trident-sm': '15px',
        'trident-lg': '25px',
      },
      boxShadow: {
        'trident': '0 10px 30px rgba(21, 25, 87, 0.1)',
        'trident-md': '0 20px 40px rgba(21, 115, 194, 0.15)',
        'trident-button': '0 4px 15px rgba(21, 115, 194, 0.4)',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', '"Noto Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
