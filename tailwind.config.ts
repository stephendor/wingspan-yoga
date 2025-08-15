import type { Config } from 'tailwindcss'
import lineClamp from '@tailwindcss/line-clamp'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    // Ensure gradient classes are always generated
    'from-softyellow-300',
    'to-softblue-300',
    'from-softorange-300',
    'to-softblue-300',
    'from-softpink-300',
    'to-softblue-300',
    'from-softgreen-300',
    'to-softblue-300',
    'bg-gradient-to-b',
    'bg-gradient-to-br',
    'bg-gradient-to-r',
    // Background colors
    'bg-softyellow-50',
    'bg-softyellow-100',
    'bg-softyellow-200',
    'bg-softyellow-300',
    'bg-softorange-50',
    'bg-softorange-100',
    'bg-softorange-200',
    'bg-softorange-300',
    'bg-softblue-50',
    'bg-softblue-100',
    'bg-softblue-200',
    'bg-softblue-300',
    'bg-softgreen-50',
    'bg-softgreen-100',
    'bg-softgreen-200',
    'bg-softgreen-300',
    'bg-softpink-50',
    'bg-softpink-100',
    'bg-softpink-200',
    'bg-softpink-300',
  ] as const,
  theme: {
    extend: {
      colors: {
        // New Brand Colors (Figma Design) - Updated with softer, more muted tones
        softorange: {
        50: '#fffaf7',
        100: '#fef3e8',
        200: '#fde7d0',
        300: '#FFDD99', // Brighter, sunnier orange
        400: '#f8d5a6',
        500: '#f5c484',
        600: '#f2b462',
        700: '#efa340',
        800: '#ec931e',
        900: '#d4830c',
      },
      softyellow: {
        50: '#fffef7',
        100: '#fefce8',
        200: '#fef9c3',
        300: '#FFF2A1', // Brighter, sunnier yellow
        400: '#fde68a',
        500: '#fcd34d',
        600: '#f59e0b',
        700: '#d97706',
        800: '#b45309',
        900: '#92400e',
      },
        softpink: {
          50: '#fef8f9',
          100: '#fdf1f3',
          200: '#fceaed',
          300: '#F9E1E8', // Primary soft pink from Figma - kept same
          400: '#f5d0d7',
          500: '#f1bfc6',
          600: '#edaeb5',
          700: '#e99da4',
          800: '#e58c93',
          900: '#e17b82',
        },
        softgreen: {
          50: '#f8fcf6',
          100: '#f1f9ed',
          200: '#eaf6e4',
          300: '#D9EAD3', // Primary soft green from Figma - kept same
          400: '#cbe0c2',
          500: '#bdd6b1',
          600: '#afcca0',
          700: '#a1c28f',
          800: '#93b87e',
          900: '#85ae6d',
        },
        softblue: {
          50: '#f7fbfe',
          100: '#eff7fc',
          200: '#e7f3fa',
          300: '#B3E5FC', // Brighter, sunnier blue
          400: '#c6dff4',
          500: '#b6d4f0',
          600: '#a6c9ec',
          700: '#96bee8',
          800: '#86b3e4',
          900: '#76a8e0',
        },
        // Original Brand Colors (preserved for existing components)
        sage: {
          50: '#f6f7f4',
          100: '#e9ebe3',
          200: '#d3d7c9',
          300: '#b4bca3',
          400: '#94a077',
          500: '#7a8759', // Primary sage green
          600: '#606b46',
          700: '#4c5438',
          800: '#3e442f',
          900: '#353a29',
        },
        ocean: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9', // Primary ocean blue
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        sky: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Accent Colors
        terracotta: {
          50: '#fdf4f3',
          100: '#fce7e4',
          200: '#f9d3ce',
          300: '#f4b5ab',
          400: '#ec8b7a',
          500: '#d97b5c', // Primary terracotta
          600: '#c25f3f',
          700: '#a24c33',
          800: '#86412e',
          900: '#713a2c',
        },
        blush: {
          50: '#fef7f7',
          100: '#fdeee8',
          200: '#fdddd6',
          300: '#fabbbb',
          400: '#f58b8b',
          500: '#ec5a5a', // Primary blush
          600: '#d83c3c',
          700: '#b62d2d',
          800: '#962a2a',
          900: '#7c2a2a',
        },
        // Neutrals
        charcoal: {
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#454545',
          900: '#3d3d3d', // Primary charcoal
          950: '#262626',
        },
        warm: {
          50: '#fdfcfb',
          100: '#faf8f5',
          200: '#f4f0e8',
          300: '#ede5d3',
          400: '#e3d5b7',
          500: '#d6c199', // Warm neutral
          600: '#c9a876',
          700: '#b8935e',
          800: '#967750',
          900: '#796145',
        },
      },
      fontFamily: {
        // Header fonts (Figma Design Typography)
        'playfair': ['Playfair Display', 'serif'],
        lato: ['Lato', 'sans-serif'],
        // Original header fonts (preserved)
        montserrat: ['Montserrat', 'sans-serif'],
        raleway: ['Raleway', 'sans-serif'],
        // Body fonts
        'open-sans': ['Open Sans', 'sans-serif'],
        // Default font stack
        sans: ['Lato', 'Open Sans', 'system-ui', 'sans-serif'],
        heading: ['Playfair Display', 'Montserrat', 'serif'],
        serif: ['Playfair Display', 'serif'],
      },
      fontSize: {
        // Extended typography scale
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      spacing: {
        // Extended spacing scale for consistent layout
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        // Organic, natural border radius options
        'soft': '0.375rem',
        'natural': '0.75rem',
        'organic': '1.5rem',
      },
      boxShadow: {
        // Soft, natural shadows
        'soft': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'natural': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'organic': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'zen': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        // Subtle, natural animations
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [
    lineClamp,
  ],
}

export default config
