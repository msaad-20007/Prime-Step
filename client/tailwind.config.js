/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#050505',
        card: '#121212',
        accent: '#D4FF14',
        'text-primary': '#F3F4F6',
      },
    },
  },
  plugins: [],
}
