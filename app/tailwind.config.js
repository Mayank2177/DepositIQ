/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        solar: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        warm: {
          amber: '#f59e0b',
          gold: '#eab308',
          crimson: '#ef4444',
          terracotta: '#dc2626',
          sand: '#fef3c7',
        },
        porcelain: {
          base: '#f8fafc',
          card: '#ffffff',
          hover: '#f1f5f9',
          border: '#e2e8f0',
        },
        graphite: {
          title: '#0f172a',
          body: '#334155',
          muted: '#64748b',
          subtle: '#94a3b8',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'soft-card': '0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03)',
        'elevated': '0 20px 40px -6px rgba(15, 23, 42, 0.08), 0 8px 16px -4px rgba(15, 23, 42, 0.04)',
        'studio': '0 30px 60px -12px rgba(234, 88, 12, 0.12), 0 18px 36px -18px rgba(15, 23, 42, 0.08)',
        'inset-hairline': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.8)',
      }
    },
  },
  plugins: [],
}
