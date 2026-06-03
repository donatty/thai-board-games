import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          cyan:   '#00f5ff',
          pink:   '#ff0090',
          gold:   '#ffd700',
          green:  '#39ff14',
          purple: '#bf00ff',
        },
        dark: {
          900: '#020408',
          800: '#060d14',
          700: '#0a1628',
          600: '#0f2040',
          500: '#162b52',
        },
      },
      fontFamily: {
        arcade: ['var(--font-arcade)', 'monospace'],
        thai:   ['var(--font-thai)', 'sans-serif'],
        mono:   ['var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        neon:        '0 0 5px #00f5ff, 0 0 20px #00f5ff, 0 0 40px #00f5ff55',
        'neon-pink': '0 0 5px #ff0090, 0 0 20px #ff0090, 0 0 40px #ff009055',
        'neon-gold': '0 0 5px #ffd700, 0 0 20px #ffd700, 0 0 40px #ffd70055',
        'neon-green':'0 0 5px #39ff14, 0 0 20px #39ff14, 0 0 40px #39ff1455',
      },
      animation: {
        'glow-pulse':    'glowPulse 2s ease-in-out infinite',
        'float':         'float 3s ease-in-out infinite',
        'scan-line':     'scanLine 8s linear infinite',
        'flicker':       'flicker 0.15s infinite',
        'slide-up':      'slideUp 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.4s ease-out',
        'bounce-in':     'bounceIn 0.6s cubic-bezier(0.34,1.56,0.64,1)',
        'spin-slow':     'spin 8s linear infinite',
        'particle':      'particle 1s ease-out forwards',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        scanLine: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.85' },
        },
        slideUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to:   { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          from: { transform: 'translateX(-30px)', opacity: '0' },
          to:   { transform: 'translateX(0)', opacity: '1' },
        },
        bounceIn: {
          from: { transform: 'scale(0.3)', opacity: '0' },
          to:   { transform: 'scale(1)', opacity: '1' },
        },
        particle: {
          '0%':   { transform: 'translate(0,0) scale(1)', opacity: '1' },
          '100%': { transform: 'translate(var(--tx),var(--ty)) scale(0)', opacity: '0' },
        },
      },
      backgroundImage: {
        'grid-pattern': `linear-gradient(rgba(0,245,255,0.03) 1px, transparent 1px),
                         linear-gradient(90deg, rgba(0,245,255,0.03) 1px, transparent 1px)`,
        'radial-glow':  'radial-gradient(ellipse at center, rgba(0,245,255,0.08) 0%, transparent 70%)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
    },
  },
  plugins: [],
}

export default config
