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
        lucia: {
          // Dark theme colors
          bg: '#0c0e12',
          surface: '#14171d',
          panel: '#1a1e26',
          elevated: '#222730',
          border: '#2a303c',
          'border-light': '#353d4d',
          muted: '#6b7a94',
          text: '#c8d1de',
          bright: '#e8ecf2',
          accent: '#2d9e5e',
          'accent-hover': '#3ecf8e',
          'accent-soft': 'rgba(45, 158, 94, 0.12)',
          'accent-glow': 'rgba(45, 158, 94, 0.25)',
          user: '#1e3a5f',
          'user-text': '#b8d4f0',
          assistant: '#1a1e26',
          success: '#3ecf8e',
          error: '#ef6461',
          // Light theme colors
          light: {
            bg: '#f5f7fa',
            surface: '#ffffff',
            panel: '#f0f2f5',
            elevated: '#e8eaed',
            border: '#d1d5db',
            'border-light': '#e5e7eb',
            muted: '#6b7280',
            text: '#374151',
            bright: '#111827',
            user: '#dcfce7',
            'user-text': '#14532d',
            assistant: '#f9fafb',
          }
        }
      },
      fontFamily: {
        display: ['"DM Sans"', 'system-ui', 'sans-serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'typing-pulse': 'typingPulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s ease-in-out infinite',
      },
      keyframes: {
        typingPulse: {
          '0%, 100%': { opacity: '0.2', transform: 'scale(0.85)' },
          '50%': { opacity: '1', transform: 'scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
