module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'picnic': ['PicNic', 'sans-serif'],
        'pixelify': ['PixelifySans', 'sans-serif']
      },
      fontSize: {
        'responsive-sm': 'clamp(0.75rem, 1.5vw, 1rem)',
        'responsive-base': 'clamp(1rem, 2vw, 1.25rem)',
        'responsive-lg': 'clamp(1.25rem, 2.5vw, 1.5rem)',
      }
    },
  },
  plugins: [],
}
