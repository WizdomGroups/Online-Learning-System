/** @type {import('tailwindcss').Config} */
// const colors = require("tailwindcss/colors");

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
        primary: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],     // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
        '5xl': ['3rem', { lineHeight: '1' }],           // 48px
      },
      colors: {
        // Brand Colors
        primary: "#F26522",
        "primary-hover": "#d4571e",
        secondary: "#3B7080",
        "secondary-hover": "#33616f",

        // Semantic Colors
        success: "#03C95A",
        "success-hover": "#02b250",
        info: "#1B84FF",
        "info-hover": "#1775e6",
        warning: "#FFC107",
        "warning-hover": "#e6ac06",
        danger: "#E70D0D",
        "danger-hover": "#cc0b0b",

        // Grayscale & Basic Colors
        dark: "#212529",
        light: "#F8F9FA",
        white: "#FFFFFF",
        black: "#000000",

        // Additional Colors
        purple: "#AB47BC",
        pink: "#FD3995",
        skyblue: "#0DCAF0",
        teal: "#02a8b5",

        // Teal Palette (Modern Teal Theme)
        "teal-50": "#e6f7f8",
        "teal-100": "#cceff1",
        "teal-200": "#99dfe3",
        "teal-300": "#66cfd5",
        "teal-400": "#33bfc7",
        "teal-500": "#02a8b5",
        "teal-600": "#028691",
        "teal-700": "#01656d",
        "teal-800": "#014349",
        "teal-900": "#002225",

        // Brand Gradients and Palette Levels
        "primary-100": "#FEF0E9",
        "primary-200": "#FCE0D3",
        "primary-300": "#F9C1A8",
        "primary-400": "#F59274",
        "primary-500": "#F26522",
        "primary-600": "#ef5e16",
        "primary-700": "#e85a17",
        "primary-800": "#df5313",
        "primary-900": "#F37438",

        "secondary-100": "#F0F6F7",
        "secondary-200": "#E2EEF0",
        "secondary-300": "#C2DADC",
        "secondary-400": "#A1C5C9",
        "secondary-500": "#3B7080",
        "secondary-600": "#33616f",
        "secondary-700": "#2d5561",
        "secondary-800": "#254651",
        "secondary-900": "#1d373f",

        "success-100": "#E6FBEE",
        "success-200": "#CFF8DE",
        "success-300": "#A0F1BC",
        "success-400": "#70EA9A",
        "success-500": "#03C95A",
        "success-600": "#02b250",
        "success-700": "#029e46",
        "success-800": "#01863b",
        "success-900": "#007e36",

        "info-100": "#EAF4FF",
        "info-200": "#D5E9FF",
        "info-300": "#ACD3FF",
        "info-400": "#83BCFF",
        "info-500": "#1B84FF",
        "info-600": "#1775e6",
        "info-700": "#1367cc",
        "info-800": "#0f58b3",
        "info-900": "#0c4e9f",

        "warning-100": "#FFF8E1",
        "warning-200": "#FFECB3",
        "warning-300": "#FFD54F",
        "warning-400": "#FFCA28",
        "warning-500": "#FFC107",
        "warning-600": "#e6ac06",
        "warning-700": "#cc9805",
        "warning-800": "#b38404",
        "warning-900": "#997004",

        "danger-100": "#FEECEC",
        "danger-200": "#FDCFCF",
        "danger-300": "#FCAFAF",
        "danger-400": "#F99090",
        "danger-500": "#E70D0D",
        "danger-600": "#cc0b0b",
        "danger-700": "#b30909",
        "danger-800": "#990707",
        "danger-900": "#800606",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(270deg, #FA812F 0%, #E73C3C 100%)",
        "gradient-secondary":
          "linear-gradient(270deg, #3B7080 0%, #244550 100%)",
      },
    },
  },
  plugins: [],
};
