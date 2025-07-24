/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // CodeBattle Simplified Design System classes
    'bg-primary-gray',
    'bg-primary-red', 
    'text-primary-gray',
    'text-primary-red',
    'text-black',
    'text-white',
    'border-primary-gray',
    'border-primary-red',
    'shadow-card',
    'shadow-modal',
    'shadow-hover',
    // Animation classes
    'animate-glow-pulse',
    'animate-float',
    'fade-in',
    'slide-up',
  ],
  theme: {
    extend: {
      colors: {
        // CodeBattle Primary Design System - Matching LandingPage

        // Primary Gray (Background) - Light gray from LandingPage
        'primary-gray': {
          DEFAULT: '#D9D9D9',
          light: '#E5E5E5',
          dark: '#CCCCCC',
        },

        // Primary Red (Accent) - Bright red from LandingPage  
        'primary-red': {
          DEFAULT: '#FF0000',
          light: '#FF3333',
          dark: '#CC0000',
        },

        // Text Colors - Simple black and white system
        'text': {
          primary: '#000000',
          secondary: '#000000', 
          light: '#ffffff',
          muted: '#000000',
        },

        // Surface Colors - Simplified
        'surface': {
          primary: '#D9D9D9',
          secondary: '#ffffff',
          accent: '#D9D9D9',
          overlay: 'rgba(217, 217, 217, 0.9)',
        },

        // Utility Colors
        'black': '#000000',
        'white': '#ffffff',
        'transparent': 'transparent',

        // shadcn/ui colors - Updated to match theme
        border: "#CCCCCC",
        input: "#D9D9D9", 
        ring: "#FF0000",
        background: "#D9D9D9",
        foreground: "#000000",
        primary: {
          DEFAULT: "#FF0000",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#D9D9D9",
          foreground: "#000000",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        'spektr-cyan-50': '#e6f7ff',
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
        '7xl': '4.5rem',
        '8xl': '6rem',
        '9xl': '8rem',
        '10xl': '10rem',
        '11xl': '12rem',
      },
      fontFamily: {
        'sans': ['Outreque', 'Inter', 'system-ui', 'sans-serif'],
        'mono': ['Outreque', 'Courier New', 'monospace'],
        'primary': ['Outreque', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        // CodeBattle Professional Design System Shadows with warm sunset theme
        'card': '0 4px 12px rgba(255, 179, 71, 0.08)',
        'modal': '0 16px 40px rgba(255, 107, 107, 0.12)',
        'hover': '0 8px 24px rgba(0, 180, 166, 0.15)',
        'glow-coral': '0 0 20px rgba(255, 107, 107, 0.3)',
        'glow-teal': '0 0 20px rgba(0, 180, 166, 0.3)',
        'glow-amber': '0 0 20px rgba(255, 179, 71, 0.3)',
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '16px',
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      spacing: {
        'section': '32px',
      },
      transitionTimingFunction: {
        'card': 'cubic-bezier(0.23, 1, 0.32, 1)',
        'button': 'cubic-bezier(0.45, 0, 0.55, 1)',
      },
      animation: {
        // CodeBattle Professional Design System Animations
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
        'slide-up': 'slideUp 0.8s cubic-bezier(0.23, 1, 0.32, 1)',
        'slide-down': 'slideDown 0.6s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'glow-pulse-teal': 'glowPulseTeal 2s ease-in-out infinite',
        'glow-pulse-amber': 'glowPulseAmber 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 107, 107, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 107, 107, 0.6)' },
        },
        glowPulseTeal: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 180, 166, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 180, 166, 0.6)' },
        },
        glowPulseAmber: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 179, 71, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 179, 71, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      }
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}
