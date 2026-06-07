/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      // ============================================================
      // Warna Brand SDENTIBAYA
      // Hijau: utama | Navy: sidebar | Emas: aksen | Putih: bg
      // ============================================================
      colors: {
        hijau: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a', // primer — tombol, nav aktif
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        navy: {
          50:  '#f0f4ff',
          100: '#e0e8ff',
          200: '#c7d4f8',
          300: '#a5b8f3',
          400: '#7c96eb',
          500: '#5872e0',
          600: '#3d54d4',
          700: '#2d3fa8',
          800: '#1e2a7a',
          900: '#151e54', // sidebar header
        },
        emas: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b', // aksen kuning emas
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
        },
        cyan: {
          50:  '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        ungu: {
          50:  '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        purple: {
          50:  '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      transitionDuration: {
        250: '250ms',
      },

      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
}
