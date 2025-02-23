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
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... rest of your color configurations
      },
      fontSize: {
        'responsive-sm': 'clamp(0.75rem, 1.5vw, 1rem)',
        'responsive-base': 'clamp(1rem, 2vw, 1.25rem)',
        'responsive-lg': 'clamp(1.25rem, 2.5vw, 1.5rem)',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}
