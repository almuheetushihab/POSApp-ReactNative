/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: '#2563EB',
                secondary: '#1E293B',
                accent: '#F59E0B',
                background: '#F1F5F9',
                surface: '#FFFFFF',
                danger: '#EF4444',
                success: '#10B981',
            },
        },
    },
    plugins: [],
}