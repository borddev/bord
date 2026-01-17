import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gsc: {
          blue: '#1967D2',
          background: '#F8F9FA',
          surface: '#FFFFFF',
          'text-primary': '#202124',
          'text-secondary': '#5F6368',
          success: '#1E8E3E',
          warning: '#F9AB00',
          border: '#DADCE0',
        }
      },
      fontFamily: {
        sans: ['Roboto', 'system-ui', 'sans-serif'],
        heading: ['Google Sans', 'Roboto', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
