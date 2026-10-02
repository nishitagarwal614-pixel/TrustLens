/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Multi-Colour Theme Named Tokens
        'primary-blue': '#123A8C',
        'dark-blue': '#0B2E73',
        'light-blue': '#EAF2FC',
        'blue-accent': '#1769AA',
        'primary-red': '#ED1C24',
        'dark-red': '#C62828',
        'light-red': '#FDEBEC',
        'primary-purple': '#4635B1',
        'deep-purple': '#352580',
        'light-purple': '#F1EEFA',
        'primary-green': '#138808',
        'dark-green': '#0B6B05',
        'light-green': '#EAF6EA',
        'indian-saffron': '#FF9933',
        'light-saffron': '#FFF1E5',
        'warning-amber': '#E09F00',
        'warning-yellow': '#FFC107',
        'light-amber': '#FFF7D6',
        'light-bg': '#F5F6F8',
        'bg-blue': '#EEF4FB',
        'bg-purple': '#F4F1FA',
        'bg-red': '#FFF1F2',
        'bg-green': '#EEF8EF',
        'primary-text': '#172033',
        'secondary-text': '#4B5563',
        'muted-text': '#6B7280',
        'border-default': '#D8DEE8',
        'border-blue': '#B8CBE8',
        'border-red': '#F3B6BA',
        'border-purple': '#C8C1E8',
        'border-green': '#B8DDB8',

        // Brand & Status Mappings
        brand: {
          blue: '#123A8C',
          navy: '#0B2E73',
          red: '#ED1C24',
          purple: '#4635B1',
          saffron: '#FF9933',
          green: '#138808',
          amber: '#E09F00',
        },
        risk: {
          high: '#ED1C24',
          contradicted: '#ED1C24',
          potential: '#C62828',
          medium: '#E09F00',
          low: '#123A8C',
          unverified: '#123A8C',
          safe: '#138808',
          verified: '#138808',
        },

        // Balanced Color Ramp Overrides (Ensures all existing components adopt the palette)
        blue: {
          50: '#EAF2FC',  // Light blue
          100: '#EEF4FB', // Light blue background
          200: '#B8CBE8', // Blue border
          300: '#8CAEE0',
          400: '#1769AA', // Blue accent
          500: '#123A8C', // Primary Blue
          600: '#123A8C', // Primary Blue: Main brand & solution
          700: '#0B2E73', // Dark Blue: Hover & nav
          800: '#0B2E73', // Dark Blue
          900: '#082052',
          950: '#051433',
        },
        purple: {
          50: '#F1EEFA',  // Light purple
          100: '#F4F1FA', // Light purple background
          200: '#C8C1E8', // Purple border
          300: '#A79CD8',
          400: '#7A6BC3',
          500: '#4635B1', // Primary Purple
          600: '#4635B1', // Primary Purple: AI & Intelligence
          700: '#352580', // Deep Purple
          800: '#2B1F70',
          900: '#1E1550',
        },
        rose: {
          50: '#FDEBEC',  // Light red
          100: '#FFF1F2', // Light red background
          200: '#F3B6BA', // Red border
          300: '#F8848A',
          400: '#F34D54',
          500: '#ED1C24', // Primary Red
          600: '#ED1C24', // Primary Red: Risk, Alert, Contradicted
          700: '#C62828', // Dark Red: Potential Risk
          800: '#9E0E14',
          900: '#73090E',
        },
        red: {
          50: '#FDEBEC',  // Light red
          100: '#FFF1F2', // Light red background
          200: '#F3B6BA', // Red border
          300: '#F8848A',
          400: '#F34D54',
          500: '#ED1C24', // Primary Red
          600: '#ED1C24', // Primary Red: Risk & Alerts
          700: '#C62828', // Dark Red: Potential Risk
          800: '#9E0E14',
          900: '#73090E',
        },
        amber: {
          50: '#FFF7D6',  // Light amber
          100: '#FFF7D6',
          200: '#FFE082',
          300: '#FFD54F',
          400: '#FFC107', // Yellow
          500: '#E09F00', // Amber: Warning & Partial Verification
          600: '#E09F00',
          700: '#C68A00',
          800: '#9E6E00',
          900: '#7F5600',
        },
        emerald: {
          50: '#EAF6EA',  // Light green
          100: '#EEF8EF', // Light green background
          200: '#B8DDB8', // Green border
          300: '#81C784',
          400: '#4CAF50',
          500: '#138808', // Primary Green: Verified & Safe
          600: '#138808',
          700: '#0B6B05', // Dark Green
          800: '#0A4A04',
          900: '#073303',
        },
        green: {
          50: '#EAF6EA',  // Light green
          100: '#EEF8EF', // Light green background
          200: '#B8DDB8', // Green border
          300: '#81C784',
          400: '#4CAF50',
          500: '#138808', // Primary Green
          600: '#138808',
          700: '#0B6B05', // Dark Green
          800: '#0A4A04',
        },
        saffron: {
          DEFAULT: '#FF9933', // Indian Saffron
          50: '#FFF1E5',  // Light Saffron
          100: '#FFE0B2',
          200: '#FFCC80',
          500: '#FF9933',
          600: '#FB8C00',
        },
        slate: {
          50: '#F5F6F8',  // Main Background
          100: '#EDEFF3',
          200: '#D8DEE8', // Default Border
          300: '#D8DEE8', // Default Border
          400: '#9CA3AF',
          500: '#6B7280', // Muted Text
          600: '#4B5563', // Secondary Text
          700: '#374151',
          800: '#172033', // Primary Text
          900: '#0B2E73', // Dark Navy Blue
          950: '#071E4A',
        }
      }
    },
  },
  plugins: [],
}
