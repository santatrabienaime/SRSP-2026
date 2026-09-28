/**
 * NOTE : ce fichier n'est PAS lu par la chaîne de build.
 *
 * Le projet utilise Tailwind v4 (plugin @tailwindcss/vite), dont le thème est
 * déclaré dans src/index.css via @theme. Les couleurs, animations et keyframes
 * doivent donc être ajoutés dans index.css, pas ici.
 *
 * @type {import('tailwindcss').Config}
 */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1e40af',
        secondary: '#475569',
      },
    },
  },
  plugins: [],
};