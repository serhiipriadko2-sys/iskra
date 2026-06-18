/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        iskra: {
          bg: '#05080A',
          surface: '#0F1216',
          'surface-2': '#1A1E24',
          primary: '#FF7A00',
          'primary-dim': 'rgba(255, 122, 0, 0.1)',
          accent: '#4DA3FF',
          text: '#E6E8EB',
          muted: '#8A9199',
          danger: '#FF4D4D',
          success: '#2ECC71',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        serif: ['Cormorant Garamond', 'serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        glow: 'glow 3s alternate infinite',
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          from: { filter: 'drop-shadow(0 0 10px rgba(255,122,0,0.2))' },
          to: { filter: 'drop-shadow(0 0 20px rgba(255,122,0,0.6))' },
        },
      },
    },
  },
  plugins: [],
};
