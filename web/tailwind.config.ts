import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#d4af37',
          light: '#e9c349',
          dark: '#b3976f',
          50: '#fdf8e8',
          100: '#f5dea0',
          200: '#ffe088',
          500: '#d4af37',
          600: '#b3976f',
          700: '#735c00',
        },
        emerald: {
          DEFAULT: '#166d13',
          light: '#84db74',
          dark: '#005303',
        },
        rose: {
          DEFAULT: '#8c4b55',
          light: '#ee9da8',
          dark: '#6e323d',
        },
        surface: {
          DEFAULT: '#fcf9f8',
          dim: '#dcd9d9',
          bright: '#fcf9f8',
          container: {
            DEFAULT: '#f0eded',
            low: '#f6f3f2',
            high: '#eae7e7',
            highest: '#e5e2e1',
          },
        },
      },
      fontFamily: {
        heading: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Montserrat', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        label: ['Montserrat', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        'sm': '0.25rem',
        'DEFAULT': '0.5rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.5rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      boxShadow: {
        'luxury': '0 4px 12px rgba(26, 26, 26, 0.06)',
        'luxury-lg': '0 10px 30px rgba(26, 26, 26, 0.08)',
        'luxury-xl': '0 20px 50px rgba(26, 26, 26, 0.1)',
        'glow': '0 0 20px rgba(212, 175, 55, 0.15)',
        'glow-strong': '0 0 30px rgba(212, 175, 55, 0.25)',
      },
    },
  },
  plugins: [],
};

export default config;
