/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{ts,tsx}",
    "./utils/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#05080A', 
        surface: '#0F1216',
        surface2: '#1A1E24',
        glass: 'rgba(20, 25, 30, 0.6)',
        'glass-light': 'rgba(255, 255, 255, 0.03)',
        border: 'rgba(255, 255, 255, 0.08)',
        text: '#E6E8EB',
        'text-muted': '#8A9199',
        primary: '#FF7A00', 
        'primary-dim': 'rgba(255, 122, 0, 0.1)',
        accent: '#4DA3FF',  
        'accent-dim': 'rgba(77, 163, 255, 0.1)',
        success: '#2ECC71',
        warning: '#FFB020',
        danger: '#FF4D4D',
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
        'pill': '9999px',
      },
      boxShadow: {
        soft: '0 4px 20px rgba(0,0,0,0.3)',
        deep: '0 10px 40px -10px rgba(0,0,0,0.6)',
        'glow-ember': '0 0 20px rgba(255,122,0,0.2), 0 0 40px rgba(255,122,0,0.1)',
        'glow-electric': '0 0 20px rgba(77,163,255,0.2), 0 0 40px rgba(77,163,255,0.1)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      dropShadow: {
        'glow-primary': '0 0 10px rgba(255,122,0,0.5)',
        'glow-accent': '0 0 10px rgba(77,163,255,0.5)',
      },
      fontFamily: {
        sans: "'Inter', system-ui, -apple-system, sans-serif",
        mono: "'JetBrains Mono', monospace",
        serif: "'Cormorant Garamond', serif",
      },
      animation: {
        'fade-in': 'fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 7s ease-in-out infinite 2s',
        'float-delayed-2': 'float 8s ease-in-out infinite 1s',
        'breathe': 'breathe 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'fade-in': {
          'from': { opacity: 0, transform: 'scale(0.98)' },
          'to': { opacity: 1, transform: 'scale(1)' },
        },
        'slide-up': {
          'from': { transform: 'translateY(100%)' },
          'to': { transform: 'translateY(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'breathe': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
        'glow': {
          'from': { filter: 'drop-shadow(0 0 10px rgba(255,122,0,0.5))' },
          'to': { filter: 'drop-shadow(0 0 20px rgba(255,122,0,0.9)) brightness(1.2)' },
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'conic-gradient(from 90deg at 50% 50%, #000000 0%, #1a1a1a 50%, #000000 100%)',
      }
    }
  },
  plugins: [],
}
