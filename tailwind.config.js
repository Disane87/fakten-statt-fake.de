/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
    "./app/**/*.{js,vue,ts}"
  ],
  theme: {
    extend: {
      // Map CSS custom properties to Tailwind color classes
      colors: {
        // Core theme colors
        'brand': {
          DEFAULT: 'var(--color-brand)',
          50: 'var(--color-brand-50)',
          100: 'var(--color-brand-100)',
          600: 'var(--color-brand-600)',
          700: 'var(--color-brand-700)',
        },
        'accent': {
          DEFAULT: 'var(--color-accent)',
          600: 'var(--color-accent-600)',
        },
        
        // Surface colors
        'background': 'var(--color-background)',
        'panel': 'var(--color-panel)',
        'muted': 'var(--color-muted)',
        'border': 'var(--color-border)',
        
        // Text colors
        'ink': 'var(--color-ink)',
        'card-foreground': 'var(--color-card-foreground)',
        'muted-foreground': 'var(--color-muted-foreground)',
        
        // Semantic colors
        'success': {
          DEFAULT: 'var(--color-success)',
          foreground: 'var(--color-success-foreground)',
          bg: 'var(--color-success-bg)',
        },
        'error': {
          DEFAULT: 'var(--color-error)',
          foreground: 'var(--color-error-foreground)',
          bg: 'var(--color-error-bg)',
        },
        'warning': {
          DEFAULT: 'var(--color-warning)',
          foreground: 'var(--color-warning-foreground)',
          bg: 'var(--color-warning-bg)',
        },
        'info': {
          DEFAULT: 'var(--color-info)',
          foreground: 'var(--color-info-foreground)',
          bg: 'var(--color-info-bg)',
        },
        
        // Custom palette
        'sage': {
          DEFAULT: 'var(--color-sage)',
          50: 'var(--color-sage-50)',
          100: 'var(--color-sage-100)',
          600: 'var(--color-sage-600)',
        },
        'copper': {
          DEFAULT: 'var(--color-copper)',
          50: 'var(--color-copper-50)',
          100: 'var(--color-copper-100)',
          600: 'var(--color-copper-600)',
        },
        'anthracite': {
          DEFAULT: 'var(--color-anthracite)',
          300: 'var(--color-anthracite-300)',
          600: 'var(--color-anthracite-600)',
        },
        'cream': {
          DEFAULT: 'var(--color-cream)',
          600: 'var(--color-cream-600)',
        },
      },
      
      borderRadius: {
        'xl2': '1.25rem',
        'xl3': '1.5rem',
      },
      
      boxShadow: {
        'glow': '0 0 20px var(--color-brand)',
        'glow-sm': '0 0 10px var(--color-brand)',
      },
      
      ringColor: {
        DEFAULT: 'var(--color-ring)',
      },
    },
  },
  plugins: [],

  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxtjs/color-mode"
  ]
}