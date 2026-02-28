import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#6366f1', dark: '#4f46e5' },
        surface: { DEFAULT: '#1e1e2e', light: '#2a2a3e', lighter: '#363650' },
        sidebar: '#181825',
        text: { DEFAULT: '#cdd6f4', muted: '#6c7086' },
      },
    },
  },
  plugins: [],
};
export default config;
