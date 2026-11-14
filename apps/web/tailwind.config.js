/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#030712',
          900: '#080e1a',
          850: '#0d1527',
          800: '#111c35',
          700: '#1b2a4e',
          600: '#2b3f6c',
        },
        nasa: {
          blue: '#0b3d91',
          red: '#fc3d21',
          cyan: '#38bdf8',
          amber: '#f59e0b',
          emerald: '#10b981'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Consolas', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 30s linear infinite',
      }
    },
  },
  plugins: [],
}
