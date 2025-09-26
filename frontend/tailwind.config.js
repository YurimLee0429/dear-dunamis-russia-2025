/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        mission: {
          purple: "#6b21a8",
          red: "#dc2626",
          blue: "#2563eb",
        },
      },
    },
  },
  plugins: [],
};
