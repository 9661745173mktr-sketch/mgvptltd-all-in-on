import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mg: { 
          dark: '#0B0F19', 
          gold: '#D4AF37', 
          blue: '#1E3A8A' 
        }
      },
    },
  },
  plugins: [],
};

export default config;