/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    light: '#D4A373', // Buff
                    DEFAULT: '#9C6644', // Earthy Brown
                    dark: '#7F5539', // Dark Brown
                },
                secondary: {
                    light: '#E6CCB2', // Almond
                    DEFAULT: '#DDB892', // Sand
                    dark: '#B08968', // Light Brown
                },
                accent: {
                    DEFAULT: '#606C38', // Deep Green
                    dark: '#283618', // Dark Olive
                },
                background: '#FAF9F6', // Off-white/Bone
                surface: '#fcf9f4',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
