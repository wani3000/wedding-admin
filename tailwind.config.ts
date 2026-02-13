import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1D2029",
        background: "#FFFFFF",
        "off-white": "#F9F9F9", // Just in case
      },
      fontFamily: {
        sans: ['"Wanted Sans Variable"', "Wanted Sans", "sans-serif"],
        serif: ['"Wanted Sans Variable"', "Wanted Sans", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
