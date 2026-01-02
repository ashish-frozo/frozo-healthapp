/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./App.{js,jsx,ts,tsx}",
        "./app/**/*.{js,jsx,ts,tsx}",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                primary: '#2b7cee',
                'primary-dark': '#1a65d6',
                'background-light': '#f6f7f8',
                'background-dark': '#101822',
                'surface-light': '#ffffff',
                'surface-dark': '#1a2634',
                'text-primary-light': '#0d131b',
                'text-primary-dark': '#e2e8f0',
                'text-secondary-light': '#4c6c9a',
                'text-secondary-dark': '#94a3b8',
            },
            fontFamily: {
                'display': ['Lexend', 'System'],
            },
        },
    },
    plugins: [],
};
