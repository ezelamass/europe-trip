import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Acento de la app. Lima sobre casi-negro es la paleta personal de Eze
      // (ver perfil/estetica-y-gustos en el segundo cerebro). Cambiarlo por otra
      // escala de Tailwind acá lo cambia en toda la app.
      colors: { accent: colors.lime },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
