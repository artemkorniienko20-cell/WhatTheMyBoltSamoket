/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bolt: {
          green: '#34D186',
          greenDark: '#22B56E',
          greenLight: '#62F5AB',
          black: '#12161A',
          dark: '#181E24',
          darkCard: '#1E252D',
          darkBorder: '#2C353F',
          textMuted: '#94A3B8'
        }
      }
    },
  },
  plugins: [],
}
