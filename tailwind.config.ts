import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#FF8A65',
        secondary: '#AED581',
        blue: '#81D4FA',
        yellow: '#FFF176',
        dark: '#455A64',
        light: '#FFFBE6',
        purple: '#B39DDB',
        success: '#22C55E',
        info: '#3B82F6',
        warning: '#EF4444',
        'primary-dark': '#F4511E',
        'primary-light': '#FFCCBC',
        'secondary-dark': '#7CB342',
        'secondary-light': '#DCEDC8',
      },
      fontFamily: {
        sans: ['Inter', 'System'],
        display: ['Quicksand', 'System'],
      },
    },
  },
  plugins: [],
};

export default config;
