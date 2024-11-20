/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html"
    ],
    darkMode: 'class',
    theme: {
        extend: {
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in',
                'fade-in-delay': 'fadeIn 0.5s ease-in 0.2s forwards',
                'fade-in-delay-2': 'fadeIn 0.5s ease-in 0.4s forwards',
                blob: "blob 7s infinite",
                'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                blob: {
                    "0%": {
                        transform: "translate(0px, 0px) scale(1)",
                    },
                    "33%": {
                        transform: "translate(30px, -50px) scale(1.1)",
                    },
                    "66%": {
                        transform: "translate(-20px, 20px) scale(0.9)",
                    },
                    "100%": {
                        transform: "translate(0px, 0px) scale(1)",
                    },
                },
                pulse: {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: .5 },
                },
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
    ],
} 