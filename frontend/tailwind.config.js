/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      // === Warna Brand SDENTIBAYA ===
      // Hijau cerah: utama | Navy lembut: sidebar | Kuning emas: aksen | Putih: bg
      colors: {
        hijau: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a', // hijau utama (tombol, aktif)
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
          700: '#2d3fa8', // navy lembut
          800: '#1e2a7a',
          900: '#151e54', // sidebar utama
        },
        emas: {
          400: '#fbbf24',
          500: '#f59e0b', // kuning emas aksen
          600: '#d97706',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,.08), 0 1px 2px -1px rgba(0,0,0,.06)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,.10)',
      },
    },
  },
  plugins: [],
}
