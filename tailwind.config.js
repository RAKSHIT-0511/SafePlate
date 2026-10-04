/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary': '#115637',
        'primary-container': '#2f6f4e',
        'on-primary': '#ffffff',
        'on-primary-container': '#acefc6',
        'primary-fixed': '#aef1c8',
        'primary-fixed-dim': '#93d5ad',

        'secondary': '#885200',
        'secondary-container': '#fcaa46',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#6d4100',
        'secondary-fixed': '#ffdcbb',
        'secondary-fixed-dim': '#ffb869',
        'on-secondary-fixed': '#2b1700',

        'tertiary': '#115635',
        'tertiary-container': '#2e6f4c',
        'on-tertiary': '#ffffff',
        'on-tertiary-container': '#acefc3',

        'surface': '#f0fdf3',
        'on-surface': '#131e18',
        'on-surface-variant': '#404942',

        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#eaf7ed',
        'surface-container': '#e4f1e7',
        'surface-container-high': '#dfebe2',
        'surface-container-highest': '#d9e6dc',

        'error': '#ba1a1a',
        'error-container': '#ffdad6',
        'on-error': '#ffffff',
        'on-error-container': '#93000a',

        'outline': '#707972',
        'outline-variant': '#bfc9c0',

        // Semantic status tokens
        'status-safe-bg': '#E6F4EA',
        'status-safe-text': '#1B5E3C',
        'status-caution-bg': '#FFF4E5',
        'status-caution-text': '#B76E00',
        'status-unsafe-bg': '#FDEDEC',
        'status-unsafe-text': '#D64545',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        'space-xs': '0.25rem',
        'space-sm': '0.5rem',
        'space-md': '1rem',
        'space-lg': '1.5rem',
        'space-xl': '2rem',
        'space-2xl': '3rem',
        'gutter': '1.5rem',
        'gutter-mobile': '1rem',
        'margin': '2rem',
        'margin-mobile': '1rem',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'tactile': '0px 4px 16px -2px rgba(47, 111, 78, 0.04), 0px 1px 3px rgba(30, 41, 35, 0.03)',
        'tactile-hover': '0px 10px 24px -4px rgba(47, 111, 78, 0.08), 0px 2px 6px rgba(30, 41, 35, 0.04)',
      },
    },
  },
  plugins: [],
};
