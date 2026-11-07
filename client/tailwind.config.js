/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: '#F7F3EC',
          light: '#FCFAF7',
          dark: '#EFE9DE',
        },
        walnut: {
          DEFAULT: '#493326',
          light: '#5E4333',
          dark: '#38251C',
        },
        espresso: {
          DEFAULT: '#241B16',
          light: '#2E221C',
          dark: '#18120E',
        },
        oak: {
          DEFAULT: '#C8A77D',
          light: '#D9BE9B',
          dark: '#B08E62',
        },
        gold: {
          DEFAULT: '#B69764',
          light: '#CDB182',
          dark: '#9A7D4E',
          accent: '#D4AF37',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        cinzel: ['"Cinzel"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 10px 30px -10px rgba(36, 27, 22, 0.15)',
        'luxury-lg': '0 20px 40px -15px rgba(36, 27, 22, 0.25)',
      },
      borderRadius: {
        'luxury': '16px',
        'luxury-lg': '24px',
      },
    },
  },
  plugins: [],
}
