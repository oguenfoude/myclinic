import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './types/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          hover: '#1d4ed8',
          light: '#eff6ff',
          lightHover: '#dbeafe',
          dark: '#1e40af',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#2563eb',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        accent: {
          DEFAULT: '#4f46e5',
          hover: '#4338ca',
          light: '#eef2ff',
          dark: '#3730a3',
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        surface: {
          DEFAULT: '#f8fafc',
          hover: '#f1f5f9',
          dark: '#e2e8f0',
        },
        success: {
          DEFAULT: '#16a34a',
          hover: '#15803d',
          light: '#f0fdf4',
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        danger: {
          DEFAULT: '#dc2626',
          hover: '#b91c1c',
          light: '#fef2f2',
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light: '#fffbeb',
        },
        // ── Semantic decorative colors ──
        'stat-today': {
          DEFAULT: '#14b8a6',
          50: '#f0fdfa',
          600: '#0d9488',
        },
        'stat-month': {
          DEFAULT: '#8b5cf6',
          50: '#f5f3ff',
          600: '#7c3aed',
        },
        'stat-male': {
          DEFAULT: '#2563eb',
          50: '#eff6ff',
        },
        'stat-female': {
          DEFAULT: '#ec4899',
          50: '#fdf2f8',
        },
        'mock-red': '#f87171',
        'mock-amber': '#fbbf24',
        'mock-green': '#4ade80',
        skeleton: {
          DEFAULT: '#e2e8f0',
          light: '#f1f5f9',
        },
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'dialog': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'primary': '0 4px 14px 0 rgba(37, 99, 235, 0.39)',
        'primary-hover': '0 6px 20px 0 rgba(37, 99, 235, 0.5)',
      },
    },
  },
  plugins: [],
}

export default config
