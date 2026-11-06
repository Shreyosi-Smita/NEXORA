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
        // Titanium Blue 2.0 Palette
        titanium: {
          main: '#080D16',
          app: '#0C1421',
          sidebar: '#0A111D',
          surface: '#131F30',
          elevated: '#1B2A3D',
          hover: '#24374D',
          accent: '#6D9BCB',
          'accent-light': '#91B8DE',
          electric: '#B5D7F5',
          steel: '#52677F',
          text: '#EDF4FC',
          'text-secondary': '#A2B2C5',
          'text-muted': '#70839A',
          border: '#293B51',
        },
        semantic: {
          success: '#35D6A1',
          warning: '#FFBC69',
          error: '#FF6B81',
          info: '#69B5FF',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Geist Mono', 'monospace'],
      },
      boxShadow: {
        'titanium': '0 4px 20px -2px rgba(8, 13, 22, 0.7), 0 0 15px -3px rgba(109, 155, 203, 0.1)',
        'titanium-lg': '0 10px 30px -5px rgba(8, 13, 22, 0.8), 0 0 25px -5px rgba(109, 155, 203, 0.2)',
        'glow-accent': '0 0 20px -2px rgba(109, 155, 203, 0.35)',
        'glow-electric': '0 0 25px 0px rgba(181, 215, 245, 0.4)',
      }
    },
  },
  plugins: [],
}
