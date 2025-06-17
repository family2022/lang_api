module.exports = {
  mode: 'jit',
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        'main-black': "#363636",
        'main-white': "#f8f8f8",
        'main-red': "#DC2F2F",
        'main-orange': '#FF894C',
        'primary': '#1a202c',
        'secondary': '#2d3748',
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
