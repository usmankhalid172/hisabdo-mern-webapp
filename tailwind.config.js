/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#1A237E', // Deep Indigo
          secondary: '#0D47A1', // Navy
          accent: '#00E676', // Vibrant Emerald
          expense: '#E53935', // Crimson
          receivable: '#1A237E',
          payable: '#E53935',
          bgLight: '#F8F9FD',
          bgDark: '#121212',
        },
        hisab: {
          indigo: '#1A237E',
          navy: '#0D47A1',
          emerald: '#00E676',
          crimson: '#E53935',
          amber: '#F59E0B',
          cardDark: '#1E1E1E',
          cardLight: '#FFFFFF',
          borderDark: '#2E2E2E',
          borderLight: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        urdu: ['Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', 'serif'],
        arabic: ['Noto Sans Arabic', 'sans-serif'],
      },
      boxShadow: {
        'glow-emerald': '0 0 20px -3px rgba(0, 230, 118, 0.35)',
        'glow-indigo': '0 0 25px -3px rgba(26, 35, 126, 0.45)',
        'glow-crimson': '0 0 20px -3px rgba(229, 57, 53, 0.35)',
      }
    },
  },
  plugins: [],
};