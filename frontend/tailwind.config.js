/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0B0F17',
        surface: {
          DEFAULT: '#111827',
          light: '#1F2937',
          lighter: '#374151',
          border: '#1E293B',
        },
        brand: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          400: '#34D399',
          500: '#10B981', // Emerald accent
          600: '#059669',
          700: '#047857',
        }
      }
    },
  },
  plugins: [],
}

