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
        espresso: {
          DEFAULT: '#2C1810',
          light: '#3D2317',
          lighter: '#4A2E1F',
        },
        ivory: {
          DEFAULT: '#FDF8F3',
          dark: '#F5F0EB',
        },
        gold: {
          DEFAULT: '#C4A882',
          light: '#D4B892',
          dark: '#B3976F',
        },
      },
      fontFamily: {
        heading: ['Playfair Display', 'Georgia', 'serif'],
        body: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
